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
            <div style={{ marginBottom: '28px' }}>
                <h1 className="page-title" style={{ fontSize: '26px', marginBottom: '4px' }}>
                    გამარჯობა, {profile?.name || 'მენეჯერ'} 👋
                </h1>
                <p className="page-subtitle" style={{ fontSize: '14px' }}>
                    {new Date().toLocaleDateString('ka-GE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {/* ═══ Stats Row ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <StatCard icon={ClipboardList} label="აქტიური" value={activeOrders.length} color="#047857" bg="#ECFDF5" gradient="linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" />
                <StatCard icon={Clock} label="მოლოდინში" value={pendingOrders.length} color="#D97706" bg="#FFFBEB" gradient="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" />
                <StatCard icon={CheckCircle} label="დასრულებული" value={completedOrders.length} color="#059669" bg="#D1FAE5" gradient="linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)" />
                <StatCard icon={Wallet} label="სულ მიღებული" value={`₾${summary?.totalEarned?.toFixed(0) || 0}`} color="#047857" bg="#ECFDF5" gradient="linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" />
            </div>

            {/* ═══ Finance + Debt Row ═══ */}
            {summary && (
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px',
                }}>
                    {/* Debt */}
                    <div style={{
                        padding: '20px', borderRadius: '18px',
                        background: summary.currentDebt > 0
                            ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
                            : 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                        border: `1px solid ${summary.currentDebt > 0 ? 'rgba(217,119,6,0.12)' : 'rgba(5,150,105,0.12)'}`,
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-15px', right: '-15px',
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: summary.currentDebt > 0 ? 'rgba(217,119,6,0.06)' : 'rgba(5,150,105,0.06)',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <AlertTriangle size={16} style={{ color: summary.currentDebt > 0 ? '#D97706' : '#059669' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: summary.currentDebt > 0 ? '#92400E' : '#065F46' }}>
                                ვალი კომპანიის მიმართ
                            </span>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: summary.currentDebt > 0 ? '#D97706' : '#059669', position: 'relative' }}>
                            ₾ {summary.currentDebt?.toFixed(0)}
                        </div>
                    </div>

                    {/* Commission */}
                    <div style={{
                        padding: '20px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                        border: '1px solid rgba(59,130,246,0.1)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-15px', right: '-15px',
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: 'rgba(59,130,246,0.06)',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                            <TrendingUp size={14} style={{ color: '#2563EB' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF' }}>საკომისიო</span>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#2563EB', position: 'relative' }}>{feePercent}%</div>
                    </div>

                    {/* Guarantee Fund */}
                    <div style={{
                        padding: '20px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)',
                        border: '1px solid rgba(8,145,178,0.1)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-15px', right: '-15px',
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: 'rgba(8,145,178,0.06)',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                            <Shield size={14} style={{ color: '#0891B2' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#155E75' }}>საგარანტიო ფონდი</span>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0891B2', position: 'relative' }}>
                            ₾ {summary.guaranteeFund?.toFixed(0)}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Two-column: Orders + Transactions ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
                {/* Active Orders */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ClipboardList size={18} style={{ color: 'var(--accent)' }} />
                            აქტიური შეკვეთები
                            {activeOrders.length > 0 && (
                                <span style={{
                                    fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                                    background: 'var(--accent-50)', color: 'var(--accent)',
                                    padding: '3px 10px', borderRadius: '8px',
                                }}>{activeOrders.length}</span>
                            )}
                        </h2>
                        <button onClick={() => navigate('/tasks')} className="btn btn-ghost" style={{ fontSize: '13px', gap: '4px' }}>
                            ყველა <ArrowRight size={14} />
                        </button>
                    </div>

                    {activeOrders.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '40px', color: 'var(--ink-faint)',
                            background: 'white', borderRadius: '16px', border: '1px solid var(--surface-100)',
                        }}>
                            <CheckCircle size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                            <p style={{ fontSize: '14px', fontWeight: 500 }}>აქტიური შეკვეთები არ არის</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeOrders.slice(0, 6).map(order => {
                                const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                const StatusIcon = sc.icon;
                                return (
                                    <div key={order.id} className="order-card"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        style={{ cursor: 'pointer', borderLeft: `3px solid ${sc.color}` }}>
                                        <div style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {order.vehicle && (
                                                        <>
                                                            <div style={{
                                                                width: 36, height: 36, borderRadius: 10,
                                                                background: `${sc.bg}`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                <Car size={16} style={{ color: sc.color }} />
                                                            </div>
                                                            <div>
                                                                <span style={{ fontSize: '14px', fontWeight: 700 }}>
                                                                    {order.vehicle.make} {order.vehicle.model}
                                                                </span>
                                                                <span style={{ fontSize: '11px', color: 'var(--ink-faint)', marginLeft: '6px' }}>{order.vehicle.year}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '20px',
                                                        fontSize: '11px', fontWeight: 600,
                                                        background: sc.bg, color: sc.color,
                                                        display: 'flex', alignItems: 'center', gap: '5px'
                                                    }}>
                                                        <StatusIcon size={11} />
                                                        {sc.label}
                                                    </span>
                                                    <ChevronRight size={16} style={{ color: 'var(--ink-ghost)' }} />
                                                </div>
                                            </div>
                                            {order.problemDescription && (
                                                <p style={{
                                                    fontSize: '13px', color: 'var(--ink-light)', lineHeight: 1.5,
                                                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                    marginBottom: '8px',
                                                }}>
                                                    {order.problemDescription}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--ink-faint)' }}>
                                                {order.client && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', background: 'var(--surface-50)' }}>
                                                        <User size={11} /> {order.client.name}
                                                    </span>
                                                )}
                                                {order.client?.phone && (
                                                    <a href={`tel:${order.client.phone}`} onClick={e => e.stopPropagation()}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
                                                        <Phone size={10} /> დარეკვა
                                                    </a>
                                                )}
                                                {order.address && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', maxWidth: '200px' }}>
                                                        <MapPin size={10} style={{ flexShrink: 0 }} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</span>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={18} style={{ color: '#D97706' }} />
                            ბოლო ტრანზაქციები
                        </h2>
                        <button onClick={() => navigate('/finance')} className="btn btn-ghost" style={{ fontSize: '13px', gap: '4px' }}>
                            ყველა <ArrowRight size={14} />
                        </button>
                    </div>
                    <div style={{
                        background: 'white', borderRadius: '18px', border: '1px solid var(--surface-100)',
                        overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}>
                        {!finance?.transactions?.length ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-faint)' }}>
                                <CreditCard size={28} style={{ marginBottom: '8px', opacity: 0.3 }} />
                                <p style={{ fontSize: '13px' }}>ტრანზაქციები ჯერ არ არის</p>
                            </div>
                        ) : (
                            finance.transactions.slice(0, 5).map((tx: any, i: number) => (
                                <div key={tx.id} style={{
                                    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
                                    borderBottom: i < Math.min(finance.transactions.length, 5) - 1 ? '1px solid var(--surface-100)' : 'none',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-50)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: tx.type === 'CLIENT_TO_MANAGER' ? '#ECFDF5' : '#FEF2F2',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {tx.type === 'CLIENT_TO_MANAGER'
                                            ? <CreditCard size={15} style={{ color: '#059669' }} />
                                            : <Wallet size={15} style={{ color: '#DC2626' }} />
                                        }
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '13px', fontWeight: 600 }}>
                                            {tx.type === 'CLIENT_TO_MANAGER' ? 'კლიენტის გადახდა' : 'კომპანიის წილი'}
                                        </p>
                                        <p style={{ fontSize: '11px', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
                                            {new Date(tx.createdAt).toLocaleDateString('ka-GE')}
                                        </p>
                                    </div>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px',
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
    icon: any; label: string; value: string | number; color: string; bg: string; gradient: string;
}) {
    return (
        <div style={{
            padding: '18px 20px', borderRadius: '16px',
            background: gradient,
            border: `1px solid ${color}12`,
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${color}15`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <div style={{
                position: 'absolute', top: '-12px', right: '-12px',
                width: '50px', height: '50px', borderRadius: '50%',
                background: `${color}08`,
            }} />
            <Icon size={20} style={{ color, marginBottom: '10px', position: 'relative' }} />
            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color, position: 'relative' }}>{value}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color, opacity: 0.75, marginTop: '4px', position: 'relative' }}>{label}</div>
        </div>
    );
}
