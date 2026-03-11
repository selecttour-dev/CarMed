import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
    ArrowLeft, CheckCircle2, Car, MapPin, Shield, Receipt, BarChart3, User,
    Check, X, AlertTriangle, Loader2, Package, Wrench, HelpCircle, MessageSquare,
    ThumbsUp, ThumbsDown, Ban, Download, Clock, Phone, CreditCard, Star
} from 'lucide-react';
import { getMakeLogo } from '../data/carDatabase';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    PENDING: { label: 'მოლოდინში', color: '#D97706', bg: '#FFFBEB', border: 'rgba(217,119,6,0.15)', dot: '#F59E0B' },
    ACCEPTED: { label: 'მიღებული', color: '#2563EB', bg: '#EFF6FF', border: 'rgba(37,99,235,0.15)', dot: '#3B82F6' },
    PICKED_UP: { label: 'წაყვანილია', color: '#7C3AED', bg: '#F5F3FF', border: 'rgba(124,58,237,0.15)', dot: '#8B5CF6' },
    IN_PROGRESS: { label: 'მიმდინარეობს', color: '#0891B2', bg: '#ECFEFF', border: 'rgba(8,145,178,0.15)', dot: '#06B6D4' },
    COMPLETED: { label: 'დასრულებული', color: '#059669', bg: '#F0FDF4', border: 'rgba(5,150,105,0.15)', dot: '#10B981' },
    CANCELED: { label: 'გაუქმებული', color: '#DC2626', bg: '#FEF2F2', border: 'rgba(220,38,38,0.15)', dot: '#EF4444' },
    REJECTED: { label: 'უარყოფილი', color: '#DC2626', bg: '#FEF2F2', border: 'rgba(220,38,38,0.15)', dot: '#EF4444' },
};

const LINE_TYPE_ICON: Record<string, any> = { PART: Package, LABOR: Wrench, OTHER: HelpCircle };

const APPROVAL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: 'მოლოდინში', color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle },
    APPROVED: { label: 'დადასტურებული', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
    REJECTED: { label: 'უარყოფილი', color: '#DC2626', bg: '#FEF2F2', icon: Ban },
    PARTIALLY_APPROVED: { label: 'ნაწილობრივ', color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle },
};

const translateNote = (note: string): string | null => {
    if (!note) return null;
    const map: Record<string, string> = {
        'Order created': 'შეკვეთა შეიქმნა',
        'Vehicle picked up': 'ავტომობილი წაყვანილია',
        'Invoice created': 'ინვოისი შეიქმნა',
        'Invoice updated': 'ინვოისი განახლდა',
        'Payment confirmed': 'გადახდა დადასტურდა',
        'Order completed': 'შეკვეთა დასრულდა',
        'Order canceled': 'შეკვეთა გაუქმდა',
        'Order accepted': 'შეკვეთა მიღებულია',
        'Manager assigned': 'მენეჯერი მინიჭებულია',
    };
    if (map[note]) return map[note];
    if (note.startsWith('Diagnosing at')) return `დიაგნოსტიკა: ${note.replace('Diagnosing at ', '')}`;
    if (note.startsWith('Repairing at')) return `შეკეთება: ${note.replace('Repairing at ', '')}`;
    if (note.startsWith('Ready at')) return `მზადაა: ${note.replace('Ready at ', '')}`;
    if (note.startsWith('Status changed')) return 'სტატუსი შეიცვალა';
    if (/^[a-zA-Z0-9\s.,!?@#$%^&*()-_+=]+$/.test(note)) return null;
    return note;
};

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ type: 'line' | 'invoice'; lineId?: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    const fetchOrder = async () => {
        try { const { data } = await api.get(`/client/orders/${id}`); setOrder(data.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchOrder(); }, [id]);

    const approveLine = async (lineId: string) => {
        setActionLoading(lineId);
        try { const { data } = await api.put(`/client/orders/${id}/invoice/lines/${lineId}/approve`); setOrder(data.data); }
        catch (e) { console.error(e); }
        finally { setActionLoading(null); }
    };

    const rejectLine = async (lineId: string, reason: string) => {
        setActionLoading(lineId);
        try { const { data } = await api.put(`/client/orders/${id}/invoice/lines/${lineId}/reject`, { reason }); setOrder(data.data); }
        catch (e) { console.error(e); }
        finally { setActionLoading(null); setRejectModal(null); setRejectReason(''); }
    };

    const approveInvoice = async () => {
        setActionLoading('invoice-approve');
        try { const { data } = await api.put(`/client/orders/${id}/invoice/approve`); setOrder(data.data); }
        catch (e) { console.error(e); }
        finally { setActionLoading(null); }
    };

    const rejectInvoice = async (reason: string) => {
        setActionLoading('invoice-reject');
        try { const { data } = await api.put(`/client/orders/${id}/invoice/reject`, { reason }); setOrder(data.data); }
        catch (e) { console.error(e); }
        finally { setActionLoading(null); setRejectModal(null); setRejectReason(''); }
    };

    const submitReview = async () => {
        if (reviewRating < 1) return;
        setReviewLoading(true);
        try {
            const { data } = await api.post(`/client/orders/${id}/review`, {
                rating: reviewRating, comment: reviewComment.trim() || null,
            });
            setOrder(data.data);
        } catch (e) { console.error(e); }
        finally { setReviewLoading(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="w-7 h-7 border-[2.5px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        </div>
    );
    if (!order) return <div className="text-center py-20 text-ink-muted">შეკვეთა ვერ მოიძებნა</div>;

    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const invoice = order.invoice;
    const invoiceApproval = invoice?.clientApprovalStatus || 'PENDING';
    const isPending = invoiceApproval === 'PENDING';
    const isPartial = invoiceApproval === 'PARTIALLY_APPROVED';
    const canAct = isPending || isPartial;

    const effectiveLines = invoice?.lines?.filter((l: any) => (l.clientApprovalStatus || 'PENDING') !== 'REJECTED') || [];
    const rejectedLines = invoice?.lines?.filter((l: any) => l.clientApprovalStatus === 'REJECTED') || [];
    const effectiveClientTotal = effectiveLines.reduce((sum: number, l: any) => sum + l.clientPrice * l.quantity, 0);
    const originalClientTotal = invoice?.totalClientPrice || 0;
    const hasRejections = rejectedLines.length > 0;

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            {/* Nav */}
            <button onClick={() => navigate('/dashboard/orders')}
                className="group flex items-center gap-1.5 text-ink-muted hover:text-emerald-700 text-[13px] font-medium mb-6 transition-colors">
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
                ჩემი შეკვეთები
            </button>

            {/* Header Card */}
            <div className="card p-4 sm:p-6 mb-5 sm:mb-6 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {order.vehicle && (
                            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-[14px] sm:rounded-[16px] bg-surface-50 border border-surface-100 flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0">
                                {getMakeLogo(order.vehicle.make) ? (
                                    <img src={getMakeLogo(order.vehicle.make)} alt={order.vehicle.make} className="w-full h-full object-contain" />
                                ) : (
                                    <Car size={22} className="text-ink-faint" />
                                )}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h1 className="text-[16px] sm:text-[18px] font-extrabold tracking-tight text-ink font-display">
                                    {order.vehicle ? `${order.vehicle.make} ${order.vehicle.model}` : 'შეკვეთა'}
                                </h1>
                                <span className="badge text-[10px] sm:text-[11px]"
                                    style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                                    {st.label}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-muted text-[11px] sm:text-[12px]">
                                {order.vehicle?.plateNumber && (
                                    <span className="font-mono font-semibold text-ink-light">{order.vehicle.plateNumber}</span>
                                )}
                                {order.vehicle?.year && <span>• {order.vehicle.year}</span>}
                                <span className="flex items-center gap-1">
                                    <Clock size={11} />
                                    {new Date(order.createdAt).toLocaleDateString('ka-GE')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <span className="font-mono text-ink-faint text-[12px] hidden sm:block">#{order.id.slice(0, 8)}</span>
                </div>

                {(order.problemDescription || order.address) && (
                    <div className="mt-4 pt-4 border-t border-surface-100">
                        {order.address && (
                            <div className="flex items-center gap-1.5 text-ink-muted text-[12px] mb-2">
                                <MapPin size={12} className="flex-shrink-0" /> {order.address}
                            </div>
                        )}
                        {order.problemDescription && (
                            <p className="text-ink-light text-[13px] leading-relaxed">{order.problemDescription}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in-up-1">
                {/* Main Content — 2/3 */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Invoice */}
                    {invoice && (
                        <div className="card overflow-hidden">
                            {/* Invoice Header */}
                            <div className="p-5 pb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="section-title flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-[10px] bg-orange-50 flex items-center justify-center">
                                            <Receipt size={15} className="text-orange-600" />
                                        </div>
                                        ინვოისი
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button title="PDF ჩამოტვირთვა (მალე)"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-semibold
                                            bg-surface-50 text-ink-faint border border-surface-100 cursor-not-allowed">
                                            <Download size={12} /> PDF
                                        </button>
                                        {invoiceApproval !== 'PENDING' && (() => {
                                            const ac = APPROVAL_CONFIG[invoiceApproval];
                                            const AcIcon = ac?.icon;
                                            return (
                                                <span className="badge text-[11px]" style={{ background: ac?.bg, color: ac?.color }}>
                                                    {AcIcon && <AcIcon size={12} />} {ac?.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {invoice.serviceCenterName && (
                                    <p className="text-ink-muted text-[12px] mb-3">
                                        სერვის ცენტრი: <span className="font-semibold text-ink-light">{invoice.serviceCenterName}</span>
                                    </p>
                                )}

                                {canAct && (
                                    <div className="rounded-[14px] p-4 bg-amber-50 border border-amber-100">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-[10px] bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                <AlertTriangle size={14} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-amber-800 text-[13px] mb-0.5">
                                                    {isPending ? 'ინვოისი დასადასტურებელია' : 'ნაწილობრივ დადასტურებული'}
                                                </p>
                                                <p className="text-amber-700/60 text-[12px] leading-relaxed">
                                                    {isPending
                                                        ? 'შეამოწმეთ და დააჭირეთ „სრულად დადასტურება" ან ცალ-ცალკე გადაწყვიტეთ.'
                                                        : 'ზოგი ნაწილი უარყოფილია — გადასახდელი თანხა შემცირდა.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Line Items */}
                            <div className="border-t border-surface-100">
                                {invoice.lines?.map((line: any, idx: number) => {
                                    const TypeIcon = LINE_TYPE_ICON[line.type] || HelpCircle;
                                    const lineApproval = line.clientApprovalStatus || 'PENDING';
                                    const lineConfig = APPROVAL_CONFIG[lineApproval];
                                    const isLineApproved = lineApproval === 'APPROVED';
                                    const isLineRejected = lineApproval === 'REJECTED';
                                    const isLinePending = lineApproval === 'PENDING';
                                    const isLoading = actionLoading === line.id;

                                    return (
                                        <div key={line.id}
                                            className={`px-5 py-4 transition-all ${idx < invoice.lines.length - 1 ? 'border-b border-surface-100' : ''}
                                            ${isLineApproved ? 'bg-emerald-50/30' : isLineRejected ? 'bg-red-50/30 opacity-50' : ''}`}>
                                            <div className="flex items-start gap-3.5">
                                                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0
                                                    ${isLineApproved ? 'bg-emerald-100' : isLineRejected ? 'bg-red-100' : 'bg-surface-50'}`}>
                                                    <TypeIcon size={15} className={
                                                        isLineApproved ? 'text-emerald-600' : isLineRejected ? 'text-red-500' : 'text-ink-faint'
                                                    } />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className={`font-semibold text-[13px] ${isLineRejected ? 'line-through text-ink-faint' : 'text-ink'}`}>
                                                            {line.description}
                                                        </p>
                                                        {line.brand && (
                                                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-[6px] bg-surface-50 text-ink-faint border border-surface-100
                                                                ${isLineRejected ? 'line-through' : ''}`}>
                                                                {line.brand}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                                                        <span className={`px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium
                                                            ${line.type === 'PART' ? 'bg-emerald-50 text-emerald-600' : line.type === 'LABOR' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                                                            {line.type === 'PART' ? 'ნაწილი' : line.type === 'LABOR' ? 'სამუშაო' : 'სხვა'}
                                                        </span>
                                                        <span>×{line.quantity}</span>
                                                        {line.quality && (
                                                            <span className="px-1.5 py-0.5 rounded-[6px] bg-blue-50 text-blue-600 text-[9px] font-medium">
                                                                {line.quality === 'OEM' ? 'ორიგინალი' : line.quality === 'AFTERMARKET' ? 'არაორიგინ.' : line.quality === 'USED_OEM' ? 'მეორადი' : 'აღდგ.'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isLineRejected && line.clientRejectionReason && (
                                                        <div className="mt-2 flex items-start gap-1.5 text-red-600 text-[11px] bg-red-50 px-3 py-2 rounded-[10px] border border-red-100">
                                                            <MessageSquare size={11} className="flex-shrink-0 mt-0.5" />
                                                            <span>{line.clientRejectionReason}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price + Actions */}
                                                <div className="text-right flex-shrink-0">
                                                    <p className={`font-mono font-bold text-[14px] mb-2 ${isLineRejected ? 'line-through text-ink-faint' : 'text-ink'}`}>
                                                        ₾ {(line.clientPrice * line.quantity).toFixed(2)}
                                                    </p>

                                                    {isLinePending && (
                                                        <div className="flex items-center gap-1.5">
                                                            <button onClick={() => approveLine(line.id)} disabled={!!actionLoading}
                                                                className="btn-primary text-[10px] px-2.5 py-1.5 rounded-[10px] disabled:opacity-50">
                                                                {isLoading ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                                                                თანხმობა
                                                            </button>
                                                            <button onClick={() => setRejectModal({ type: 'line', lineId: line.id })} disabled={!!actionLoading}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] text-[10px] font-semibold
                                                                bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all disabled:opacity-50">
                                                                <X size={10} /> უარი
                                                            </button>
                                                        </div>
                                                    )}

                                                    {!isLinePending && (
                                                        <span className="badge text-[10px]" style={{ background: lineConfig.bg, color: lineConfig.color }}>
                                                            {(() => { const Icon = lineConfig.icon; return <Icon size={10} />; })()}
                                                            {lineConfig.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totals */}
                            <div className="p-5 border-t border-surface-100 bg-surface-50/50">
                                <div className="flex justify-between items-center py-1 text-[13px] text-ink-muted">
                                    <span>{effectiveLines.length} ნაწილი/სერვისი</span>
                                    <span className="font-mono font-semibold">
                                        {hasRejections && (
                                            <span className="line-through text-ink-ghost mr-2 text-[12px]">₾ {originalClientTotal.toFixed(2)}</span>
                                        )}
                                        ₾ {effectiveClientTotal.toFixed(2)}
                                    </span>
                                </div>
                                {hasRejections && (
                                    <div className="flex justify-between items-center py-1 text-[12px] text-red-400">
                                        <span className="flex items-center gap-1"><Ban size={11} /> უარყოფილი ({rejectedLines.length})</span>
                                        <span className="font-mono font-semibold">-₾ {(originalClientTotal - effectiveClientTotal).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 mt-2 border-t border-surface-200">
                                    <span className="text-[15px] font-bold text-ink">გადასახდელი</span>
                                    <span className="font-mono text-[18px] font-extrabold text-emerald-700">
                                        {hasRejections && (
                                            <span className="line-through text-ink-ghost mr-2.5 text-[13px] font-medium">₾ {originalClientTotal.toFixed(2)}</span>
                                        )}
                                        ₾ {effectiveClientTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Approve/Reject Buttons */}
                            {canAct && (
                                <div className="p-5 border-t border-surface-100 bg-white flex gap-3">
                                    <button onClick={approveInvoice} disabled={!!actionLoading}
                                        className="flex-1 btn-primary py-3.5 text-[14px] font-bold disabled:opacity-60">
                                        {actionLoading === 'invoice-approve'
                                            ? <Loader2 size={16} className="animate-spin" />
                                            : <ThumbsUp size={16} />}
                                        {isPartial ? 'დარჩენილის დადასტურება' : 'სრულად დადასტურება'}
                                    </button>
                                    <button onClick={() => setRejectModal({ type: 'invoice' })} disabled={!!actionLoading}
                                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] text-[14px] font-bold
                                        bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all disabled:opacity-60">
                                        <ThumbsDown size={16} /> სრული უარყოფა
                                    </button>
                                </div>
                            )}

                            {/* Bank details */}
                            {invoiceApproval === 'APPROVED' && order.manager?.managerProfile?.bankAccountNumber && (
                                <div className="p-5 border-t border-surface-100">
                                    <div className="rounded-[14px] p-4 bg-emerald-gradient-soft border border-emerald-200/40">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CreditCard size={15} className="text-emerald-700" />
                                            <p className="text-emerald-800 text-[13px] font-bold">გადახდის დეტალები</p>
                                        </div>
                                        {order.manager.managerProfile.bankName && (
                                            <p className="text-emerald-700/60 text-[12px] mb-1">{order.manager.managerProfile.bankName}</p>
                                        )}
                                        <p className="font-mono font-bold text-emerald-900 text-[15px] tracking-wide">{order.manager.managerProfile.bankAccountNumber}</p>
                                        {order.manager.managerProfile.bankAccountName && (
                                            <p className="text-emerald-700/50 text-[12px] mt-1">{order.manager.managerProfile.bankAccountName}</p>
                                        )}
                                        <p className="text-emerald-600/40 text-[11px] mt-3 leading-relaxed">
                                            გადარიცხვის შემდეგ მენეჯერი დაადასტურებს მიღებას.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Rejection note */}
                            {invoiceApproval === 'REJECTED' && invoice.clientApprovalNote && (
                                <div className="p-5 border-t border-surface-100">
                                    <div className="bg-red-50 border border-red-100 rounded-[14px] p-4 flex items-start gap-3">
                                        <MessageSquare size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-red-800 font-semibold text-[13px] mb-1">უარყოფის მიზეზი</p>
                                            <p className="text-red-700/70 text-[12px] leading-relaxed">{invoice.clientApprovalNote}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment confirmed */}
                    {order.managerConfirmedPayment && (
                        <div className="flex items-center gap-3 card p-4 border-emerald-100 bg-emerald-50/50">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                            <span className="font-semibold text-emerald-700 text-[13px]">მენეჯერმა დაადასტურა გადახდის მიღება</span>
                        </div>
                    )}

                    {/* Review Section */}
                    {order.status === 'COMPLETED' && order.manager && (
                        <div className="card p-5">
                            <h3 className="section-title mb-4 flex items-center gap-2">
                                <Star size={15} className="text-amber-500" />
                                {order.review ? 'თქვენი შეფასება' : 'შეაფასეთ მენეჯერი'}
                            </h3>

                            {order.review ? (
                                <div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={22}
                                                fill={s <= order.review.rating ? '#F59E0B' : 'none'}
                                                stroke={s <= order.review.rating ? '#F59E0B' : '#D1D5DB'}
                                                strokeWidth={1.5} />
                                        ))}
                                        <span className="ml-2 text-ink-muted text-[13px] font-mono">{order.review.rating}/5</span>
                                    </div>
                                    {order.review.comment && (
                                        <p className="text-ink-light text-[13px] leading-relaxed mt-2 bg-surface-50 rounded-[12px] p-3 border border-surface-100">
                                            "{order.review.comment}"
                                        </p>
                                    )}
                                    <p className="text-ink-faint text-[11px] mt-2">
                                        {new Date(order.review.createdAt).toLocaleString('ka-GE')}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-ink-muted text-[12px] mb-3">როგორ შეაფასებთ მენეჯერის მომსახურებას?</p>
                                    <div className="flex items-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} type="button"
                                                onMouseEnter={() => setReviewHover(s)}
                                                onMouseLeave={() => setReviewHover(0)}
                                                onClick={() => setReviewRating(s)}
                                                className="transition-transform hover:scale-110">
                                                <Star size={28}
                                                    fill={s <= (reviewHover || reviewRating) ? '#F59E0B' : 'none'}
                                                    stroke={s <= (reviewHover || reviewRating) ? '#F59E0B' : '#D1D5DB'}
                                                    strokeWidth={1.5}
                                                    style={{ transition: 'all 0.15s' }} />
                                            </button>
                                        ))}
                                        {reviewRating > 0 && (
                                            <span className="ml-2 text-amber-600 font-bold text-[14px]">{reviewRating}/5</span>
                                        )}
                                    </div>
                                    <textarea value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        placeholder="დაწერეთ კომენტარი (სურვილისამებრ)..."
                                        className="input min-h-[70px] resize-none mb-3" />
                                    <button onClick={submitReview}
                                        disabled={reviewRating < 1 || reviewLoading}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-[14px] text-[14px] font-bold transition-all disabled:opacity-40
                                            ${reviewRating > 0
                                                ? 'text-white shadow-lg'
                                                : 'bg-surface-50 text-ink-faint'}`}
                                        style={reviewRating > 0 ? {
                                            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                            boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
                                        } : {}}>
                                        {reviewLoading ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
                                        შეფასების გაგზავნა
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar — 1/3 */}
                <div className="space-y-5">
                    {/* Status Timeline */}
                    <div className="card p-5">
                        <h3 className="section-title mb-4 flex items-center gap-2">
                            <BarChart3 size={15} className="text-ink-muted" />
                            სტატუსის ისტორია
                        </h3>
                        {order.statusHistory?.length > 0 ? (
                            <div className="relative pl-5">
                                <div className="absolute left-[5px] top-1 bottom-1 w-[2px]"
                                    style={{ background: 'linear-gradient(180deg, #E2E8F0 0%, transparent 100%)' }} />
                                {order.statusHistory.map((sh: any, idx: number) => {
                                    const hst = STATUS_CONFIG[sh.toStatus] || STATUS_CONFIG.PENDING;
                                    const isLast = idx === order.statusHistory.length - 1;
                                    const translatedNote = translateNote(sh.notes);
                                    return (
                                        <div key={sh.id || idx} className="relative pb-5 last:pb-0">
                                            <div className="absolute left-[-17px] top-0.5 w-3 h-3 rounded-full border-2"
                                                style={{
                                                    background: isLast ? hst.dot : '#fff',
                                                    borderColor: isLast ? hst.dot : '#CBD5E1',
                                                    boxShadow: isLast ? `0 0 8px ${hst.dot}40` : 'none',
                                                }} />
                                            <div className="ml-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="badge text-[10px]"
                                                        style={{ background: hst.bg, color: hst.color }}>
                                                        {hst.label}
                                                    </span>
                                                    <span className="font-mono text-[10px] text-ink-faint">
                                                        {new Date(sh.createdAt).toLocaleString('ka-GE', {
                                                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                                {translatedNote && (
                                                    <p className="text-[12px] text-ink-muted mt-0.5 leading-relaxed">{translatedNote}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <p className="text-ink-muted text-[13px]">ისტორია ცარიელია</p>}
                    </div>

                    {/* Manager Card */}
                    {order.manager && (
                        <div className="card p-5">
                            <h3 className="section-title mb-3 flex items-center gap-2">
                                <User size={15} className="text-ink-muted" /> მენეჯერი
                            </h3>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-bold text-[15px]
                                    bg-emerald-gradient-soft text-emerald-700 border border-emerald-200/40">
                                    {order.manager.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-ink text-[13px]">
                                        {order.manager.name} {order.manager.managerProfile?.surname || ''}
                                    </p>
                                    <p className="text-ink-muted text-[12px] flex items-center gap-1">
                                        <Phone size={10} />
                                        <span className="font-mono">{order.manager.phone}</span>
                                    </p>
                                </div>
                            </div>
                            {order.manager.managerProfile?.bankAccountNumber && (
                                <div className="bg-surface-50 rounded-[12px] p-3 mt-2">
                                    <p className="text-ink-faint text-[10px] font-semibold uppercase tracking-wider mb-1">საბანკო ანგარიში</p>
                                    {order.manager.managerProfile.bankName && (
                                        <p className="text-ink-muted text-[11px]">{order.manager.managerProfile.bankName}</p>
                                    )}
                                    <p className="font-mono font-bold text-ink text-[13px]">{order.manager.managerProfile.bankAccountNumber}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info hint */}
                    <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[14px] bg-emerald-50/50 border border-emerald-100/50">
                        <Shield size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-emerald-800 text-[11px] mb-0.5">როგორ მუშაობს?</p>
                            <p className="text-emerald-700/40 text-[11px] leading-relaxed">
                                ინვოისის მიღებისას შეამოწმეთ ნაწილები, დაადასტურეთ ან უარყავით. დადასტურების შემდეგ გადაიხადეთ მითითებულ ანგარიშზე.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
                    onClick={() => { setRejectModal(null); setRejectReason(''); }}>
                    <div className="bg-white rounded-[20px] p-6 max-w-md w-full shadow-float animate-scale-in"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-[12px] bg-red-50 flex items-center justify-center border border-red-100">
                                <AlertTriangle size={18} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[15px] text-ink">
                                    {rejectModal.type === 'invoice' ? 'ინვოისის უარყოფა' : 'ნაწილის უარყოფა'}
                                </h3>
                                <p className="text-ink-muted text-[12px]">
                                    {rejectModal.type === 'invoice' ? 'მთელი ინვოისი უარყოფილი იქნება' : 'ეს ნაწილი/სერვისი უარყოფილი იქნება'}
                                </p>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-[12px] font-semibold text-ink-light mb-2">მიზეზი (სურვილისამებრ)</label>
                            <textarea value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="მაგ: ფასი ძვირია, არ მჭირდება ეს ნაწილი..."
                                className="input min-h-[90px] resize-none" />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                                className="btn-secondary text-[13px] px-5 py-2.5">
                                გაუქმება
                            </button>
                            <button onClick={() => {
                                if (rejectModal.type === 'invoice') rejectInvoice(rejectReason);
                                else if (rejectModal.lineId) rejectLine(rejectModal.lineId, rejectReason);
                            }}
                                disabled={!!actionLoading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[13px] font-bold text-white
                                bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60 shadow-lg"
                                style={{ boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}>
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                უარყოფა
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
