// ============================================================
// System Settings Service
// Manages global configuration: edit window, defaults, etc.
// ============================================================

import prisma from '../lib/prisma';

const DEFAULTS: Record<string, string> = {
    INVOICE_EDIT_WINDOW_HOURS: '2',       // hours (supports decimals: 0.1 = 6 min)
    DEFAULT_COMPANY_FEE_PERCENT: '20',    // % of net cost
};

export class SystemSettingsService {

    /**
     * Get a setting value (with default fallback)
     */
    static async get(key: string): Promise<string> {
        const setting = await (prisma as any).systemSetting.findUnique({ where: { key } });
        return setting?.value ?? DEFAULTS[key] ?? '';
    }

    /**
     * Get numeric setting
     */
    static async getNumber(key: string): Promise<number> {
        const val = await this.get(key);
        return parseFloat(val) || 0;
    }

    /**
     * Get edit window in milliseconds
     */
    static async getEditWindowMs(): Promise<number> {
        const hours = await this.getNumber('INVOICE_EDIT_WINDOW_HOURS');
        return hours * 60 * 60 * 1000;
    }

    /**
     * Set a setting value
     */
    static async set(key: string, value: string): Promise<void> {
        await (prisma as any).systemSetting.upsert({
            where: { key },
            create: { key, value },
            update: { value },
        });
    }

    /**
     * Get all settings (for admin display)
     */
    static async getAll(): Promise<Record<string, string>> {
        const settings = await (prisma as any).systemSetting.findMany();
        const result: Record<string, string> = { ...DEFAULTS };
        for (const s of settings) {
            result[s.key] = s.value;
        }
        return result;
    }

    /**
     * Bulk update settings
     */
    static async updateMany(settings: Record<string, string>): Promise<void> {
        const promises = Object.entries(settings).map(([key, value]) =>
            this.set(key, String(value))
        );
        await Promise.all(promises);
    }
}
