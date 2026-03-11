// ============================================================
// Auth Service - JWT Authentication & Token Management
// ============================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ActivityService } from './activity.service';

const SALT_ROUNDS = 12;

/**
 * Normalize Georgian phone number to +995XXXXXXXXX format.
 * Accepts: +995555000010, 995555000010, 555000010, 0555000010
 * Also strips spaces, dashes, and parentheses.
 */
function normalizePhone(raw: string): string {
    // Remove all non-digit characters except leading +
    let digits = raw.replace(/[^\d+]/g, '');

    // Remove leading +
    if (digits.startsWith('+')) {
        digits = digits.slice(1);
    }

    // Remove leading 0 (local format: 0555...)
    if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    // If starts with 995 and has 12 digits total — already has country code
    if (digits.startsWith('995') && digits.length === 12) {
        return '+' + digits;
    }

    // If 9 digits (local number without country code)
    if (digits.length === 9) {
        return '+995' + digits;
    }

    // Fallback: return with + prefix if long enough, or as-is
    if (digits.length >= 9) {
        return '+' + digits;
    }

    return raw; // Return original if can't parse
}

export class AuthService {
    /**
     * Register a new user (Client by default)
     */
    static async register(data: {
        name: string;
        phone: string;
        password: string;
        email?: string;
        role?: 'CLIENT' | 'MANAGER' | 'ADMIN';
    }) {
        data.phone = normalizePhone(data.phone);
        const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
        if (existing) {
            throw ApiError.conflict('Phone number already registered');
        }

        if (data.email) {
            const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
            if (existingEmail) {
                throw ApiError.conflict('Email already registered');
            }
        }

        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
        const role = data.role || 'CLIENT';

        const user = await prisma.user.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                passwordHash,
                role,
                // Auto-create manager profile for MANAGER role
                ...(role === 'MANAGER' && {
                    managerProfile: {
                        create: {
                            commissionPercentage: 60,
                            guaranteeFundBalance: 0,
                            currentDebtToCompany: 0,
                        },
                    },
                }),
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        const tokens = await this.generateTokens(user.id, user.role);
        return { user, ...tokens };
    }

    /**
     * Login with phone + password
     */
    static async login(phone: string, password: string) {
        const normalizedPhone = normalizePhone(phone);
        const user = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                status: true,
                passwordHash: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        if (user.status === 'BLOCKED') {
            throw ApiError.forbidden('Account is blocked');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        const tokens = await this.generateTokens(user.id, user.role);
        const { passwordHash: _, ...userData } = user;

        // Update lastLoginAt & log activity
        await (prisma as any).user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        ActivityService.log({
            userId: user.id,
            action: 'LOGIN',
            description: `${user.name} შემოვიდა სისტემაში (${user.role})`,
        });

        return { user: userData, ...tokens };
    }

    /**
     * Refresh access token using a valid refresh token
     */
    static async refresh(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
                id: string;
                role: string;
            };

            // Verify token exists in DB (rotation)
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw ApiError.unauthorized('Invalid refresh token');
            }

            // Rotate: delete old, create new
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });

            const tokens = await this.generateTokens(decoded.id, decoded.role);
            return tokens;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw ApiError.unauthorized('Invalid refresh token');
        }
    }

    /**
     * Logout - revoke refresh token
     */
    static async logout(refreshToken: string) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    /**
     * Get current user profile
     */
    static async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                managerProfile: true,
            },
        });

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user;
    }

    /**
     * Generate JWT access + refresh tokens with DB persistence
     */
    private static async generateTokens(userId: string, role: string) {
        const accessToken = jwt.sign(
            { id: userId, role },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: userId, role },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        // Store refresh token in DB
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return { accessToken, refreshToken };
    }
}
