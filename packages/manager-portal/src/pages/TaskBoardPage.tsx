import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerContext } from '../components/DashboardLayout';
import api from '../lib/api';
import {
    MapPin, Clock, XCircle, Loader2, Car, User, ChevronRight, AlertCircle,
    Coffee, Search, Phone, Activity, CheckCircle2, Truck, Ban, ThumbsUp, Filter
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: 'მოლოდინში', color: '#D97706', bg: '#FFFBEB', icon: Clock },
    ACCEPTED: { label: 'მიღებული', color: '#2563EB', bg: '#EFF6FF', icon: ThumbsUp },
    PICKED_UP: { label: 'წაყვანილია', color: '#7C3AED', bg: '#F5F3FF', icon: Truck },
    IN_PROGRESS: { label: 'მიმდინარეობს', color: '#0891B2', bg: '#ECFEFF', icon: Activity },
    COMPLETED: { label: 'დასრულებული', color: '#059669', bg: '#D1FAE5', icon: CheckCircle2 },
    CANCELED: { label: 'გაუქმებული', color: '#DC2626', bg: '#FEF2F2', icon: Ban },
    REJECTED: { label: 'უარყოფილი', color: '#DC2626', bg: '#FEF2F2', icon: Ban },
};

export default function TaskBoardPage() {
    const { isAvailable } = useManagerContext();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [taskSearch, setTaskSearch] = useState('');
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const params = filter ? `?status=${filter}` : '';
            const { data } = await api.get(`/manager/orders${params}`);
            setOrders(data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (isAvailable) fetchOrders(); else setLoading(false); }, [filter, isAvailable]);

    const handleReject = async (orderId: string) => {
        setRejectingId(orderId);
        try {
            await api.put(`/manager/orders/${orderId}/reject`, { reason: rejectReason });
            setShowRejectModal(null);
            setRejectReason('');
            fetchOrders();
        } catch (e) { console.error(e); }
        finally { setRejectingId(null); }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (!taskSearch) return true;
            const q = taskSearch.toLowerCase();
            return (
                order.client?.name?.toLowerCase().includes(q) ||
                order.vehicle?.make?.toLowerCase().includes(q) ||
                order.vehicle?.model?.toLowerCase().includes(q) ||
                order.address?.toLowerCase().includes(q) ||
                order.problemDescription?.toLowerCase().includes(q) ||
                order.id?.toLowerCase().includes(q)
            );
        });
    }, [orders, taskSearch]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { '': orders.length };
        orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
        return counts;
    }, [orders]);

    if (!isAvailable) {
        return (
            <div className="unavailable-overlay">
                <div style={{
                    width: 80, height: 80, borderRadius: 22,
                    background: 'var(--error-light)', border: '1px solid rgba(220,38,38,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                }}>
                    <Coffee size={36} style={{ color: 'var(--error)' }} />
                </div>
                <h2>თქვენ არ მუშაობთ</h2>
                <p>ჩართეთ ხელმისაწვდომობა რომ ნახოთ და მიიღოთ ახალი შეკვეთები.</p>
            </div>
        );
    }

    const activeCount = orders.filter(o => !['COMPLETED', 'CANCELED', 'REJECTED'].includes(o.status)).length;
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    const filters = [
        { key: '', label: 'ყველა' },
        { key: 'PENDING', label: 'მოლოდინში' },
        { key: 'ACCEPTED', label: 'მიღებული' },
        { key: 'PICKED_UP', label: 'წაყვანილი' },
        { key: 'IN_PROGRESS', label: 'მიმდინარე' },
        { key: 'COMPLETED', label: 'დასრულებული' },
    ];

    const getTimeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} წთ`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} სთ`;
        const days = Math.floor(hours / 24);
        return `${days} დღე`;
    };

    return (
        <div className="animate-fade-in">
            {/* ═══ Header ═══ */}
            <div style={{ marginBottom: '24px' }}>
                <h1 className="page-title" style={{ fontSize: '26px', marginBottom: '10px' }}>დავალებები</h1>

                {/* Quick stat chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', border: '1px solid rgba(4,120,87,0.1)',
                        fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
                        აქტიური: {activeCount}
                    </div>
                    {pendingCount > 0 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '20px',
                            background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1px solid rgba(217,119,6,0.1)',
                            fontSize: '12px', fontWeight: 600, color: '#D97706',
                        }}>
                            <AlertCircle size={12} />
                            ელოდება: {pendingCount}
                        </div>
                    )}
                    <div style={{
                        padding: '7px 14px', borderRadius: '20px',
                        background: 'var(--surface-50)', border: '1px solid var(--surface-100)',
                        fontSize: '12px', fontWeight: 500, color: 'var(--ink-muted)',
                    }}>
                        სულ: {orders.length}
                    </div>
                </div>
            </div>

            {/* ═══ Search ═══ */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
                <Search size={16} style={{
                    position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--ink-faint)',
                }} />
                <input className="form-input"
                    style={{
                        paddingLeft: '44px', border: '1.5px solid var(--surface-200)',
                        borderRadius: '14px', fontSize: '14px', height: '46px',
                        transition: 'all 0.2s',
                    }}
                    placeholder="ძიება: კლიენტი, მანქანა, მისამართი..."
                    value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)}
                    onFocus={e => e.currentTarget.style.borderColor = '#047857'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--surface-200)'}
                />
                {taskSearch && (
                    <button onClick={() => setTaskSearch('')} style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'var(--surface-100)', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)',
                        display: 'flex', padding: '4px', borderRadius: '6px',
                    }}>
                        <XCircle size={16} />
                    </button>
                )}
            </div>

            {/* ═══ Filters ═══ */}
            <div style={{
                display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'nowrap',
                overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '2px',
            }}>
                {filters.map((f) => {
                    const isActive = filter === f.key;
                    const count = statusCounts[f.key] || 0;
                    const sc = f.key ? STATUS_CONFIG[f.key] : null;
                    return (
                        <button key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={{
                                padding: '8px 16px', borderRadius: '20px',
                                fontSize: '12px', fontWeight: isActive ? 700 : 500,
                                border: isActive
                                    ? `1.5px solid ${sc?.color || 'var(--accent)'}`
                                    : '1.5px solid var(--surface-200)',
                                background: isActive ? (sc?.bg || 'var(--accent-50)') : 'white',
                                color: isActive ? (sc?.color || 'var(--accent)') : 'var(--ink-muted)',
                                cursor: 'pointer', transition: 'all 0.2s',
                                fontFamily: 'var(--font-sans)',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                flexShrink: 0, whiteSpace: 'nowrap',
                                boxShadow: isActive ? `0 2px 8px ${sc?.color || 'var(--accent)'}15` : 'none',
                            }}>
                            {f.label}
                            {count > 0 && (
                                <span style={{
                                    fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                                    background: isActive ? `${sc?.color || 'var(--accent)'}15` : 'var(--surface-100)',
                                    color: isActive ? (sc?.color || 'var(--accent)') : 'var(--ink-faint)',
                                    padding: '1px 7px', borderRadius: '8px',
                                    minWidth: '20px', textAlign: 'center',
                                }}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ═══ Orders List ═══ */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '56px 20px',
                    background: 'white', borderRadius: '20px',
                    border: '1px solid var(--surface-100)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: 18,
                        background: 'var(--surface-50)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <Search size={26} style={{ color: 'var(--ink-ghost)' }} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: '6px' }}>
                        {taskSearch ? 'ძიებით ვერაფერი მოიძებნა' : filter ? 'ამ სტატუსით შეკვეთები არ არის' : 'შეკვეთები ჯერ არ არის'}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--ink-faint)' }}>
                        {taskSearch ? 'სცადეთ სხვა საძიებო ტექსტი' : 'ახალი შეკვეთები აქ გამოჩნდება'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredOrders.map((order, idx) => {
                        const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                        const StatusIcon = sc.icon;
                        const canReject = ['PENDING', 'ACCEPTED'].includes(order.status);
                        const isPending = order.status === 'PENDING';

                        return (
                            <div key={order.id}
                                style={{
                                    background: 'white', borderRadius: '18px',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    borderLeft: `4px solid ${sc.color}`,
                                    overflow: 'hidden',
                                    transition: 'all 0.25s',
                                    animation: `fadeInUp 0.3s ease-out ${idx * 0.03}s both`,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.07)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}
                            >
                                <div style={{ padding: '16px 20px', cursor: 'pointer' }}
                                    onClick={() => navigate(`/orders/${order.id}`)}>

                                    {/* ── Row 1: Status + Time ── */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '4px 12px', borderRadius: '20px',
                                            background: sc.bg, fontSize: '11px', fontWeight: 700,
                                            color: sc.color,
                                        }}>
                                            <StatusIcon size={12} />
                                            {sc.label}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{
                                                fontSize: '11px', color: 'var(--ink-faint)',
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                fontFamily: 'var(--font-mono)',
                                            }}>
                                                <Clock size={11} /> {getTimeAgo(order.createdAt)} წინ
                                            </span>
                                            <ChevronRight size={16} style={{ color: 'var(--ink-ghost)' }} />
                                        </div>
                                    </div>

                                    {/* ── Row 2: Vehicle ── */}
                                    {order.vehicle && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                            <div style={{
                                                width: 42, height: 42, borderRadius: 12,
                                                background: `linear-gradient(135deg, ${sc.bg}, ${sc.color}12)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <Car size={20} style={{ color: sc.color }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '16px', fontWeight: 700 }}>
                                                        {order.vehicle.make} {order.vehicle.model}
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{order.vehicle.year}</span>
                                                </div>
                                                {order.vehicle.plateNumber && (
                                                    <span style={{
                                                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                                                        color: 'var(--ink-muted)', background: 'var(--surface-50)',
                                                        padding: '2px 8px', borderRadius: '5px', fontWeight: 600,
                                                        border: '1px solid var(--surface-100)',
                                                        display: 'inline-block', marginTop: '3px',
                                                    }}>{order.vehicle.plateNumber}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Row 3: Problem ── */}
                                    {order.problemDescription && (
                                        <p style={{
                                            fontSize: '13px', color: 'var(--ink-light)', lineHeight: 1.6,
                                            marginBottom: '10px',
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {order.problemDescription}
                                        </p>
                                    )}

                                    {/* ── Row 4: Meta pills ── */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        flexWrap: 'wrap', fontSize: '12px',
                                    }}>
                                        {order.client && (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 10px', borderRadius: '8px',
                                                background: 'var(--surface-50)', color: 'var(--ink-muted)',
                                                fontWeight: 500,
                                            }}>
                                                <User size={11} /> {order.client.name}
                                            </span>
                                        )}
                                        {order.client?.phone && (
                                            <a href={`tel:${order.client.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    padding: '4px 10px', borderRadius: '8px',
                                                    background: '#EFF6FF', color: '#2563EB',
                                                    textDecoration: 'none', fontWeight: 600,
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}
                                            >
                                                <Phone size={10} /> დარეკვა
                                            </a>
                                        )}
                                        {order.address && (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 10px', borderRadius: '8px',
                                                background: 'var(--surface-50)', color: 'var(--ink-faint)',
                                                maxWidth: '220px',
                                            }}>
                                                <MapPin size={10} style={{ flexShrink: 0 }} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {order.address}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ── Reject button ── */}
                                {canReject && (
                                    <div style={{
                                        padding: '10px 20px', borderTop: '1px solid rgba(0,0,0,0.04)',
                                        background: isPending ? 'linear-gradient(135deg, rgba(254,243,199,0.3), rgba(254,243,199,0.15))' : 'var(--surface-50)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}>
                                        {isPending && (
                                            <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <AlertCircle size={13} /> ელოდება თქვენს პასუხს
                                            </span>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); setShowRejectModal(order.id); }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                padding: '6px 14px', borderRadius: '10px',
                                                background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.1)',
                                                color: '#DC2626', fontSize: '12px', fontWeight: 600,
                                                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                                transition: 'all 0.2s', marginLeft: 'auto',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.12)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; }}
                                        >
                                            <XCircle size={12} /> უარყოფა
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ Reject Modal ═══ */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => { setShowRejectModal(null); setRejectReason(''); }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '20px', padding: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: 14,
                                background: 'var(--error-light)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <AlertCircle size={22} style={{ color: 'var(--error)' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '2px' }}>შეკვეთის უარყოფა</h2>
                                <p style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>შეკვეთა გადაბრუნდება ადმინთან</p>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">მიზეზი (არჩევითი)</label>
                            <textarea className="form-input" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="მაგ: ამ ზონაში ვერ მივდივარ, ძალიან შორსაა..."
                                style={{ minHeight: '90px', borderRadius: '12px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                                style={{ borderRadius: '12px' }}>
                                გაუქმება
                            </button>
                            <button className="btn btn-danger" onClick={() => handleReject(showRejectModal!)}
                                disabled={rejectingId === showRejectModal} style={{ gap: '6px', borderRadius: '12px' }}>
                                {rejectingId === showRejectModal
                                    ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                    : <XCircle size={14} />
                                }
                                უარყოფა
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
