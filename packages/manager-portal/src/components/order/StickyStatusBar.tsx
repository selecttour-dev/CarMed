import { Check, Loader2, FileText, CheckCircle, Clock, Truck, Activity, Ban, ThumbsUp, ChevronRight } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; step: number }> = {
    PENDING: { label: 'მოლოდინში', color: '#D97706', bg: '#FFFBEB', icon: Clock, step: 1 },
    ACCEPTED: { label: 'მიღებული', color: '#2563EB', bg: '#EFF6FF', icon: ThumbsUp, step: 2 },
    PICKED_UP: { label: 'წაყვანილია', color: '#7C3AED', bg: '#F5F3FF', icon: Truck, step: 3 },
    IN_PROGRESS: { label: 'მიმდინარეობს', color: '#0891B2', bg: '#ECFEFF', icon: Activity, step: 4 },
    COMPLETED: { label: 'დასრულებული', color: '#059669', bg: '#D1FAE5', icon: CheckCircle, step: 5 },
    CANCELED: { label: 'გაუქმებული', color: '#DC2626', bg: '#FEF2F2', icon: Ban, step: 0 },
    REJECTED: { label: 'უარყოფილი', color: '#DC2626', bg: '#FEF2F2', icon: Ban, step: 0 },
};

const STEPS = [
    { key: 'PENDING', label: 'მოლოდინში', icon: Clock },
    { key: 'ACCEPTED', label: 'მიღებული', icon: ThumbsUp },
    { key: 'PICKED_UP', label: 'წაყვანილი', icon: Truck },
    { key: 'IN_PROGRESS', label: 'მიმდინარე', icon: Activity },
    { key: 'COMPLETED', label: 'დასრულდა', icon: CheckCircle },
];

const NEXT_STATUS: Record<string, { status: string; label: string; color: string; gradient: string }> = {
    PENDING: { status: 'ACCEPTED', label: '✅ მივიღე შეკვეთა', color: '#2563EB', gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)' },
    ACCEPTED: { status: 'PICKED_UP', label: '🚗 წავიყვანე მანქანა', color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)' },
    PICKED_UP: { status: 'IN_PROGRESS', label: '🔧 დავიწყე სამუშაო', color: '#0891B2', gradient: 'linear-gradient(135deg, #0891B2, #0E7490)' },
    IN_PROGRESS: { status: 'COMPLETED', label: '🏁 დავასრულე', color: '#059669', gradient: 'linear-gradient(135deg, #059669, #047857)' },
};

interface Props {
    order: any;
    submitting: boolean;
    onStatusUpdate: (status: string) => void;
    onCreateInvoice: () => void;
    isCompleted: boolean;
}

export default function StickyStatusBar({ order, submitting, onStatusUpdate, onCreateInvoice, isCompleted }: Props) {
    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const StatusIcon = sc.icon;
    const nextAction = NEXT_STATUS[order.status];
    const currentStep = sc.step;

    return (
        <div style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,249,0.98))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            marginLeft: '-32px', marginRight: '-32px', marginTop: '-28px',
            padding: '0 32px 18px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
            {/* ═══ Step Progress Bar ═══ */}
            <div style={{
                display: 'flex', alignItems: 'center',
                padding: '16px 0 14px',
                gap: '2px',
            }}>
                {STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCurrent = step.key === order.status;
                    const isDone = currentStep > idx + 1;

                    return (
                        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : undefined }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                whiteSpace: 'nowrap',
                            }}>
                                <div style={{
                                    width: isCurrent ? 32 : 24,
                                    height: isCurrent ? 32 : 24,
                                    borderRadius: '50%',
                                    background: isDone ? '#059669' : isCurrent ? sc.color : '#F3F4F6',
                                    border: isCurrent ? `2px solid ${sc.color}30` : isDone ? 'none' : '2px solid #E5E7EB',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isCurrent ? `0 0 0 5px ${sc.color}12` : 'none',
                                }}>
                                    {isDone ? (
                                        <Check size={13} style={{ color: 'white' }} />
                                    ) : (
                                        <StepIcon size={isCurrent ? 14 : 11} style={{
                                            color: isCurrent ? 'white' : '#9CA3AF',
                                        }} />
                                    )}
                                </div>
                                <span style={{
                                    fontSize: isCurrent ? '12px' : '11px',
                                    fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                                    color: isDone ? '#059669' : isCurrent ? sc.color : '#9CA3AF',
                                    letterSpacing: '-0.01em',
                                }}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div style={{
                                    flex: 1, height: '2px', marginLeft: '8px',
                                    background: isDone ? '#059669' : '#E5E7EB',
                                    borderRadius: '1px',
                                    transition: 'background 0.5s ease',
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ═══ Status + Actions ═══ */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '14px', flexWrap: 'wrap',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 18px 10px 12px',
                    borderRadius: '14px',
                    background: `${sc.bg}`,
                    border: `1px solid ${sc.color}18`,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${sc.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <StatusIcon size={17} style={{ color: sc.color }} />
                    </div>
                    <div>
                        <div style={{
                            fontSize: '14px', fontWeight: 800, color: sc.color,
                            lineHeight: 1.2, letterSpacing: '-0.02em',
                        }}>
                            {sc.label}
                        </div>
                        <div style={{
                            fontSize: '11px', fontFamily: 'var(--font-mono)',
                            color: 'var(--ink-faint)', fontWeight: 500,
                        }}>
                            #{order.id.slice(0, 8)}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {order.status === 'IN_PROGRESS' && !order.invoice && (
                        <button onClick={onCreateInvoice}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '10px 18px', borderRadius: '12px',
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.1)',
                                color: 'var(--ink)', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(234,88,12,0.3)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(234,88,12,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)'; }}
                        >
                            <FileText size={14} style={{ color: '#EA580C' }} /> ინვოისის შექმნა
                        </button>
                    )}

                    {nextAction && !isCompleted && (
                        <button
                            onClick={() => onStatusUpdate(nextAction.status)}
                            disabled={submitting}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '11px 22px', borderRadius: '14px',
                                background: nextAction.gradient,
                                color: 'white', border: 'none',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em',
                                fontFamily: 'var(--font-sans)',
                                boxShadow: `0 4px 16px ${nextAction.color}30`,
                                transition: 'all 0.2s',
                                opacity: submitting ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = `0 6px 22px ${nextAction.color}40`)}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = `0 4px 16px ${nextAction.color}30`)}
                        >
                            {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                            {nextAction.label}
                            {!submitting && <ChevronRight size={15} style={{ opacity: 0.7 }} />}
                        </button>
                    )}

                    {isCompleted && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '11px 20px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #059669, #10B981)',
                            color: 'white', fontSize: '14px', fontWeight: 700,
                            boxShadow: '0 4px 16px rgba(5,150,105,0.25)',
                            letterSpacing: '-0.01em',
                        }}>
                            <CheckCircle size={16} /> დასრულებულია
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export { STATUS_CONFIG, NEXT_STATUS };
