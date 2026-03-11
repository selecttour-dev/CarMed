// ============================================================
// Admin Routes - Users, Orders, Finance, Guarantee Fund
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { OrderService } from '../services/order.service';
import { FinanceService } from '../services/finance.service';
import { InvoiceService } from '../services/invoice.service';
import { PartsCatalogService } from '../services/parts-catalog.service';
import { AuthService } from '../services/auth.service';
import { SystemSettingsService } from '../services/system-settings.service';
import { ActivityService } from '../services/activity.service';
import prisma from '../lib/prisma';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

// ── Dashboard ────────────────────────────────────────────────

// GET /api/admin/dashboard
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await FinanceService.getDashboardStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
});

// ── User Management ──────────────────────────────────────────

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.query.role as string | undefined;
        const status = req.query.status as string | undefined;
        const search = req.query.search as string | undefined;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;

        const where: any = {};
        if (role) where.role = role;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            (prisma as any).user.findMany({
                where,
                select: {
                    id: true, name: true, phone: true, email: true, role: true, status: true, createdAt: true,
                    lastLoginAt: true,
                    managerProfile: true,
                    _count: { select: { clientOrders: true, managerOrders: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/users/:id/activity — User activity logs
router.get('/users/:id/activity', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;
        const result = await ActivityService.getUserLogs(req.params.id, limit, offset);
        res.json({ success: true, data: result.logs, total: result.total });
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/managers - Create a new manager
router.post('/managers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, phone, password, email, companyFeePercent } = req.body;
        if (!name || !phone || !password) {
            return res.status(400).json({ success: false, error: 'Name, phone and password are required' });
        }

        const result = await AuthService.register({
            name,
            phone,
            password,
            email,
            role: 'MANAGER',
        });

        // Update company fee percent if specified
        if (companyFeePercent !== undefined) {
            const feeVal = parseFloat(companyFeePercent);
            if (!isNaN(feeVal) && feeVal >= 0 && feeVal <= 100) {
                await prisma.managerProfile.update({
                    where: { userId: result.user.id },
                    data: { companyFeePercent: feeVal } as any,
                });
            }
        }

        res.status(201).json({ success: true, data: result.user });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/users/:id/status - Block/Unblock user
router.put('/users/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        if (!['ACTIVE', 'BLOCKED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Status must be ACTIVE or BLOCKED' });
        }
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { status },
            select: { id: true, name: true, phone: true, role: true, status: true },
        });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// ── Order Management ─────────────────────────────────────────

// GET /api/admin/orders
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string | undefined;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;

        const result = await OrderService.getOrders({ status: status as any, page, pageSize });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/orders/:id
router.get('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/orders/:id/assign
router.put('/orders/:id/assign', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { managerId } = req.body;
        if (!managerId) {
            return res.status(400).json({ success: false, error: 'managerId is required' });
        }
        const order = await OrderService.assignManager(req.params.id, managerId, req.user!.id);
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/orders/:id/reassign — Reassign manager (any status)
router.put('/orders/:id/reassign', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { managerId } = req.body;
        if (!managerId) {
            return res.status(400).json({ success: false, error: 'managerId is required' });
        }
        const order = await OrderService.reassignManager(req.params.id, managerId, req.user!.id);
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/orders/:id/status - Admin can force status changes
router.put('/orders/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, notes } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }
        const order = await OrderService.forceUpdateStatus(req.params.id, status, req.user!.id, notes);
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// ── Finance & Anti-Fraud ─────────────────────────────────────

// GET /api/admin/finance
router.get('/finance', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const finance = await FinanceService.getAllManagersFinance();
        res.json({ success: true, data: finance });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/managers/:id/commission
router.put('/managers/:id/commission', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { commissionPercentage } = req.body;
        if (commissionPercentage === undefined) {
            return res.status(400).json({ success: false, error: 'commissionPercentage is required' });
        }
        const profile = await FinanceService.updateCommission(req.params.id, commissionPercentage);
        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/managers/:id/guarantee-fund
router.post('/managers/:id/guarantee-fund', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount, reason } = req.body;
        if (amount === undefined || !reason) {
            return res.status(400).json({ success: false, error: 'amount and reason are required' });
        }
        const profile = await FinanceService.adjustGuaranteeFund(
            req.params.id,
            parseFloat(amount),
            reason,
            req.user!.id
        );
        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
});

// ── Notifications ────────────────────────────────────────────

// GET /api/admin/notifications
router.get('/notifications', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 50;
        const isRead = req.query.isRead as string | undefined;

        const where: any = { userId: req.user!.id };
        if (isRead === 'true') where.isRead = true;
        if (isRead === 'false') where.isRead = false;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
        ]);
        res.json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/notifications/:id/read
router.put('/notifications/:id/read', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.notification.update({
            where: { id: req.params.id },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/notifications/read-all
router.put('/notifications/read-all', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user!.id, isRead: false },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/managers - List all managers
router.get('/managers', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const managers = await prisma.user.findMany({
            where: { role: 'MANAGER' },
            select: {
                id: true, name: true, phone: true, email: true, status: true,
                managerProfile: true,
                _count: { select: { managerOrders: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: managers });
    } catch (error) {
        next(error);
    }
});

// ── System Settings ──────────────────────────────────────────

const SETTING_DEFAULTS: Record<string, string> = {
    allowClientManagerSelection: 'false',
};

// GET /api/admin/settings
router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const dbSettings = await prisma.systemSetting.findMany();
        const settings: Record<string, string> = { ...SETTING_DEFAULTS };
        dbSettings.forEach(s => { settings[s.key] = s.value; });
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/settings
router.put('/settings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ success: false, error: 'key and value are required' });
        }
        await prisma.systemSetting.upsert({
            where: { key },
            create: { key, value: String(value) },
            update: { value: String(value) },
        });
        res.json({ success: true, message: 'Setting updated' });
    } catch (error) {
        next(error);
    }
});

// ── Invoice Management (Admin can do everything) ─────────────



// PUT /api/admin/invoice-lines/:id — Edit any line item (no time restriction)
router.put('/invoice-lines/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { description, quantity, netCost, clientPrice, type } = req.body;
        const updated = await InvoiceService.editLine(req.params.id, req.user!.id, 'ADMIN', {
            description, quantity: quantity ? parseInt(quantity) : undefined,
            netCost: netCost !== undefined ? parseFloat(netCost) : undefined,
            clientPrice: clientPrice !== undefined ? parseFloat(clientPrice) : undefined, type,
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/invoice-lines/:id — Delete any line item (no time restriction)
router.delete('/invoice-lines/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await InvoiceService.deleteLine(req.params.id, req.user!.id, 'ADMIN');
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/invoices/:id/lines — Add line to any invoice
router.post('/invoices/:id/lines', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { description, quantity, netCost, clientPrice, type } = req.body;
        if (!description || netCost === undefined || clientPrice === undefined) {
            return res.status(400).json({ success: false, error: 'description, netCost, clientPrice required' });
        }
        const line = await InvoiceService.addLine(req.params.id, req.user!.id, 'ADMIN', {
            description, quantity: parseInt(quantity) || 1, netCost: parseFloat(netCost), clientPrice: parseFloat(clientPrice), type,
        });
        res.status(201).json({ success: true, data: line });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/invoices/:id/carmed-fee — Update CarMed fee
router.put('/invoices/:id/carmed-fee', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { carmedFee } = req.body;
        if (carmedFee === undefined) {
            return res.status(400).json({ success: false, error: 'carmedFee is required' });
        }
        const invoice = await InvoiceService.updateCarmedFee(req.params.id, parseFloat(carmedFee));
        res.json({ success: true, data: invoice });
    } catch (error) {
        next(error);
    }
});

// ── Price Alerts ──────────────────────────────────────────

// GET /api/admin/price-alerts
router.get('/price-alerts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status ? String(req.query.status) : undefined;
        const alerts = await PartsCatalogService.getPriceAlerts(status);
        res.json({ success: true, data: alerts });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/price-alerts/:id
router.put('/price-alerts/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body; // REVIEWED or DISMISSED
        const alert = await PartsCatalogService.updateAlertStatus(req.params.id, status);
        res.json({ success: true, data: alert });
    } catch (error) {
        next(error);
    }
});

// ── Parts Catalog ────────────────────────────────────────────

// GET /api/admin/parts-catalog
router.get('/parts-catalog', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search ? String(req.query.search) : undefined;
        const make = req.query.make ? String(req.query.make) : undefined;
        const model = req.query.model ? String(req.query.model) : undefined;

        const where: any = {};
        if (search) where.partName = { contains: search, mode: 'insensitive' };
        if (make) where.make = { equals: make, mode: 'insensitive' };
        if (model) where.model = { equals: model, mode: 'insensitive' };

        const parts = await (prisma as any).partsCatalog.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: 100,
        });

        res.json({ success: true, data: parts });
    } catch (error) {
        next(error);
    }
});

// ── Vehicles ─────────────────────────────────────────────────

// GET /api/admin/vehicles
router.get('/vehicles', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            include: {
                client: { select: { id: true, name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: vehicles });
    } catch (error) {
        next(error);
    }
});



// ── System Settings ──────────────────────────────────────────

// GET /api/admin/settings
router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await SystemSettingsService.getAll();
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/settings
router.put('/settings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;
        // Support both { key: 'K', value: 'V' } and { K: 'V', ... } formats
        if (body.key && body.value !== undefined) {
            await SystemSettingsService.set(body.key, String(body.value));
        } else {
            await SystemSettingsService.updateMany(body);
        }
        const updated = await SystemSettingsService.getAll();
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// ── Correction Requests ──────────────────────────────────────

// GET /api/admin/correction-requests
router.get('/correction-requests', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status ? String(req.query.status) : undefined;
        const requests = await InvoiceService.getCorrectionRequests(status);
        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
});

// PUT /api/admin/correction-requests/:id (approve/reject)
router.put('/correction-requests/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { action, adminNote } = req.body; // action: 'APPROVED' | 'REJECTED'
        const approved = action === 'APPROVED';
        const result = await InvoiceService.resolveCorrectionRequest(
            req.params.id,
            req.user!.id,
            approved,
            adminNote
        );
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// ── Manager Fee Percent ──────────────────────────────────────

// PUT /api/admin/managers/:id/fee
router.put('/managers/:id/fee', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyFeePercent } = req.body;
        if (companyFeePercent === undefined || companyFeePercent < 0 || companyFeePercent > 100) {
            return res.status(400).json({ success: false, error: 'companyFeePercent must be 0-100' });
        }
        const profile = await (prisma as any).managerProfile.update({
            where: { userId: req.params.id },
            data: { companyFeePercent: parseFloat(companyFeePercent) },
        });
        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
});

export default router;
