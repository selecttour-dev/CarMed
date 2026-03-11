import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
    Wallet, TrendingUp, Shield, Loader2, Receipt,
    CreditCard, Building2, DollarSign, ArrowDownRight, ArrowUpRight, Info, PiggyBank
} from 'lucide-react';

const TX_CONFIG: Record<string, { label: string; Icon: any; color: string; sign: string }> = {
    CLIENT_TO_MANAGER: { label: 'კლიენტის გადახდა', Icon: CreditCard, color: '#059669', sign: '+' },
    MANAGER_TO_COMPANY: { label: 'კომპანიის წილი', Icon: Building2, color: '#DC2626', sign: '-' },
    GUARANTEE_FUND_DEDUCTION: { label: 'საგარანტიო ფონდი', Icon: Shield, color: '#0891B2', sign: '-' },
};

export default function FinancePage() {
    const [finance, setFinance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/manager/finance').then(({ data }) => setFinance(data.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="fin-loading"><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-light)' }} /></div>
    );
    if (!finance) return (
        <div className="card fin-empty">
            <Wallet size={40} style={{ color: 'var(--ink-ghost)', marginBottom: '12px' }} />
            <h3>ფინანსური მონაცემები ვერ ჩაიტვირთა</h3>
        </div>
    );

    const { summary, transactions } = finance;
    const feePercent = summary.companyFeePercent ?? 20;

    return (
        <div className="animate-fade-in">
            <div className="fin-header">
                <h1 className="page-title fin-title">ფინანსები</h1>
                <p className="page-subtitle">ფინანსური მიმოხილვა და ტრანზაქციების ისტორია</p>
            </div>

            {/* ═══ Stats Grid ═══ */}
            <div className="fin-stats-grid">
                <div className="fin-stat-card fin-stat-green">
                    <div className="fin-stat-icon" style={{ background: 'rgba(5,150,105,0.12)' }}>
                        <ArrowUpRight size={18} style={{ color: '#059669' }} />
                    </div>
                    <div className="fin-stat-value" style={{ color: '#059669' }}>₾ {summary.totalEarned.toFixed(0)}</div>
                    <div className="fin-stat-label" style={{ color: '#065F46' }}>სულ მიღებული</div>
                </div>

                <div className="fin-stat-card" style={{
                    background: summary.currentDebt > 0
                        ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)'
                        : 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                }}>
                    <div className="fin-stat-icon" style={{
                        background: summary.currentDebt > 0 ? 'rgba(217,119,6,0.12)' : 'rgba(5,150,105,0.12)',
                    }}>
                        {summary.currentDebt > 0
                            ? <ArrowDownRight size={18} style={{ color: '#D97706' }} />
                            : <TrendingUp size={18} style={{ color: '#059669' }} />}
                    </div>
                    <div className="fin-stat-value" style={{ color: summary.currentDebt > 0 ? '#D97706' : '#059669' }}>
                        ₾ {summary.currentDebt.toFixed(0)}
                    </div>
                    <div className="fin-stat-label" style={{ color: summary.currentDebt > 0 ? '#92400E' : '#065F46' }}>
                        {summary.currentDebt > 0 ? 'ვალი კომპანიის მიმართ' : 'ვალი არ გაქვთ ✓'}
                    </div>
                </div>

                <div className="fin-stat-card fin-stat-blue">
                    <div className="fin-stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                        <TrendingUp size={18} style={{ color: '#2563EB' }} />
                    </div>
                    <div className="fin-stat-value" style={{ color: '#2563EB' }}>{feePercent}%</div>
                    <div className="fin-stat-label" style={{ color: '#1E40AF' }}>კომპანიის საკომისიო</div>
                </div>

                <div className="fin-stat-card fin-stat-cyan">
                    <div className="fin-stat-icon" style={{ background: 'rgba(8,145,178,0.12)' }}>
                        <PiggyBank size={18} style={{ color: '#0891B2' }} />
                    </div>
                    <div className="fin-stat-value" style={{ color: '#0891B2' }}>₾ {summary.guaranteeFund.toFixed(0)}</div>
                    <div className="fin-stat-label" style={{ color: '#155E75' }}>საგარანტიო ფონდი</div>
                </div>
            </div>

            {/* ═══ How It Works ═══ */}
            <div className="fin-how-card">
                <div className="fin-how-header">
                    <div className="fin-how-icon"><Info size={15} style={{ color: '#EA580C' }} /></div>
                    <span>როგორ მუშაობს?</span>
                </div>
                <div className="fin-how-formula">
                    <div className="fin-how-item">
                        <div className="fin-how-item-label">კლიენტის ჯამი</div>
                        <div className="fin-how-item-value" style={{ color: '#059669' }}>₾1000</div>
                    </div>
                    <span className="fin-how-op">−</span>
                    <div className="fin-how-item">
                        <div className="fin-how-item-label">ნეტო + კომპანია ({feePercent}%)</div>
                        <div className="fin-how-item-value" style={{ color: '#DC2626' }}>₾500+₾{(1000 * feePercent / 100).toFixed(0)}</div>
                    </div>
                    <span className="fin-how-op">=</span>
                    <div className="fin-how-item">
                        <div className="fin-how-item-label">შენი მოგება</div>
                        <div className="fin-how-item-value" style={{ color: '#059669' }}>₾{(1000 - 500 - 1000 * feePercent / 100).toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {/* ═══ Transactions ═══ */}
            <div className="fin-tx-card">
                <div className="fin-tx-header">
                    <div className="fin-tx-header-left">
                        <div className="fin-tx-header-icon"><Receipt size={15} style={{ color: 'var(--accent)' }} /></div>
                        <h3>ტრანზაქციები</h3>
                    </div>
                    <span className="fin-tx-count">{transactions.length}</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="fin-tx-empty">
                        <Receipt size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                        <p>ტრანზაქციები ჯერ არ არის</p>
                    </div>
                ) : (
                    <div>
                        {transactions.map((tx: any, idx: number) => {
                            const tc = TX_CONFIG[tx.type] || { label: tx.type, Icon: DollarSign, color: 'var(--ink-muted)', sign: '' };
                            const TxIcon = tc.Icon;
                            return (
                                <div key={tx.id} className="fin-tx-row"
                                    style={{ borderBottom: idx < transactions.length - 1 ? '1px solid var(--surface-100)' : 'none' }}>
                                    <div className="fin-tx-icon" style={{ background: `${tc.color}10` }}>
                                        <TxIcon size={16} style={{ color: tc.color }} />
                                    </div>
                                    <div className="fin-tx-info">
                                        <p className="fin-tx-label">{tc.label}</p>
                                        <div className="fin-tx-meta">
                                            <span>{new Date(tx.createdAt).toLocaleDateString('ka-GE')}</span>
                                            {tx.orderId && <span className="fin-tx-order">#{tx.orderId.slice(0, 8)}</span>}
                                        </div>
                                    </div>
                                    <div className="fin-tx-right">
                                        <p className="fin-tx-amount" style={{ color: tc.color }}>{tc.sign}₾ {tx.amount.toFixed(2)}</p>
                                        <span className={`fin-tx-status ${tx.status === 'CONFIRMED' ? 'confirmed' : 'pending'}`}>
                                            {tx.status === 'CONFIRMED' ? 'დადასტ.' : 'მოლოდინში'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
