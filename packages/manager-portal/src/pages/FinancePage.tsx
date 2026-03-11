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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-light)' }} />
        </div>
    );
    if (!finance) return (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <Wallet size={40} style={{ color: 'var(--ink-ghost)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-muted)' }}>ფინანსური მონაცემები ვერ ჩაიტვირთა</h3>
        </div>
    );

    const { summary, transactions } = finance;
    const feePercent = summary.companyFeePercent ?? 20;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '28px' }}>
                <h1 className="page-title" style={{ fontSize: '26px', marginBottom: '4px' }}>ფინანსები</h1>
                <p className="page-subtitle" style={{ fontSize: '14px' }}>ფინანსური მიმოხილვა და ტრანზაქციების ისტორია</p>
            </div>

            {/* ═══ 4-column Stats ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                {/* Total Earned */}
                <div style={{
                    padding: '22px', borderRadius: '18px',
                    background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                    border: '1px solid rgba(5,150,105,0.12)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '65px', height: '65px', borderRadius: '50%', background: 'rgba(5,150,105,0.06)' }} />
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        <ArrowUpRight size={20} style={{ color: '#059669' }} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669', position: 'relative' }}>
                        ₾ {summary.totalEarned.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#065F46', marginTop: '4px' }}>სულ მიღებული</div>
                </div>

                {/* Current Debt */}
                <div style={{
                    padding: '22px', borderRadius: '18px',
                    background: summary.currentDebt > 0 ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' : 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                    border: `1px solid ${summary.currentDebt > 0 ? 'rgba(217,119,6,0.12)' : 'rgba(5,150,105,0.12)'}`,
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '65px', height: '65px', borderRadius: '50%', background: summary.currentDebt > 0 ? 'rgba(217,119,6,0.06)' : 'rgba(5,150,105,0.06)' }} />
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: summary.currentDebt > 0 ? 'rgba(217,119,6,0.12)' : 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        {summary.currentDebt > 0 ? <ArrowDownRight size={20} style={{ color: '#D97706' }} /> : <TrendingUp size={20} style={{ color: '#059669' }} />}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: summary.currentDebt > 0 ? '#D97706' : '#059669', position: 'relative' }}>
                        ₾ {summary.currentDebt.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: summary.currentDebt > 0 ? '#92400E' : '#065F46', marginTop: '4px' }}>
                        {summary.currentDebt > 0 ? 'ვალი კომპანიის მიმართ' : 'ვალი არ გაქვთ ✓'}
                    </div>
                </div>

                {/* Commission */}
                <div style={{
                    padding: '22px', borderRadius: '18px',
                    background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                    border: '1px solid rgba(59,130,246,0.1)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '65px', height: '65px', borderRadius: '50%', background: 'rgba(59,130,246,0.06)' }} />
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        <TrendingUp size={20} style={{ color: '#2563EB' }} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#2563EB', position: 'relative' }}>{feePercent}%</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E40AF', marginTop: '4px' }}>კომპანიის საკომისიო</div>
                </div>

                {/* Guarantee Fund */}
                <div style={{
                    padding: '22px', borderRadius: '18px',
                    background: 'linear-gradient(135deg, #ECFEFF, #CFFAFE)',
                    border: '1px solid rgba(8,145,178,0.1)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '65px', height: '65px', borderRadius: '50%', background: 'rgba(8,145,178,0.06)' }} />
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(8,145,178,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        <PiggyBank size={20} style={{ color: '#0891B2' }} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0891B2', position: 'relative' }}>
                        ₾ {summary.guaranteeFund.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#155E75', marginTop: '4px' }}>საგარანტიო ფონდი</div>
                </div>
            </div>

            {/* ═══ How It Works ═══ */}
            <div style={{
                marginBottom: '24px', padding: '18px 22px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)',
                border: '1px solid rgba(234,88,12,0.08)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(234,88,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Info size={15} style={{ color: '#EA580C' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#9A3412' }}>როგორ მუშაობს?</span>
                </div>
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '10px',
                    alignItems: 'center', textAlign: 'center',
                    padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.7)',
                }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600, marginBottom: '4px' }}>კლიენტის ჯამი</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669' }}>₾1000</div>
                    </div>
                    <span style={{ fontSize: '20px', color: '#D97706', fontWeight: 800 }}>−</span>
                    <div>
                        <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600, marginBottom: '4px' }}>ნეტო + კომპანია ({feePercent}%)</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#DC2626' }}>₾500+₾{(1000 * feePercent / 100).toFixed(0)}</div>
                    </div>
                    <span style={{ fontSize: '20px', color: '#D97706', fontWeight: 800 }}>=</span>
                    <div>
                        <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600, marginBottom: '4px' }}>შენი მოგება</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669' }}>₾{(1000 - 500 - 1000 * feePercent / 100).toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {/* ═══ Transactions ═══ */}
            <div style={{
                background: 'white', borderRadius: '20px', border: '1px solid var(--surface-100)',
                overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <div style={{
                    padding: '18px 22px', borderBottom: '1px solid var(--surface-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #F8FAF9, #F0F4F2)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(4,120,87,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Receipt size={15} style={{ color: 'var(--accent)' }} />
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>ტრანზაქციები</h3>
                    </div>
                    <span style={{
                        fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)',
                        color: 'var(--ink-faint)', background: 'var(--surface-50)',
                        padding: '4px 10px', borderRadius: '8px',
                    }}>{transactions.length}</span>
                </div>

                {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--ink-faint)', fontSize: '14px' }}>
                        <Receipt size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                        <p>ტრანზაქციები ჯერ არ არის</p>
                    </div>
                ) : (
                    <div>
                        {transactions.map((tx: any, idx: number) => {
                            const tc = TX_CONFIG[tx.type] || { label: tx.type, Icon: DollarSign, color: 'var(--ink-muted)', sign: '' };
                            const TxIcon = tc.Icon;
                            return (
                                <div key={tx.id} style={{
                                    padding: '14px 22px',
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    borderBottom: idx < transactions.length - 1 ? '1px solid var(--surface-100)' : 'none',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-50)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12,
                                        background: `${tc.color}10`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <TxIcon size={18} style={{ color: tc.color }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{tc.label}</p>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)' }}>
                                                {new Date(tx.createdAt).toLocaleDateString('ka-GE')}
                                            </span>
                                            {tx.orderId && (
                                                <span style={{
                                                    fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ink-ghost)',
                                                    background: 'var(--surface-50)', padding: '2px 6px', borderRadius: '4px',
                                                }}>
                                                    #{tx.orderId.slice(0, 8)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px', color: tc.color }}>
                                            {tc.sign}₾ {tx.amount.toFixed(2)}
                                        </p>
                                        <span style={{
                                            fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                                            background: tx.status === 'CONFIRMED' ? '#ECFDF5' : '#FFFBEB',
                                            color: tx.status === 'CONFIRMED' ? '#059669' : '#D97706',
                                        }}>
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
