import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerContext } from '../components/DashboardLayout';
import api from '../lib/api';
import {
    Wallet, TrendingUp, ClipboardList, Clock, ArrowRight, Car,
    CheckCircle, AlertTriangle, Loader2, Coffee, Shield, CreditCard, MapPin,
    User, Phone, Activity, ChevronRight
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: 'მოლოდინში', color: '#D97706', bg: '#FFFBEB', icon: Clock },
    ACCEPTED: { label: 'მიღებული', color: '#2563EB', bg: '#EFF6FF', icon: CheckCircle },
    PICKED_UP: { label: 'წაყვანილია', color: '#7C3AED', bg: '#F5F3FF', icon: Car },
    IN_PROGRESS: { label: 'მიმდინარეობს', color: '#0891B2', bg: '#ECFEFF', icon: Activity },
    COMPLETED: { label: 'დასრულებული', color: '#059669', bg: '#ECFDF5', icon: CheckCircle },
    CANCELED: { label: 'გაუქმებული', color: '#DC2626', bg: '#FEF2F2', icon: Clock },
    REJECTED: { label: 'უარყოფილი', color: '#DC2626', bg: '#FEF2F2', icon: Clock },
};

export default function DashboardPage() {
    const { isAvailable, profile } = useManagerContext();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [finance, setFinance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAvailable) { setLoading(false); return; }
        Promise.all([
            api.get('/manager/orders').then(r => setOrders(r.data.data || [])),
            api.get('/manager/finance').then(r => setFinance(r.data.data)),
        ]).catch(console.error).finally(() => setLoading(false));
    }, [isAvailable]);

    if (!isAvailable) {
        return (
            <div className="unavailable-overlay">
                <div style={{
                    width: 80, height: 80, borderRadius: 22,
                    background: 'var(--error-light)', border: '1px solid rgba(220,38,38,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
                }}>
                    <Coffee size={36} style={{ color: 'var(--error)' }} />
                </div>
                <h2>თქვენ არ მუშაობთ</h2>
                <p>ჩართეთ ხელმისაწვდომობა რომ ნახოთ და მიიღოთ ახალი შეკვეთები.</p>
            </div>
        );
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
        </div>
    );

    const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELED', 'REJECTED'].includes(o.status));
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const summary = finance?.summary;
    const feePercent = summary?.companyFeePercent ?? 20;

    return (
        <div className="animate-fade-in">
            {/* Greeting */}
            <div className="mgr-greeting">
                <h1 className="page-title mgr-greeting-title">
                    გამარჯობა, {profile?.name || 'მენეჯერ'} 👋
                </h1>
                <p className="page-subtitle">
                    {new Date().toLocaleDateString('ka-GE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {/* ═══ Stats Row ═══ */}
            <div className="mgr-stats-grid">
                <StatCard icon={ClipboardList} label="აქტიური" value={activeOrders.length} color="#047857" gradient="linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" />
                <StatCard icon={Clock} label="მოლოდინში" value={pendingOrders.length} color="#D97706" gradient="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" />
                <StatCard icon={CheckCircle} label="დასრულებული" value={completedOrders.length} color="#059669" gradient="linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)" />
                <StatCard icon={Wallet} label="სულ მიღებული" value={`₾${summary?.totalEarned?.toFixed(0) || 0}`} color="#047857" gradient="linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" />
            </div>

            {/* ═══ Finance Cards ═══ */}
            {summary && (
                <div className="mgr-finance-grid">
                    {/* Debt */}
                    <div className="mgr-finance-card" style={{
                        background: summary.currentDebt > 0
                            ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
                            : 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                        borderColor: summary.currentDebt > 0 ? 'rgba(217,119,6,0.12)' : 'rgba(5,150,105,0.12)',
                    }}>
                        <div className="mgr-finance-card-header">
                            <AlertTriangle size={15} style={{ color: summary.currentDebt > 0 ? '#D97706' : '#059669' }} />
                            <span style={{ color: summary.currentDebt > 0 ? '#92400E' : '#065F46' }}>
                                ვალი
                            </span>
                        </div>
                        <div className="mgr-finance-card-value" style={{ color: summary.currentDebt > 0 ? '#D97706' : '#059669' }}>
                            ₾ {summary.currentDebt?.toFixed(0)}
                        </div>
                    </div>

                    {/* Commission */}
                    <div className="mgr-finance-card" style={{
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                        borderColor: 'rgba(59,130,246,0.1)',
                    }}>
                        <div className="mgr-finance-card-header">
                            <TrendingUp size={14} style={{ color: '#2563EB' }} />
                            <span style={{ color: '#1E40AF' }}>საკომისიო</span>
                        </div>
                        <div className="mgr-finance-card-value" style={{ color: '#2563EB' }}>
                            {feePercent}%
                        </div>
                    </div>

                    {/* Guarantee */}
                    <div className="mgr-finance-card" style={{
                        background: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)',
                        borderColor: 'rgba(8,145,178,0.1)',
                    }}>
                        <div className="mgr-finance-card-header">
                            <Shield size={14} style={{ color: '#0891B2' }} />
                            <span style={{ color: '#155E75' }}>საგარანტიო ფონდი</span>
                        </div>
                        <div className="mgr-finance-card-value" style={{ color: '#0891B2' }}>
                            ₾ {summary.guaranteeFund?.toFixed(0)}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Orders + Transactions ═══ */}
            <div className="mgr-main-grid">
                {/* Active Orders */}
                <div>
                    <div className="mgr-section-header">
                        <h2 className="mgr-section-title">
                            <ClipboardList size={17} style={{ color: 'var(--accent)' }} />
                            აქტიური შეკვეთები
                            {activeOrders.length > 0 && (
                                <span className="mgr-section-count">{activeOrders.length}</span>
                            )}
                        </h2>
                        <button onClick={() => navigate('/tasks')} className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
                            ყველა <ArrowRight size={14} />
                        </button>
                    </div>

                    {activeOrders.length === 0 ? (
                        <div className="mgr-empty-state">
                            <CheckCircle size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                            <p>აქტიური შეკვეთები არ არის</p>
                        </div>
                    ) : (
                        <div className="mgr-order-list">
                            {activeOrders.slice(0, 6).map(order => {
                                const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                const StatusIcon = sc.icon;
                                return (
                                    <div key={order.id} className="mgr-order-card"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        style={{ borderLeftColor: sc.color }}>
                                        <div className="mgr-order-card-inner">
                                            <div className="mgr-order-card-top">
                                                <div className="mgr-order-card-info">
                                                    {order.vehicle && (
                                                        <>
                                                            <div className="mgr-order-card-icon" style={{ background: sc.bg }}>
                                                                <Car size={15} style={{ color: sc.color }} />
                                                            </div>
                                                            <div className="mgr-order-card-vehicle">
                                                                <span className="mgr-order-card-name">
                                                                    {order.vehicle.make} {order.vehicle.model}
                                                                </span>
                                                                <span className="mgr-order-card-year">{order.vehicle.year}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="mgr-order-card-status">
                                                    <span className="mgr-order-badge" style={{ background: sc.bg, color: sc.color }}>
                                                        <StatusIcon size={11} />
                                                        {sc.label}
                                                    </span>
                                                    <ChevronRight size={16} className="mgr-order-chevron" />
                                                </div>
                                            </div>
                                            {order.problemDescription && (
                                                <p className="mgr-order-desc">{order.problemDescription}</p>
                                            )}
                                            <div className="mgr-order-meta">
                                                {order.client && (
                                                    <span className="mgr-meta-tag">
                                                        <User size={11} /> {order.client.name}
                                                    </span>
                                                )}
                                                {order.client?.phone && (
                                                    <a href={`tel:${order.client.phone}`} onClick={e => e.stopPropagation()}
                                                        className="mgr-meta-tag mgr-meta-phone">
                                                        <Phone size={10} /> დარეკვა
                                                    </a>
                                                )}
                                                {order.address && (
                                                    <span className="mgr-meta-tag mgr-meta-address">
                                                        <MapPin size={10} />
                                                        <span>{order.address}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div>
                    <div className="mgr-section-header">
                        <h2 className="mgr-section-title">
                            <CreditCard size={17} style={{ color: '#D97706' }} />
                            ბოლო ტრანზაქციები
                        </h2>
                        <button onClick={() => navigate('/finance')} className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
                            ყველა <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="mgr-transactions-card">
                        {!finance?.transactions?.length ? (
                            <div className="mgr-empty-state" style={{ padding: '36px 20px' }}>
                                <CreditCard size={28} style={{ marginBottom: '8px', opacity: 0.3 }} />
                                <p>ტრანზაქციები ჯერ არ არის</p>
                            </div>
                        ) : (
                            finance.transactions.slice(0, 5).map((tx: any, i: number) => (
                                <div key={tx.id} className="mgr-transaction-row"
                                    style={{
                                        borderBottom: i < Math.min(finance.transactions.length, 5) - 1 ? '1px solid var(--surface-100)' : 'none',
                                    }}>
                                    <div className="mgr-tx-icon" style={{
                                        background: tx.type === 'CLIENT_TO_MANAGER' ? '#ECFDF5' : '#FEF2F2',
                                    }}>
                                        {tx.type === 'CLIENT_TO_MANAGER'
                                            ? <CreditCard size={15} style={{ color: '#059669' }} />
                                            : <Wallet size={15} style={{ color: '#DC2626' }} />
                                        }
                                    </div>
                                    <div className="mgr-tx-info">
                                        <p className="mgr-tx-label">
                                            {tx.type === 'CLIENT_TO_MANAGER' ? 'კლიენტის გადახდა' : 'კომპანიის წილი'}
                                        </p>
                                        <p className="mgr-tx-date">
                                            {new Date(tx.createdAt).toLocaleDateString('ka-GE')}
                                        </p>
                                    </div>
                                    <span className="mgr-tx-amount" style={{
                                        color: tx.type === 'CLIENT_TO_MANAGER' ? '#059669' : '#DC2626',
                                    }}>
                                        {tx.type === 'CLIENT_TO_MANAGER' ? '+' : '-'}₾{tx.amount.toFixed(0)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, gradient }: {
    icon: any; label: string; value: string | number; color: string; gradient: string;
}) {
    return (
        <div className="mgr-stat-card" style={{ background: gradient, borderColor: `${color}12` }}>
            <Icon size={18} style={{ color, marginBottom: '8px' }} />
            <div className="mgr-stat-value" style={{ color }}>{value}</div>
            <div className="mgr-stat-label" style={{ color }}>{label}</div>
        </div>
    );
}
