// ============================================================
// CarMed Backend - Express Server Entry Point
// ============================================================

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import managerRoutes from './routes/manager.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Global Middleware ────────────────────────────────────────
app.use(cors({
    origin: [
        'http://localhost:5174', // Client Portal
        'http://localhost:5175', // Manager Portal
        'http://localhost:5176', // Admin Portal
    ],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ── Static Files (Uploads) ──────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'CarMed API is running', timestamp: new Date().toISOString() });
});

// ── Error Handler (must be last) ─────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚗 CarMed API Server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
