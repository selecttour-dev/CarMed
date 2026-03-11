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
    PENDING: { status: 'ACCEPTED', label: '✅ მივიღე', color: '#2563EB', gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)' },
    ACCEPTED: { status: 'PICKED_UP', label: '🚗 წავიყვანე', color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)' },
    PICKED_UP: { status: 'IN_PROGRESS', label: '🔧 დავიწყე', color: '#0891B2', gradient: 'linear-gradient(135deg, #0891B2, #0E7490)' },
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
        <div className="sticky-status-bar">
            {/* ═══ Step Progress Bar ═══ */}
            <div className="status-steps">
                {STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCurrent = step.key === order.status;
                    const isDone = currentStep > idx + 1;

                    return (
                        <div key={step.key} className="status-step-item" style={{ flex: idx < STEPS.length - 1 ? 1 : undefined }}>
                            <div className="status-step-inner">
                                <div
                                    className={`status-step-circle ${isDone ? 'done' : isCurrent ? 'current' : ''}`}
                                    style={{
                                        width: isCurrent ? 32 : 24,
                                        height: isCurrent ? 32 : 24,
                                        background: isDone ? '#059669' : isCurrent ? sc.color : '#F3F4F6',
                                        border: isCurrent ? `2px solid ${sc.color}30` : isDone ? 'none' : '2px solid #E5E7EB',
                                        boxShadow: isCurrent ? `0 0 0 5px ${sc.color}12` : 'none',
                                    }}
                                >
                                    {isDone ? (
                                        <Check size={13} style={{ color: 'white' }} />
                                    ) : (
                                        <StepIcon size={isCurrent ? 14 : 11} style={{
                                            color: isCurrent ? 'white' : '#9CA3AF',
                                        }} />
                                    )}
                                </div>
                                <span className="status-step-label" style={{
                                    fontSize: isCurrent ? '12px' : '11px',
                                    fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                                    color: isDone ? '#059669' : isCurrent ? sc.color : '#9CA3AF',
                                }}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className="status-step-line" style={{
                                    background: isDone ? '#059669' : '#E5E7EB',
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ═══ Status + Actions ═══ */}
            <div className="status-actions-row">
                <div className="status-badge" style={{
                    background: sc.bg,
                    border: `1px solid ${sc.color}18`,
                }}>
                    <div className="status-badge-icon" style={{ background: `${sc.color}15` }}>
                        <StatusIcon size={17} style={{ color: sc.color }} />
                    </div>
                    <div>
                        <div className="status-badge-label" style={{ color: sc.color }}>
                            {sc.label}
                        </div>
                        <div className="status-badge-id">
                            #{order.id.slice(0, 8)}
                        </div>
                    </div>
                </div>

                <div className="status-action-btns">
                    {order.status === 'IN_PROGRESS' && !order.invoice && (
                        <button onClick={onCreateInvoice} className="status-invoice-btn">
                            <FileText size={14} style={{ color: '#EA580C' }} /> ინვოისი
                        </button>
                    )}

                    {nextAction && !isCompleted && (
                        <button
                            onClick={() => onStatusUpdate(nextAction.status)}
                            disabled={submitting}
                            className="status-next-btn"
                            style={{
                                background: nextAction.gradient,
                                boxShadow: `0 4px 16px ${nextAction.color}30`,
                                opacity: submitting ? 0.7 : 1,
                            }}
                        >
                            {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                            {nextAction.label}
                            {!submitting && <ChevronRight size={15} style={{ opacity: 0.7 }} />}
                        </button>
                    )}

                    {isCompleted && (
                        <span className="status-completed-badge">
                            <CheckCircle size={16} /> დასრულებულია
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export { STATUS_CONFIG, NEXT_STATUS };
