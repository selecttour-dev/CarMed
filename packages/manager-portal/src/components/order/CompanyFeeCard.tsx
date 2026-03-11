import { CheckCircle, Loader2, AlertTriangle, DollarSign } from 'lucide-react';

interface Props {
    order: any;
    submitting: boolean;
    onMarkFeePaid: () => void;
    isCompleted: boolean;
}

export default function CompanyFeeCard({ order, submitting, onMarkFeePaid, isCompleted }: Props) {
    if (!order.invoice) return null;

    const lines = order.invoice.lines || [];
    const tClient = lines.reduce((s: number, l: any) => s + l.clientPrice * l.quantity, 0);
    const feePercent = 20;
    const fee = tClient * (feePercent / 100);
    const paid = order.invoice.managerFeePaid === true;

    if (tClient <= 0) return null;
    if (!isCompleted) return null;

    return (
        <div style={{
            borderRadius: '20px', padding: '22px 24px',
            background: paid
                ? 'linear-gradient(135deg, #F0FDF4, #D1FAE5)'
                : 'linear-gradient(135deg, #FEF2F2, #FFF5F5)',
            border: `1px solid ${paid ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)'}`,
            boxShadow: paid ? '0 2px 12px rgba(5,150,105,0.08)' : '0 2px 12px rgba(220,38,38,0.08)',
            animation: !paid ? 'pulse-gentle 2s ease-in-out infinite' : undefined,
        }}>
            <style>{`
                @keyframes pulse-gentle {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                    50% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.1); }
                }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: paid ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: paid ? '0 4px 12px rgba(5,150,105,0.15)' : '0 4px 12px rgba(220,38,38,0.12)',
                }}>
                    {paid
                        ? <CheckCircle size={24} style={{ color: '#059669' }} />
                        : <AlertTriangle size={24} style={{ color: '#DC2626' }} />
                    }
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: '15px', fontWeight: 800,
                        color: paid ? '#059669' : '#DC2626',
                        lineHeight: 1.3,
                    }}>
                        {paid ? 'კომპანიის წილი გადახდილია ✓' : '⚠️ კომპანიის წილი გადასახდელია!'}
                    </p>
                    <p style={{
                        fontSize: '13px',
                        color: paid ? '#065F46' : '#991B1B',
                        opacity: 0.9, marginTop: '4px',
                    }}>
                        {paid
                            ? `₾${fee.toFixed(2)} — დადასტურებულია`
                            : `გთხოვთ ჩარიცხოთ ₾${fee.toFixed(2)} კომპანიის ანგარიშზე`
                        }
                    </p>
                    {!paid && (
                        <p style={{
                            fontSize: '11px', color: '#991B1B', opacity: 0.6,
                            marginTop: '4px', fontFamily: 'var(--font-mono)',
                        }}>
                            {feePercent}% × ₾{tClient.toFixed(0)} = ₾{fee.toFixed(2)}
                        </p>
                    )}
                </div>
                {!paid && (
                    <button
                        disabled={submitting}
                        onClick={onMarkFeePaid}
                        style={{
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            color: 'white', border: 'none',
                            fontSize: '13px', fontWeight: 700, gap: '6px',
                            whiteSpace: 'nowrap', padding: '12px 20px', borderRadius: '12px',
                            boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                            display: 'flex', alignItems: 'center',
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(5,150,105,0.3)'; }}
                    >
                        {submitting
                            ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                            : <DollarSign size={15} />
                        }
                        ჩავრიცხე
                    </button>
                )}
            </div>
        </div>
    );
}
