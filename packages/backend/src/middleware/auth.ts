import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
                name: string;
                phone: string;
            };
        }
    }
}

/**
 * Authenticate middleware - validates JWT Bearer token
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            role: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, name: true, phone: true, status: true },
        });

        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        if (user.status === 'BLOCKED') {
            throw ApiError.forbidden('Account is blocked');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }
        next(ApiError.unauthorized('Invalid or expired token'));
    }
};

/**
 * Authorization middleware - checks user role
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(ApiError.unauthorized());
        }
        if (!roles.includes(req.user.role)) {
            return next(ApiError.forbidden('Insufficient permissions'));
        }
        next();
    };
};
