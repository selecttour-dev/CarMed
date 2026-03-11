// ============================================================
// CarMed Shared Types - Source of Truth for All Portals
// ============================================================

// ── User & Auth ──────────────────────────────────────────────

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    CLIENT = 'CLIENT',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
}

export interface User {
    id: string;
    role: UserRole;
    name: string;
    phone: string;
    email?: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    phone: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    phone: string;
    password: string;
    role?: UserRole;
}

// ── Vehicle ──────────────────────────────────────────────────

export interface Vehicle {
    id: string;
    clientId: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    plateNumber: string;
    color?: string;
    photoUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVehicleRequest {
    make: string;
    model: string;
    year: number;
    vin?: string;
    plateNumber: string;
    color?: string;
}

// ── Order (Task) Status Machine ──────────────────────────────

export enum OrderStatus {
    PENDING = 'PENDING',
    PICKED_UP = 'PICKED_UP',
    DIAGNOSING = 'DIAGNOSING',
    INVOICED = 'INVOICED',
    PAID = 'PAID',
    IN_REPAIR = 'IN_REPAIR',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}

/**
 * Valid status transitions (State Machine).
 * RULE 1: No automated cron-based transitions.
 * RULE 2: Manager payment confirmation required for PAID -> IN_REPAIR.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PICKED_UP, OrderStatus.CANCELED],
    [OrderStatus.PICKED_UP]: [OrderStatus.DIAGNOSING, OrderStatus.CANCELED],
    [OrderStatus.DIAGNOSING]: [OrderStatus.INVOICED, OrderStatus.CANCELED],
    [OrderStatus.INVOICED]: [OrderStatus.PAID, OrderStatus.CANCELED],
    [OrderStatus.PAID]: [OrderStatus.IN_REPAIR],
    [OrderStatus.IN_REPAIR]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELED]: [],
};

export interface Order {
    id: string;
    clientId: string;
    managerId?: string;
    vehicleId: string;
    status: OrderStatus;
    address: string;
    problemDescription: string;
    createdAt: string;
    updatedAt: string;
    // Populated
    client?: User;
    manager?: User;
    vehicle?: Vehicle;
    invoice?: Invoice;
    transactions?: Transaction[];
}

export interface CreateOrderRequest {
    vehicleId: string;
    address: string;
    problemDescription: string;
}

// ── Invoice ──────────────────────────────────────────────────

export interface Invoice {
    id: string;
    orderId: string;
    serviceCenterName: string;
    partsCost: number;
    laborCost: number;
    carmedFee: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInvoiceRequest {
    serviceCenterName: string;
    partsCost: number;
    laborCost: number;
    carmedFee: number;
}

// ── Transaction & Finance ────────────────────────────────────

export enum TransactionType {
    CLIENT_TO_MANAGER = 'CLIENT_TO_MANAGER',
    MANAGER_TO_COMPANY = 'MANAGER_TO_COMPANY',
    GUARANTEE_FUND_DEDUCTION = 'GUARANTEE_FUND_DEDUCTION',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DISPUTED = 'DISPUTED',
}

export interface Transaction {
    id: string;
    orderId: string;
    managerId: string;
    amount: number;
    type: TransactionType;

    status: TransactionStatus;
    confirmedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ── Manager Profile ──────────────────────────────────────────

export interface ManagerProfile {
    userId: string;
    commissionPercentage: number;
    guaranteeFundBalance: number;
    currentDebtToCompany: number;
    bankAccountDetails?: string;
    user?: User;
}

// ── Notifications ────────────────────────────────────────────

export enum NotificationType {
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
    INVOICE_SENT = 'INVOICE_SENT',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    ADMIN_ALERT = 'ADMIN_ALERT',
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

// ── API Response Wrappers ────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// ── API Route Constants ──────────────────────────────────────

export const API_ROUTES = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',
        ME: '/api/auth/me',
    },
    CLIENT: {
        PROFILE: '/api/client/profile',
        VEHICLES: '/api/client/vehicles',
        ORDERS: '/api/client/orders',
        NOTIFICATIONS: '/api/client/notifications',
    },
    MANAGER: {
        PROFILE: '/api/manager/profile',
        ORDERS: '/api/manager/orders',
        CONFIRM_PAYMENT: (orderId: string) => `/api/manager/orders/${orderId}/confirm-payment`,
        CREATE_INVOICE: (orderId: string) => `/api/manager/orders/${orderId}/invoice`,
        UPDATE_STATUS: (orderId: string) => `/api/manager/orders/${orderId}/status`,
        FINANCE: '/api/manager/finance',
    },
    ADMIN: {
        DASHBOARD: '/api/admin/dashboard',
        USERS: '/api/admin/users',
        MANAGERS: '/api/admin/managers',
        ORDERS: '/api/admin/orders',
        ASSIGN_ORDER: (orderId: string) => `/api/admin/orders/${orderId}/assign`,
        FINANCE: '/api/admin/finance',
        NOTIFICATIONS: '/api/admin/notifications',
        GUARANTEE_FUND: (managerId: string) => `/api/admin/managers/${managerId}/guarantee-fund`,
    },
} as const;
