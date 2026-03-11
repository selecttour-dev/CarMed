// ============================================================
// Manager Routes - Profile, Tasks, Invoicing, Finance, Payments
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { OrderService } from '../services/order.service';
import { InvoiceService } from '../services/invoice.service';
import { PartsCatalogService } from '../services/parts-catalog.service';
import { FinanceService } from '../services/finance.service';
import prisma from '../lib/prisma';

const router = Router();

router.use(authenticate);
router.use(authorize('MANAGER'));

// ── Profile ──────────────────────────────────────────────────

// GET /api/manager/profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, name: true, phone: true, email: true, role: true, status: true,
                managerProfile: true,
                createdAt: true,
            },
        });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// PUT /api/manager/profile - Update profile details
router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, surname, personalId, dateOfBirth, personalAddress,
            bankName, bankAccountNumber, bankAccountName } = req.body;

        // Update user name/email
        if (name || email) {
            await prisma.user.update({
                where: { id: req.user!.id },
                data: { ...(name && { name }), ...(email && { email }) },
            });
        }

        // Upsert manager profile details
        const profileData: any = {};
        if (surname !== undefined) profileData.surname = surname;
        if (personalId !== undefined) profileData.personalId = personalId;
        if (dateOfBirth !== undefined) profileData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
        if (personalAddress !== undefined) profileData.personalAddress = personalAddress;
        if (bankName !== undefined) profileData.bankName = bankName;
        if (bankAccountNumber !== undefined) profileData.bankAccountNumber = bankAccountNumber;
        if (bankAccountName !== undefined) profileData.bankAccountName = bankAccountName;

        // Calculate if profile is complete
        const existingProfile = await prisma.managerProfile.findUnique({
            where: { userId: req.user!.id },
        });
        const merged = { ...existingProfile, ...profileData };
        const isProfileComplete = Boolean(
            merged.surname && merged.personalId && merged.bankName &&
            merged.bankAccountNumber && merged.bankAccountName
        );
        profileData.isProfileComplete = isProfileComplete;

        await prisma.managerProfile.update({
            where: { userId: req.user!.id },
            data: profileData,
        });

        const updated = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, name: true, phone: true, email: true, role: true, status: true,
                managerProfile: true, createdAt: true,
            },
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// ── Availability Toggle ──────────────────────────────────────

// PUT /api/manager/availability
router.put('/availability', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { isAvailable } = req.body;
        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({ success: false, error: 'isAvailable must be a boolean' });
        }

        const profile = await prisma.managerProfile.update({
            where: { userId: req.user!.id },
            data: { isAvailable },
        });

        // Notify admins about availability change
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });
        await prisma.notification.createMany({
            data: admins.map((admin) => ({
                userId: admin.id,
                type: 'ADMIN_ALERT' as const,
                title: isAvailable ? '✅ მენეჯერი ხელმისაწვდომია' : '⛔ მენეჯერი არ მუშაობს',
                message: `${user?.name} ${isAvailable ? 'ისევ ხელმისაწვდომია' : 'მონიშნა "არ ვმუშაობ"'}`,
                metadata: { managerId: req.user!.id, isAvailable },
            })),
        });

        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
});

// ── Task Board (Orders) ─────────────────────────────────────

// GET /api/manager/orders
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string | undefined;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;

        const result = await OrderService.getOrders({
            managerId: req.user!.id,
            status: status as any,
            page,
            pageSize,
        });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
});

// GET /api/manager/orders/:id
router.get('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        if (order.managerId !== req.user!.id) {
            return res.status(403).json({ success: false, error: 'Not assigned to you' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// PUT /api/manager/orders/:id/status
router.put('/orders/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, notes } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }

        // Verify manager is assigned
        const order = await prisma.order.findFirst({
            where: { id: req.params.id, managerId: req.user!.id },
        });
        if (!order) {
            return res.status(403).json({ success: false, error: 'Not assigned to you' });
        }

        const updated = await OrderService.updateStatus(req.params.id, status, req.user!.id, notes);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// PUT /api/manager/orders/:id/mark-fee-paid — Manager confirms company fee paid
router.put('/orders/:id/mark-fee-paid', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await OrderService.markManagerFeePaid(req.params.id, req.user!.id);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// ── Order Rejection ──────────────────────────────────────────

// PUT /api/manager/orders/:id/reject
router.put('/orders/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reason } = req.body;

        const order = await prisma.order.findFirst({
            where: { id: req.params.id, managerId: req.user!.id },
        });
        if (!order) {
            return res.status(403).json({ success: false, error: 'Not assigned to you' });
        }
        if (!['PENDING', 'ACCEPTED'].includes(order.status)) {
            return res.status(400).json({ success: false, error: 'Can only reject orders in PENDING or ACCEPTED status' });
        }

        // Unassign manager and set back to PENDING
        const updated = await prisma.order.update({
            where: { id: req.params.id },
            data: {
                managerId: null,
                status: 'PENDING',
                statusHistory: {
                    create: {
                        fromStatus: order.status,
                        toStatus: 'PENDING',
                        changedById: req.user!.id,
                        notes: reason ? `შეკვეთა უარყოფილია: ${reason}` : 'შეკვეთა უარყოფილია მენეჯერის მიერ',
                    },
                },
            },
            include: {
                vehicle: true,
                client: { select: { id: true, name: true, phone: true, role: true, status: true } },
            },
        });

        // Notify admins
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        const manager = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });
        await prisma.notification.createMany({
            data: admins.map((admin) => ({
                userId: admin.id,
                type: 'ORDER_REJECTED' as const,
                title: '❌ შეკვეთა უარყოფილია',
                message: `${manager?.name}-მა უარყო შეკვეთა #${req.params.id.slice(0, 8)}${reason ? ': ' + reason : ''}`,
                metadata: { orderId: req.params.id, managerId: req.user!.id, reason },
            })),
        });

        // Notify client
        await prisma.notification.create({
            data: {
                userId: order.clientId,
                type: 'ORDER_STATUS_CHANGED' as const,
                title: 'მენეჯერი შეიცვალა',
                message: `შეკვეთა #${req.params.id.slice(0, 8)} — ახალი მენეჯერი დაგინიშნებათ`,
                metadata: { orderId: req.params.id },
            },
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// ── Invoice Generator (Line-Item Based) ──────────────────────

// POST /api/manager/orders/:id/invoice — Create invoice with line items
router.post('/orders/:id/invoice', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { note, lines } = req.body;
        if (!lines || !Array.isArray(lines) || lines.length === 0) {
            return res.status(400).json({ success: false, error: 'lines[] are required' });
        }

        const invoice = await InvoiceService.createInvoice(req.params.id, req.user!.id, {
            note,
            lines: lines.map((l: any) => ({
                description: l.description,
                quantity: parseInt(l.quantity) || 1,
                netCost: parseFloat(l.netCost),
                clientPrice: parseFloat(l.clientPrice),
                type: l.type || 'PART',
            })),
        });
        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        next(error);
    }
});

// POST /api/manager/invoices/:id/lines — Add line item
router.post('/invoices/:id/lines', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { description, quantity, netCost, clientPrice, type, quality, brand } = req.body;
        if (!description || netCost === undefined || clientPrice === undefined) {
            return res.status(400).json({ success: false, error: 'description, netCost, clientPrice required' });
        }
        const line = await InvoiceService.addLine(req.params.id, req.user!.id, 'MANAGER', {
            description, quantity: parseInt(quantity) || 1,
            netCost: parseFloat(netCost), clientPrice: parseFloat(clientPrice),
            type, quality, brand,
        });
        res.status(201).json({ success: true, data: line });
    } catch (error) {
        next(error);
    }
});

// PUT /api/manager/invoice-lines/:id — Edit line item (or auto-correction if window expired)
router.put('/invoice-lines/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { description, quantity, netCost, clientPrice, type } = req.body;
        const result = await InvoiceService.editLine(req.params.id, req.user!.id, 'MANAGER', {
            description, quantity: quantity ? parseInt(quantity) : undefined,
            netCost: netCost !== undefined ? parseFloat(netCost) : undefined,
            clientPrice: clientPrice !== undefined ? parseFloat(clientPrice) : undefined, type,
        });
        if (result && (result as any).correctionSent) {
            return res.json({ success: true, correctionSent: true, message: (result as any).message });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/manager/invoice-lines/:id — Delete line item (or auto-correction if window expired)
router.delete('/invoice-lines/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await InvoiceService.deleteLine(req.params.id, req.user!.id, 'MANAGER');
        if (result && (result as any).correctionSent) {
            return res.json({ success: true, correctionSent: true, message: (result as any).message });
        }
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// POST /api/manager/correction-requests — Submit correction request (after 2h)
router.post('/correction-requests', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { invoiceId, invoiceLineId, type, reason, newDescription, newNetCost, newClientPrice, newQuantity, newType } = req.body;
        if (!invoiceId || !type) {
            return res.status(400).json({ success: false, error: 'invoiceId and type are required' });
        }
        const request = await InvoiceService.submitCorrectionRequest(req.user!.id, {
            invoiceId, invoiceLineId, type, reason, newDescription,
            newNetCost: newNetCost !== undefined ? parseFloat(newNetCost) : undefined,
            newClientPrice: newClientPrice !== undefined ? parseFloat(newClientPrice) : undefined,
            newQuantity: newQuantity ? parseInt(newQuantity) : undefined, newType,
        });
        res.status(201).json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
});

// ── Payment Confirmation (RULE 2) ───────────────────────────

// POST /api/manager/orders/:id/confirm-payment
router.post('/orders/:id/confirm-payment', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await OrderService.confirmPayment(req.params.id, req.user!.id);
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// ── Finance Dashboard ────────────────────────────────────────

// GET /api/manager/finance
router.get('/finance', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const finance = await FinanceService.getManagerFinance(req.user!.id);
        res.json({ success: true, data: finance });
    } catch (error) {
        next(error);
    }
});

// ── Notifications ────────────────────────────────────────────

// GET /api/manager/notifications
router.get('/notifications', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
});

// ── Parts Catalog Autocomplete ───────────────────────────────

// GET /api/manager/parts-catalog?make=Mercedes&model=GLE+Coupe&query=ბაბ
router.get('/parts-catalog', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { make, model, query } = req.query;
        if (!make || !model) {
            return res.status(400).json({ success: false, error: 'make and model are required' });
        }
        const parts = await PartsCatalogService.searchParts(
            String(make), String(model), query ? String(query) : undefined
        );
        res.json({ success: true, data: parts });
    } catch (error) {
        next(error);
    }
});

// GET /api/manager/brands?query=bo — Brand autocomplete
router.get('/brands', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.query ? String(req.query.query) : '';
        const where: any = { brand: { not: null } };
        if (query.length >= 1) {
            where.brand = { ...where.brand, contains: query, mode: 'insensitive' };
        }
        const results = await (prisma as any).partsCatalog.findMany({
            where,
            select: { brand: true },
            distinct: ['brand'],
            orderBy: { brand: 'asc' },
            take: 15,
        });
        const brands = results.map((r: any) => r.brand).filter(Boolean);
        res.json({ success: true, data: brands });
    } catch (error) {
        next(error);
    }
});

export default router;
