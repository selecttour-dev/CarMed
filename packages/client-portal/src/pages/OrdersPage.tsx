import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ClipboardList, Clock, MapPin, Car, Plus, ArrowRight, Wrench, CheckCircle2, AlertCircle, User, CreditCard } from 'lucide-react';
import { getMakeLogo } from '../data/carDatabase';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string; icon: React.ReactNode }> = {
    PENDING: { label: 'მოლოდინში', bg: 'bg-amber-50', color: 'text-amber-700', dot: 'bg-amber-400', icon: <Clock size={12} /> },
    PICKED_UP: { label: 'წაყვანილია', bg: 'bg-blue-50', color: 'text-blue-700', dot: 'bg-blue-400', icon: <Car size={12} /> },
    DIAGNOSING: { label: 'დიაგნოსტიკა', bg: 'bg-purple-50', color: 'text-purple-700', dot: 'bg-purple-400', icon: <Wrench size={12} /> },
    INVOICED: { label: 'ინვოისი', bg: 'bg-orange-50', color: 'text-orange-700', dot: 'bg-orange-400', icon: <CreditCard size={12} /> },
    PAID: { label: 'გადახდილი', bg: 'bg-emerald-50', color: 'text-emerald-700', dot: 'bg-emerald-400', icon: <CheckCircle2 size={12} /> },
    IN_REPAIR: { label: 'შეკეთებაშია', bg: 'bg-cyan-50', color: 'text-cyan-700', dot: 'bg-cyan-400', icon: <Wrench size={12} /> },
    COMPLETED: { label: 'დასრულებული', bg: 'bg-emerald-50', color: 'text-emerald-700', dot: 'bg-emerald-500', icon: <CheckCircle2 size={12} /> },
    CANCELED: { label: 'გაუქმებული', bg: 'bg-red-50', color: 'text-red-700', dot: 'bg-red-400', icon: <AlertCircle size={12} /> },
};

const FILTERS = [
    { key: '', label: 'ყველა' },
    { key: 'PENDING', label: 'მოლოდინში' },
    { key: 'DIAGNOSING', label: 'დიაგნოსტიკა' },
    { key: 'INVOICED', label: 'ინვოისი' },
    { key: 'IN_REPAIR', label: 'შეკეთებაშია' },
    { key: 'COMPLETED', label: 'დასრულებული' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try { const { data } = await api.get('/client/orders'); setOrders(data.data || []); }
            catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = filter ? orders.filter(o => o.status === filter) : orders;

    const statusCounts: Record<string, number> = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffHours < 1) return 'ახლახანს';
        if (diffHours < 24) return `${diffHours} საათის წინ`;
        if (diffDays < 7) return `${diffDays} დღის წინ`;
        return d.toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 animate-fade-in-up">
                <div>
                    <h1 className="text-[20px] sm:text-[24px] font-extrabold tracking-tight text-ink font-display">ჩემი შეკვეთები</h1>
                    <p className="page-subtitle">
                        {orders.length > 0 ? `${orders.length} შეკვეთა სულ` : 'თვალყური ადევნეთ სერვის შეკვეთებს'}
                    </p>
                </div>
                <button className="btn-primary text-[13px] px-5 py-2.5 w-full sm:w-auto"
                    onClick={() => navigate('/dashboard/orders/new')}>
                    <Plus size={15} strokeWidth={2.5} /> ახალი შეკვეთა
                </button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 mb-5 sm:mb-6 animate-fade-in-up-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {FILTERS.map((f) => {
                    const count = f.key === '' ? orders.length : (statusCounts[f.key] || 0);
                    const isActive = filter === f.key;
                    const statusConf = f.key ? STATUS_CONFIG[f.key] : null;
                    return (
                        <button key={f.key}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[12px] font-semibold transition-all duration-200
                                ${isActive
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink-muted border border-surface-200 hover:border-emerald-200 hover:text-ink'}`}
                            onClick={() => setFilter(f.key)}>
                            {statusConf && !isActive && (
                                <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                            )}
                            {f.label}
                            {count > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[6px]
                                    ${isActive ? 'bg-white/20 text-white' : 'bg-surface-50 text-ink-faint'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="card p-16 text-center">
                    <div className="w-7 h-7 border-[2.5px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-16 text-center animate-fade-in-up-2">
                    <div className="w-16 h-16 rounded-[18px] bg-surface-50 flex items-center justify-center mx-auto mb-5">
                        <ClipboardList size={28} className="text-ink-faint" />
                    </div>
                    <h3 className="text-[17px] font-bold text-ink mb-2">
                        {filter ? 'ამ სტატუსით შეკვეთები არ არის' : 'შეკვეთები არ არის'}
                    </h3>
                    <p className="text-ink-muted text-[13px] mb-6 max-w-xs mx-auto">
                        შექმენით პირველი შეკვეთა მენეჯერის გამოსაძახებლად
                    </p>
                    <button className="btn-primary text-[14px] px-6 py-3"
                        onClick={() => navigate('/dashboard/orders/new')}>
                        <Plus size={16} /> ახალი შეკვეთა
                    </button>
                </div>
            ) : (
                <div className="space-y-3 animate-fade-in-up-2">
                    {filtered.map((order) => {
                        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                        const logo = order.vehicle ? getMakeLogo(order.vehicle.make) : undefined;
                        return (
                            <div key={order.id} onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                className="card-interactive group">
                                <div className="p-4 sm:p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Vehicle logo */}
                                        <div className="w-12 h-12 rounded-[14px] bg-surface-50 border border-surface-100
                                            flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                                            {logo ? (
                                                <img src={logo} alt={order.vehicle?.make} className="w-7 h-7 object-contain"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <Car size={18} className="text-ink-faint" />
                                            )}
                                        </div>

                                        {/* Main content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div>
                                                    <h3 className="font-bold text-ink text-[15px] leading-tight">
                                                        {order.vehicle ? `${order.vehicle.make} ${order.vehicle.model}` : 'ავტომობილი'}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-faint">
                                                        {order.vehicle?.year && <span className="font-mono">{order.vehicle.year}</span>}
                                                        {order.vehicle?.plateNumber && (
                                                            <>
                                                                <span className="text-ink-ghost">·</span>
                                                                <span className="font-mono font-semibold tracking-wide">{order.vehicle.plateNumber}</span>
                                                            </>
                                                        )}
                                                        <span className="text-ink-ghost">·</span>
                                                        <span className="font-mono opacity-60">#{order.id.slice(0, 6)}</span>
                                                    </div>
                                                </div>

                                                {/* Status badge */}
                                                <span className={`badge ${status.bg} ${status.color} flex-shrink-0`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            {order.problemDescription && (
                                                <p className="text-ink-muted text-[13px] line-clamp-1 mb-2.5">{order.problemDescription}</p>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-[11px] text-ink-faint">
                                                    {order.address && (
                                                        <span className="flex items-center gap-1 max-w-[160px] truncate">
                                                            <MapPin size={11} className="flex-shrink-0" /> {order.address}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={11} /> {formatDate(order.createdAt)}
                                                    </span>
                                                    {order.manager && (
                                                        <span className="flex items-center gap-1">
                                                            <User size={11} /> {order.manager.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-emerald-600 text-[11px] font-semibold opacity-0 group-hover:opacity-100
                                                    transition-opacity flex items-center gap-1">
                                                    დეტალები <ArrowRight size={11} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
