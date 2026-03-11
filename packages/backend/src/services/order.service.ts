// ============================================================
// Order Service - Core Order Flow & Status Machine
// Implements: RULE 1 (no cron), RULE 2 (manager payment confirmation),
//             RULE 3 (dynamic debt calculation)
// ============================================================

import prisma from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { OrderStatus } from '@prisma/client';
import { ActivityService } from './activity.service';

// Valid status transitions — simplified 4-step flow
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['ACCEPTED', 'CANCELED'],
    ACCEPTED: ['PICKED_UP', 'CANCELED', 'REJECTED'],
    PICKED_UP: ['IN_PROGRESS', 'CANCELED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELED'],
    COMPLETED: [],
    CANCELED: [],
    REJECTED: [],
};

export class OrderService {
    /**
     * Create a new order (Client action)
     */
    static async createOrder(data: {
        clientId: string;
        vehicleId: string;
        address: string;
        problemDescription: string;
        managerId?: string;
    }) {
        // Verify vehicle belongs to client
        const vehicle = await prisma.vehicle.findFirst({
            where: { id: data.vehicleId, clientId: data.clientId },
        });
        if (!vehicle) {
            throw ApiError.notFound('Vehicle not found or does not belong to you');
        }

        const order = await prisma.order.create({
            data: {
                clientId: data.clientId,
                vehicleId: data.vehicleId,
                address: data.address,
                problemDescription: data.problemDescription,
                managerId: data.managerId || undefined,
                status: 'PENDING',
                statusHistory: {
                    create: {
                        fromStatus: 'PENDING',
                        toStatus: 'PENDING',
                        changedById: data.clientId,
                        notes: data.managerId ? 'Order created (manager pre-selected by client)' : 'Order created',
                    },
                },
            },
            include: {
                vehicle: true,
                client: { select: { id: true, name: true, phone: true, role: true, status: true } },
            },
        });

        // Notify admins about new order
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        await prisma.notification.createMany({
            data: admins.map((admin) => ({
                userId: admin.id,
                type: 'ORDER_CREATED' as const,
                title: 'ახალი შეკვეთა',
                message: `ახალი შეკვეთა #${order.id.slice(0, 8)} - ${vehicle.make} ${vehicle.model}`,
                metadata: { orderId: order.id },
            })),
        });

        return order;
    }

    /**
     * Assign a manager to an order (Admin action)
     */
    static async assignManager(orderId: string, managerId: string, adminId: string) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw ApiError.notFound('Order not found');
        if (order.status !== 'PENDING') {
            throw ApiError.badRequest('Can only assign managers to pending orders');
        }

        const manager = await prisma.user.findFirst({
            where: { id: managerId, role: 'MANAGER', status: 'ACTIVE' },
        });
        if (!manager) throw ApiError.notFound('Manager not found or inactive');

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
                managerId,
                statusHistory: {
                    create: {
                        fromStatus: order.status,
                        toStatus: order.status,
                        changedById: adminId,
                        notes: `Manager ${manager.name} assigned`,
                    },
                },
            },
            include: {
                vehicle: true,
                client: { select: { id: true, name: true, phone: true, role: true, status: true } },
                manager: { select: { id: true, name: true, phone: true, role: true, status: true } },
            },
        });

        // Notify the manager
        await prisma.notification.create({
            data: {
                userId: managerId,
                type: 'ORDER_CREATED',
                title: 'ახალი დავალება',
                message: `თქვენ მინიჭდით შეკვეთა #${orderId.slice(0, 8)}`,
                metadata: { orderId },
            },
        });

        return updated;
    }

    /**
     * Reassign manager on any order (Admin action — no status restriction)
     */
    static async reassignManager(orderId: string, newManagerId: string, adminId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { manager: { select: { id: true, name: true } } },
        });
        if (!order) throw ApiError.notFound('Order not found');

        const newManager = await prisma.user.findFirst({
            where: { id: newManagerId, role: 'MANAGER', status: 'ACTIVE' },
        });
        if (!newManager) throw ApiError.notFound('Manager not found or inactive');

        const oldManagerName = order.manager?.name || 'არცერთი';

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
                managerId: newManagerId,
                statusHistory: {
                    create: {
                        fromStatus: order.status,
                        toStatus: order.status,
                        changedById: adminId,
                        notes: `მენეჯერი შეიცვალა: ${oldManagerName} → ${newManager.name}`,
                    },
                },
            },
            include: {
                vehicle: true,
                client: { select: { id: true, name: true, phone: true, role: true, status: true } },
                manager: { select: { id: true, name: true, phone: true, role: true, status: true, managerProfile: true } },
            },
        });

        // Notify new manager
        await prisma.notification.create({
            data: {
                userId: newManagerId,
                type: 'ORDER_CREATED',
                title: 'ახალი დავალება (გადამისამართება)',
                message: `თქვენ მინიჭდით შეკვეთა #${orderId.slice(0, 8)} (ადმინის მიერ)`,
                metadata: { orderId },
            },
        });

        // Notify old manager if exists
        if (order.manager?.id && order.manager.id !== newManagerId) {
            await prisma.notification.create({
                data: {
                    userId: order.manager.id,
                    type: 'ADMIN_ALERT' as any,
                    title: 'შეკვეთა გადამისამართდა',
                    message: `შეკვეთა #${orderId.slice(0, 8)} გადამისამართდა ${newManager.name}-ზე`,
                    metadata: { orderId },
                },
            });
        }

        return updated;
    }

    /**
     * Update order status (Manager or Admin action)
     * Enforces the status machine and cross-verification rules.
     */
    static async updateStatus(
        orderId: string,
        newStatus: OrderStatus,
        userId: string,
        notes?: string
    ) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { invoice: true },
        });
        if (!order) throw ApiError.notFound('Order not found');

        // Validate transition
        const allowedTransitions = STATUS_TRANSITIONS[order.status];
        if (!allowedTransitions.includes(newStatus)) {
            throw ApiError.badRequest(
                `Cannot transition from ${order.status} to ${newStatus}. Allowed: ${allowedTransitions.join(', ')}`
            );
        }

        // RULE: Calculate manager debt when order is COMPLETED
        // Manager owes company companyFeePercent% of the total client price
        if (newStatus === 'COMPLETED' && order.invoice && order.managerId) {
            const inv = order.invoice as any;
            await this.calculateManagerDebt(order.managerId, inv.totalClientPrice || 0, orderId);
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                statusHistory: {
                    create: {
                        fromStatus: order.status,
                        toStatus: newStatus,
                        changedById: userId,
                        notes,
                    },
                },
            },
            include: {
                vehicle: true,
                client: { select: { id: true, name: true, phone: true, role: true, status: true } },
                manager: { select: { id: true, name: true, phone: true, role: true, status: true } },
                invoice: true,
            },
        });

        // Notify client about status change
        await prisma.notification.create({
            data: {
                userId: order.clientId,
                type: 'ORDER_STATUS_CHANGED',
                title: 'შეკვეთის სტატუსი შეიცვალა',
                message: `შეკვეთა #${orderId.slice(0, 8)}: ${order.status} → ${newStatus}`,
                metadata: { orderId, fromStatus: order.status, toStatus: newStatus },
            },
        });

        // Activity log
        ActivityService.log({
            userId,
            action: 'STATUS_CHANGE',
            description: `სტატუსი შეიცვალა: ${order.status} → ${newStatus} (შეკვეთა #${orderId.slice(0, 8)})`,
            metadata: { orderId, fromStatus: order.status, toStatus: newStatus },
        });

        return updated;
    }

    /**
     * Admin force status change — skips transition validation
     */
    static async forceUpdateStatus(
        orderId: string,
        newStatus: OrderStatus,
        adminId: string,
        notes?: string
    ) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { invoice: true },
        });
        if (!order) throw ApiError.notFound('Order not found');

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                statusHistory: {
                    create: {
                        fromStatus: order.status,
                        toStatus: newStatus,
                        changedById: adminId,
                        notes: notes || `ადმინის ძალით: ${order.status} → ${newStatus}`,
                    },
                },
            },
            include: {
                vehicle: true,
                client: { select: { id: true, name: true, phone: true, role: true, status: true } },
                manager: { select: { id: true, name: true, phone: true, role: true, status: true } },
                invoice: true,
            },
        });

        // Notify client
        await prisma.notification.create({
            data: {
                userId: order.clientId,
                type: 'ORDER_STATUS_CHANGED',
                title: 'შეკვეთის სტატუსი შეიცვალა',
                message: `შეკვეთა #${orderId.slice(0, 8)}: ${order.status} → ${newStatus} (ადმინი)`,
                metadata: { orderId, fromStatus: order.status, toStatus: newStatus },
            },
        });

        // Activity log
        ActivityService.log({
            userId: adminId,
            action: 'STATUS_CHANGE',
            description: `ადმინის ძალით: ${order.status} → ${newStatus} (შეკვეთა #${orderId.slice(0, 8)})`,
            metadata: { orderId, fromStatus: order.status, toStatus: newStatus, force: true },
        });

        return updated;
    }

    /**
     * Manager marks their company fee as paid
     */
    static async markManagerFeePaid(orderId: string, managerId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { invoice: true },
        });
        if (!order) throw ApiError.notFound('Order not found');
        if (order.managerId !== managerId) {
            throw ApiError.forbidden('You are not the manager of this order');
        }
        if (!order.invoice) throw ApiError.badRequest('No invoice on this order');

        const updated = await (prisma as any).invoice.update({
            where: { id: order.invoice.id },
            data: { managerFeePaid: true },
        });

        // Notify admins
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'ORDER_STATUS_CHANGED' as any,
                    title: 'მენეჯერმა საკომისიო ჩარიცხა',
                    message: `შეკვეთა #${orderId.slice(0, 8)} — მენეჯერმა დაადასტურა საკომისიოს გადახდა`,
                    metadata: { orderId },
                },
            });
        }

        // Activity log
        ActivityService.log({
            userId: managerId,
            action: 'FEE_PAID',
            description: `საკომისიო დადასტურებულია (შეკვეთა #${orderId.slice(0, 8)})`,
            metadata: { orderId },
        });

        return updated;
    }

    /**
     * Confirm payment received (Manager action) - RULE 2
     * Manager confirms they received the payment from client.
     */
    static async confirmPayment(orderId: string, managerId: string) {
        const order = await prisma.order.findFirst({
            where: { id: orderId, managerId },
        });
        if (!order) throw ApiError.notFound('Order not found or not assigned to you');

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
                managerConfirmedPayment: true,
                managerConfirmedAt: new Date(),
            },
        });

        // Create and confirm transaction record
        if (order.managerId) {
            const invoice = await prisma.invoice.findUnique({ where: { orderId } });
            if (invoice) {
                const existingTx = await prisma.transaction.findFirst({
                    where: { orderId, managerId, type: 'CLIENT_TO_MANAGER' },
                });
                if (existingTx) {
                    await prisma.transaction.update({
                        where: { id: existingTx.id },
                        data: { status: 'CONFIRMED', confirmedAt: new Date() },
                    });
                } else {
                    await prisma.transaction.create({
                        data: {
                            orderId,
                            managerId,
                            amount: invoice.totalAmount,
                            type: 'CLIENT_TO_MANAGER',
                            status: 'CONFIRMED',
                            confirmedAt: new Date(),
                        },
                    });
                }
            }
        }

        return updated;
    }

    /**
     * RULE 3: Calculate manager's debt to company
     * Manager owes companyFeePercent% of totalClientPrice to the company.
     * Default companyFeePercent = 20 (i.e., 20% of what client pays).
     */
    private static async calculateManagerDebt(managerId: string, totalClientPrice: number, orderId: string) {
        const profile = await prisma.managerProfile.findUnique({
            where: { userId: managerId },
        });
        if (!profile) return;

        // Company's share = totalClientPrice * companyFeePercent / 100
        // If companyFeePercent = 20 and client paid ₾1000, company gets ₾200
        const feePercent = (profile as any).companyFeePercent ?? 20;
        const companyShare = totalClientPrice * (feePercent / 100);

        if (companyShare <= 0) return;

        await prisma.managerProfile.update({
            where: { userId: managerId },
            data: {
                currentDebtToCompany: { increment: companyShare },
            },
        });

        // Record the debt transaction
        await prisma.transaction.create({
            data: {
                orderId,
                managerId,
                amount: companyShare,
                type: 'MANAGER_TO_COMPANY',
                status: 'PENDING',
            },
        });
    }



    /**
     * Get orders with filters and pagination
     */
    static async getOrders(filters: {
        clientId?: string;
        managerId?: string;
        status?: OrderStatus;
        page?: number;
        pageSize?: number;
    }) {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (filters.clientId) where.clientId = filters.clientId;
        if (filters.managerId) where.managerId = filters.managerId;
        if (filters.status) where.status = filters.status;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    vehicle: true,
                    client: { select: { id: true, name: true, phone: true, role: true, status: true } },
                    manager: { select: { id: true, name: true, phone: true, role: true, status: true } },
                    invoice: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    /**
     * Get single order with full details
     */
    static async getOrderById(orderId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                vehicle: true,
                client: { select: { id: true, name: true, phone: true, role: true, status: true } },
                manager: {
                    select: {
                        id: true, name: true, phone: true, role: true, status: true,
                        managerProfile: true,
                    },
                },
                invoice: {
                    include: {
                        lines: { orderBy: { createdAt: 'asc' as const } },
                        correctionRequests: { orderBy: { createdAt: 'desc' as const } },
                    },
                },
                transactions: true,
                statusHistory: {
                    include: {
                        changedBy: { select: { id: true, name: true, role: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                review: true,
            },
        });

        if (!order) throw ApiError.notFound('Order not found');
        return order;
    }
}
