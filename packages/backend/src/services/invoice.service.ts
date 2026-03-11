// ============================================================
// Invoice Service — Line-Item Based with Edit Controls
// - Manager can freely edit/delete within 2 hours
// - After 2h, manager sends correction request to admin
// - Admin can always edit/delete directly
// ============================================================

import prisma from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { PartsCatalogService } from './parts-catalog.service';
import { SystemSettingsService } from './system-settings.service';

export class InvoiceService {

    /**
     * Create invoice with line items (Manager action)
     */
    static async createInvoice(
        orderId: string,
        managerId: string,
        data: {
            note?: string;
            lines: Array<{
                description: string;
                quantity: number;
                netCost: number;
                clientPrice: number;
                type?: 'PART' | 'LABOR' | 'OTHER';
            }>;
        }
    ) {
        const order = await prisma.order.findFirst({
            where: { id: orderId, managerId },
            include: { vehicle: true },
        });
        if (!order) throw ApiError.notFound('Order not found or not assigned to you');
        if (order.status !== 'IN_PROGRESS') {
            throw ApiError.badRequest('Invoice can only be created during IN_PROGRESS status');
        }

        // Existing invoice check
        const existing = await prisma.invoice.findUnique({ where: { orderId } });
        if (existing) throw ApiError.badRequest('Invoice already exists for this order');

        if (!data.lines || data.lines.length === 0) {
            throw ApiError.badRequest('At least one line item is required');
        }

        // Calculate totals
        const totalNetCost = data.lines.reduce((sum, l) => sum + (l.netCost * l.quantity), 0);
        const totalClientPrice = data.lines.reduce((sum, l) => sum + (l.clientPrice * l.quantity), 0);
        const totalAmount = totalClientPrice;

        const invoice = await prisma.invoice.create({
            data: {
                orderId,
                serviceCenterName: '',
                totalNetCost,
                totalClientPrice,
                carmedFee: 0,
                totalAmount,
                partsCost: totalClientPrice, // backward compat
                laborCost: 0,
                note: data.note,
                lines: {
                    create: data.lines.map((l) => ({
                        description: l.description,
                        quantity: l.quantity,
                        netCost: l.netCost,
                        clientPrice: l.clientPrice,
                        type: l.type || 'PART',
                    })),
                },
            },
            include: { lines: true },
        });

        // NOTE: Status stays IN_PROGRESS — invoice doesn't change the status anymore

        // Create status history note
        await prisma.orderStatusHistory.create({
            data: {
                orderId,
                fromStatus: 'IN_PROGRESS',
                toStatus: 'IN_PROGRESS',
                changedById: managerId,
                notes: 'Invoice created',
            },
        });

        // Track parts in catalog for autocomplete & price monitoring
        if (order.vehicle) {
            for (const line of (invoice as any).lines) {
                try {
                    await PartsCatalogService.trackPart({
                        make: order.vehicle.make,
                        model: order.vehicle.model,
                        partName: line.description,
                        type: line.type,
                        quality: line.quality || undefined,
                        brand: line.brand || undefined,
                        netCost: line.netCost,
                        clientPrice: line.clientPrice,
                        quantity: line.quantity,
                        managerId,
                        orderId,
                        invoiceLineId: line.id,
                    });
                } catch (e) {
                    console.error('Failed to track part in catalog:', e);
                }
            }
        }

        return invoice;
    }

    /**
     * Add a line item to existing invoice
     */
    static async addLine(
        invoiceId: string,
        userId: string,
        role: 'MANAGER' | 'ADMIN',
        data: { description: string; quantity: number; netCost: number; clientPrice: number; type?: 'PART' | 'LABOR' | 'OTHER'; quality?: string; brand?: string }
    ) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { order: { include: { vehicle: true } } },
        });
        if (!invoice) throw ApiError.notFound('Invoice not found');

        // Manager ownership check
        if (role === 'MANAGER' && invoice.order.managerId !== userId) {
            throw ApiError.forbidden('Not your invoice');
        }

        const line = await prisma.invoiceLine.create({
            data: {
                invoiceId,
                description: data.description,
                quantity: data.quantity,
                netCost: data.netCost,
                clientPrice: data.clientPrice,
                type: data.type || 'PART',
                quality: data.quality || undefined,
                brand: data.brand || undefined,
            },
        });

        await this.recalculateTotals(invoiceId);

        // Track in catalog
        if (invoice.order.vehicle) {
            try {
                await PartsCatalogService.trackPart({
                    make: invoice.order.vehicle.make,
                    model: invoice.order.vehicle.model,
                    partName: data.description,
                    type: data.type || 'PART',
                    quality: data.quality || undefined,
                    brand: data.brand || undefined,
                    netCost: data.netCost,
                    clientPrice: data.clientPrice,
                    quantity: data.quantity,
                    managerId: userId,
                    orderId: invoice.order.id,
                    invoiceLineId: line.id,
                });
            } catch (e) {
                console.error('Failed to track part in catalog:', e);
            }
        }

        return line;
    }

    /**
     * Edit a line item — manager restricted by time window
     */
    static async editLine(
        lineId: string,
        userId: string,
        role: 'MANAGER' | 'ADMIN',
        data: { description?: string; quantity?: number; netCost?: number; clientPrice?: number; type?: 'PART' | 'LABOR' | 'OTHER' }
    ) {
        const line = await prisma.invoiceLine.findUnique({
            where: { id: lineId },
            include: { invoice: { include: { order: true } } },
        });
        if (!line) throw ApiError.notFound('Line item not found');

        if (role === 'MANAGER') {
            if (line.invoice.order.managerId !== userId) throw ApiError.forbidden('Not your invoice');
            // Check time window (configurable by admin)
            const editWindowMs = await SystemSettingsService.getEditWindowMs();
            const elapsed = Date.now() - new Date(line.createdAt).getTime();
            if (elapsed > editWindowMs) {
                // Auto-submit correction request instead of throwing error
                await this.submitCorrectionRequest(userId, {
                    invoiceId: line.invoiceId,
                    invoiceLineId: lineId,
                    type: 'EDIT',
                    reason: 'რედაქტირება (ავტომატური მოთხოვნა)',
                    newDescription: data.description,
                    newNetCost: data.netCost,
                    newClientPrice: data.clientPrice,
                    newQuantity: data.quantity,
                });
                return { correctionSent: true, message: 'რედაქტირების დრო ამოიწურა — მოთხოვნა გაიგზავნა ადმინთან' };
            }
        }

        const updated = await (prisma as any).invoiceLine.update({
            where: { id: lineId },
            data: {
                description: data.description,
                quantity: data.quantity,
                netCost: data.netCost,
                clientPrice: data.clientPrice,
                type: data.type,
            },
        });

        await this.recalculateTotals(line.invoiceId);
        return updated;
    }

    /**
     * Delete a line item — manager restricted by time window
     */
    static async deleteLine(
        lineId: string,
        userId: string,
        role: 'MANAGER' | 'ADMIN'
    ) {
        const line = await prisma.invoiceLine.findUnique({
            where: { id: lineId },
            include: { invoice: { include: { order: true } } },
        });
        if (!line) throw ApiError.notFound('Line item not found');

        if (role === 'MANAGER') {
            if (line.invoice.order.managerId !== userId) throw ApiError.forbidden('Not your invoice');
            const editWindowMs = await SystemSettingsService.getEditWindowMs();
            const elapsed = Date.now() - new Date(line.createdAt).getTime();
            if (elapsed > editWindowMs) {
                // Auto-submit delete correction request instead of throwing error
                await this.submitCorrectionRequest(userId, {
                    invoiceId: line.invoiceId,
                    invoiceLineId: lineId,
                    type: 'DELETE',
                    reason: 'წაშლის მოთხოვნა (ავტომატური)',
                });
                return { correctionSent: true, message: 'წაშლის დრო ამოიწურა — მოთხოვნა გაიგზავნა ადმინთან' };
            }
        }

        await (prisma as any).invoiceLine.delete({ where: { id: lineId } });
        await this.recalculateTotals(line.invoiceId);
        return { deleted: true };
    }

    /**
     * Submit correction request (Manager action, after 2h window)
     */
    static async submitCorrectionRequest(
        managerId: string,
        data: {
            invoiceId: string;
            invoiceLineId?: string;
            type: 'EDIT' | 'DELETE' | 'ADD';
            reason: string;
            newDescription?: string;
            newNetCost?: number;
            newClientPrice?: number;
            newQuantity?: number;
            newType?: 'PART' | 'LABOR' | 'OTHER';
        }
    ) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: data.invoiceId },
            include: { order: true },
        });
        if (!invoice) throw ApiError.notFound('Invoice not found');
        if (invoice.order.managerId !== managerId) throw ApiError.forbidden('Not your invoice');

        // Check that there's no pending request for same line
        if (data.invoiceLineId) {
            const pending = await prisma.invoiceCorrectionRequest.findFirst({
                where: { invoiceLineId: data.invoiceLineId, status: 'PENDING' },
            });
            if (pending) throw ApiError.badRequest('Already a pending correction request for this line');
        }

        const request = await prisma.invoiceCorrectionRequest.create({
            data: {
                invoiceId: data.invoiceId,
                invoiceLineId: data.invoiceLineId,
                managerId,
                type: data.type,
                reason: data.reason,
                newDescription: data.newDescription,
                newNetCost: data.newNetCost,
                newClientPrice: data.newClientPrice,
                newQuantity: data.newQuantity,
                newType: data.newType,
            },
        });

        // Notify admins
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        await prisma.notification.createMany({
            data: admins.map((a) => ({
                userId: a.id,
                type: 'ADMIN_ALERT' as const,
                title: '📝 კორექტირების მოთხოვნა',
                message: `მენეჯერმა გაგზავნა ${data.type === 'EDIT' ? 'რედაქტირების' : data.type === 'DELETE' ? 'წაშლის' : 'დამატების'} მოთხოვნა`,
                metadata: { correctionRequestId: request.id, invoiceId: data.invoiceId },
            })),
        });

        return request;
    }

    /**
     * Resolve correction request (Admin action)
     */
    static async resolveCorrectionRequest(
        requestId: string,
        adminId: string,
        approved: boolean,
        adminNote?: string
    ) {
        const db = prisma as any;
        const request = await db.invoiceCorrectionRequest.findUnique({
            where: { id: requestId },
            include: { invoice: true },
        });
        if (!request) throw ApiError.notFound('Correction request not found');
        if (request.status !== 'PENDING') throw ApiError.badRequest('Request already resolved');

        if (approved) {
            // Apply the correction
            if (request.type === 'DELETE' && request.invoiceLineId) {
                await db.invoiceLine.delete({ where: { id: request.invoiceLineId } });
            } else if (request.type === 'EDIT' && request.invoiceLineId) {
                await db.invoiceLine.update({
                    where: { id: request.invoiceLineId },
                    data: {
                        description: request.newDescription ?? undefined,
                        netCost: request.newNetCost ?? undefined,
                        clientPrice: request.newClientPrice ?? undefined,
                        quantity: request.newQuantity ?? undefined,
                        type: request.newType ?? undefined,
                    },
                });
            } else if (request.type === 'ADD') {
                await db.invoiceLine.create({
                    data: {
                        invoiceId: request.invoiceId,
                        description: request.newDescription || 'New item',
                        netCost: request.newNetCost || 0,
                        clientPrice: request.newClientPrice || 0,
                        quantity: request.newQuantity || 1,
                        type: request.newType || 'PART',
                    },
                });
            }
            await this.recalculateTotals(request.invoiceId);
        }

        const updated = await db.invoiceCorrectionRequest.update({
            where: { id: requestId },
            data: {
                status: approved ? 'APPROVED' : 'REJECTED',
                adminId,
                adminNote,
                resolvedAt: new Date(),
            },
        });

        // Notify manager
        await prisma.notification.create({
            data: {
                userId: request.managerId,
                type: 'ADMIN_ALERT' as any,
                title: approved ? '✅ კორექტირება დადასტურდა' : '❌ კორექტირება უარყოფილია',
                message: adminNote || (approved ? 'თქვენი მოთხოვნა დამტკიცდა' : 'თქვენი მოთხოვნა უარყოფილია'),
                metadata: { correctionRequestId: requestId },
            },
        });

        return updated;
    }

    /**
     * Get correction requests for admin
     */
    static async getCorrectionRequests(status?: string) {
        const requests = await (prisma as any).invoiceCorrectionRequest.findMany({
            where: status ? { status } : {},
            include: {
                invoice: {
                    include: {
                        order: { include: { vehicle: true, client: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Enrich with manager names
        const managerIds = [...new Set(requests.map((r: any) => r.managerId))] as string[];
        const managers = await prisma.user.findMany({
            where: { id: { in: managerIds } },
            select: { id: true, name: true },
        });
        const managerMap = new Map(managers.map(m => [m.id, m.name]));

        return requests.map((r: any) => ({
            ...r,
            managerName: managerMap.get(r.managerId) || 'უცნობი',
        }));
    }

    /**
     * Admin: directly edit carmedFee on invoice
     */
    static async updateCarmedFee(invoiceId: string, carmedFee: number) {
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice) throw ApiError.notFound('Invoice not found');

        return prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                carmedFee,
                totalAmount: invoice.totalClientPrice + carmedFee,
            },
        });
    }

    /**
     * Recalculate invoice totals from line items
     */
    private static async recalculateTotals(invoiceId: string) {
        const lines = await prisma.invoiceLine.findMany({ where: { invoiceId } });
        const totalNetCost = lines.reduce((s, l) => s + (l.netCost * l.quantity), 0);
        const totalClientPrice = lines.reduce((s, l) => s + (l.clientPrice * l.quantity), 0);

        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        const totalAmount = totalClientPrice + (invoice?.carmedFee || 0);

        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { totalNetCost, totalClientPrice, totalAmount, partsCost: totalClientPrice },
        });
    }

    /**
     * Get invoice with lines (role-aware: hides netCost from clients)
     */
    static async getInvoiceByOrderId(orderId: string, role: 'MANAGER' | 'ADMIN' | 'CLIENT') {
        const invoice = await prisma.invoice.findUnique({
            where: { orderId },
            include: {
                lines: { orderBy: { createdAt: 'asc' } },
                correctionRequests: role !== 'CLIENT' ? { orderBy: { createdAt: 'desc' } } : false,
            },
        });
        if (!invoice) return null;

        if (role === 'CLIENT') {
            // Strip netCost and totalNetCost from client view
            return {
                ...invoice,
                totalNetCost: undefined,
                lines: invoice.lines.map((l) => ({
                    ...l,
                    netCost: undefined,
                })),
            };
        }

        return invoice;
    }
}
