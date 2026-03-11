import prisma from '../lib/prisma';

export class ActivityService {
    /**
     * Log a user activity
     */
    static async log(data: {
        userId: string;
        action: string;
        description: string;
        ipAddress?: string;
        userAgent?: string;
        metadata?: any;
    }) {
        try {
            return await (prisma as any).activityLog.create({ data });
        } catch (e) {
            console.error('[ActivityService] Failed to log:', e);
        }
    }

    /**
     * Get activity logs for a specific user
     */
    static async getUserLogs(userId: string, limit = 50, offset = 0) {
        const [logs, total] = await Promise.all([
            (prisma as any).activityLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            (prisma as any).activityLog.count({ where: { userId } }),
        ]);
        return { logs, total };
    }

    /**
     * Get all activity logs (admin)
     */
    static async getAllLogs(filters: {
        userId?: string;
        action?: string;
        limit?: number;
        offset?: number;
    } = {}) {
        const where: any = {};
        if (filters.userId) where.userId = filters.userId;
        if (filters.action) where.action = filters.action;

        const [logs, total] = await Promise.all([
            (prisma as any).activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: filters.limit || 50,
                skip: filters.offset || 0,
                include: {
                    user: { select: { id: true, name: true, phone: true, role: true } },
                },
            }),
            (prisma as any).activityLog.count({ where }),
        ]);
        return { logs, total };
    }
}
