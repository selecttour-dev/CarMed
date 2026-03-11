// ============================================================
// Client Routes - Vehicles, Orders, Receipts, Notifications
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { OrderService } from '../services/order.service';
import prisma from '../lib/prisma';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';

const router = Router();

// All client routes require authentication
router.use(authenticate);
router.use(authorize('CLIENT'));

// ── File Upload Config ───────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/receipts'));
    },
    filename: (_req, file, cb) => {
        cb(null, `${uuid()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Profile ──────────────────────────────────────────────────

// GET /api/client/profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, phone: true, email: true, role: true, status: true, createdAt: true },
        });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// PUT /api/client/profile
router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: { ...(name && { name }), ...(email && { email }) },
            select: { id: true, name: true, phone: true, email: true, role: true, status: true },
        });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// ── Vehicles (Garage) ────────────────────────────────────────

// GET /api/client/vehicles
router.get('/vehicles', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { clientId: req.user!.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: vehicles });
    } catch (error) {
        next(error);
    }
});

// POST /api/client/vehicles
router.post('/vehicles', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { make, model, year, vin, plateNumber, color } = req.body;
        if (!make || !model || !year || !plateNumber) {
            return res.status(400).json({ success: false, error: 'Make, model, year, and plate number are required' });
        }
        const vehicle = await prisma.vehicle.create({
            data: { clientId: req.user!.id, make, model, year: parseInt(year), vin, plateNumber, color },
        });
        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        next(error);
    }
});

// PUT /api/client/vehicles/:id
router.put('/vehicles/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicle = await prisma.vehicle.findFirst({
            where: { id: req.params.id, clientId: req.user!.id },
        });
        if (!vehicle) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }
        const { make, model, year, vin, plateNumber, color } = req.body;
        const updated = await prisma.vehicle.update({
            where: { id: req.params.id },
            data: {
                ...(make && { make }),
                ...(model && { model }),
                ...(year && { year: parseInt(year) }),
                ...(vin !== undefined && { vin }),
                ...(plateNumber && { plateNumber }),
                ...(color !== undefined && { color }),
            },
        });
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/client/vehicles/:id
router.delete('/vehicles/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicle = await prisma.vehicle.findFirst({
            where: { id: req.params.id, clientId: req.user!.id },
        });
        if (!vehicle) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }
        await prisma.vehicle.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Vehicle deleted' });
    } catch (error) {
        next(error);
    }
});

// ── Orders ───────────────────────────────────────────────────

// GET /api/client/orders
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const result = await OrderService.getOrders({ clientId: req.user!.id, page, pageSize });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
});

// POST /api/client/orders
router.post('/orders', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vehicleId, address, problemDescription, managerId } = req.body;
        if (!vehicleId || !address || !problemDescription) {
            return res.status(400).json({ success: false, error: 'vehicleId, address, and problemDescription are required' });
        }

        // Check if client manager selection is allowed
        let validManagerId: string | undefined;
        if (managerId) {
            const setting = await prisma.systemSetting.findUnique({ where: { key: 'allowClientManagerSelection' } });
            if (setting?.value === 'true') {
                const manager = await prisma.user.findFirst({
                    where: { id: managerId, role: 'MANAGER', status: 'ACTIVE' },
                });
                if (manager) validManagerId = managerId;
            }
        }

        const order = await OrderService.createOrder({
            clientId: req.user!.id,
            vehicleId,
            address,
            problemDescription,
            managerId: validManagerId,
        });
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});

// GET /api/client/orders/:id
router.get('/orders/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        // Ensure client can only see their own orders
        if (order.clientId !== req.user!.id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
});


// Receipt upload endpoint removed — payment verification via manager confirmation only

// ── Notifications ────────────────────────────────────────────

// GET /api/client/notifications
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

// ── Settings & Manager Selection ─────────────────────────────

// GET /api/client/settings - Get client-relevant settings
router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'allowClientManagerSelection' },
        });
        res.json({
            success: true,
            data: {
                allowClientManagerSelection: setting?.value === 'true',
            },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/client/managers - Get available managers (only if selection is enabled)
router.get('/managers', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'allowClientManagerSelection' },
        });
        if (setting?.value !== 'true') {
            return res.json({ success: true, data: [], enabled: false });
        }
        const managers = await prisma.user.findMany({
            where: {
                role: 'MANAGER',
                status: 'ACTIVE',
                managerProfile: { isAvailable: true },
            },
            select: {
                id: true, name: true, phone: true,
                managerProfile: {
                    select: { surname: true, bankName: true },
                },
            },
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: managers, enabled: true });
    } catch (error) {
        next(error);
    }
});

// ── Invoice Approval ─────────────────────────────────────────

// PUT /api/client/orders/:orderId/invoice/lines/:lineId/approve
router.put('/orders/:orderId/invoice/lines/:lineId/approve', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.orderId },
            include: { invoice: { include: { lines: true } } },
        });
        if (!order || order.clientId !== req.user!.id) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        if (!order.invoice) {
            return res.status(400).json({ success: false, error: 'No invoice found' });
        }
        const line = order.invoice.lines.find(l => l.id === req.params.lineId);
        if (!line) {
            return res.status(404).json({ success: false, error: 'Line not found' });
        }

        await prisma.invoiceLine.update({
            where: { id: line.id },
            data: { clientApprovalStatus: 'APPROVED', clientRejectionReason: null },
        });

        // Recalculate invoice-level approval status
        await recalcInvoiceApproval(order.invoice.id);

        const updated = await OrderService.getOrderById(req.params.orderId);
        res.json({ success: true, data: updated });
    } catch (error) { next(error); }
});

// PUT /api/client/orders/:orderId/invoice/lines/:lineId/reject
router.put('/orders/:orderId/invoice/lines/:lineId/reject', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reason } = req.body;
        const order = await prisma.order.findUnique({
            where: { id: req.params.orderId },
            include: { invoice: { include: { lines: true } } },
        });
        if (!order || order.clientId !== req.user!.id) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        if (!order.invoice) {
            return res.status(400).json({ success: false, error: 'No invoice found' });
        }
        const line = order.invoice.lines.find(l => l.id === req.params.lineId);
        if (!line) {
            return res.status(404).json({ success: false, error: 'Line not found' });
        }

        await prisma.invoiceLine.update({
            where: { id: line.id },
            data: { clientApprovalStatus: 'REJECTED', clientRejectionReason: reason || null },
        });

        await recalcInvoiceApproval(order.invoice.id);

        const updated = await OrderService.getOrderById(req.params.orderId);
        res.json({ success: true, data: updated });
    } catch (error) { next(error); }
});

// PUT /api/client/orders/:orderId/invoice/approve — Approve entire invoice
router.put('/orders/:orderId/invoice/approve', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.orderId },
            include: { invoice: { include: { lines: true } } },
        });
        if (!order || order.clientId !== req.user!.id) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        if (!order.invoice) {
            return res.status(400).json({ success: false, error: 'No invoice found' });
        }

        // Approve all pending lines
        await prisma.invoiceLine.updateMany({
            where: { invoiceId: order.invoice.id, clientApprovalStatus: 'PENDING' },
            data: { clientApprovalStatus: 'APPROVED' },
        });

        await prisma.invoice.update({
            where: { id: order.invoice.id },
            data: {
                clientApprovalStatus: 'APPROVED',
                clientApprovalNote: null,
                clientApprovedAt: new Date(),
            },
        });

        const updated = await OrderService.getOrderById(req.params.orderId);

        // Notify admins about invoice approval
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'ADMIN_ALERT' as any,
                    title: 'ინვოისი დადასტურდა',
                    message: `კლიენტმა დაადასტურა ინვოისი შეკვეთა #${req.params.orderId.slice(0, 8)}`,
                    metadata: { orderId: req.params.orderId },
                },
            });
        }

        res.json({ success: true, data: updated });
    } catch (error) { next(error); }
});

// PUT /api/client/orders/:orderId/invoice/reject — Reject entire invoice
router.put('/orders/:orderId/invoice/reject', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reason } = req.body;
        const order = await prisma.order.findUnique({
            where: { id: req.params.orderId },
            include: { invoice: { include: { lines: true } } },
        });
        if (!order || order.clientId !== req.user!.id) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        if (!order.invoice) {
            return res.status(400).json({ success: false, error: 'No invoice found' });
        }

        // Reject all lines
        await prisma.invoiceLine.updateMany({
            where: { invoiceId: order.invoice.id },
            data: { clientApprovalStatus: 'REJECTED', clientRejectionReason: reason || null },
        });

        await prisma.invoice.update({
            where: { id: order.invoice.id },
            data: {
                clientApprovalStatus: 'REJECTED',
                clientApprovalNote: reason || null,
                clientApprovedAt: new Date(),
            },
        });

        const updated = await OrderService.getOrderById(req.params.orderId);

        // Notify admins about invoice rejection
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'ADMIN_ALERT' as any,
                    title: 'ინვოისი უარყოფილია',
                    message: `კლიენტმა უარყო ინვოისი შეკვეთა #${req.params.orderId.slice(0, 8)}${reason ? ': ' + reason : ''}`,
                    metadata: { orderId: req.params.orderId },
                },
            });
        }

        res.json({ success: true, data: updated });
    } catch (error) { next(error); }
});

// Helper: recalculate invoice-level approval based on line statuses
async function recalcInvoiceApproval(invoiceId: string) {
    const lines = await prisma.invoiceLine.findMany({ where: { invoiceId } });
    const allApproved = lines.every(l => l.clientApprovalStatus === 'APPROVED');
    const allRejected = lines.every(l => l.clientApprovalStatus === 'REJECTED');
    const allPending = lines.every(l => l.clientApprovalStatus === 'PENDING');

    let status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED' = 'PENDING';
    if (allApproved) status = 'APPROVED';
    else if (allRejected) status = 'REJECTED';
    else if (!allPending) status = 'PARTIALLY_APPROVED';

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            clientApprovalStatus: status,
            clientApprovedAt: status !== 'PENDING' ? new Date() : null,
        },
    });
}

// ── Reviews ──────────────────────────────────────────────────

// POST /api/client/orders/:orderId/review
router.post('/orders/:orderId/review', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
        }

        const order = await prisma.order.findFirst({
            where: { id: orderId, clientId: req.user!.id },
            include: { review: true },
        });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        if (order.status !== 'COMPLETED') {
            return res.status(400).json({ success: false, error: 'Can only review completed orders' });
        }
        if (order.review) {
            return res.status(400).json({ success: false, error: 'Review already submitted' });
        }
        if (!order.managerId) {
            return res.status(400).json({ success: false, error: 'No manager to review' });
        }

        await prisma.review.create({
            data: {
                orderId,
                clientId: req.user!.id,
                managerId: order.managerId,
                rating: parseInt(String(rating)),
                comment: comment || null,
            },
        });

        const updated = await OrderService.getOrderById(orderId);

        // Notify admins about review
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'ADMIN_ALERT' as any,
                    title: 'ახალი შეფასება',
                    message: `კლიენტმა შეაფასა მენეჯერი ${parseInt(String(rating))}/5 ⭐ (შეკვეთა #${orderId.slice(0, 8)})`,
                    metadata: { orderId },
                },
            });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

export default router;
