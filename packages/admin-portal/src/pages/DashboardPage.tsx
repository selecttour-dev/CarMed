import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Package, Users, TrendingUp, Clock, CheckCircle, AlertTriangle, Eye, X, Edit3, Check, XCircle, LayoutDashboard, DollarSign } from 'lucide-react';

interface PriceAlert {
    id: string;
    partName: string;
    make: string;
    model: string;
    expectedPrice: number;
    actualPrice: number;
    deviationPct: number;
    status: string;
    managerId: string;
    orderId: string;
    createdAt: string;
}

interface CorrectionRequest {
    id: string;
    invoiceId: string;
    invoiceLineId: string | null;
    managerId: string;
    type: 'EDIT' | 'DELETE' | 'ADD';
    reason: string;
    newDescription: string | null;
    newNetCost: number | null;
    newClientPrice: number | null;
    newQuantity: number | null;
    status: string;
    createdAt: string;
    manager?: { name: string };
    invoice?: { order?: { vehicle?: { make: string; model: string } } };
}

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
    const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, alertsRes, correctionsRes] = await Promise.all([
                    api.get('/admin/dashboard'),
                    api.get('/admin/price-alerts?status=PENDING').catch(() => ({ data: { data: [] } })),
                    api.get('/admin/correction-requests?status=PENDING').catch(() => ({ data: { data: [] } })),
                ]);
                setStats(statsRes.data.data);
                setPriceAlerts(alertsRes.data.data || []);
                setCorrections(correctionsRes.data.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const handleAlertAction = async (alertId: string, status: 'REVIEWED' | 'DISMISSED') => {
        try {
            await api.put(`/admin/price-alerts/${alertId}`, { status });
            setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (e) { console.error(e); }
    };

    const handleCorrectionAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
        try {
            await api.put(`/admin/correction-requests/${id}`, { action });
            setCorrections(prev => prev.filter(c => c.id !== id));
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="empty-state"><p>იტვირთება...</p></div>;

    const CORRECTION_TYPE_LABELS: Record<string, string> = {
        EDIT: 'რედაქტირება',
        DELETE: 'წაშლა',
        ADD: 'დამატება',
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title"><LayoutDashboard size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />დეშბორდი</h1>
                <p className="page-subtitle">CarMed-ის გლობალური მონიტორინგი</p>
            </div>

            {/* ── Correction Requests ── */}
            {corrections.length > 0 && (
                <div style={{
                    marginBottom: '20px', padding: '16px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)',
                    border: '1px solid rgba(37, 99, 235, 0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '10px',
                            background: 'rgba(37, 99, 235, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Edit3 size={16} style={{ color: '#2563EB' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E40AF' }}>
                                კორექციის მოთხოვნები
                                <span style={{
                                    marginLeft: '8px', fontSize: '11px', fontWeight: 600,
                                    padding: '2px 8px', borderRadius: '10px',
                                    background: '#2563EB', color: 'white'
                                }}>
                                    {corrections.length}
                                </span>
                            </h3>
                            <p style={{ fontSize: '11px', color: '#3B82F6' }}>მენეჯერებს სჭირდებათ ინვოისის ცვლილება — თქვენი დადასტურება საჭიროა</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {corrections.map(cr => (
                            <div key={cr.id} style={{
                                padding: '12px 14px', borderRadius: '10px',
                                background: 'white', border: '1px solid rgba(37,99,235,0.1)',
                            }}>
                                {/* Header: type badge + manager name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                                        background: cr.type === 'DELETE' ? '#FEE2E2' : cr.type === 'ADD' ? '#ECFDF5' : '#EFF6FF',
                                        color: cr.type === 'DELETE' ? '#DC2626' : cr.type === 'ADD' ? '#059669' : '#2563EB',
                                    }}>
                                        {CORRECTION_TYPE_LABELS[cr.type] || cr.type}
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                                        {(cr as any).managerName || 'მენეჯერი'}
                                    </span>
                                    <span style={{
                                        fontSize: '10px', color: '#718096', fontFamily: 'var(--font-mono)',
                                        background: '#F0F4F2', padding: '1px 5px', borderRadius: '3px',
                                    }}>
                                        #{cr.invoiceId?.slice(0, 8)}
                                    </span>
                                </div>

                                {/* Reason */}
                                < div style={{
                                    padding: '8px 10px', borderRadius: '8px', background: '#FAFAFA',
                                    fontSize: '12px', color: '#374151', marginBottom: '6px',
                                    borderLeft: '3px solid #3B82F6',
                                }}>
                                    <span style={{ fontWeight: 600, color: '#1E40AF' }}>მიზეზი: </span>
                                    {cr.reason}
                                </div>

                                {/* Proposed changes (for EDIT/ADD) */}
                                {(cr.type === 'EDIT' || cr.type === 'ADD') && (cr.newDescription || cr.newNetCost || cr.newClientPrice) && (
                                    <div style={{
                                        display: 'flex', gap: '12px', fontSize: '11px', marginBottom: '6px',
                                        padding: '6px 10px', borderRadius: '6px', background: '#F8FAFC',
                                    }}>
                                        {cr.newDescription && (
                                            <div>
                                                <span style={{ color: '#94A3B8' }}>აღწერა: </span>
                                                <span style={{ fontWeight: 600 }}>{cr.newDescription}</span>
                                            </div>
                                        )}
                                        {cr.newNetCost !== null && (
                                            <div>
                                                <span style={{ color: '#94A3B8' }}>ნეტო: </span>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₾{cr.newNetCost}</span>
                                            </div>
                                        )}
                                        {cr.newClientPrice !== null && (
                                            <div>
                                                <span style={{ color: '#94A3B8' }}>კლიენტი: </span>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#047857' }}>₾{cr.newClientPrice}</span>
                                            </div>
                                        )}
                                        {cr.newQuantity !== null && (
                                            <div>
                                                <span style={{ color: '#94A3B8' }}>რაოდ: </span>
                                                <span style={{ fontWeight: 600 }}>{cr.newQuantity}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions + date */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: '10px', color: '#A0AEC0', fontFamily: 'var(--font-mono)' }}>
                                        {new Date(cr.createdAt).toLocaleString('ka-GE')}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => handleCorrectionAction(cr.id, 'APPROVED')}
                                            style={{
                                                background: '#059669', border: 'none', cursor: 'pointer',
                                                padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                                                color: 'white', display: 'flex', alignItems: 'center', gap: '3px',
                                            }}
                                            title="დადასტურება"
                                        >
                                            <Check size={12} /> დასტური
                                        </button>
                                        <button
                                            onClick={() => handleCorrectionAction(cr.id, 'REJECTED')}
                                            style={{
                                                background: 'none', border: '1px solid #FCA5A5', cursor: 'pointer',
                                                padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                                                color: '#DC2626', display: 'flex', alignItems: 'center', gap: '3px',
                                            }}
                                            title="უარყოფა"
                                        >
                                            <XCircle size={12} /> უარი
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div >
            )
            }

            {/* ── Price Alerts ── */}
            {
                priceAlerts.length > 0 && (
                    <div style={{
                        marginBottom: '20px', padding: '16px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)',
                        border: '1px solid rgba(234, 88, 12, 0.15)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'rgba(234, 88, 12, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <AlertTriangle size={16} style={{ color: '#EA580C' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#9A3412' }}>
                                    ფასის ალერტები
                                    <span style={{
                                        marginLeft: '8px', fontSize: '11px', fontWeight: 600,
                                        padding: '2px 8px', borderRadius: '10px',
                                        background: '#EA580C', color: 'white'
                                    }}>
                                        {priceAlerts.length}
                                    </span>
                                </h3>
                                <p style={{ fontSize: '11px', color: '#B45309' }}>ნეტო ფასი ან ხარისხი საეჭვოდ განსხვავდება</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {priceAlerts.map(alert => {
                                const isQualityMismatch = (alert as any).alertType === 'QUALITY_MISMATCH';
                                return (
                                    <div key={alert.id} style={{
                                        padding: '12px 14px', borderRadius: '10px',
                                        background: 'white', border: `1px solid ${isQualityMismatch ? 'rgba(220,38,38,0.15)' : 'rgba(234,88,12,0.1)'}`,
                                    }}>
                                        {/* Header row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                                                background: isQualityMismatch ? '#FEE2E2' : '#FFF7ED',
                                                color: isQualityMismatch ? '#DC2626' : '#EA580C',
                                            }}>
                                                {isQualityMismatch ? 'ხარისხი' : 'ნეტო ფასი'}
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: 700 }}>{alert.partName}</span>
                                            <span style={{
                                                fontSize: '10px', color: '#4A5568', fontWeight: 400,
                                                background: '#F0F4F2', padding: '1px 6px', borderRadius: '4px',
                                            }}>
                                                {alert.make} {alert.model}
                                            </span>
                                            {(alert as any).quality && (
                                                <span style={{
                                                    fontSize: '9px', fontWeight: 600, padding: '1px 5px', borderRadius: '3px',
                                                    background: (alert as any).quality === 'OEM' ? '#ECFDF5' : '#FFF7ED',
                                                    color: (alert as any).quality === 'OEM' ? '#059669' : '#EA580C',
                                                }}>
                                                    {(alert as any).quality === 'OEM' ? 'ორიგინალი' : 'არაორიგინალი'}
                                                </span>
                                            )}
                                            {(alert as any).brand && (
                                                <span style={{ fontSize: '9px', color: '#718096' }}>{(alert as any).brand}</span>
                                            )}
                                        </div>

                                        {/* Manager info */}
                                        <div style={{ fontSize: '11px', color: '#4A5568', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <strong style={{ color: '#1A202C' }}>{(alert as any).managerName || 'უცნობი'}</strong>
                                            </span>
                                            <span style={{ color: '#A0AEC0' }}>•</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#718096' }}>
                                                #{(alert as any).orderShortId || alert.orderId?.slice(0, 8)}
                                            </span>
                                        </div>

                                        {/* Price comparison */}
                                        <div style={{
                                            display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px',
                                            padding: '8px 10px', borderRadius: '8px', background: '#FAFAFA',
                                            marginBottom: '6px',
                                        }}>
                                            {isQualityMismatch ? (
                                                <>
                                                    <div>
                                                        <div style={{ fontSize: '9px', color: '#718096', fontWeight: 600, marginBottom: '1px' }}>კლიენტის ფასი</div>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#DC2626', fontSize: '14px' }}>₾{alert.actualPrice.toFixed(0)}</div>
                                                    </div>
                                                    <span style={{ color: '#CBD5E0', fontSize: '16px' }}>→</span>
                                                    <div>
                                                        <div style={{ fontSize: '9px', color: '#718096', fontWeight: 600, marginBottom: '1px' }}>OEM საშუალო</div>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669', fontSize: '14px' }}>₾{alert.expectedPrice.toFixed(0)}</div>
                                                    </div>
                                                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                                        <div style={{ fontSize: '9px', color: '#DC2626', fontWeight: 600 }}>არაორიგინალი OEM-ის ფასად!</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <div style={{ fontSize: '9px', color: '#718096', fontWeight: 600, marginBottom: '1px' }}>ფაქტ. ნეტო (ასაღები)</div>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#DC2626', fontSize: '14px' }}>₾{alert.actualPrice.toFixed(0)}</div>
                                                    </div>
                                                    <span style={{ color: '#CBD5E0', fontSize: '16px' }}>vs</span>
                                                    <div>
                                                        <div style={{ fontSize: '9px', color: '#718096', fontWeight: 600, marginBottom: '1px' }}>საშ. ნეტო (ჩვეულებრივი)</div>
                                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669', fontSize: '14px' }}>₾{alert.expectedPrice.toFixed(0)}</div>
                                                    </div>
                                                    <div style={{ marginLeft: 'auto' }}>
                                                        <span style={{
                                                            padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                                                            background: alert.deviationPct > 30 ? '#FEE2E2' : '#FFF7ED',
                                                            color: alert.deviationPct > 30 ? '#DC2626' : '#EA580C',
                                                        }}>
                                                            {alert.deviationPct > 0 ? '+' : ''}{alert.deviationPct}%
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions + date */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: '10px', color: '#A0AEC0', fontFamily: 'var(--font-mono)' }}>
                                                {new Date(alert.createdAt).toLocaleString('ka-GE')}
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => handleAlertAction(alert.id, 'REVIEWED')}
                                                    style={{
                                                        background: 'none', border: '1px solid var(--surface-200)', cursor: 'pointer',
                                                        padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                                                        color: '#059669', display: 'flex', alignItems: 'center', gap: '3px',
                                                    }}
                                                    title="გადამოწმებულია"
                                                >
                                                    <Eye size={12} /> OK
                                                </button>
                                                <button
                                                    onClick={() => handleAlertAction(alert.id, 'DISMISSED')}
                                                    style={{
                                                        background: 'none', border: '1px solid var(--surface-200)', cursor: 'pointer',
                                                        padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                                                        color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: '3px',
                                                    }}
                                                    title="უგულებელყოფა"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            }

            {/* ── Stats ── */}
            {
                stats && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.06))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <Package size={22} style={{ color: '#059669' }} />
                                </div>
                                <div className="stat-value" style={{ color: '#047857' }}>{stats.orders.total}</div>
                                <div className="stat-label">სულ შეკვეთები</div>
                            </div>
                            <div className="stat-card">
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.06))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <Clock size={22} style={{ color: '#D97706' }} />
                                </div>
                                <div className="stat-value" style={{ color: '#D97706' }}>{stats.orders.pending}</div>
                                <div className="stat-label">მოლოდინში</div>
                            </div>
                            <div className="stat-card">
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.06))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <TrendingUp size={22} style={{ color: '#2563EB' }} />
                                </div>
                                <div className="stat-value" style={{ color: '#2563EB' }}>{stats.orders.active}</div>
                                <div className="stat-label">აქტიური</div>
                            </div>
                            <div className="stat-card">
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.06))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <CheckCircle size={22} style={{ color: '#10B981' }} />
                                </div>
                                <div className="stat-value" style={{ color: '#059669' }}>{stats.orders.completed}</div>
                                <div className="stat-label">დასრულებული</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div className="stat-card">
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.06))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <Users size={22} style={{ color: '#8B5CF6' }} />
                                </div>
                                <div className="stat-value" style={{ color: '#7C3AED' }}>{stats.users.clients}</div>
                                <div className="stat-label">კლიენტები</div>
                            </div>
                            <div className="stat-card">
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.12), rgba(234, 88, 12, 0.06))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <Users size={22} style={{ color: '#EA580C' }} />
                                </div>
                                <div className="stat-value" style={{ color: '#EA580C' }}>{stats.users.managers}</div>
                                <div className="stat-label">მენეჯერები</div>
                            </div>
                        </div>

                        {/* Revenue Hero Card */}
                        <div style={{
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                            padding: '28px 30px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.2)',
                        }}>
                            <div style={{
                                position: 'absolute', top: '-50%', right: '-20%',
                                width: '300px', height: '300px', borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                                pointerEvents: 'none',
                            }} />
                            <div style={{
                                position: 'absolute', bottom: '-30%', left: '-10%',
                                width: '200px', height: '200px', borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
                                pointerEvents: 'none',
                            }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', position: 'relative' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                }}>
                                    <DollarSign size={18} style={{ color: 'white' }} />
                                </div>
                                <span style={{
                                    fontSize: '13px', fontWeight: 600, color: 'rgba(148, 163, 184, 0.9)',
                                    letterSpacing: '0.05em', textTransform: 'uppercase',
                                }}>
                                    რევენიუ
                                </span>
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: '40px', fontWeight: 800,
                                color: '#10B981', letterSpacing: '-1.5px', lineHeight: 1.1,
                                position: 'relative',
                                textShadow: '0 0 40px rgba(16, 185, 129, 0.2)',
                            }}>
                                ₾ {(stats.revenue.total || 0).toFixed(2)}
                            </div>
                            <div style={{
                                fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)',
                                marginTop: '8px', position: 'relative',
                            }}>
                                სულ დადასტურებული ტრანზაქციები
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );
}
