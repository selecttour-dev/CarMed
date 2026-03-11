import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import {
    Car, ArrowRight, Plus, Clock, MapPin, Wrench,
    CheckCircle2, AlertCircle, ChevronRight, Zap, CreditCard,
    Shield, Activity, ArrowUpRight
} from 'lucide-react';
import { getMakeLogo, CAR_COLORS } from '../data/carDatabase';

interface Vehicle {
    id: string; make: string; model: string; year: number;
    plateNumber: string; color?: string;
}

interface Order {
    id: string; status: string; address: string; problemDescription: string;
    createdAt: string; vehicle?: { make: string; model: string; year: number; plateNumber: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }> = {
    PENDING: { label: 'მოლოდინში', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400', icon: <Clock size={12} /> },
    PICKED_UP: { label: 'წაყვანილია', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400', icon: <Car size={12} /> },
    DIAGNOSING: { label: 'დიაგნოსტიკა', color: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-400', icon: <Wrench size={12} /> },
    INVOICED: { label: 'ინვოისი', color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-400', icon: <CreditCard size={12} /> },
    PAID: { label: 'გადახდილი', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400', icon: <CheckCircle2 size={12} /> },
    IN_REPAIR: { label: 'შეკეთებაშია', color: 'text-cyan-700', bg: 'bg-cyan-50', dot: 'bg-cyan-400', icon: <Wrench size={12} /> },
    COMPLETED: { label: 'დასრულებული', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', icon: <CheckCircle2 size={12} /> },
    CANCELED: { label: 'გაუქმებული', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400', icon: <AlertCircle size={12} /> },
};

const STATUS_FLOW = ['PENDING', 'PICKED_UP', 'DIAGNOSING', 'INVOICED', 'PAID', 'IN_REPAIR', 'COMPLETED'];

function getProgress(status: string): number {
    const idx = STATUS_FLOW.indexOf(status);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / STATUS_FLOW.length) * 100);
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 6) return 'ღამე მშვიდობისა';
    if (h < 12) return 'დილა მშვიდობისა';
    if (h < 18) return 'გამარჯობა';
    return 'საღამო მშვიდობისა';
}

function formatTimeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'ახლახანს';
    if (diffHours < 24) return `${diffHours} საათის წინ`;
    if (diffDays < 7) return `${diffDays} დღის წინ`;
    return d.toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' });
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [v, o] = await Promise.all([
                    api.get('/client/vehicles'),
                    api.get('/client/orders'),
                ]);
                setVehicles(v.data.data || []);
                setOrders(o.data.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELED'].includes(o.status));
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');
    const firstName = user?.name?.split(' ')[0] || 'მომხმარებელი';

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="w-7 h-7 border-[2.5px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* ═══ Welcome + Stats Row ═══ */}
            <div className="mb-8 animate-fade-in-up">
                <h1 className="page-title">
                    {getGreeting()}, {firstName}
                </h1>
                <p className="page-subtitle">თქვენი ავტომობილების სერვისის ცენტრი</p>
            </div>

            {/* ═══ Stat Cards ═══ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in-up-1">
                {/* Active Orders */}
                <div className="card p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-[12px] bg-amber-50 flex items-center justify-center">
                            <Activity size={17} className="text-amber-600" />
                        </div>
                        {activeOrders.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-soft" />
                        )}
                    </div>
                    <p className="text-[24px] font-extrabold text-ink font-mono leading-none">{activeOrders.length}</p>
                    <p className="text-ink-faint text-[12px] font-medium mt-1">აქტიური</p>
                </div>

                {/* Vehicles */}
                <div className="card p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-[12px] bg-emerald-50 flex items-center justify-center">
                            <Car size={17} className="text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-[24px] font-extrabold text-ink font-mono leading-none">{vehicles.length}</p>
                    <p className="text-ink-faint text-[12px] font-medium mt-1">ავტომობილი</p>
                </div>

                {/* Completed */}
                <div className="card p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-[12px] bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 size={17} className="text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-[24px] font-extrabold text-ink font-mono leading-none">{completedOrders.length}</p>
                    <p className="text-ink-faint text-[12px] font-medium mt-1">დასრულებული</p>
                </div>

                {/* CTA Card */}
                <div className="card-interactive p-4 sm:p-5 group"
                    onClick={() => navigate('/dashboard/orders/new')}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-emerald-500 to-emerald-700 
                            flex items-center justify-center shadow-glow-emerald">
                            <Plus size={17} className="text-white" />
                        </div>
                        <ArrowUpRight size={14} className="text-ink-ghost group-hover:text-emerald-600 
                            transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="text-[14px] font-bold text-ink leading-tight">ახალი შეკვეთა</p>
                    <p className="text-ink-faint text-[11px] mt-0.5">მენეჯერის გამოძახება</p>
                </div>
            </div>

            {/* ═══ Main Grid ═══ */}
            <div className="grid lg:grid-cols-3 gap-5 animate-fade-in-up-2">

                {/* ── Active Orders ── (2 cols) */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title">აქტიური შეკვეთები</h2>
                        {orders.length > 0 && (
                            <Link to="/dashboard/orders" className="btn-ghost text-[12px] px-3 py-1.5">
                                ყველა <ChevronRight size={14} />
                            </Link>
                        )}
                    </div>

                    {activeOrders.length === 0 ? (
                        <div className="card p-10 sm:p-14 text-center">
                            <div className="w-16 h-16 rounded-[18px] bg-surface-50 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={28} className="text-emerald-400" />
                            </div>
                            <h3 className="text-[16px] font-bold text-ink mb-1">ყველაფერი წესრიგშია</h3>
                            <p className="text-ink-muted text-[13px] mb-5">აქტიური შეკვეთები არ გაქვთ</p>
                            <button className="btn-primary text-[13px] px-5 py-2.5"
                                onClick={() => navigate('/dashboard/orders/new')}>
                                <Plus size={15} /> ახალი შეკვეთა
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeOrders.slice(0, 4).map((order) => {
                                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                const progress = getProgress(order.status);
                                const logo = order.vehicle ? getMakeLogo(order.vehicle.make) : undefined;

                                return (
                                    <div key={order.id}
                                        onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                        className="card-interactive group">
                                        <div className="p-4 sm:p-5">
                                            {/* Top row */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-12 h-12 rounded-[14px] bg-surface-50 border border-surface-100
                                                        flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {logo ? (
                                                            <img src={logo} alt={order.vehicle?.make} className="w-7 h-7 object-contain"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        ) : (
                                                            <Car size={18} className="text-ink-faint" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-ink text-[15px] leading-tight">
                                                            {order.vehicle ? `${order.vehicle.make} ${order.vehicle.model}` : 'ავტომობილი'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-faint">
                                                            {order.vehicle?.plateNumber && (
                                                                <span className="font-mono font-semibold tracking-wide">{order.vehicle.plateNumber}</span>
                                                            )}
                                                            <span className="font-mono opacity-60">#{order.id.slice(0, 6)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={`badge ${status.bg} ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            {order.problemDescription && (
                                                <p className="text-ink-muted text-[13px] line-clamp-1 mb-3">{order.problemDescription}</p>
                                            )}

                                            {/* Progress bar */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-700 ${status.dot}`}
                                                        style={{ width: `${progress}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-ink-faint font-mono">{progress}%</span>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between text-[11px] text-ink-faint">
                                                <div className="flex items-center gap-3">
                                                    {order.address && (
                                                        <span className="flex items-center gap-1 max-w-[150px] truncate">
                                                            <MapPin size={11} /> {order.address}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={11} /> {formatTimeAgo(order.createdAt)}
                                                    </span>
                                                </div>
                                                <span className="text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 
                                                    transition-opacity flex items-center gap-1">
                                                    ნახვა <ArrowRight size={11} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Sidebar ── (1 col) */}
                <div className="space-y-5">
                    {/* CTA Banner */}
                    <div className="rounded-[20px] p-5 overflow-hidden cursor-pointer group"
                        style={{
                            background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 40%, #064E3B 100%)',
                        }}
                        onClick={() => navigate('/dashboard/orders/new')}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                <Zap size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-white leading-tight">
                                    გამოიძახეთ მენეჯერი
                                </h3>
                                <p className="text-white/30 text-[11px]">Door-to-door სერვისი</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-300/80 text-[12px] font-semibold 
                            group-hover:text-emerald-300 transition-colors">
                            შეკვეთის შექმნა
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* My Cars */}
                    <div className="card overflow-hidden">
                        <div className="flex items-center justify-between px-5 pt-5 pb-3">
                            <h2 className="section-title">ჩემი გარაჟი</h2>
                            <Link to="/dashboard/garage" className="text-[11px] text-emerald-700 font-semibold 
                                hover:underline flex items-center gap-0.5">
                                ყველა <ChevronRight size={12} />
                            </Link>
                        </div>

                        {vehicles.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 rounded-[14px] bg-surface-50 flex items-center justify-center mx-auto mb-3">
                                    <Car size={20} className="text-ink-faint" />
                                </div>
                                <p className="text-ink-muted text-[12px] mb-3">ავტომობილები არ არის</p>
                                <button className="text-[12px] text-emerald-700 font-semibold hover:underline"
                                    onClick={() => navigate('/dashboard/garage')}>
                                    + დამატება
                                </button>
                            </div>
                        ) : (
                            <div className="px-3 pb-3">
                                {vehicles.slice(0, 3).map((v) => {
                                    const logo = getMakeLogo(v.make);
                                    const vColor = v.color ? CAR_COLORS.find(c => c.name === v.color) : undefined;
                                    return (
                                        <div key={v.id} onClick={() => navigate('/dashboard/garage')}
                                            className="flex items-center gap-3 px-3 py-3 rounded-[12px]
                                            hover:bg-surface-50 transition-colors cursor-pointer group/v">
                                            <div className="w-10 h-10 rounded-[12px] bg-surface-50 border border-surface-100
                                                flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {logo ? (
                                                    <img src={logo} alt={v.make} className="w-6 h-6 object-contain"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                ) : (
                                                    <Car size={16} className="text-ink-faint" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-ink text-[13px] truncate">{v.make} {v.model}</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-ink-faint text-[10px] font-mono font-medium">{v.plateNumber}</span>
                                                    <span className="text-ink-ghost text-[10px]">·</span>
                                                    <span className="text-ink-faint text-[10px]">{v.year}</span>
                                                    {vColor && (
                                                        <>
                                                            <span className="text-ink-ghost text-[10px]">·</span>
                                                            <div className="w-2 h-2 rounded-full border border-black/10"
                                                                style={{ backgroundColor: vColor.hex }} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-ink-ghost opacity-0 group-hover/v:opacity-100 transition-opacity" />
                                        </div>
                                    );
                                })}
                                {vehicles.length > 3 && (
                                    <Link to="/dashboard/garage" className="block text-center text-[11px] text-emerald-700 font-medium py-2 hover:underline">
                                        +{vehicles.length - 3} სხვა
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/dashboard/orders/new')}
                            className="card-interactive group p-4 text-left">
                            <div className="w-9 h-9 rounded-[10px] bg-emerald-50 flex items-center justify-center mb-3
                                group-hover:bg-emerald-600 transition-colors duration-300">
                                <Plus size={16} className="text-emerald-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <p className="text-[12px] font-bold text-ink">შეკვეთა</p>
                            <p className="text-[10px] text-ink-faint mt-0.5">მენეჯერის გამოძახება</p>
                        </button>
                        <button onClick={() => navigate('/dashboard/garage')}
                            className="card-interactive group p-4 text-left">
                            <div className="w-9 h-9 rounded-[10px] bg-blue-50 flex items-center justify-center mb-3
                                group-hover:bg-blue-600 transition-colors duration-300">
                                <Car size={16} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <p className="text-[12px] font-bold text-ink">ავტო</p>
                            <p className="text-[10px] text-ink-faint mt-0.5">გარაჟის მართვა</p>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[14px] bg-emerald-50/50 border border-emerald-100/50">
                        <Shield size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-emerald-700/50 text-[11px] leading-relaxed">
                            თქვენი მონაცემები დაშიფრულია და დაცულია.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
