import { Clock, CheckCircle, Truck, Activity, Ban, ThumbsUp, History } from 'lucide-react';

const STATUS_ICONS: Record<string, any> = {
    PENDING: Clock,
    ACCEPTED: ThumbsUp,
    PICKED_UP: Truck,
    IN_PROGRESS: Activity,
    COMPLETED: CheckCircle,
    CANCELED: Ban,
    REJECTED: Ban,
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'მოლოდინში',
    ACCEPTED: 'მიღებული',
    PICKED_UP: 'წაყვანილია',
    IN_PROGRESS: 'მიმდინარეობს',
    COMPLETED: 'დასრულებული',
    CANCELED: 'გაუქმებული',
    REJECTED: 'უარყოფილი',
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#D97706',
    ACCEPTED: '#2563EB',
    PICKED_UP: '#7C3AED',
    IN_PROGRESS: '#0891B2',
    COMPLETED: '#059669',
    CANCELED: '#DC2626',
    REJECTED: '#DC2626',
};

interface Props {
    statusHistory: any[];
}

export default function StatusTimeline({ statusHistory }: Props) {
    if (!statusHistory || statusHistory.length === 0) return null;

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px 14px',
                background: 'linear-gradient(135deg, #F8FAF9, #F0F4F2)',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: '10px',
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'rgba(4, 120, 87, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <History size={14} style={{ color: '#047857' }} />
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, flex: 1 }}>სტატუსის ისტორია</h3>
                <span style={{
                    fontSize: '11px', fontFamily: 'var(--font-mono)',
                    color: 'var(--ink-faint)', fontWeight: 500,
                    background: 'var(--surface-50)', padding: '3px 8px', borderRadius: '6px',
                }}>
                    {statusHistory.length} ჩანაწერი
                </span>
            </div>

            <div style={{ padding: '16px 20px' }}>
                <div style={{ paddingLeft: '20px', position: 'relative' }}>
                    <div style={{
                        position: 'absolute', left: 6, top: 8, bottom: 8,
                        width: 2, background: 'var(--surface-200)',
                        borderRadius: '1px',
                    }} />
                    {statusHistory.map((sh: any, idx: number) => {
                        const isLast = idx === statusHistory.length - 1;
                        const color = STATUS_COLORS[sh.toStatus] || '#94A3B8';
                        const label = STATUS_LABELS[sh.toStatus] || sh.toStatus;
                        const Icon = STATUS_ICONS[sh.toStatus] || Clock;
                        const date = new Date(sh.createdAt);

                        return (
                            <div key={sh.id} style={{
                                display: 'flex', gap: '14px',
                                paddingBottom: isLast ? 0 : '16px',
                                position: 'relative',
                            }}>
                                <div style={{
                                    position: 'absolute', left: -17,
                                    width: isLast ? 12 : 10,
                                    height: isLast ? 12 : 10,
                                    borderRadius: '50%',
                                    marginTop: isLast ? 2 : 3,
                                    background: isLast ? color : 'white',
                                    border: isLast ? 'none' : '2px solid var(--surface-200)',
                                    boxShadow: isLast ? `0 0 0 4px ${color}20, 0 0 10px ${color}30` : 'none',
                                    transition: 'all 0.3s',
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Icon size={13} style={{ color: isLast ? color : 'var(--ink-faint)', flexShrink: 0 }} />
                                        <span style={{
                                            fontSize: '13px', fontWeight: isLast ? 700 : 500,
                                            color: isLast ? color : 'var(--ink-light)',
                                        }}>
                                            {label}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '11px', fontFamily: 'var(--font-mono)',
                                        color: 'var(--ink-faint)', marginTop: '2px', marginLeft: '19px',
                                    }}>
                                        {date.toLocaleDateString('ka-GE')} · {date.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {sh.notes && (
                                        <p style={{
                                            fontSize: '12px', color: 'var(--ink-muted)',
                                            marginTop: '3px', marginLeft: '19px',
                                            fontStyle: 'italic',
                                        }}>
                                            {sh.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
