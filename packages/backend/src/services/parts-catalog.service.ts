// ============================================================
// Parts Catalog Service — Auto-populated price catalog
// - Tracks parts per vehicle make/model AND quality category
// - Provides autocomplete for part names
// - Detects price deviations (>10%) and alerts admin
// - Detects quality mismatch fraud (AFTERMARKET priced as OEM)
// ============================================================

import prisma from '../lib/prisma';

const PRICE_DEVIATION_THRESHOLD = 0.10; // 10%

// Quality labels for Georgian display
const QUALITY_LABELS: Record<string, string> = {
    OEM: 'ორიგინალი',
    AFTERMARKET: 'არაორიგინალი',
    USED_OEM: 'მეორადი ორიგ.',
    REFURBISHED: 'აღდგენილი',
};

export class PartsCatalogService {

    /**
     * Search parts catalog for autocomplete
     * Returns matching parts for given make/model
     */
    static async searchParts(make: string, model: string, query?: string) {
        const where: any = {
            make: { equals: make, mode: 'insensitive' },
            model: { equals: model, mode: 'insensitive' },
        };

        if (query && query.length >= 2) {
            where.partName = { contains: query, mode: 'insensitive' };
        }

        const parts = await (prisma as any).partsCatalog.findMany({
            where,
            orderBy: { usageCount: 'desc' },
            take: 30,
        });

        return parts;
    }

    /**
     * Update catalog and check price after invoice line creation
     * Now tracks by [make, model, partName, quality] for smart pricing
     */
    static async trackPart(data: {
        make: string;
        model: string;
        partName: string;
        type: string;
        quality?: string;    // OEM | AFTERMARKET | USED_OEM | REFURBISHED
        brand?: string;      // Bosch, TRW, Toyota Genuine...
        netCost: number;
        clientPrice: number;
        quantity: number;
        managerId: string;
        orderId: string;
        invoiceLineId: string;
    }) {
        const normalizedMake = data.make.trim();
        const normalizedModel = data.model.trim();
        const normalizedName = data.partName.trim();
        const quality = data.quality || null;
        const brand = data.brand?.trim() || null;

        // Find or create catalog entry — now by [make, model, partName, quality]
        const existing = await (prisma as any).partsCatalog.findFirst({
            where: {
                make: normalizedMake,
                model: normalizedModel,
                partName: normalizedName,
                quality: quality,
            },
        });

        let catalogId: string;

        if (existing) {
            // Update running averages
            const newCount = existing.usageCount + 1;
            const newAvgNet = ((existing.avgNetCost * existing.usageCount) + data.netCost) / newCount;
            const newAvgClient = ((existing.avgClientPrice * existing.usageCount) + data.clientPrice) / newCount;

            catalogId = existing.id;

            await (prisma as any).partsCatalog.update({
                where: { id: existing.id },
                data: {
                    avgNetCost: newAvgNet,
                    avgClientPrice: newAvgClient,
                    lastNetCost: data.netCost,
                    lastClientPrice: data.clientPrice,
                    minClientPrice: Math.min(existing.minClientPrice || data.clientPrice, data.clientPrice),
                    maxClientPrice: Math.max(existing.maxClientPrice || data.clientPrice, data.clientPrice),
                    usageCount: newCount,
                    type: data.type,
                    brand: brand || existing.brand,
                },
            });

            // Check price deviation on NET COST within same quality category
            // (clientPrice is more individual/negotiable, netCost should be consistent)
            const expectedNetCost = existing.avgNetCost;
            if (existing.usageCount >= 1 && expectedNetCost > 0) {
                const deviation = Math.abs(data.netCost - expectedNetCost) / expectedNetCost;

                if (deviation > PRICE_DEVIATION_THRESHOLD) {
                    await this.createAlert({
                        ...data,
                        make: normalizedMake,
                        model: normalizedModel,
                        partName: normalizedName,
                        quality,
                        brand,
                        catalogId,
                        expectedPrice: expectedNetCost,
                        deviation,
                        alertType: 'PRICE_DEVIATION',
                    });
                }
            }
        } else {
            // First time this part+quality combo is used
            const created = await (prisma as any).partsCatalog.create({
                data: {
                    make: normalizedMake,
                    model: normalizedModel,
                    partName: normalizedName,
                    type: data.type,
                    quality,
                    brand,
                    avgNetCost: data.netCost,
                    avgClientPrice: data.clientPrice,
                    lastNetCost: data.netCost,
                    lastClientPrice: data.clientPrice,
                    minClientPrice: data.clientPrice,
                    maxClientPrice: data.clientPrice,
                    usageCount: 1,
                },
            });
            catalogId = created.id;

            // Cross-quality fraud check: does a cheaper quality exist at similar/higher price?
            await this.checkQualityMismatch(data, normalizedMake, normalizedModel, normalizedName, quality, catalogId);
        }

        return catalogId;
    }

    /**
     * Cross-quality fraud detection
     * e.g. AFTERMARKET part priced at OEM level
     */
    private static async checkQualityMismatch(
        data: { clientPrice: number; managerId: string; orderId: string; invoiceLineId: string; brand?: string },
        make: string, model: string, partName: string,
        quality: string | null, catalogId: string
    ) {
        if (!quality || quality === 'OEM') return; // OEM is the most expensive, no fraud check needed

        // Find OEM price for same part
        const oemEntry = await (prisma as any).partsCatalog.findFirst({
            where: {
                make, model, partName,
                quality: 'OEM',
            },
        });

        if (oemEntry && oemEntry.avgClientPrice > 0) {
            // If aftermarket/used is >= 80% of OEM price, suspicious
            const ratio = data.clientPrice / oemEntry.avgClientPrice;
            if (ratio >= 0.80) {
                await this.createAlert({
                    ...data,
                    make, model, partName,
                    quality,
                    brand: data.brand || null,
                    catalogId,
                    expectedPrice: oemEntry.avgClientPrice,
                    deviation: ratio - 1,
                    alertType: 'QUALITY_MISMATCH',
                });
            }
        }
    }

    /**
     * Create a price alert with notification to admins
     */
    private static async createAlert(data: {
        invoiceLineId: string;
        catalogId: string;
        managerId: string;
        orderId: string;
        partName: string;
        make: string;
        model: string;
        quality: string | null;
        brand: string | null;
        expectedPrice: number;
        netCost?: number;
        clientPrice?: number;
        deviation: number;
        alertType: string;
    }) {
        const isQualityMismatch = data.alertType === 'QUALITY_MISMATCH';
        // For price deviation: compare netCost. For quality mismatch: compare clientPrice.
        const actualPrice = isQualityMismatch ? (data.clientPrice || 0) : (data.netCost || 0);
        const deviationPct = Math.round(Math.abs(data.deviation) * 100);

        await (prisma as any).priceAlert.create({
            data: {
                invoiceLineId: data.invoiceLineId,
                catalogId: data.catalogId,
                managerId: data.managerId,
                orderId: data.orderId,
                partName: data.partName,
                make: data.make,
                model: data.model,
                quality: data.quality,
                brand: data.brand,
                expectedPrice: data.expectedPrice,
                actualPrice,
                deviationPct,
                alertType: data.alertType,
            },
        });

        // Notify admins
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        const manager = await prisma.user.findUnique({
            where: { id: data.managerId },
            select: { name: true },
        });

        const qualityLabel = data.quality ? QUALITY_LABELS[data.quality] || data.quality : '';

        const title = isQualityMismatch ? '🚨 ხარისხის შეუსაბამობა' : '⚠️ ფასის გადახრა (ნეტო)';
        const message = isQualityMismatch
            ? `${manager?.name || 'მენეჯერი'}: "${data.partName}" ${qualityLabel} — კლ.₾${actualPrice} (OEM საშ. ₾${data.expectedPrice.toFixed(0)}) — ${qualityLabel} ფასი OEM-ის დონეზეა!`
            : `${manager?.name || 'მენეჯერი'}: "${data.partName}" ${qualityLabel} (${data.make} ${data.model}) — ნეტო ₾${actualPrice} vs საშ.ნეტო ₾${data.expectedPrice.toFixed(0)} (${deviationPct}% გადახრა)`;

        await prisma.notification.createMany({
            data: admins.map((a) => ({
                userId: a.id,
                type: 'ADMIN_ALERT' as const,
                title,
                message,
                metadata: {
                    invoiceLineId: data.invoiceLineId,
                    catalogId: data.catalogId,
                    alertType: data.alertType,
                    deviation: deviationPct,
                },
            })),
        });
    }

    /**
     * Get price alerts for admin — enriched with manager name & order info
     */
    static async getPriceAlerts(status?: string) {
        const alerts = await (prisma as any).priceAlert.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        if (!alerts.length) return [];

        // Enrich with manager name and order info
        const managerIds = [...new Set(alerts.map((a: any) => a.managerId))] as string[];
        const orderIds = [...new Set(alerts.map((a: any) => a.orderId))] as string[];

        const [managers, orders] = await Promise.all([
            prisma.user.findMany({
                where: { id: { in: managerIds } },
                select: { id: true, name: true, phone: true },
            }),
            prisma.order.findMany({
                where: { id: { in: orderIds } },
                select: { id: true, vehicle: { select: { make: true, model: true, plateNumber: true } } },
            }),
        ]);

        const managerMap = new Map(managers.map(m => [m.id, m]));
        const orderMap = new Map(orders.map(o => [o.id, o]));

        return alerts.map((alert: any) => ({
            ...alert,
            managerName: managerMap.get(alert.managerId)?.name || 'უცნობი',
            managerPhone: managerMap.get(alert.managerId)?.phone || '',
            orderShortId: alert.orderId.slice(0, 8).toUpperCase(),
        }));
    }

    /**
     * Admin: dismiss or review a price alert
     */
    static async updateAlertStatus(alertId: string, status: 'REVIEWED' | 'DISMISSED') {
        return (prisma as any).priceAlert.update({
            where: { id: alertId },
            data: { status },
        });
    }
}
