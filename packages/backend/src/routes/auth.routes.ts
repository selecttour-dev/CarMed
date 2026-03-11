// ============================================================
// Auth Routes - Login, Register, Token Refresh, Logout
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, phone, password, email } = req.body;
        if (!name || !phone || !password) {
            return res.status(400).json({ success: false, error: 'Name, phone and password are required' });
        }
        const result = await AuthService.register({ name, phone, password, email });
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ success: false, error: 'Phone and password are required' });
        }
        const result = await AuthService.login(phone, password);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, error: 'Refresh token is required' });
        }
        const tokens = await AuthService.refresh(refreshToken);
        res.json({ success: true, data: tokens });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await AuthService.logout(refreshToken);
        }
        res.json({ success: true, message: 'Logged out' });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await AuthService.getMe(req.user!.id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

export default router;
