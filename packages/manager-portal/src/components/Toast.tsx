// ============================================================
// Toast Notification System
// Replace browser alert(), confirm(), prompt() with in-app toasts
// ============================================================

import { useState, useCallback, createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';

// ── Types ────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ConfirmState {
    message: string;
    resolve: (value: boolean) => void;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showConfirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

// ── Provider ─────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirm, setConfirm] = useState<ConfirmState | null>(null);
    const idRef = useRef(0);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
        const id = String(++idRef.current);
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const showConfirm = useCallback((message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirm({ message, resolve });
        });
    }, []);

    const handleConfirmResolve = (value: boolean) => {
        confirm?.resolve(value);
        setConfirm(null);
    };

    const TOAST_STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
        success: { bg: '#F0FDF4', border: '#A7F3D0', color: '#065F46', icon: '✓' },
        error: { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', icon: '✗' },
        warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', icon: '!' },
        info: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: 'i' },
    };

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast Stack */}
            <div style={{
                position: 'fixed', top: '16px', right: '16px', zIndex: 99999,
                display: 'flex', flexDirection: 'column', gap: '8px',
                pointerEvents: 'none', maxWidth: '360px',
            }}>
                {toasts.map(toast => {
                    const s = TOAST_STYLES[toast.type];
                    return (
                        <div key={toast.id} style={{
                            padding: '12px 16px', borderRadius: '12px',
                            background: s.bg, border: `1px solid ${s.border}`,
                            color: s.color, fontSize: '13px', fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            pointerEvents: 'auto',
                            animation: 'toast-in 0.3s ease-out',
                            lineHeight: 1.4,
                        }}>
                            <span style={{ fontSize: '16px', flexShrink: 0 }}>{s.icon}</span>
                            <span>{toast.message}</span>
                            <button
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                style={{
                                    marginLeft: 'auto', background: 'none', border: 'none',
                                    color: s.color, cursor: 'pointer', fontSize: '16px',
                                    opacity: 0.5, padding: '0 4px', flexShrink: 0,
                                }}
                            >×</button>
                        </div>
                    );
                })}
            </div>

            {/* Confirm Dialog */}
            {confirm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px',
                }} onClick={() => handleConfirmResolve(false)}>
                    <div style={{
                        background: 'white', borderRadius: '16px',
                        padding: '24px', maxWidth: '360px', width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        animation: 'toast-in 0.2s ease-out',
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '12px', fontSize: '20px',
                        }}>!</div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: '#1e293b' }}>
                            დადასტურება
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                            {confirm.message}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleConfirmResolve(false)}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                                    border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer',
                                }}
                            >არა</button>
                            <button
                                onClick={() => handleConfirmResolve(true)}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                                    border: 'none', background: '#DC2626', color: 'white', cursor: 'pointer',
                                }}
                            >დიახ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation keyframes */}
            <style>{`
                @keyframes toast-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </ToastContext.Provider>
    );
}
