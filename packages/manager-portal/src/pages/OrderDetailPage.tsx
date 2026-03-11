import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../components/Toast';
import {
    ArrowLeft, Check, FileText, Loader2, Plus, Trash2, Edit2, X, Receipt, Lock,
    TrendingUp, Hash, AlertTriangle, CheckCircle2, Ban, MessageSquare
} from 'lucide-react';

// Components
import StickyStatusBar from '../components/order/StickyStatusBar';
import ClientVehicleCard from '../components/order/ClientVehicleCard';
import CompanyFeeCard from '../components/order/CompanyFeeCard';
import PhotoUploadSection from '../components/order/PhotoUploadSection';
import StatusTimeline from '../components/order/StatusTimeline';

const LINE_TYPE_LABELS: Record<string, string> = { PART: 'ნაწილი', LABOR: 'სამუშაო', OTHER: 'სხვა' };
const QUALITY_LABELS: Record<string, string> = {
    OEM: 'ორიგინალი', AFTERMARKET: 'არაორიგინალი',
    USED_OEM: 'მეორადი ორიგ.', REFURBISHED: 'აღდგენილი',
};

const APPROVAL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: 'მოლოდინში', color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle },
    APPROVED: { label: 'დადასტურებული', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
    REJECTED: { label: 'უარყოფილი', color: '#DC2626', bg: '#FEF2F2', icon: Ban },
    PARTIALLY_APPROVED: { label: 'ნაწილობრივ', color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle },
};

interface InvoiceLine { id: string; description: string; quantity: number; netCost: number; clientPrice: number; type: string; createdAt: string; }

const EDIT_WINDOW_MS = 2 * 60 * 60 * 1000;

export default function OrderDetailPage() {
    const { showToast, showConfirm } = useToast();
    const { id } = useParams() as { id: string };
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [invoiceLines, setInvoiceLines] = useState([
        { description: '', quantity: 1, netCost: '', clientPrice: '', type: 'PART' as string, quality: '' as string, brand: '' as string }
    ]);

    const [editingLine, setEditingLine] = useState<InvoiceLine | null>(null);
    const [editForm, setEditForm] = useState({ description: '', quantity: '1', netCost: '', clientPrice: '', type: 'PART' });

    const [activeSuggestionIdx, setActiveSuggestionIdx] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsTimeout = useRef<any>(null);

    const [, setBrandSuggestions] = useState<string[]>([]);
    const [, setShowBrandSuggestions] = useState(false);
    const [, setActiveBrandIdx] = useState<number | null>(null);
    const brandTimeout = useRef<any>(null);

    const [showAddLineForm, setShowAddLineForm] = useState(false);
    const [addLineData, setAddLineData] = useState({ description: '', quantity: 1, netCost: '', clientPrice: '', type: 'PART', quality: '', brand: '' });
    const [addLineSuggestions, setAddLineSuggestions] = useState<any[]>([]);
    const [showAddLineSuggestions, setShowAddLineSuggestions] = useState(false);
    const [addLineBrandSuggestions, setAddLineBrandSuggestions] = useState<string[]>([]);
    const [showAddLineBrandSuggestions, setShowAddLineBrandSuggestions] = useState(false);
    const addLineTimeout = useRef<any>(null);
    const addLineBrandTimeout = useRef<any>(null);

    const fetchSuggestions = useCallback(async (query: string, lineIdx: number) => {
        if (!order?.vehicle || query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        if (suggestionsTimeout.current) clearTimeout(suggestionsTimeout.current);
        suggestionsTimeout.current = setTimeout(async () => {
            try {
                const { data } = await api.get('/manager/parts-catalog', { params: { make: order.vehicle.make, model: order.vehicle.model, query } });
                setSuggestions(data.data || []); setActiveSuggestionIdx(lineIdx); setShowSuggestions(data.data?.length > 0);
            } catch { setSuggestions([]); }
        }, 300);
    }, [order]);

    const fetchBrandSuggestions = useCallback(async (query: string, lineIdx: number, target: 'form' | 'addLine') => {
        if (query.length < 1) {
            if (target === 'form') { setBrandSuggestions([]); setShowBrandSuggestions(false); }
            else { setAddLineBrandSuggestions([]); setShowAddLineBrandSuggestions(false); }
            return;
        }
        const ref = target === 'form' ? brandTimeout : addLineBrandTimeout;
        if (ref.current) clearTimeout(ref.current);
        ref.current = setTimeout(async () => {
            try {
                const { data } = await api.get('/manager/brands', { params: { query } });
                if (target === 'form') { setBrandSuggestions(data.data || []); setActiveBrandIdx(lineIdx); setShowBrandSuggestions((data.data || []).length > 0); }
                else { setAddLineBrandSuggestions(data.data || []); setShowAddLineBrandSuggestions((data.data || []).length > 0); }
            } catch { /* */ }
        }, 300);
    }, []);

    const fetchAddLineSuggestions = useCallback(async (query: string) => {
        if (!order?.vehicle || query.length < 2) { setAddLineSuggestions([]); setShowAddLineSuggestions(false); return; }
        if (addLineTimeout.current) clearTimeout(addLineTimeout.current);
        addLineTimeout.current = setTimeout(async () => {
            try {
                const { data } = await api.get('/manager/parts-catalog', { params: { make: order.vehicle.make, model: order.vehicle.model, query } });
                setAddLineSuggestions(data.data || []); setShowAddLineSuggestions((data.data || []).length > 0);
            } catch { setAddLineSuggestions([]); }
        }, 300);
    }, [order]);

    const fetchOrder = async () => {
        try { const { data } = await api.get(`/manager/orders/${id}`); setOrder(data.data); }
        catch { /* */ } finally { setLoading(false); }
    };
    useEffect(() => { fetchOrder(); }, [id]);

    const updateStatus = async (newStatus: string) => {
        try { setSubmitting(true); await api.put(`/manager/orders/${id}/status`, { status: newStatus }); fetchOrder(); }
        catch (err: any) { showToast(err.response?.data?.error || 'შეცდომა', 'error'); }
        finally { setSubmitting(false); }
    };

    const addFormLine = () => setInvoiceLines([...invoiceLines, { description: '', quantity: 1, netCost: '', clientPrice: '', type: 'PART', quality: '', brand: '' }]);
    const removeFormLine = (idx: number) => { if (invoiceLines.length > 1) setInvoiceLines(invoiceLines.filter((_, i) => i !== idx)); };
    const updateFormLine = (idx: number, field: string, value: any) => { const l = [...invoiceLines]; (l[idx] as any)[field] = value; setInvoiceLines(l); };

    const submitInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post(`/manager/orders/${id}/invoice`, {
                lines: invoiceLines.map(l => ({
                    description: l.description, quantity: l.quantity,
                    netCost: parseFloat(l.netCost), clientPrice: parseFloat(l.clientPrice),
                    type: l.type, quality: l.quality || undefined, brand: l.brand || undefined,
                })),
            });
            setShowInvoiceForm(false); fetchOrder();
        } catch (err: any) { showToast(err.response?.data?.error || 'შეცდომა', 'error'); }
        finally { setSubmitting(false); }
    };

    const canDirectEdit = (line: InvoiceLine) => (Date.now() - new Date(line.createdAt).getTime()) < EDIT_WINDOW_MS;
    const openEditModal = (line: InvoiceLine) => {
        setEditingLine(line);
        setEditForm({ description: line.description, quantity: String(line.quantity), netCost: String(line.netCost), clientPrice: String(line.clientPrice), type: line.type });
    };
    const submitEdit = async () => {
        if (!editingLine) return;
        try {
            setSubmitting(true);
            const { data } = await api.put(`/manager/invoice-lines/${editingLine.id}`, {
                description: editForm.description, quantity: parseInt(editForm.quantity),
                netCost: parseFloat(editForm.netCost), clientPrice: parseFloat(editForm.clientPrice), type: editForm.type,
            });
            showToast(data.correctionSent ? (data.message || 'მოთხოვნა გაიგზავნა ადმინთან') : 'ნაწილი წარმატებით განახლდა', data.correctionSent ? 'info' : 'success');
            setEditingLine(null); fetchOrder();
        } catch (err: any) { showToast(err.response?.data?.error || 'შეცდომა', 'error'); }
        finally { setSubmitting(false); }
    };
    const handleDeleteLine = async (line: InvoiceLine) => {
        const confirmed = await showConfirm('წავშალოთ ეს ნაწილი?');
        if (!confirmed) return;
        try {
            setSubmitting(true);
            const { data } = await api.delete(`/manager/invoice-lines/${line.id}`);
            showToast(data.correctionSent ? (data.message || 'წაშლის მოთხოვნა გაიგზავნა') : 'ნაწილი წაიშალა', data.correctionSent ? 'info' : 'success');
            fetchOrder();
        } catch (err: any) { showToast(err.response?.data?.error || 'შეცდომა', 'error'); }
        finally { setSubmitting(false); }
    };

    const handleMarkFeePaid = async () => {
        const inv = order.invoice;
        const lines = inv?.lines || [];
        const tClient = lines.reduce((s: number, l: any) => s + l.clientPrice * l.quantity, 0);
        const fee = tClient * 0.2;
        if (!confirm(`დაადასტურეთ ₾${fee.toFixed(2)} საკომისიოს გადახდა კომპანიისთვის?`)) return;
        try {
            setSubmitting(true);
            await api.put(`/manager/orders/${id}/mark-fee-paid`);
            fetchOrder(); showToast('საკომისიო დადასტურებულია', 'success');
        } catch { showToast('შეცდომა', 'error'); }
        finally { setSubmitting(false); }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
        </div>
    );
    if (!order) return (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-muted)' }}>შეკვეთა ვერ მოიძებნა</h3>
        </div>
    );

    const isCompleted = ['COMPLETED', 'CANCELED', 'REJECTED'].includes(order.status);
    const formNetTotal = invoiceLines.reduce((s, l) => s + (parseFloat(l.netCost) || 0) * l.quantity, 0);
    const formClientTotal = invoiceLines.reduce((s, l) => s + (parseFloat(l.clientPrice) || 0) * l.quantity, 0);

    return (
        <div className="animate-fade-in">
            {/* Back button */}
            <button className="btn btn-ghost" onClick={() => navigate('/tasks')}
                style={{ marginBottom: '12px', gap: '6px', fontSize: '13px', padding: '8px 14px', borderRadius: '10px' }}>
                <ArrowLeft size={15} /> დავალებებში
            </button>

            {/* ═══ STICKY STATUS BAR ═══ */}
            <StickyStatusBar
                order={order}
                submitting={submitting}
                onStatusUpdate={updateStatus}
                onCreateInvoice={() => setShowInvoiceForm(true)}
                isCompleted={isCompleted}
            />

            {/* Completed banner */}
            {isCompleted && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '14px 18px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #D1FAE5, #ECFDF5)',
                    border: '1px solid rgba(5,150,105,0.15)',
                    marginBottom: '20px', fontSize: '13px', fontWeight: 600, color: '#059669',
                }}>
                    <Lock size={15} />
                    შეკვეთა დასრულებულია — რედაქტირება შეზღუდულია
                </div>
            )}

            {/* ═══ 2-Column Desktop Layout ═══ */}
            <div className="order-detail-grid">
                {/* ── LEFT COLUMN: Main Content ── */}
                <div className="order-detail-left">
                    {/* Client & Vehicle */}
                    <ClientVehicleCard order={order} isCompleted={isCompleted} />

                    {/* Company Fee */}
                    <CompanyFeeCard order={order} submitting={submitting} onMarkFeePaid={handleMarkFeePaid} isCompleted={isCompleted} />

                    {/* ═══ Invoice Section ═══ */}
                    <div style={{
                        background: 'white', borderRadius: '20px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        opacity: isCompleted ? 0.9 : 1,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}>
                        <div style={{
                            padding: '18px 24px 14px',
                            background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)',
                            borderBottom: '1px solid rgba(234,88,12,0.08)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: 'rgba(234,88,12,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Receipt size={16} style={{ color: '#EA580C' }} />
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: 700, flex: 1, letterSpacing: '-0.02em' }}>
                                ინვოისი
                            </span>
                            {order.invoice && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Client approval status badge */}
                                    {order.invoice.clientApprovalStatus && order.invoice.clientApprovalStatus !== 'PENDING' && (() => {
                                        const ac = APPROVAL_CONFIG[order.invoice.clientApprovalStatus];
                                        const AcIcon = ac?.icon;
                                        return (
                                            <span style={{
                                                fontSize: '11px', fontWeight: 700,
                                                color: ac?.color, background: ac?.bg,
                                                padding: '4px 12px', borderRadius: '20px',
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                border: `1px solid ${ac?.color}18`,
                                            }}>
                                                {AcIcon && <AcIcon size={12} />}
                                                კლიენტი: {ac?.label}
                                            </span>
                                        );
                                    })()}
                                    {order.invoice.clientApprovalStatus === 'PENDING' && (
                                        <span style={{
                                            fontSize: '11px', fontWeight: 600,
                                            color: '#D97706', background: '#FFFBEB',
                                            padding: '4px 12px', borderRadius: '20px',
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            border: '1px solid rgba(217,119,6,0.12)',
                                        }}>
                                            <AlertTriangle size={11} />
                                            კლიენტი ჯერ არ დაადასტურა
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: '11px', fontFamily: 'var(--font-mono)',
                                        color: '#EA580C', fontWeight: 600,
                                        background: 'rgba(234,88,12,0.08)',
                                        padding: '4px 10px', borderRadius: '8px',
                                    }}>
                                        {order.invoice.lines?.length || 0} ჩანაწერი
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '20px 24px' }}>
                            {order.invoice ? (
                                <div>
                                    {/* Line Items Table */}
                                    <div className="invoice-table-wrap">
                                        <div className="invoice-table-header">
                                            <span>ნაწილი</span><span style={{ textAlign: 'center' }}>რაოდ.</span>
                                            <span style={{ textAlign: 'right' }}>ნეტო</span><span style={{ textAlign: 'right' }}>კლიენტი</span><span />
                                        </div>
                                        {order.invoice.lines?.map((line: InvoiceLine) => {
                                            const editable = canDirectEdit(line) && !isCompleted;
                                            return (
                                                <div key={line.id} className="invoice-table-row">
                                                    <div>
                                                        <span style={{ fontWeight: 600 }}>{line.description}</span>
                                                        <span style={{
                                                            fontSize: '10px', padding: '2px 6px', borderRadius: '5px', marginLeft: '6px',
                                                            background: line.type === 'PART' ? '#ECFDF5' : line.type === 'LABOR' ? '#EFF6FF' : '#FFF7ED',
                                                            color: line.type === 'PART' ? '#047857' : line.type === 'LABOR' ? '#2563EB' : '#EA580C',
                                                            fontWeight: 600,
                                                        }}>{LINE_TYPE_LABELS[line.type]}</span>
                                                        {(line as any).quality && (
                                                            <span style={{
                                                                fontSize: '9px', padding: '2px 5px', borderRadius: '4px', marginLeft: '4px',
                                                                background: '#F5F3FF', color: '#7C3AED', fontWeight: 600,
                                                            }}>{QUALITY_LABELS[(line as any).quality] || (line as any).quality}</span>
                                                        )}
                                                    </div>
                                                    <span style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', fontSize: '12px' }}>{line.quantity}</span>
                                                    <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', fontSize: '12px' }}>₾{(line.netCost * line.quantity).toFixed(0)}</span>
                                                    <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>₾{(line.clientPrice * line.quantity).toFixed(0)}</span>
                                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        {/* Client approval status per line */}
                                                        {(() => {
                                                            const lineApproval = (line as any).clientApprovalStatus || 'PENDING';
                                                            if (!order.invoice?.clientApprovalStatus || order.invoice.clientApprovalStatus === 'PENDING') return null;
                                                            const lac = APPROVAL_CONFIG[lineApproval];
                                                            const LacIcon = lac?.icon;
                                                            return (
                                                                <span title={lineApproval === 'REJECTED' && (line as any).clientRejectionReason ? `მიზეზი: ${(line as any).clientRejectionReason}` : lac?.label}
                                                                    style={{
                                                                        display: 'flex', alignItems: 'center', gap: '3px',
                                                                        fontSize: '10px', fontWeight: 700,
                                                                        color: lac?.color, background: lac?.bg,
                                                                        padding: '2px 8px', borderRadius: '6px',
                                                                        whiteSpace: 'nowrap',
                                                                    }}>
                                                                    {LacIcon && <LacIcon size={10} />}
                                                                    {lac?.label}
                                                                </span>
                                                            );
                                                        })()}
                                                        {!isCompleted && (
                                                            <>
                                                                <button onClick={() => openEditModal(line)} style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                                                    color: '#047857', borderRadius: '6px', transition: 'background 0.15s',
                                                                }} title="რედაქტირება"
                                                                    onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
                                                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                                ><Edit2 size={13} /></button>
                                                                <button onClick={() => handleDeleteLine(line)} style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                                                    color: editable ? '#DC2626' : 'var(--ink-faint)', borderRadius: '6px', transition: 'background 0.15s',
                                                                }} title={editable ? 'წაშლა' : 'წაშლის მოთხოვნა'}
                                                                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                                                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                                ><Trash2 size={13} /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                    {/* Rejection reason inline */}
                                                    {(line as any).clientApprovalStatus === 'REJECTED' && (line as any).clientRejectionReason && (
                                                        <div style={{
                                                            gridColumn: '1 / -1', marginTop: '4px',
                                                            padding: '6px 12px', borderRadius: '8px',
                                                            background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.1)',
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            fontSize: '11px', color: '#DC2626',
                                                        }}>
                                                            <MessageSquare size={11} style={{ flexShrink: 0 }} />
                                                            <span><strong>კლიენტის მიზეზი:</strong> {(line as any).clientRejectionReason}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Totals */}
                                    {(() => {
                                        const tNet = order.invoice.totalNetCost || 0;
                                        const tClient = order.invoice.totalClientPrice || 0;
                                        const feePercent = (order.manager?.managerProfile as any)?.companyFeePercent ?? 20;
                                        const companyShare = tClient * (feePercent / 100);
                                        const managerProfit = tClient - tNet - companyShare;
                                        return (
                                            <div className="invoice-totals-grid">
                                                {/* Left: Net + Client Total */}
                                                <div style={{ borderRadius: '14px', background: 'var(--surface-50)', padding: '16px 18px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                                                        <span>ნეტო ჯამი</span>
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₾ {tNet.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px solid var(--surface-200)', paddingTop: '8px' }}>
                                                        <span>კლიენტი იხდის</span>
                                                        <span style={{ fontFamily: 'var(--font-mono)', color: '#047857' }}>₾ {tClient.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                {/* Right: Profit breakdown */}
                                                <div style={{
                                                    borderRadius: '14px',
                                                    background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)',
                                                    border: '1px solid #E2E8F0', padding: '16px 18px',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                                                        <span style={{ color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Hash size={11} /> კომპანია ({feePercent}%)
                                                        </span>
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#D97706' }}>₾ {companyShare.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
                                                        <span style={{ color: managerProfit >= 0 ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <TrendingUp size={14} /> შენი მოგება
                                                        </span>
                                                        <span style={{ fontFamily: 'var(--font-mono)', color: managerProfit >= 0 ? '#059669' : '#DC2626' }}>₾ {managerProfit.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Add Line */}
                                    {!isCompleted && order.status === 'IN_PROGRESS' && (
                                        <div style={{ marginTop: '14px' }}>
                                            {!showAddLineForm ? (
                                                <button onClick={() => setShowAddLineForm(true)} style={{
                                                    width: '100%', padding: '12px', borderRadius: '12px',
                                                    border: '1.5px dashed rgba(4,120,87,0.25)', background: 'none',
                                                    color: '#047857', fontSize: '13px', fontWeight: 600,
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
                                                }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.borderColor = '#047857'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(4,120,87,0.25)'; }}
                                                >
                                                    <Plus size={14} /> ნაწილის / სერვისის დამატება
                                                </button>
                                            ) : (
                                                <AddLineForm
                                                    data={addLineData} setData={setAddLineData}
                                                    suggestions={addLineSuggestions} showSuggestions={showAddLineSuggestions}
                                                    brandSuggestions={addLineBrandSuggestions} showBrandSuggestions={showAddLineBrandSuggestions}
                                                    fetchSuggestions={fetchAddLineSuggestions}
                                                    fetchBrandSuggestions={(q: string) => fetchBrandSuggestions(q, 0, 'addLine')}
                                                    setShowSuggestions={setShowAddLineSuggestions}
                                                    setShowBrandSuggestions={setShowAddLineBrandSuggestions}
                                                    submitting={submitting}
                                                    onCancel={() => { setShowAddLineForm(false); setAddLineData({ description: '', quantity: 1, netCost: '', clientPrice: '', type: 'PART', quality: '', brand: '' }); }}
                                                    onSubmit={async () => {
                                                        if (!addLineData.description || !addLineData.netCost || !addLineData.clientPrice) return;
                                                        try {
                                                            setSubmitting(true);
                                                            await api.post(`/manager/invoices/${order.invoice.id}/lines`, {
                                                                description: addLineData.description, quantity: addLineData.quantity,
                                                                netCost: parseFloat(addLineData.netCost), clientPrice: parseFloat(addLineData.clientPrice),
                                                                type: addLineData.type, quality: addLineData.quality || undefined, brand: addLineData.brand || undefined,
                                                            });
                                                            setAddLineData({ description: '', quantity: 1, netCost: '', clientPrice: '', type: 'PART', quality: '', brand: '' });
                                                            setShowAddLineForm(false); fetchOrder();
                                                        } catch (err: any) { showToast(err.response?.data?.error || 'შეცდომა', 'error'); }
                                                        finally { setSubmitting(false); }
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-faint)' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(234,88,12,0.08)' }}>
                                        <FileText size={24} style={{ color: '#EA580C', opacity: 0.5 }} />
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '4px' }}>ინვოისი ჯერ არ შექმნილა</p>
                                    <p style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                                        {order.status === 'IN_PROGRESS' ? 'შექმნეთ ინვოისი ზემოთ ღილაკით' : 'ინვოისი ხელმისაწვდომია „მიმდინარე" სტატუსზე'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Photos & Timeline ── */}
                <div className="order-detail-right">
                    <PhotoUploadSection orderStatus={order.status} isCompleted={isCompleted} />
                    <StatusTimeline statusHistory={order.statusHistory} />
                </div>
            </div>

            {/* ═══ Invoice Creation Modal ═══ */}
            {showInvoiceForm && (
                <div className="modal-overlay" onClick={() => setShowInvoiceForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(234,88,12,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Receipt size={20} style={{ color: '#EA580C' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>ინვოისის შექმნა</h2>
                                <p style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>ნაწილები და სერვისები დაამატეთ ცალ-ცალკე</p>
                            </div>
                            <button onClick={() => setShowInvoiceForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', padding: '4px' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={submitInvoice}>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label className="form-label" style={{ margin: 0 }}>ნაწილები / სერვისები</label>
                                    <button type="button" onClick={addFormLine} style={{
                                        background: 'none', border: '1px dashed var(--surface-300)', cursor: 'pointer',
                                        padding: '4px 10px', borderRadius: '8px', fontSize: '12px', color: '#047857',
                                        display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600,
                                    }}><Plus size={12} /> დამატება</button>
                                </div>
                                {invoiceLines.map((line, idx) => (
                                    <div key={idx} style={{ padding: '14px', borderRadius: '14px', border: '1px solid var(--surface-100)', marginBottom: '10px', background: 'var(--surface-50)' }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <input className="form-input" placeholder="ნაწილი/სერვისი" value={line.description}
                                                    onChange={e => { updateFormLine(idx, 'description', e.target.value); fetchSuggestions(e.target.value, idx); }}
                                                    onFocus={() => { if (line.description.length >= 2) fetchSuggestions(line.description, idx); }}
                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                    required autoComplete="off" style={{ fontSize: '13px', padding: '8px 12px' }} />
                                                {showSuggestions && activeSuggestionIdx === idx && suggestions.length > 0 && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'white', borderRadius: '10px', border: '1px solid var(--surface-200)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '180px', overflowY: 'auto', marginTop: '4px' }}>
                                                        {suggestions.map((s: any) => (
                                                            <div key={s.id}
                                                                onMouseDown={() => { updateFormLine(idx, 'description', s.partName); updateFormLine(idx, 'type', s.type); if (s.quality) updateFormLine(idx, 'quality', s.quality); if (s.brand) updateFormLine(idx, 'brand', s.brand); setShowSuggestions(false); }}
                                                                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid var(--surface-50)', transition: 'background 0.1s' }}
                                                                onMouseEnter={e => (e.currentTarget.style.background = '#ECFDF5')}
                                                                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                                                            >
                                                                <span style={{ fontWeight: 600 }}>{s.partName}</span>
                                                                <span style={{ fontSize: '10px', marginLeft: '6px', color: '#718096' }}>{LINE_TYPE_LABELS[s.type]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <select value={line.type} onChange={e => updateFormLine(idx, 'type', e.target.value)}
                                                style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--surface-200)', fontSize: '12px', background: 'white', cursor: 'pointer' }}>
                                                <option value="PART">ნაწილი</option>
                                                <option value="LABOR">სამუშაო</option>
                                                <option value="OTHER">სხვა</option>
                                            </select>
                                            {invoiceLines.length > 1 && (
                                                <button type="button" onClick={() => removeFormLine(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}><Trash2 size={14} /></button>
                                            )}
                                        </div>
                                        {line.type === 'PART' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                <select value={line.quality} onChange={e => updateFormLine(idx, 'quality', e.target.value)}
                                                    style={{ padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--surface-200)', fontSize: '12px', background: 'white' }}>
                                                    <option value="">ხარისხი...</option>
                                                    <option value="OEM">ორიგინალი</option>
                                                    <option value="AFTERMARKET">არაორიგინალი</option>
                                                    <option value="USED_OEM">მეორადი ორიგ.</option>
                                                    <option value="REFURBISHED">აღდგენილი</option>
                                                </select>
                                                <input className="form-input" placeholder="ბრენდი" value={line.brand}
                                                    onChange={e => { updateFormLine(idx, 'brand', e.target.value); fetchBrandSuggestions(e.target.value, idx, 'form'); }}
                                                    onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                                                    style={{ fontSize: '12px', padding: '6px 10px' }} />
                                            </div>
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr', gap: '8px' }}>
                                            <div>
                                                <label style={{ fontSize: '10px', color: 'var(--ink-faint)', fontWeight: 600 }}>რაოდ.</label>
                                                <input type="number" min="1" className="form-input" value={line.quantity}
                                                    onChange={e => updateFormLine(idx, 'quantity', parseInt(e.target.value) || 1)}
                                                    style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', padding: '6px 8px', textAlign: 'center' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '10px', color: 'var(--ink-faint)', fontWeight: 600 }}>ნეტო ₾</label>
                                                <input type="number" step="0.01" className="form-input" placeholder="0.00" value={line.netCost}
                                                    onChange={e => updateFormLine(idx, 'netCost', e.target.value)} required
                                                    style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', padding: '6px 10px' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>კლიენტი ₾</label>
                                                <input type="number" step="0.01" className="form-input" placeholder="0.00" value={line.clientPrice}
                                                    onChange={e => updateFormLine(idx, 'clientPrice', e.target.value)} required
                                                    style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', padding: '6px 10px', borderColor: '#D1FAE5' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {formClientTotal > 0 && (
                                <div style={{ padding: '14px 18px', borderRadius: '14px', background: '#ECFDF5', border: '1px solid rgba(4,120,87,0.1)', marginBottom: '20px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--ink-muted)' }}>
                                        <span>ნეტო:</span><span style={{ fontFamily: 'var(--font-mono)' }}>₾ {formNetTotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#059669' }}>
                                        <span>მარკაპი:</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₾ {(formClientTotal - formNetTotal).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderTop: '1px solid rgba(4,120,87,0.15)', paddingTop: '8px', marginTop: '6px' }}>
                                        <span>კლიენტი იხდის:</span><span style={{ fontFamily: 'var(--font-mono)', color: '#047857' }}>₾ {formClientTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowInvoiceForm(false)}>გაუქმება</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ gap: '6px' }}>
                                    {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={15} />}
                                    {submitting ? 'იგზავნება...' : 'ინვოისის გაგზავნა'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══ Edit Line Modal ═══ */}
            {editingLine && (
                <div className="modal-overlay" onClick={() => setEditingLine(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Edit2 size={18} style={{ color: '#047857' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>ნაწილის რედაქტირება</h2>
                                <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>შეცვალეთ მონაცემები</p>
                            </div>
                            <button onClick={() => setEditingLine(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)' }}><X size={20} /></button>
                        </div>
                        <div className="form-group">
                            <label className="form-label">სახელი</label>
                            <input className="form-input" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">რაოდენობა</label>
                                <input type="number" className="form-input" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} style={{ fontFamily: 'var(--font-mono)' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ტიპი</label>
                                <select className="form-input" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                                    <option value="PART">ნაწილი</option><option value="LABOR">სამუშაო</option><option value="OTHER">სხვა</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">ნეტო ₾</label>
                                <input type="number" step="0.01" className="form-input" value={editForm.netCost} onChange={e => setEditForm({ ...editForm, netCost: e.target.value })} style={{ fontFamily: 'var(--font-mono)' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ color: '#059669' }}>კლიენტი ₾</label>
                                <input type="number" step="0.01" className="form-input" value={editForm.clientPrice} onChange={e => setEditForm({ ...editForm, clientPrice: e.target.value })} style={{ fontFamily: 'var(--font-mono)', borderColor: '#D1FAE5' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button className="btn btn-outline" onClick={() => setEditingLine(null)}>გაუქმება</button>
                            <button className="btn btn-primary" onClick={submitEdit} disabled={submitting} style={{ gap: '6px' }}>
                                {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />} შენახვა
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Add Line Inline Form ─── */
function AddLineForm({ data, setData, suggestions, showSuggestions, fetchSuggestions, fetchBrandSuggestions, setShowSuggestions, setShowBrandSuggestions, submitting, onCancel, onSubmit }: any) {
    return (
        <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(4,120,87,0.15)', background: '#ECFDF5' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>ახალი ნაწილი / სერვისი</span>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', padding: '2px' }}><X size={15} /></button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input className="form-input" placeholder="ნაწილი/სერვისი" value={data.description}
                        onChange={e => { setData({ ...data, description: e.target.value }); fetchSuggestions(e.target.value); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        required autoComplete="off" style={{ fontSize: '13px', padding: '8px 12px' }} />
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'white', borderRadius: '10px', border: '1px solid var(--surface-200)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '150px', overflowY: 'auto', marginTop: '4px' }}>
                            {suggestions.map((s: any) => (
                                <div key={s.id}
                                    onMouseDown={() => { setData({ ...data, description: s.partName, type: s.type, quality: s.quality || '', brand: s.brand || '' }); setShowSuggestions(false); }}
                                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid var(--surface-50)', transition: 'background 0.1s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#ECFDF5')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                                >
                                    <span style={{ fontWeight: 600 }}>{s.partName}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <select value={data.type} onChange={e => setData({ ...data, type: e.target.value })}
                    style={{ padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--surface-200)', fontSize: '12px', background: 'white' }}>
                    <option value="PART">ნაწილი</option><option value="LABOR">სამუშაო</option><option value="OTHER">სხვა</option>
                </select>
            </div>
            {data.type === 'PART' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <select value={data.quality} onChange={e => setData({ ...data, quality: e.target.value })}
                        style={{ padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--surface-200)', fontSize: '12px', background: 'white' }}>
                        <option value="">ხარისხი...</option><option value="OEM">ორიგინალი</option><option value="AFTERMARKET">არაორიგინალი</option>
                        <option value="USED_OEM">მეორადი ორიგ.</option><option value="REFURBISHED">აღდგენილი</option>
                    </select>
                    <input className="form-input" placeholder="ბრენდი" value={data.brand}
                        onChange={e => { setData({ ...data, brand: e.target.value }); fetchBrandSuggestions(e.target.value); }}
                        onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                        style={{ fontSize: '12px', padding: '6px 10px' }} />
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                    <label style={{ fontSize: '10px', color: 'var(--ink-faint)', fontWeight: 600 }}>რაოდ.</label>
                    <input type="number" min="1" className="form-input" value={data.quantity}
                        onChange={e => setData({ ...data, quantity: parseInt(e.target.value) || 1 })}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', padding: '6px 8px', textAlign: 'center' }} />
                </div>
                <div>
                    <label style={{ fontSize: '10px', color: 'var(--ink-faint)', fontWeight: 600 }}>ნეტო ₾</label>
                    <input type="number" step="0.01" className="form-input" placeholder="0.00" value={data.netCost}
                        onChange={e => setData({ ...data, netCost: e.target.value })} required
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', padding: '6px 10px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>კლიენტი ₾</label>
                    <input type="number" step="0.01" className="form-input" placeholder="0.00" value={data.clientPrice}
                        onChange={e => setData({ ...data, clientPrice: e.target.value })} required
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', padding: '6px 10px', borderColor: '#D1FAE5' }} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={onCancel} className="btn btn-outline" style={{ fontSize: '12px', padding: '7px 14px' }}>გაუქმება</button>
                <button onClick={onSubmit} className="btn btn-primary"
                    disabled={submitting || !data.description || !data.netCost || !data.clientPrice}
                    style={{ fontSize: '12px', padding: '7px 14px', gap: '5px' }}>
                    {submitting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={13} />}
                    დამატება
                </button>
            </div>
        </div>
    );
}
