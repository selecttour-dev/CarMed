// ============================================================
// Finance Service - Debt, Guarantee Fund, Financial Reports
// ============================================================

import prisma from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

export class FinanceService {
    /**
     * Get manager's financial summary
     */
    static async getManagerFinance(managerId: string) {
        const profile = await prisma.managerProfile.findUnique({
            where: { userId: managerId },
            include: {
                user: { select: { id: true, name: true, phone: true } },
            },
        });
        if (!profile) throw ApiError.notFound('Manager profile not found');

        const transactions = await prisma.transaction.findMany({
            where: { managerId },
            include: {
                order: {
                    select: { id: true, status: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        const totalEarned = await prisma.transaction.aggregate({
            where: { managerId, type: 'CLIENT_TO_MANAGER', status: 'CONFIRMED' },
            _sum: { amount: true },
        });

        const totalDebtPaid = await prisma.transaction.aggregate({
            where: { managerId, type: 'MANAGER_TO_COMPANY', status: 'CONFIRMED' },
            _sum: { amount: true },
        });

        return {
            profile,
            transactions,
            summary: {
                totalEarned: totalEarned._sum.amount || 0,
                totalDebtPaid: totalDebtPaid._sum.amount || 0,
                currentDebt: profile.currentDebtToCompany,
                guaranteeFund: profile.guaranteeFundBalance,
                commissionPercentage: profile.commissionPercentage,
                companyFeePercent: (profile as any).companyFeePercent ?? 20,
            },
        };
    }

    /**
     * Admin: Get all managers' financial overview
     */
    static async getAllManagersFinance() {
        const profiles = await prisma.managerProfile.findMany({
            include: {
                user: { select: { id: true, name: true, phone: true, status: true } },
            },
        });

        const totalRevenue = await prisma.transaction.aggregate({
            where: { type: 'CLIENT_TO_MANAGER', status: 'CONFIRMED' },
            _sum: { amount: true },
        });

        const totalCompanyDebt = await prisma.managerProfile.aggregate({
            _sum: { currentDebtToCompany: true, guaranteeFundBalance: true },
        });

        // Orders with invoices for financial analysis
        const ordersWithInvoices = await (prisma as any).order.findMany({
            where: { invoice: { isNot: null } },
            select: {
                id: true, status: true, createdAt: true,
                managerId: true,
                manager: { select: { id: true, name: true } },
                client: { select: { id: true, name: true } },
                invoice: {
                    select: {
                        id: true, totalNetCost: true, totalClientPrice: true,
                        carmedFee: true, totalAmount: true,
                        managerFeePaid: true,
                        lines: { select: { netCost: true, clientPrice: true, quantity: true, description: true, type: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });

        // Build a lookup map for manager companyFeePercent
        const managerFeeMap: Record<string, number> = {};
        for (const p of profiles) {
            managerFeeMap[p.userId] = (p as any).companyFeePercent ?? 20;
        }

        // Calculate totals from invoices
        let totalNetCost = 0;
        let totalClientPrice = 0;
        let totalCompanyFees = 0;
        let unpaidFees = 0;
        let paidFees = 0;
        const unpaidFeeOrders: any[] = [];

        for (const order of ordersWithInvoices) {
            const inv = order.invoice as any;
            if (!inv) continue;
            const lines = inv.lines || [];
            const netSum = lines.reduce((s: number, l: any) => s + l.netCost * l.quantity, 0);
            const clientSum = lines.reduce((s: number, l: any) => s + l.clientPrice * l.quantity, 0);
            // Use manager's specific companyFeePercent, default 20%
            const feePercent = managerFeeMap[order.managerId] ?? 20;
            const fee = clientSum * (feePercent / 100);

            totalNetCost += netSum;
            totalClientPrice += clientSum;
            totalCompanyFees += fee;

            if (inv.managerFeePaid) {
                paidFees += fee;
            } else if (fee > 0) {
                unpaidFees += fee;
                unpaidFeeOrders.push({
                    orderId: order.id,
                    manager: order.manager,
                    client: order.client,
                    clientTotal: clientSum,
                    fee,
                    status: order.status,
                    createdAt: order.createdAt,
                });
            }
        }

        // Monthly stats (last 6 months)
        const monthlyStats: any[] = [];
        for (let i = 0; i < 6; i++) {
            const start = new Date();
            start.setMonth(start.getMonth() - i, 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);

            const monthOrders = await prisma.order.count({
                where: { createdAt: { gte: start, lt: end } },
            });
            const completedMonth = await prisma.order.count({
                where: { status: 'COMPLETED', createdAt: { gte: start, lt: end } },
            });

            monthlyStats.push({
                month: start.toLocaleDateString('ka-GE', { month: 'short', year: 'numeric' }),
                monthKey: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
                orders: monthOrders,
                completed: completedMonth,
            });
        }

        // Order status distribution
        const statusCounts = await Promise.all(
            ['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'REJECTED'].map(
                async (st) => ({ status: st, count: await prisma.order.count({ where: { status: st as any } }) })
            )
        );

        return {
            managers: profiles,
            totals: {
                totalRevenue: totalRevenue._sum.amount || 0,
                totalPendingDebt: totalCompanyDebt._sum.currentDebtToCompany || 0,
                totalGuaranteeFund: totalCompanyDebt._sum.guaranteeFundBalance || 0,
                totalNetCost,
                totalClientPrice,
                totalMargin: totalClientPrice - totalNetCost,
                totalCompanyFees,
                paidFees,
                unpaidFees,
            },
            unpaidFeeOrders,
            monthlyStats: monthlyStats.reverse(),
            statusCounts,
            recentOrders: ordersWithInvoices.slice(0, 20).map(o => ({
                id: o.id, status: o.status, createdAt: o.createdAt,
                manager: o.manager, client: o.client,
                netCost: (o.invoice as any)?.lines?.reduce((s: number, l: any) => s + l.netCost * l.quantity, 0) || 0,
                clientPrice: (o.invoice as any)?.lines?.reduce((s: number, l: any) => s + l.clientPrice * l.quantity, 0) || 0,
                feePaid: (o.invoice as any)?.managerFeePaid || false,
            })),
        };
    }

    /**
     * Admin: Adjust guarantee fund for a manager (manual intervention)
     */
    static async adjustGuaranteeFund(
        managerId: string,
        amount: number,
        reason: string,
        adminId: string
    ) {
        const profile = await prisma.managerProfile.findUnique({
            where: { userId: managerId },
        });
        if (!profile) throw ApiError.notFound('Manager profile not found');

        if (amount < 0 && profile.guaranteeFundBalance + amount < 0) {
            throw ApiError.badRequest('Insufficient guarantee fund balance');
        }

        const updated = await prisma.managerProfile.update({
            where: { userId: managerId },
            data: {
                guaranteeFundBalance: { increment: amount },
            },
        });

        // Notify manager
        await prisma.notification.create({
            data: {
                userId: managerId,
                type: 'ADMIN_ALERT',
                title: amount > 0 ? 'საგარანტიო ფონდის შევსება' : 'საგარანტიო ფონდიდან ჩამოჭრა',
                message: `${amount > 0 ? '+' : ''}₾${amount} - ${reason}`,
                metadata: { amount, reason, adminId },
            },
        });

        return updated;
    }

    /**
     * Admin: Update manager commission percentage
     */
    static async updateCommission(managerId: string, commissionPercentage: number) {
        if (commissionPercentage < 0 || commissionPercentage > 100) {
            throw ApiError.badRequest('Commission must be between 0 and 100');
        }

        return prisma.managerProfile.update({
            where: { userId: managerId },
            data: { commissionPercentage },
        });
    }

    /**
     * Admin Dashboard Stats
     */
    static async getDashboardStats() {
        const [
            totalOrders,
            pendingOrders,
            activeOrders,
            completedOrders,
            totalClients,
            totalManagers,
            revenueData,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({
                where: { status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_PROGRESS'] } },
            }),
            prisma.order.count({ where: { status: 'COMPLETED' } }),
            prisma.user.count({ where: { role: 'CLIENT' } }),
            prisma.user.count({ where: { role: 'MANAGER' } }),
            prisma.transaction.aggregate({
                where: { type: 'CLIENT_TO_MANAGER', status: 'CONFIRMED' },
                _sum: { amount: true },
            }),
        ]);

        return {
            orders: { total: totalOrders, pending: pendingOrders, active: activeOrders, completed: completedOrders },
            users: { clients: totalClients, managers: totalManagers },
            revenue: { total: revenueData._sum.amount || 0 },
        };
    }
}
