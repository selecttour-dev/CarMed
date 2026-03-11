import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
    Bell, CheckCheck, ShoppingCart, FileText, CreditCard, AlertTriangle,
    Shield, Loader2, Check, Inbox
} from 'lucide-react';

const NOTIF_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    ORDER_CREATED: { icon: ShoppingCart, color: '#2563EB', bg: '#EFF6FF' },
    ORDER_STATUS_CHANGED: { icon: FileText, color: '#7C3AED', bg: '#F5F3FF' },
    ORDER_REJECTED: { icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2' },
    INVOICE_SENT: { icon: FileText, color: '#0891B2', bg: '#ECFEFF' },
    PAYMENT_RECEIVED: { icon: CreditCard, color: '#059669', bg: '#F0FDF4' },
    ADMIN_ALERT: { icon: Shield, color: '#D97706', bg: '#FFFBEB' },
    CROSS_VERIFICATION_ALERT: { icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2' },
};

const TYPE_LABELS: Record<string, string> = {
    ORDER_CREATED: 'ახალი შეკვეთა',
    ORDER_STATUS_CHANGED: 'სტატუსის ცვლილება',
    ORDER_REJECTED: 'შეკვეთა უარყოფილი',
    INVOICE_SENT: 'ინვოისი',
    PAYMENT_RECEIVED: 'გადახდა',
    ADMIN_ALERT: 'ადმინ შეტყობინება',
    CROSS_VERIFICATION_ALERT: 'ვერიფიკაცია',
};

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [markingAll, setMarkingAll] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const params: any = { pageSize: 200 };
            if (filter === 'unread') params.isRead = 'false';
            const { data } = await api.get('/admin/notifications', { params });
            setNotifications(data.data || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, [filter]);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/admin/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await api.put('/admin/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
        finally { setMarkingAll(false); }
    };

    const handleClick = (notif: any) => {
        if (!notif.isRead) markAsRead(notif.id);
        // Navigate to order if available
        const orderId = notif.metadata?.orderId;
        if (orderId) navigate(`/orders/${orderId}`);
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const d = new Date(date);
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diff < 60) return 'ახლა';
        if (diff < 3600) return `${Math.floor(diff / 60)} წუთის წინ`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} საათის წინ`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} დღის წინ`;
        return d.toLocaleDateString('ka-GE');
    };

    // Group by date
    const grouped = notifications.reduce((acc: Record<string, any[]>, n) => {
        const dateKey = new Date(n.createdAt).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(n);
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                    }}>
                        <Bell size={20} style={{ color: 'white' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>შეტყობინებები</h1>
                        <p style={{ fontSize: '12px', color: 'var(--ink-muted)', margin: 0 }}>
                            {unreadCount > 0 ? `${unreadCount} წაუკითხავი` : 'ყველა წაკითხულია'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Filter toggle */}
                    <div style={{
                        display: 'flex', borderRadius: '10px', overflow: 'hidden',
                        border: '1px solid var(--surface-200)', background: 'var(--surface-50)',
                    }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                padding: '7px 14px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                background: filter === 'all' ? 'white' : 'transparent',
                                color: filter === 'all' ? 'var(--ink)' : 'var(--ink-muted)',
                                boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                borderRadius: '9px',
                            }}>
                            ყველა
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            style={{
                                padding: '7px 14px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                background: filter === 'unread' ? 'white' : 'transparent',
                                color: filter === 'unread' ? 'var(--ink)' : 'var(--ink-muted)',
                                boxShadow: filter === 'unread' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                borderRadius: '9px',
                            }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                წაუკითხავი
                                {unreadCount > 0 && (
                                    <span style={{
                                        background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: 800,
                                        padding: '1px 5px', borderRadius: '6px', lineHeight: '14px',
                                    }}>{unreadCount}</span>
                                )}
                            </span>
                        </button>
                    </div>
                    {/* Mark all as read */}
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 14px', fontSize: '12px', fontWeight: 600,
                                borderRadius: '10px', border: '1px solid var(--surface-200)',
                                background: 'white', cursor: 'pointer',
                                color: '#059669',
                            }}>
                            {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                            ყველა წაიკითხე
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--ink-muted)', margin: '0 auto' }} />
                </div>
            ) : notifications.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px',
                        background: 'var(--surface-50)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                    }}>
                        <Inbox size={28} style={{ color: 'var(--ink-faint)' }} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                        {filter === 'unread' ? 'წაუკითხავი არ არის' : 'შეტყობინებები ცარიელია'}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
                        {filter === 'unread' ? 'ყველა შეტყობინება წაკითხულია!' : 'ჯერ შეტყობინება არ მიგიღიათ.'}
                    </p>
                </div>
            ) : (
                <div>
                    {Object.entries(grouped).map(([dateLabel, items]) => (
                        <div key={dateLabel} style={{ marginBottom: '20px' }}>
                            {/* Date header */}
                            <div style={{
                                fontSize: '11px', fontWeight: 700, color: 'var(--ink-faint)',
                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                padding: '0 4px', marginBottom: '8px',
                            }}>
                                {dateLabel}
                            </div>

                            {/* Notifications list */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {(items as any[]).map((notif: any, idx: number) => {
                                    const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.ADMIN_ALERT;
                                    const Icon = config.icon;
                                    const typeLabel = TYPE_LABELS[notif.type] || notif.type;
                                    const hasOrder = !!notif.metadata?.orderId;

                                    return (
                                        <div key={notif.id}
                                            onClick={() => handleClick(notif)}
                                            style={{
                                                display: 'flex', alignItems: 'flex-start', gap: '12px',
                                                padding: '14px 16px',
                                                borderBottom: idx < (items as any[]).length - 1 ? '1px solid var(--surface-100)' : 'none',
                                                cursor: hasOrder ? 'pointer' : 'default',
                                                background: notif.isRead ? 'transparent' : 'rgba(59,130,246,0.03)',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={e => { if (hasOrder) (e.currentTarget.style.background = 'var(--surface-50)'); }}
                                            onMouseLeave={e => { e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(59,130,246,0.03)'; }}
                                        >
                                            {/* Unread dot */}
                                            <div style={{ width: '8px', flexShrink: 0, paddingTop: '14px' }}>
                                                {!notif.isRead && (
                                                    <div style={{
                                                        width: '8px', height: '8px', borderRadius: '50%',
                                                        background: '#3B82F6',
                                                        boxShadow: '0 0 6px rgba(59,130,246,0.4)',
                                                    }} />
                                                )}
                                            </div>

                                            {/* Icon */}
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: config.bg, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <Icon size={16} style={{ color: config.color }} />
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                                    <span style={{
                                                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.3px',
                                                        padding: '2px 7px', borderRadius: '5px',
                                                        background: config.bg, color: config.color,
                                                    }}>{typeLabel}</span>
                                                </div>
                                                <p style={{
                                                    fontSize: '13px', fontWeight: notif.isRead ? 500 : 700,
                                                    color: 'var(--ink)', margin: '0 0 2px 0', lineHeight: 1.4,
                                                }}>
                                                    {notif.title}
                                                </p>
                                                <p style={{
                                                    fontSize: '12px', color: 'var(--ink-muted)',
                                                    margin: 0, lineHeight: 1.5,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {notif.message}
                                                </p>
                                            </div>

                                            {/* Time & actions */}
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <span style={{
                                                    fontSize: '11px', color: 'var(--ink-faint)',
                                                    fontFamily: 'var(--font-mono)',
                                                }}>
                                                    {formatTimeAgo(notif.createdAt)}
                                                </span>
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                                        title="წაკითხულად მონიშვნა"
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            width: '24px', height: '24px', borderRadius: '6px',
                                                            border: '1px solid var(--surface-200)', background: 'white',
                                                            cursor: 'pointer', marginTop: '4px', marginLeft: 'auto',
                                                        }}>
                                                        <Check size={12} style={{ color: '#059669' }} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
