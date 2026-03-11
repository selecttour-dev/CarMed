import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
    Shield, AlertTriangle, TrendingUp, Minus, Plus, DollarSign,
    ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Receipt,
    CheckCircle, XCircle, Search
} from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'მოლოდინში', ACCEPTED: 'მიღებული', PICKED_UP: 'წაყვანილი',
    IN_PROGRESS: 'მიმდინარე',
    COMPLETED: 'დასრულებული', CANCELED: 'გაუქმებული',
};
const STATUS_COLORS: Record<string, string> = {
    PENDING: '#F59E0B', ACCEPTED: '#3B82F6', PICKED_UP: '#8B5CF6',
    IN_PROGRESS: '#0891B2',
    COMPLETED: '#059669', CANCELED: '#EF4444',
};

export default function FinancePage() {
    const [finance, setFinance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'managers' | 'unpaid' | 'orders'>('overview');
    const [fundModal, setFundModal] = useState<{ managerId: string; managerName: string } | null>(null);
    const [fundForm, setFundForm] = useState({ amount: '', reason: '' });
    const [commissionModal, setCommissionModal] = useState<{ managerId: string; managerName: string; current: number } | null>(null);
    const [newCommission, setNewCommission] = useState('');
    const [finSearch, setFinSearch] = useState('');

    const fetchFinance = async () => {
        try {
            const { data } = await api.get('/admin/finance');
            setFinance(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchFinance(); }, []);

    const adjustFund = async (isDeduction: boolean) => {
        if (!fundModal) return;
        try {
            const amount = isDeduction ? -Math.abs(parseFloat(fundForm.amount)) : Math.abs(parseFloat(fundForm.amount));
            await api.post(`/admin/managers/${fundModal.managerId}/guarantee-fund`, { amount, reason: fundForm.reason });
            setFundModal(null);
            setFundForm({ amount: '', reason: '' });
            fetchFinance();
        } catch (err: any) { alert(err.response?.data?.error || 'შეცდომა'); }
    };

    const updateCommission = async () => {
        if (!commissionModal) return;
        try {
            await api.put(`/admin/managers/${commissionModal.managerId}/fee`, {
                companyFeePercent: parseFloat(newCommission),
            });
            setCommissionModal(null);
            setNewCommission('');
            fetchFinance();
        } catch (err: any) { alert(err.response?.data?.error || 'შეცდომა'); }
    };

    if (loading) return <div className="empty-state"><p>იტვირთება...</p></div>;
    if (!finance) return <div className="empty-state"><h3>ფინანსური მონაცემები ვერ ჩაიტვირთა</h3></div>;

    const t = finance.totals;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">ფინანსური კონტროლი</h1>
                <p className="page-subtitle">სრული ფინანსური ანალიტიკა, მენეჯერების ვალები და შემოსავლები</p>
            </div>

            {/* === KPI Cards === */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                    { label: 'კლიენტის ჯამი', value: t.totalClientPrice, icon: <DollarSign size={18} />, color: '#10B981', prefix: '₾' },
                    { label: 'ნეტო ხარჯი', value: t.totalNetCost, icon: <ArrowDownRight size={18} />, color: '#EF4444', prefix: '₾' },
                    { label: 'მარჟა', value: t.totalMargin, icon: <ArrowUpRight size={18} />, color: '#7C3AED', prefix: '₾' },
                    { label: 'კომპანიის საკომისიო', value: t.totalCompanyFees, icon: <Receipt size={18} />, color: '#0EA5E9', prefix: '₾' },
                ].map((kpi, i) => (
                    <div key={i} className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', top: '-8px', right: '-8px', width: '50px', height: '50px',
                            borderRadius: '50%', background: `${kpi.color}08`,
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: kpi.color }}>{kpi.icon}</div>
                        <p style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: kpi.color }}>
                            {kpi.prefix}{(kpi.value || 0).toFixed(0)}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 600 }}>{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* === Second Row: Fee Status + Fund + Debt === */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '14px', borderLeft: '3px solid #10B981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle size={14} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)' }}>გადახდილი საკომისიო</span>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10B981' }}>
                        ₾{(t.paidFees || 0).toFixed(0)}
                    </p>
                </div>
                <div className="card" style={{ padding: '14px', borderLeft: '3px solid #EF4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <AlertTriangle size={14} style={{ color: '#EF4444' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)' }}>გადაუხდელი საკომისიო</span>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#EF4444' }}>
                        ₾{(t.unpaidFees || 0).toFixed(0)}
                    </p>
                    {finance.unpaidFeeOrders?.length > 0 && (
                        <p style={{ fontSize: '10px', color: '#991B1B', marginTop: '4px' }}>
                            {finance.unpaidFeeOrders.length} შეკვეთა
                        </p>
                    )}
                </div>
                <div className="card" style={{ padding: '14px', borderLeft: '3px solid #22d3ee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Shield size={14} style={{ color: '#22d3ee' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)' }}>საგარანტიო ფონდი</span>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#22d3ee' }}>
                        ₾{(t.totalGuaranteeFund || 0).toFixed(0)}
                    </p>
                </div>
            </div>

            {/* Search (only for non-overview tabs) */}
            {activeTab !== 'overview' && (
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: '36px' }}
                        placeholder="ძიება მენეჯერის სახელით, კლიენტით, ID-თ..."
                        value={finSearch} onChange={(e) => setFinSearch(e.target.value)} />
                </div>
            )}

            {/* === Tabs === */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--surface-50)', padding: '4px', borderRadius: '10px' }}>
                {[
                    { key: 'overview', label: 'მიმოხილვა' },
                    { key: 'managers', label: 'მენეჯერები' },
                    { key: 'unpaid', label: `გადაუხდელი (${finance.unpaidFeeOrders?.length || 0})` },
                    { key: 'orders', label: 'შეკვეთები' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                        style={{
                            flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 700,
                            background: activeTab === tab.key ? 'white' : 'transparent',
                            color: activeTab === tab.key ? 'var(--ink-rich)' : 'var(--ink-muted)',
                            boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                        }}>{tab.label}</button>
                ))}
            </div>

            {/* === OVERVIEW TAB === */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Monthly Stats */}
                    <div className="card">
                        <div className="card-header"><h3 className="card-title"><BarChart3 size={16} /> თვიური სტატისტიკა</h3></div>
                        <div style={{ padding: '16px' }}>
                            {finance.monthlyStats?.map((m: any, i: number) => {
                                const maxOrders = Math.max(...(finance.monthlyStats?.map((x: any) => x.orders) || [1]));
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <span style={{ width: '80px', fontSize: '11px', fontWeight: 600, color: 'var(--ink-muted)' }}>{m.month}</span>
                                        <div style={{ flex: 1, position: 'relative', height: '24px', background: 'var(--surface-50)', borderRadius: '6px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${(m.orders / (maxOrders || 1)) * 100}%`, height: '100%',
                                                background: 'linear-gradient(90deg, #3B82F6, #0EA5E9)', borderRadius: '6px',
                                                transition: 'width 0.5s ease',
                                            }} />
                                            <span style={{
                                                position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                                                fontSize: '10px', fontWeight: 800, color: m.orders > 0 ? 'white' : 'var(--ink-faint)',
                                            }}>{m.orders} შეკვ.</span>
                                        </div>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', width: '40px', textAlign: 'right' }}>
                                            ✓{m.completed}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="card">
                        <div className="card-header"><h3 className="card-title"><PieChart size={16} /> სტატუსები</h3></div>
                        <div style={{ padding: '16px' }}>
                            {finance.statusCounts?.map((sc: any) => {
                                const total = finance.statusCounts.reduce((s: number, x: any) => s + x.count, 0) || 1;
                                const pct = ((sc.count / total) * 100).toFixed(0);
                                return (
                                    <div key={sc.status} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: STATUS_COLORS[sc.status] || '#666',
                                        }} />
                                        <span style={{ flex: 1, fontSize: '12px', fontWeight: 600 }}>
                                            {STATUS_LABELS[sc.status] || sc.status}
                                        </span>
                                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: STATUS_COLORS[sc.status] }}>
                                            {sc.count}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'var(--ink-faint)', width: '30px', textAlign: 'right' }}>{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Profit Breakdown */}
                    <div className="card" style={{ gridColumn: 'span 2' }}>
                        <div className="card-header"><h3 className="card-title"><TrendingUp size={16} /> მოგების ანალიზი</h3></div>
                        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {[
                                { label: 'კლიენტის ჯამი', value: t.totalClientPrice, color: '#10B981' },
                                { label: 'ნეტო ხარჯი', value: t.totalNetCost, color: '#475569' },
                                { label: 'კომპანიის წილი', value: t.totalCompanyFees, color: '#D97706' },
                                { label: 'მენეჯერების მოგება', value: (t.totalClientPrice || 0) - (t.totalNetCost || 0) - (t.totalCompanyFees || 0), color: '#7C3AED' },
                            ].map((item, i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '12px', background: 'var(--surface-50)', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: item.color }}>
                                        ₾{(item.value || 0).toFixed(0)}
                                    </p>
                                    <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--ink-faint)', marginTop: '4px' }}>{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* === MANAGERS TAB === */}
            {activeTab === 'managers' && (
                <div className="card">
                    <div className="card-header"><h3 className="card-title">მენეჯერების ფინანსები</h3></div>
                    <div className="table-container" style={{ border: 'none' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>მენეჯერი</th>
                                    <th>სტატუსი</th>
                                    <th>საკომისიო %</th>
                                    <th>ვალი კომპანიის მიმართ</th>
                                    <th>საგარანტიო ფონდი</th>
                                    <th>მოქმედებები</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finance.managers
                                    .filter((m: any) => {
                                        if (!finSearch) return true;
                                        const q = finSearch.toLowerCase();
                                        return m.user.name?.toLowerCase().includes(q) || m.user.phone?.includes(q);
                                    })
                                    .map((m: any) => (
                                        <tr key={m.id}>
                                            <td>
                                                <div className="font-bold">{m.user.name}</div>
                                                <div className="text-sm text-muted text-mono">{m.user.phone}</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${m.user.status.toLowerCase()}`}>
                                                    {m.user.status === 'ACTIVE' ? 'აქტიური' : 'დაბლოკილი'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-mono font-bold" style={{ color: 'var(--text-accent)' }}>
                                                    {(m as any).companyFeePercent ?? 20}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-mono font-bold" style={{ color: m.currentDebtToCompany > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                                    ₾ {m.currentDebtToCompany.toFixed(2)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-mono font-bold" style={{ color: '#22d3ee' }}>
                                                    ₾ {m.guaranteeFundBalance.toFixed(2)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="btn btn-sm btn-secondary"
                                                        onClick={() => { setCommissionModal({ managerId: m.userId, managerName: m.user.name, current: (m as any).companyFeePercent ?? 20 }); setNewCommission(((m as any).companyFeePercent ?? 20).toString()); }}>
                                                        % შეცვლა
                                                    </button>
                                                    <button className="btn btn-sm btn-secondary"
                                                        onClick={() => setFundModal({ managerId: m.userId, managerName: m.user.name })}>
                                                        <Shield size={12} /> ფონდი
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* === UNPAID FEES TAB === */}
            {activeTab === 'unpaid' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title" style={{ color: '#DC2626' }}>
                            გადაუხდელი საკომისიო — ₾{(t.unpaidFees || 0).toFixed(2)}
                        </h3>
                    </div>
                    {finance.unpaidFeeOrders?.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-faint)' }}>
                            <CheckCircle size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                            <p>ყველა საკომისიო გადახდილია</p>
                        </div>
                    ) : (
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>შეკვეთა</th>
                                        <th>მენეჯერი</th>
                                        <th>კლიენტი</th>
                                        <th>კლიენტის ჯამი</th>
                                        <th>საკომისიო</th>
                                        <th>სტატუსი</th>
                                        <th>თარიღი</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(finance.unpaidFeeOrders || [])
                                        .filter((o: any) => {
                                            if (!finSearch) return true;
                                            const q = finSearch.toLowerCase();
                                            return o.manager?.name?.toLowerCase().includes(q) || o.client?.name?.toLowerCase().includes(q) || o.orderId?.toLowerCase().includes(q);
                                        })
                                        .map((o: any) => (
                                            <tr key={o.orderId}>
                                                <td className="text-mono" style={{ fontSize: '11px' }}>#{o.orderId?.slice(0, 8)}</td>
                                                <td style={{ fontWeight: 700 }}>{o.manager?.name || '—'}</td>
                                                <td>{o.client?.name || '—'}</td>
                                                <td className="text-mono font-bold">₾{o.clientTotal?.toFixed(2)}</td>
                                                <td className="text-mono font-bold" style={{ color: '#DC2626' }}>₾{o.fee?.toFixed(2)}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                                        background: `${STATUS_COLORS[o.status]}15`, color: STATUS_COLORS[o.status],
                                                    }}>{STATUS_LABELS[o.status]}</span>
                                                </td>
                                                <td style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                                                    {new Date(o.createdAt).toLocaleDateString('ka-GE')}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'right', fontWeight: 800 }}>ჯამი:</td>
                                        <td className="text-mono font-bold" style={{ color: '#DC2626', fontSize: '14px' }}>
                                            ₾{(t.unpaidFees || 0).toFixed(2)}
                                        </td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* === RECENT ORDERS TAB === */}
            {activeTab === 'orders' && (
                <div className="card">
                    <div className="card-header"><h3 className="card-title">ბოლო შეკვეთები</h3></div>
                    <div className="table-container" style={{ border: 'none' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>შეკვეთა</th>
                                    <th>მენეჯერი</th>
                                    <th>კლიენტი</th>
                                    <th>ნეტო</th>
                                    <th>კლიენტის ფასი</th>
                                    <th>მარჟა</th>
                                    <th>საკომისიო</th>
                                    <th>გადახდილი</th>
                                    <th>სტატუსი</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(finance.recentOrders || [])
                                    .filter((o: any) => {
                                        if (!finSearch) return true;
                                        const q = finSearch.toLowerCase();
                                        return o.manager?.name?.toLowerCase().includes(q) || o.client?.name?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q);
                                    })
                                    .map((o: any) => {
                                        const margin = o.clientPrice - o.netCost;
                                        const fee = o.clientPrice * 0.20;
                                        return (
                                            <tr key={o.id}>
                                                <td className="text-mono" style={{ fontSize: '11px' }}>#{o.id?.slice(0, 8)}</td>
                                                <td style={{ fontSize: '12px', fontWeight: 600 }}>{o.manager?.name || '—'}</td>
                                                <td style={{ fontSize: '12px' }}>{o.client?.name || '—'}</td>
                                                <td className="text-mono" style={{ fontSize: '12px' }}>₾{o.netCost?.toFixed(0)}</td>
                                                <td className="text-mono font-bold" style={{ fontSize: '12px' }}>₾{o.clientPrice?.toFixed(0)}</td>
                                                <td className="text-mono font-bold" style={{ color: margin > 0 ? '#10B981' : '#EF4444', fontSize: '12px' }}>
                                                    ₾{margin.toFixed(0)}
                                                </td>
                                                <td className="text-mono" style={{ fontSize: '12px', color: '#0EA5E9' }}>₾{fee.toFixed(0)}</td>
                                                <td>
                                                    {o.feePaid
                                                        ? <CheckCircle size={14} style={{ color: '#10B981' }} />
                                                        : <XCircle size={14} style={{ color: '#EF4444' }} />}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                                        background: `${STATUS_COLORS[o.status]}15`, color: STATUS_COLORS[o.status],
                                                    }}>{STATUS_LABELS[o.status]}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Guarantee Fund Modal */}
            {fundModal && (
                <div className="modal-overlay" onClick={() => setFundModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">საგარანტიო ფონდი — {fundModal.managerName}</h2>
                        <div className="form-group">
                            <label className="form-label">თანხა (₾)</label>
                            <input type="number" step="0.01" className="form-input" placeholder="100.00" value={fundForm.amount}
                                onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">მიზეზი</label>
                            <input className="form-input" placeholder="მიზეზი..." value={fundForm.reason}
                                onChange={(e) => setFundForm({ ...fundForm, reason: e.target.value })} required />
                        </div>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setFundModal(null)}>გაუქმება</button>
                            <button className="btn btn-primary" onClick={() => adjustFund(false)} disabled={!fundForm.amount || !fundForm.reason}>
                                <Plus size={14} /> შევსება
                            </button>
                            <button className="btn btn-danger" onClick={() => adjustFund(true)} disabled={!fundForm.amount || !fundForm.reason}>
                                <Minus size={14} /> ჩამოჭრა
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Commission Modal */}
            {commissionModal && (
                <div className="modal-overlay" onClick={() => setCommissionModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">საკომისიოს შეცვლა — {commissionModal.managerName}</h2>
                        <p className="text-sm text-muted mb-4">ახლანდელი: {commissionModal.current}% (კლიენტის ჯამიდან)</p>
                        <div className="form-group">
                            <label className="form-label">ახალი საკომისიო (%)</label>
                            <input type="number" min="0" max="100" className="form-input" value={newCommission}
                                onChange={(e) => setNewCommission(e.target.value)} required />
                        </div>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setCommissionModal(null)}>გაუქმება</button>
                            <button className="btn btn-primary" onClick={updateCommission} disabled={!newCommission}>შენახვა</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
