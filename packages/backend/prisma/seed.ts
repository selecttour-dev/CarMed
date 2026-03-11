// ============================================================
// Database Seed - Test Data for Development
// ============================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data (order matters for foreign keys)
    await prisma.invoiceCorrectionRequest.deleteMany();
    await prisma.invoiceLine.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.orderStatusHistory.deleteMany();
    await prisma.order.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.managerProfile.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('admin123', 12);
    const clientHash = await bcrypt.hash('client123', 12);
    const managerHash = await bcrypt.hash('manager123', 12);

    // ── Admin ──────────────────────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            name: 'Admin',
            phone: '+995555000001',
            email: 'admin@carmed.ge',
            passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Admin created:', admin.email);

    // ── Managers ───────────────────────────────────────────────
    const manager1 = await prisma.user.create({
        data: {
            name: 'გიორგი მენეჯერი',
            phone: '+995555000002',
            email: 'manager@carmed.ge',
            passwordHash: managerHash,
            role: 'MANAGER',
            status: 'ACTIVE',
            managerProfile: {
                create: {
                    surname: 'ბერიძე',
                    personalId: '01234567890',
                    commissionPercentage: 60,
                    guaranteeFundBalance: 500,
                    currentDebtToCompany: 0,
                    bankName: 'TBC ბანკი',
                    bankAccountNumber: 'GE29BG0000000527972726',
                    bankAccountName: 'გიორგი ბერიძე',
                    isAvailable: true,
                    isProfileComplete: true,
                },
            },
        },
    });
    console.log('✅ Manager 1 created:', manager1.email);

    const manager2 = await prisma.user.create({
        data: {
            name: 'ნიკა მენეჯერი',
            phone: '+995555000003',
            email: 'manager2@carmed.ge',
            passwordHash: managerHash,
            role: 'MANAGER',
            status: 'ACTIVE',
            managerProfile: {
                create: {
                    surname: 'კაპანაძე',
                    commissionPercentage: 55,
                    guaranteeFundBalance: 300,
                    currentDebtToCompany: 150,
                    bankName: 'BOG ბანკი',
                    bankAccountNumber: 'GE29BG0000000527972727',
                    bankAccountName: 'ნიკა კაპანაძე',
                    isAvailable: true,
                    isProfileComplete: false,
                },
            },
        },
    });
    console.log('✅ Manager 2 created:', manager2.email);

    // ── Clients ────────────────────────────────────────────────
    const client1 = await prisma.user.create({
        data: {
            name: 'ალექსი კლიენტი',
            phone: '+995555000010',
            email: 'client@example.com',
            passwordHash: clientHash,
            role: 'CLIENT',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Client 1 created:', client1.email);

    const client2 = await prisma.user.create({
        data: {
            name: 'მარიამ კლიენტი',
            phone: '+995555000011',
            email: 'client2@example.com',
            passwordHash: clientHash,
            role: 'CLIENT',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Client 2 created:', client2.email);

    // ── Vehicles ───────────────────────────────────────────────
    const vehicle1 = await prisma.vehicle.create({
        data: {
            clientId: client1.id,
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            plateNumber: 'AA-001-BB',
            vin: 'JT2BF22K1W0123456',
            color: 'Silver',
        },
    });

    const vehicle2 = await prisma.vehicle.create({
        data: {
            clientId: client1.id,
            make: 'BMW',
            model: 'X5',
            year: 2022,
            plateNumber: 'CC-002-DD',
            vin: 'WBAPH5C55BA123456',
            color: 'Black',
        },
    });

    const vehicle3 = await prisma.vehicle.create({
        data: {
            clientId: client2.id,
            make: 'Mercedes-Benz',
            model: 'C-Class',
            year: 2021,
            plateNumber: 'EE-003-FF',
            color: 'White',
        },
    });

    console.log('✅ Vehicles created');

    // ── Sample Orders ──────────────────────────────────────────
    const order1 = await prisma.order.create({
        data: {
            clientId: client1.id,
            managerId: manager1.id,
            vehicleId: vehicle1.id,
            status: 'IN_PROGRESS',
            address: 'ვაჟა-ფშაველას #12, თბილისი',
            problemDescription: 'ძრავა ცუდად მუშაობს, ზეთი გაედინება',
            statusHistory: {
                create: [
                    { fromStatus: 'PENDING', toStatus: 'PENDING', changedById: client1.id, notes: 'Order created' },
                    { fromStatus: 'PENDING', toStatus: 'PICKED_UP', changedById: manager1.id, notes: 'Vehicle picked up' },
                    { fromStatus: 'PICKED_UP', toStatus: 'IN_PROGRESS', changedById: manager1.id, notes: 'Diagnosing at Toyota Center' },
                ],
            },
        },
    });

    const order2 = await prisma.order.create({
        data: {
            clientId: client1.id,
            vehicleId: vehicle2.id,
            status: 'PENDING',
            address: 'რუსთაველის გამზ. #24, თბილისი',
            problemDescription: 'ფრონტალური სტაბილიზატორის კვანძი ხმაურობს',
            statusHistory: {
                create: {
                    fromStatus: 'PENDING', toStatus: 'PENDING', changedById: client1.id, notes: 'Order created',
                },
            },
        },
    });

    const order3 = await prisma.order.create({
        data: {
            clientId: client2.id,
            managerId: manager2.id,
            vehicleId: vehicle3.id,
            status: 'IN_PROGRESS',
            address: 'აღმაშენებლის #56, თბილისი',
            problemDescription: 'ახალი საბურავების შეცვლა და ბალანსირება',
            statusHistory: {
                create: [
                    { fromStatus: 'PENDING', toStatus: 'PENDING', changedById: client2.id, notes: 'Order created' },
                    { fromStatus: 'PENDING', toStatus: 'PICKED_UP', changedById: manager2.id, notes: 'Picked up' },
                    { fromStatus: 'PICKED_UP', toStatus: 'IN_PROGRESS', changedById: manager2.id, notes: 'At tire shop' },
                ],
            },
        },
    });

    // Invoice with line items for order3
    await prisma.invoice.create({
        data: {
            orderId: order3.id,
            serviceCenterName: 'ProTire Georgia',
            totalNetCost: 680,
            totalClientPrice: 920,
            carmedFee: 92,
            totalAmount: 1012,
            partsCost: 800,
            laborCost: 120,
            lines: {
                create: [
                    {
                        description: 'Michelin Primacy 4 225/45 R17',
                        quantity: 4,
                        netCost: 140,     // 4 * 140 = 560
                        clientPrice: 180, // 4 * 180 = 720
                        type: 'PART',
                    },
                    {
                        description: 'ბალანსირება + მონტაჟი',
                        quantity: 4,
                        netCost: 30,      // 4 * 30 = 120
                        clientPrice: 50,  // 4 * 50 = 200
                        type: 'LABOR',
                    },
                ],
            },
        },
    });

    console.log('✅ Orders and invoices created');

    // ── Notifications ──────────────────────────────────────────
    await prisma.notification.createMany({
        data: [
            {
                userId: admin.id,
                type: 'ORDER_CREATED',
                title: 'ახალი შეკვეთა',
                message: 'ახალი შეკვეთა Toyota Camry - ძრავის შეკეთება',
                metadata: { orderId: order1.id },
            },
            {
                userId: manager1.id,
                type: 'ORDER_CREATED',
                title: 'ახალი დავალება',
                message: 'თქვენ მინიჭდით Toyota Camry-ს შეკვეთა',
                metadata: { orderId: order1.id },
            },
            {
                userId: client2.id,
                type: 'INVOICE_SENT',
                title: 'ინვოისი გამოგზავნილია',
                message: 'Mercedes C-Class - ჯამი: ₾1012',
                metadata: { orderId: order3.id },
            },
        ],
    });

    console.log('✅ Notifications created');
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin:   admin@carmed.ge / admin123  (phone: +995555000001)');
    console.log('   Manager: manager@carmed.ge / manager123  (phone: +995555000002)');
    console.log('   Client:  client@example.com / client123  (phone: +995555000010)\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
