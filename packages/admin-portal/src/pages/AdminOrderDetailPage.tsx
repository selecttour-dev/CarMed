import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
    ArrowLeft, Car, User, MapPin, Receipt, AlertTriangle,
    FileText, Loader2, CheckCircle, XCircle, RefreshCw,
    Shield, DollarSign, History, UserPlus, ChevronDown, ChevronUp, Repeat2,
    Edit2, Trash2, MessageSquare, ThumbsUp, ThumbsDown, Star
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'მოლოდინში', color: '#D97706', bg: '#FFFBEB' },
    ACCEPTED: { label: 'მიღებული', color: '#2563EB', bg: '#EFF6FF' },
    PICKED_UP: { label: 'წაყვანილია', color: '#7C3AED', bg: '#F5F3FF' },
    IN_PROGRESS: { label: 'მიმდინარეობს', color: '#0891B2', bg: '#ECFEFF' },
    COMPLETED: { label: 'დასრულებული', color: '#16A34A', bg: '#F0FDF4' },
    CANCELED: { label: 'გაუქმებული', color: '#DC2626', bg: '#FEF2F2' },
    REJECTED: { label: 'უარყოფილი', color: '#DC2626', bg: '#FEF2F2' },
};

const LINE_TYPE_LABELS: Record<string, string> = { PART: 'ნაწილი', LABOR: 'სამუშაო', OTHER: 'სხვა' };

const APPROVAL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; border: string }> = {
    PENDING: { label: 'მოლოდინში', color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle, border: 'rgba(217,119,6,0.2)' },
    APPROVED: { label: 'დადასტურებული', color: '#059669', bg: '#F0FDF4', icon: ThumbsUp, border: 'rgba(5,150,105,0.2)' },
    REJECTED: { label: 'უარყოფილი', color: '#DC2626', bg: '#FEF2F2', icon: ThumbsDown, border: 'rgba(220,38,38,0.2)' },
    PARTIALLY_APPROVED: { label: 'ნაწილობრივ დადასტურებული', color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle, border: 'rgba(217,119,6,0.2)' },
};

export default function AdminOrderDetailPage() {
    const { id } = useParams() as { id: string };
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandHistory, setExpandHistory] = useState(false);
    const [expandCorrections, setExpandCorrections] = useState(true);
    const [managers, setManagers] = useState<any[]>([]);
    const [assignModal, setAssignModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingLine, setEditingLine] = useState<any>(null);
    const [editForm, setEditForm] = useState({ description: '', quantity: '1', netCost: '', clientPrice: '', type: 'PART' });

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/admin/orders/${id}`);
            setOrder(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrder(); }, [id]);

    const fetchManagers = async () => {
        try {
            const { data } = await api.get('/admin/managers');
            setManagers(data.data || []);
        } catch (e) { console.error(e); }
    };

    const handleAssign = async () => {
        if (!selectedManager) return;
        try {
            setSubmitting(true);
            const endpoint = order?.managerId
                ? `/admin/orders/${id}/reassign`
                : `/admin/orders/${id}/assign`;
            await api.put(endpoint, { managerId: selectedManager });
            setAssignModal(false);
            setSelectedManager('');
            fetchOrder();
        } catch (err: any) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const handleStatusChange = async (newStatus: string) => {
        const currentLabel = STATUS_CONFIG[order?.status]?.label || order?.status;
        const newLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
        if (!confirm(`ნამდვილად გსურთ სტატუსის შეცვლა?\n\n${currentLabel} → ${newLabel}\n\nეს მოქმედება ადმინის ძალით.`)) return;
        try {
            setSubmitting(true);
            await api.put(`/admin/orders/${id}/status`, { status: newStatus });
            fetchOrder();
        } catch (err: any) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const handleCorrectionAction = async (reqId: string, action: 'APPROVED' | 'REJECTED') => {
        try {
            setSubmitting(true);
            await api.put(`/admin/correction-requests/${reqId}`, { action });
            fetchOrder();
        } catch (err: any) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const openEditLine = (line: any) => {
        setEditingLine(line);
        setEditForm({
            description: line.description,
            quantity: String(line.quantity),
            netCost: String(line.netCost),
            clientPrice: String(line.clientPrice),
            type: line.type,
        });
    };

    const submitEditLine = async () => {
        if (!editingLine) return;
        try {
            setSubmitting(true);
            await api.put(`/admin/invoice-lines/${editingLine.id}`, editForm);
            setEditingLine(null);
            fetchOrder();
        } catch (err: any) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const handleDeleteLine = async (line: any) => {
        if (!confirm(`წავშალოთ "${line.description}"?`)) return;
        try {
            setSubmitting(true);
            await api.delete(`/admin/invoice-lines/${line.id}`);
            fetchOrder();
        } catch (err: any) { console.error(err); }
        finally { setSubmitting(false); }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
    );

    if (!order) return (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-muted)' }}>შეკვეთა ვერ მოიძებნა</h3>
            <button className="btn btn-primary" onClick={() => navigate('/orders')} style={{ marginTop: '12px' }}>← უკან</button>
        </div>
    );

    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const invoice = order.invoice;
    const corrections = invoice?.correctionRequests || [];
    const pendingCorrections = corrections.filter((c: any) => c.status === 'PENDING');
    const history = order.statusHistory || [];
    const totalNet = invoice?.lines?.reduce((s: number, l: any) => s + l.netCost * l.quantity, 0) || 0;
    const totalClient = invoice?.lines?.reduce((s: number, l: any) => s + l.clientPrice * l.quantity, 0) || 0;
    const managerMargin = totalClient - totalNet;
    const companyFeePercent = order.manager?.managerProfile?.companyFeePercent ?? 20;
    const companyFee = totalClient * (companyFeePercent / 100);
    const feePaid = invoice?.managerFeePaid === true;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button onClick={() => navigate('/orders')} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)',
                    padding: '6px', borderRadius: '8px',
                }}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px' }}>
                            შეკვეთა #{order.id.slice(0, 8)}
                        </h1>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                            background: st.bg, color: st.color,
                        }}>
                            {st.label}
                        </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                        შექმნილია: {new Date(order.createdAt).toLocaleString('ka-GE')}
                    </p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={fetchOrder} style={{ gap: '4px' }}>
                    <RefreshCw size={13} /> განახლება
                </button>
            </div>

            {/* Pending Corrections Alert */}
            {pendingCorrections.length > 0 && (
                <div style={{
                    padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                    background: '#FFF7ED', border: '1px solid rgba(234, 88, 12, 0.2)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <AlertTriangle size={18} style={{ color: '#EA580C', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#EA580C' }}>
                            {pendingCorrections.length} მოლოდინის კორექციის მოთხოვნა
                        </p>
                        <p style={{ fontSize: '11px', color: '#92400E', opacity: 0.8 }}>
                            მენეჯერმა მოითხოვა ცვლილება — გადაამოწმეთ ქვემოთ
                        </p>
                    </div>
                </div>
            )}

            {/* Fee Payment Alert */}
            {invoice && totalClient > 0 && !feePaid && (
                <div style={{
                    padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                    background: '#FEF2F2', border: '1px solid rgba(220, 38, 38, 0.2)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <DollarSign size={18} style={{ color: '#DC2626', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626' }}>
                            მენეჯერს არ აქვს ჩარიცხული საკომისიო: ₾{companyFee.toFixed(2)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#991B1B', opacity: 0.8 }}>
                            კომპანიის {companyFeePercent}% კლიენტის ჯამიდან (₾{totalClient.toFixed(2)})
                        </p>
                    </div>
                </div>
            )}
            {invoice && feePaid && (
                <div style={{
                    padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                    background: '#F0FDF4', border: '1px solid rgba(5, 150, 105, 0.2)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <CheckCircle size={18} style={{ color: '#059669', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                        მენეჯერმა საკომისიო ჩარიცხა: ₾{companyFee.toFixed(2)}
                    </p>
                </div>
            )}

            {/* Client Approval Status Alert */}
            {invoice && (() => {
                const approval = invoice.clientApprovalStatus || 'PENDING';
                const ac = APPROVAL_CONFIG[approval];
                const AcIcon = ac?.icon;
                return (
                    <div style={{
                        padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                        background: ac.bg, border: `1px solid ${ac.border}`,
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        {AcIcon && <AcIcon size={18} style={{ color: ac.color, flexShrink: 0 }} />}
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: ac.color }}>
                                კლიენტის თანხმობა: {ac.label}
                            </p>
                            {approval === 'PENDING' && (
                                <p style={{ fontSize: '11px', color: ac.color, opacity: 0.8 }}>
                                    კლიენტს ჯერ არ დაუდასტურებია ინვოისი
                                </p>
                            )}
                            {approval === 'REJECTED' && invoice.clientApprovalNote && (
                                <p style={{ fontSize: '11px', color: ac.color, opacity: 0.8 }}>
                                    მიზეზი: {invoice.clientApprovalNote}
                                </p>
                            )}
                            {approval === 'PARTIALLY_APPROVED' && (
                                <p style={{ fontSize: '11px', color: ac.color, opacity: 0.8 }}>
                                    ზოგი ნაწილი/სერვისი დადასტურებულია, ზოგი უარყოფილი
                                </p>
                            )}
                            {invoice.clientApprovedAt && (
                                <p style={{ fontSize: '10px', color: ac.color, opacity: 0.6, marginTop: '2px' }}>
                                    {new Date(invoice.clientApprovedAt).toLocaleString('ka-GE')}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* ═══ Main Grid: 2 columns ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

                {/* ── Left: Client + Vehicle ── */}
                <div>
                    {/* Client Card */}
                    <div className="card" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={16} style={{ color: '#2563EB' }} />
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>კლიენტი</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                            <div>
                                <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>სახელი</span>
                                <span style={{ fontWeight: 700 }}>{order.client?.name || '—'}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>ტელეფონი</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{order.client?.phone || '—'}</span>
                            </div>
                        </div>
                        {order.address && (
                            <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '8px', background: '#F8FAFC', fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <MapPin size={12} style={{ flexShrink: 0, marginTop: '1px', color: '#94A3B8' }} />
                                {order.address}
                            </div>
                        )}
                    </div>

                    {/* Vehicle Card */}
                    <div className="card" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Car size={16} style={{ color: '#7C3AED' }} />
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>ავტომობილი</h3>
                        </div>
                        {order.vehicle ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                <div>
                                    <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>მარკა / მოდელი</span>
                                    <span style={{ fontWeight: 700 }}>{order.vehicle.make} {order.vehicle.model}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>წელი</span>
                                    <span style={{ fontWeight: 600 }}>{order.vehicle.year || '—'}</span>
                                </div>
                                {order.vehicle.plateNumber && (
                                    <div>
                                        <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>ნომერი</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>{order.vehicle.plateNumber}</span>
                                    </div>
                                )}
                                {order.vehicle.vin && (
                                    <div>
                                        <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>VIN</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.5px' }}>{order.vehicle.vin}</span>
                                    </div>
                                )}
                            </div>
                        ) : <p style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>ავტომობილი არ არის მითითებული</p>}
                    </div>

                    {/* Description */}
                    {order.description && (
                        <div className="card" style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <FileText size={14} style={{ color: '#64748b' }} />
                                <h3 style={{ fontSize: '13px', fontWeight: 700 }}>კლიენტის შენიშვნა</h3>
                            </div>
                            <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#475569' }}>{order.description}</p>
                        </div>
                    )}
                </div>

                {/* ── Right: Manager + Financial Summary ── */}
                <div>
                    {/* Manager Card */}
                    <div className="card" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={16} style={{ color: '#059669' }} />
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>მენეჯერი</h3>
                            <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto', fontSize: '11px', gap: '4px' }}
                                onClick={() => { fetchManagers(); setAssignModal(true); }}>
                                {order.manager ? <><Repeat2 size={12} /> შეცვლა</> : <><UserPlus size={12} /> მინიჭება</>}
                            </button>
                        </div>
                        {order.manager ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                <div>
                                    <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>სახელი</span>
                                    <span style={{ fontWeight: 700 }}>{order.manager.name}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>ტელეფონი</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{order.manager.phone}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--ink-faint)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>კომპანიის საკომისიო</span>
                                    <span style={{ fontWeight: 700, color: '#D97706' }}>{order.manager.managerProfile?.companyFeePercent ?? 20}%</span>
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>მენეჯერი არ არის მინიჭებული</p>
                        )}
                    </div>

                    {/* Financial Summary */}
                    {invoice && (
                        <div className="card" style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <DollarSign size={16} style={{ color: '#D97706' }} />
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>ფინანსური შეჯამება</h3>
                            </div>

                            {/* Row 1: Net + Client */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ padding: '10px', borderRadius: '10px', background: '#F8FAFC', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>ნეტო ჯამი (ნაწილები)</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#475569' }}>₾{totalNet.toFixed(2)}</div>
                                </div>
                                <div style={{ padding: '10px', borderRadius: '10px', background: '#F0FDF4', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>კლიენტის ჯამი</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669' }}>₾{totalClient.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Row 2: Company share + Manager profit */}
                            <div style={{
                                padding: '12px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
                                border: '1px solid #E2E8F0',
                            }}>
                                <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>
                                    განაწილება
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div style={{ padding: '10px', borderRadius: '8px', background: 'white', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                        <div style={{ fontSize: '9px', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 700 }}>
                                            კომპანიის წილი ({companyFeePercent}%)
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#D97706' }}>
                                            ₾{companyFee.toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px', borderRadius: '8px', background: 'white', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                        <div style={{ fontSize: '9px', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 700 }}>
                                            მენეჯერის მოგება
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: (totalClient - totalNet - companyFee) >= 0 ? '#7C3AED' : '#DC2626' }}>
                                            ₾{(totalClient - totalNet - companyFee).toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '8px', color: '#94A3B8', marginTop: '2px' }}>
                                            ({totalClient.toFixed(0)} - {totalNet.toFixed(0)} - {companyFee.toFixed(0)})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Client Review */}
                    {order.review && (
                        <div className="card" style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Star size={16} style={{ color: '#F59E0B' }} />
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>კლიენტის შეფასება</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '8px' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={18}
                                        fill={s <= order.review.rating ? '#F59E0B' : 'none'}
                                        stroke={s <= order.review.rating ? '#F59E0B' : '#D1D5DB'}
                                        strokeWidth={1.5}
                                    />
                                ))}
                                <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#D97706' }}>
                                    {order.review.rating}/5
                                </span>
                            </div>
                            {order.review.comment && (
                                <div style={{ padding: '10px', borderRadius: '10px', background: '#FFFBEB', fontSize: '12px', color: '#92400E', lineHeight: 1.6 }}>
                                    "{order.review.comment}"
                                </div>
                            )}
                            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '6px' }}>
                                {new Date(order.review.createdAt).toLocaleString('ka-GE')}
                                {' • '}
                                {order.client?.name || 'კლიენტი'}
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>სტატუსის ცვლილება</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                                <button key={key} className={`btn btn-sm ${order.status === key ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => handleStatusChange(key)}
                                    disabled={submitting || order.status === key}
                                    style={{ fontSize: '11px', gap: '3px', opacity: order.status === key ? 1 : 0.7 }}>
                                    {val.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Invoice Lines ═══ */}
            {invoice && invoice.lines?.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Receipt size={16} style={{ color: '#7C3AED' }} />
                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>ინვოისის ნაწილები</h3>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--ink-faint)' }}>
                            {invoice.lines.length} ნაწილი
                        </span>
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '0.5px' }}>სახელი</th>
                                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>ტიპი</th>
                                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>რაოდ.</th>
                                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>ნეტო ₾</th>
                                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>კლიენტი ₾</th>
                                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>მარჟა ₾</th>
                                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>თანხმობა</th>
                                <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>შექმნილი</th>
                                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lines.map((line: any) => {
                                const lineMargin = (line.clientPrice - line.netCost) * line.quantity;
                                return (
                                    <tr key={line.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '8px 14px', fontWeight: 600 }}>{line.description}</td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#F1F5F9', fontSize: '10px', fontWeight: 600 }}>
                                                {LINE_TYPE_LABELS[line.type] || line.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{line.quantity}</td>
                                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{line.netCost.toFixed(2)}</td>
                                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>{line.clientPrice.toFixed(2)}</td>
                                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: lineMargin >= 0 ? '#7C3AED' : '#DC2626' }}>
                                            {lineMargin.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            {(() => {
                                                const lineApproval = line.clientApprovalStatus || 'PENDING';
                                                const lac = APPROVAL_CONFIG[lineApproval];
                                                const LacIcon = lac?.icon;
                                                return (
                                                    <div>
                                                        <span title={lineApproval === 'REJECTED' && line.clientRejectionReason ? `მიზეზი: ${line.clientRejectionReason}` : lac?.label}
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '3px',
                                                                fontSize: '10px', fontWeight: 700,
                                                                color: lac?.color, background: lac?.bg,
                                                                padding: '2px 8px', borderRadius: '6px',
                                                                whiteSpace: 'nowrap' as const,
                                                            }}>
                                                            {LacIcon && <LacIcon size={10} />}
                                                            {lac?.label}
                                                        </span>
                                                        {lineApproval === 'REJECTED' && line.clientRejectionReason && (
                                                            <div style={{
                                                                marginTop: '4px', fontSize: '10px', color: '#DC2626',
                                                                display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center',
                                                            }}>
                                                                <MessageSquare size={9} />
                                                                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}
                                                                    title={line.clientRejectionReason}>
                                                                    {line.clientRejectionReason}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: '10px', color: 'var(--ink-faint)' }}>
                                            {new Date(line.createdAt).toLocaleString('ka-GE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                                                <button onClick={(e) => { e.stopPropagation(); openEditLine(line); }} style={{
                                                    background: 'none', border: 'none', cursor: 'pointer', padding: '3px',
                                                    color: 'var(--purple-500, #7C3AED)', borderRadius: '4px',
                                                }} title="რედაქტირება">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteLine(line); }} style={{
                                                    background: 'none', border: 'none', cursor: 'pointer', padding: '3px',
                                                    color: '#DC2626', borderRadius: '4px',
                                                }} title="წაშლა">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                                <td colSpan={3} style={{ padding: '10px 14px', fontWeight: 800, fontSize: '12px' }}>ჯამი</td>
                                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{totalNet.toFixed(2)}</td>
                                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669' }}>{totalClient.toFixed(2)}</td>
                                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: managerMargin >= 0 ? '#7C3AED' : '#DC2626' }}>{managerMargin.toFixed(2)}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* ═══ Correction Requests ═══ */}
            {corrections.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
                    <button onClick={() => setExpandCorrections(!expandCorrections)} style={{
                        width: '100%', padding: '14px 18px', border: 'none', cursor: 'pointer',
                        background: pendingCorrections.length > 0 ? '#FFF7ED' : '#F8FAFC',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <AlertTriangle size={16} style={{ color: pendingCorrections.length > 0 ? '#EA580C' : '#94A3B8' }} />
                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>
                            კორექციის მოთხოვნები ({corrections.length})
                        </h3>
                        {pendingCorrections.length > 0 && (
                            <span style={{
                                padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 800,
                                background: '#DC2626', color: 'white',
                            }}>{pendingCorrections.length} PENDING</span>
                        )}
                        <span style={{ marginLeft: 'auto' }}>
                            {expandCorrections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                    </button>
                    {expandCorrections && (
                        <div style={{ padding: '12px 16px' }}>
                            {corrections.map((cr: any) => (
                                <div key={cr.id} style={{
                                    padding: '12px', borderRadius: '10px', marginBottom: '8px',
                                    background: cr.status === 'PENDING' ? '#FFFBEB' : cr.status === 'APPROVED' ? '#F0FDF4' : '#FEF2F2',
                                    border: `1px solid ${cr.status === 'PENDING' ? 'rgba(217,119,6,0.12)' : cr.status === 'APPROVED' ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.12)'}`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{
                                            padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800,
                                            background: cr.type === 'EDIT' ? '#EFF6FF' : cr.type === 'DELETE' ? '#FEF2F2' : '#F0FDF4',
                                            color: cr.type === 'EDIT' ? '#2563EB' : cr.type === 'DELETE' ? '#DC2626' : '#059669',
                                        }}>
                                            {cr.type === 'EDIT' ? 'რედაქტირება' : cr.type === 'DELETE' ? 'წაშლა' : 'დამატება'}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'var(--ink-faint)' }}>
                                            {new Date(cr.createdAt).toLocaleString('ka-GE')}
                                        </span>
                                        <span style={{
                                            marginLeft: 'auto', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                                            background: cr.status === 'PENDING' ? '#FEF3C7' : cr.status === 'APPROVED' ? '#D1FAE5' : '#FECACA',
                                            color: cr.status === 'PENDING' ? '#92400E' : cr.status === 'APPROVED' ? '#065F46' : '#991B1B',
                                        }}>
                                            {cr.status === 'PENDING' ? 'მოლოდინში' : cr.status === 'APPROVED' ? 'დადასტურებული' : 'უარყოფილი'}
                                        </span>
                                    </div>
                                    {cr.reason && (
                                        <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>
                                            <strong>მიზეზი:</strong> {cr.reason}
                                        </p>
                                    )}
                                    {cr.type === 'EDIT' && (cr.newDescription || cr.newNetCost || cr.newClientPrice) && (
                                        <div style={{
                                            padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.7)',
                                            fontSize: '11px', display: 'flex', gap: '12px', marginBottom: '6px',
                                        }}>
                                            {cr.newDescription && <span>{cr.newDescription}</span>}
                                            {cr.newNetCost && <span>ნეტო: ₾{cr.newNetCost}</span>}
                                            {cr.newClientPrice && <span>🏷 კლიენტი: ₾{cr.newClientPrice}</span>}
                                            {cr.newQuantity && <span>რაოდ: {cr.newQuantity}</span>}
                                        </div>
                                    )}
                                    {cr.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                            <button className="btn btn-sm" disabled={submitting} onClick={() => handleCorrectionAction(cr.id, 'APPROVED')}
                                                style={{ background: '#059669', color: 'white', border: 'none', fontSize: '11px', gap: '4px' }}>
                                                <CheckCircle size={12} /> დადასტურება
                                            </button>
                                            <button className="btn btn-sm" disabled={submitting} onClick={() => handleCorrectionAction(cr.id, 'REJECTED')}
                                                style={{ background: '#DC2626', color: 'white', border: 'none', fontSize: '11px', gap: '4px' }}>
                                                <XCircle size={12} /> უარყოფა
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Status History ═══ */}
            {history.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
                    <button onClick={() => setExpandHistory(!expandHistory)} style={{
                        width: '100%', padding: '14px 18px', border: 'none', cursor: 'pointer',
                        background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <History size={16} style={{ color: '#64748B' }} />
                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>სტატუსის ისტორია ({history.length})</h3>
                        <span style={{ marginLeft: 'auto' }}>
                            {expandHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                    </button>
                    {expandHistory && (
                        <div style={{ padding: '16px 18px' }}>
                            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                                <div style={{ position: 'absolute', left: '6px', top: '4px', bottom: '4px', width: '2px', background: '#E2E8F0' }}></div>
                                {history.map((h: any, i: number) => {
                                    const hst = STATUS_CONFIG[h.newStatus] || STATUS_CONFIG.PENDING;
                                    return (
                                        <div key={h.id || i} style={{ position: 'relative', marginBottom: '14px', paddingLeft: '16px' }}>
                                            <div style={{
                                                position: 'absolute', left: '-2px', top: '4px',
                                                width: '10px', height: '10px', borderRadius: '50%',
                                                background: hst.color, border: '2px solid white',
                                                boxShadow: '0 0 0 2px ' + hst.bg,
                                            }}></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                                    background: hst.bg, color: hst.color,
                                                }}>
                                                    {hst.label}
                                                </span>
                                                <span style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                                                    {h.changedBy?.name || '—'} • {new Date(h.createdAt).toLocaleString('ka-GE')}
                                                </span>
                                            </div>
                                            {h.notes && (
                                                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', paddingLeft: '2px' }}>{h.notes}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Transactions ═══ */}
            {order.transactions?.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign size={16} style={{ color: '#059669' }} />
                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>ტრანზაქციები ({order.transactions.length})</h3>
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>ტიპი</th>
                                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>თანხა</th>
                                <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>თარიღი</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.transactions.map((t: any) => (
                                <tr key={t.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '8px 14px', fontWeight: 600 }}>{t.type}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: t.amount >= 0 ? '#059669' : '#DC2626' }}>
                                        ₾{Math.abs(t.amount).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: '10px', color: 'var(--ink-faint)' }}>
                                        {new Date(t.createdAt).toLocaleString('ka-GE')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══ Assign Manager Modal ═══ */}
            {assignModal && (
                <div className="modal-overlay" onClick={() => setAssignModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{order.manager ? 'მენეჯერის შეცვლა' : 'მენეჯერის მინიჭება'}</h2>
                        {order.manager && (
                            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '12px' }}>
                                მიმდინარე: <strong>{order.manager.name}</strong>
                            </p>
                        )}
                        <div className="form-group">
                            <label className="form-label">აირჩიეთ მენეჯერი</label>
                            <select className="form-input" value={selectedManager} onChange={(e) => setSelectedManager(e.target.value)}>
                                <option value="">— აირჩიეთ —</option>
                                {managers.filter(m => m.status === 'ACTIVE').map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.phone}) — საკომისიო: {m.managerProfile?.companyFeePercent ?? 20}%
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setAssignModal(false)}>გაუქმება</button>
                            <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedManager || submitting}>
                                {order.manager ? 'შეცვლა' : 'მინიჭება'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Edit Invoice Line Modal ═══ */}
            {editingLine && (
                <div className="modal-overlay" onClick={() => setEditingLine(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Edit2 size={16} style={{ color: '#7C3AED' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '15px', fontWeight: 700 }}>ნაწილის რედაქტირება</h2>
                                <p style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>ადმინი — შეუზღუდავი რედაქტირება</p>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">აღწერა</label>
                            <input className="form-input" value={editForm.description}
                                onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div className="form-group">
                                <label className="form-label">ნეტო ფასი ₾</label>
                                <input className="form-input" type="number" step="0.01" value={editForm.netCost}
                                    onChange={(e) => setEditForm(f => ({ ...f, netCost: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">კლიენტის ფასი ₾</label>
                                <input className="form-input" type="number" step="0.01" value={editForm.clientPrice}
                                    onChange={(e) => setEditForm(f => ({ ...f, clientPrice: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div className="form-group">
                                <label className="form-label">რაოდენობა</label>
                                <input className="form-input" type="number" min="1" value={editForm.quantity}
                                    onChange={(e) => setEditForm(f => ({ ...f, quantity: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ტიპი</label>
                                <select className="form-input" value={editForm.type}
                                    onChange={(e) => setEditForm(f => ({ ...f, type: e.target.value }))}>
                                    <option value="PART">ნაწილი</option>
                                    <option value="LABOR">სამუშაო</option>
                                    <option value="OTHER">სხვა</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setEditingLine(null)}>გაუქმება</button>
                            <button className="btn btn-primary" onClick={submitEditLine} disabled={submitting || !editForm.description}>
                                შენახვა
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
