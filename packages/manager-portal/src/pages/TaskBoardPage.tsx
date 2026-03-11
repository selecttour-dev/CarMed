import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerContext } from '../components/DashboardLayout';
import api from '../lib/api';
import {
    MapPin, Clock, XCircle, Loader2, Car, User, ChevronRight, AlertCircle,
    Coffee, Search, Phone, Activity, CheckCircle2, Truck, Ban, ThumbsUp
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
            <div className="task-header">
                <h1 className="page-title task-page-title">დავალებები</h1>

                {/* Quick stat chips */}
                <div className="task-stat-chips">
                    <div className="task-chip task-chip-active">
                        <span className="task-chip-dot" />
                        აქტიური: {activeCount}
                    </div>
                    {pendingCount > 0 && (
                        <div className="task-chip task-chip-pending">
                            <AlertCircle size={12} />
                            ელოდება: {pendingCount}
                        </div>
                    )}
                    <div className="task-chip task-chip-total">
                        სულ: {orders.length}
                    </div>
                </div>
            </div>

            {/* ═══ Search ═══ */}
            <div className="task-search-wrap">
                <Search size={16} className="task-search-icon" />
                <input className="form-input task-search-input"
                    placeholder="ძიება: კლიენტი, მანქანა, მისამართი..."
                    value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)}
                />
                {taskSearch && (
                    <button onClick={() => setTaskSearch('')} className="task-search-clear">
                        <XCircle size={16} />
                    </button>
                )}
            </div>

            {/* ═══ Filters ═══ */}
            <div className="task-filters">
                {filters.map((f) => {
                    const isActive = filter === f.key;
                    const count = statusCounts[f.key] || 0;
                    const sc = f.key ? STATUS_CONFIG[f.key] : null;
                    return (
                        <button key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`task-filter-btn ${isActive ? 'active' : ''}`}
                            style={{
                                borderColor: isActive ? (sc?.color || 'var(--accent)') : undefined,
                                background: isActive ? (sc?.bg || 'var(--accent-50)') : undefined,
                                color: isActive ? (sc?.color || 'var(--accent)') : undefined,
                                boxShadow: isActive ? `0 2px 8px ${sc?.color || 'var(--accent)'}15` : undefined,
                            }}>
                            {f.label}
                            {count > 0 && (
                                <span className="task-filter-count"
                                    style={{
                                        background: isActive ? `${sc?.color || 'var(--accent)'}15` : undefined,
                                        color: isActive ? (sc?.color || 'var(--accent)') : undefined,
                                    }}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ═══ Orders List ═══ */}
            {loading ? (
                <div className="task-loading">
                    <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="task-empty">
                    <div className="task-empty-icon">
                        <Search size={26} style={{ color: 'var(--ink-ghost)' }} />
                    </div>
                    <h3>{taskSearch ? 'ძიებით ვერაფერი მოიძებნა' : filter ? 'ამ სტატუსით შეკვეთები არ არის' : 'შეკვეთები ჯერ არ არის'}</h3>
                    <p>{taskSearch ? 'სცადეთ სხვა საძიებო ტექსტი' : 'ახალი შეკვეთები აქ გამოჩნდება'}</p>
                </div>
            ) : (
                <div className="task-list">
                    {filteredOrders.map((order, idx) => {
                        const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                        const StatusIcon = sc.icon;
                        const canReject = ['PENDING', 'ACCEPTED'].includes(order.status);
                        const isPending = order.status === 'PENDING';

                        return (
                            <div key={order.id} className="task-card"
                                style={{
                                    borderLeftColor: sc.color,
                                    animationDelay: `${idx * 0.03}s`,
                                }}>
                                <div className="task-card-body" onClick={() => navigate(`/orders/${order.id}`)}>
                                    {/* Row 1: Status + Time */}
                                    <div className="task-card-row1">
                                        <div className="task-card-badge" style={{ background: sc.bg, color: sc.color }}>
                                            <StatusIcon size={12} />
                                            {sc.label}
                                        </div>
                                        <div className="task-card-time">
                                            <span><Clock size={11} /> {getTimeAgo(order.createdAt)} წინ</span>
                                            <ChevronRight size={16} className="task-card-chevron" />
                                        </div>
                                    </div>

                                    {/* Row 2: Vehicle */}
                                    {order.vehicle && (
                                        <div className="task-card-vehicle">
                                            <div className="task-card-vehicle-icon" style={{ background: `linear-gradient(135deg, ${sc.bg}, ${sc.color}12)` }}>
                                                <Car size={18} style={{ color: sc.color }} />
                                            </div>
                                            <div className="task-card-vehicle-info">
                                                <div className="task-card-vehicle-name">
                                                    <span className="task-card-make">{order.vehicle.make} {order.vehicle.model}</span>
                                                    <span className="task-card-year">{order.vehicle.year}</span>
                                                </div>
                                                {order.vehicle.plateNumber && (
                                                    <span className="task-card-plate">{order.vehicle.plateNumber}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Row 3: Problem */}
                                    {order.problemDescription && (
                                        <p className="task-card-desc">{order.problemDescription}</p>
                                    )}

                                    {/* Row 4: Meta pills */}
                                    <div className="task-card-meta">
                                        {order.client && (
                                            <span className="task-meta-pill">
                                                <User size={11} /> {order.client.name}
                                            </span>
                                        )}
                                        {order.client?.phone && (
                                            <a href={`tel:${order.client.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="task-meta-pill task-meta-phone">
                                                <Phone size={10} /> დარეკვა
                                            </a>
                                        )}
                                        {order.address && (
                                            <span className="task-meta-pill task-meta-addr">
                                                <MapPin size={10} />
                                                <span>{order.address}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Reject section */}
                                {canReject && (
                                    <div className={`task-card-footer ${isPending ? 'pending' : ''}`}>
                                        {isPending && (
                                            <span className="task-footer-alert">
                                                <AlertCircle size={13} /> ელოდება თქვენს პასუხს
                                            </span>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); setShowRejectModal(order.id); }}
                                            className="task-reject-btn">
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
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '20px', padding: '24px' }}>
                        <div className="task-modal-header">
                            <div className="task-modal-icon">
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
                        <div className="task-modal-actions">
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
