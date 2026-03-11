// ============================================================
// Auth Store - Zustand state management for authentication
// ============================================================

import { create } from 'zustand';
import api from '../lib/api';

interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    status: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (phone: string, password: string) => Promise<void>;
    register: (name: string, phone: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (phone: string, password: string) => {
        const { data } = await api.post('/auth/login', { phone, password });
        if (data.success) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            set({ user: data.data.user, isAuthenticated: true });
        }
    },

    register: async (name: string, phone: string, password: string) => {
        const { data } = await api.post('/auth/register', { name, phone, password });
        if (data.success) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            set({ user: data.data.user, isAuthenticated: true });
        }
    },

    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await api.post('/auth/logout', { refreshToken });
        } catch { }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            set({ isLoading: false });
            return;
        }
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                set({ user: data.data, isAuthenticated: true, isLoading: false });
            }
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
