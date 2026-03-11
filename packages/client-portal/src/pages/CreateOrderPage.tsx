import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Send, Car, MapPin, Check, AlertCircle, Sparkles, User, Phone } from 'lucide-react';
import { getMakeLogo, CAR_COLORS } from '../data/carDatabase';

interface Vehicle {
    id: string; make: string; model: string; year: number; plateNumber: string; color?: string;
}

interface Manager {
    id: string; name: string; phone: string;
}

export default function CreateOrderPage() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [managerSelectionEnabled, setManagerSelectionEnabled] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', address: '', problemDescription: '', managerId: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/client/vehicles').then(({ data }) => setVehicles(data.data || [])).catch(console.error);
        api.get('/client/managers').then(({ data }) => {
            setManagers(data.data || []);
            setManagerSelectionEnabled(data.enabled === true);
        }).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const payload: any = {
                vehicleId: form.vehicleId,
                address: form.address,
                problemDescription: form.problemDescription,
            };
            if (form.managerId) payload.managerId = form.managerId;
            const { data } = await api.post('/client/orders', payload);
            navigate(`/dashboard/orders/${data.data.id}`);
        } catch (err: any) { setError(err.response?.data?.error || 'შეცდომა'); }
        finally { setLoading(false); }
    };

    const selectedVehicle = vehicles.find(v => v.id === form.vehicleId);
    const selectedLogo = selectedVehicle ? getMakeLogo(selectedVehicle.make) : undefined;
    const selectedManager = managers.find(m => m.id === form.managerId);

    const addressSection = managerSelectionEnabled ? 3 : 2;
    const descSection = managerSelectionEnabled ? 4 : 3;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            {/* Back */}
            <button className="group flex items-center gap-1.5 text-ink-muted text-[13px] font-medium hover:text-emerald-700
                transition-colors mb-6" onClick={() => navigate('/dashboard/orders')}>
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
                უკან
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8 animate-fade-in-up">
                <h1 className="text-[20px] sm:text-[24px] font-extrabold tracking-tight text-ink font-display">ახალი შეკვეთა</h1>
                <p className="page-subtitle">გამოიძახეთ მენეჯერი თქვენი ავტომობილისთვის</p>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-[14px] px-4 py-3 text-[13px] mb-5">
                    <AlertCircle size={16} className="flex-shrink-0" /> {error}
                </div>
            )}

            {vehicles.length === 0 ? (
                <div className="card p-16 text-center animate-fade-in-up-1">
                    <div className="w-16 h-16 rounded-[18px] bg-surface-50 flex items-center justify-center mx-auto mb-5">
                        <Car size={30} className="text-ink-faint" />
                    </div>
                    <h3 className="text-[17px] font-bold text-ink mb-2">ჯერ ავტომობილი არ გაქვთ</h3>
                    <p className="text-ink-muted text-[13px] mb-6">ჯერ დაამატეთ ავტომობილი მანქანებში</p>
                    <button className="btn-primary text-[14px] px-6 py-3"
                        onClick={() => navigate('/dashboard/garage')}>
                        მანქანებში გადასვლა
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up-1">

                    {/* Section 1: Vehicle */}
                    <div className="card overflow-hidden">
                        <div className="px-5 pt-4 pb-3 border-b border-surface-100/60">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-[6px] bg-emerald-100 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-emerald-700">1</span>
                                </div>
                                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">აირჩიეთ ავტომობილი</span>
                            </div>
                        </div>
                        <div className="p-2.5">
                            {vehicles.map((v) => {
                                const logo = getMakeLogo(v.make);
                                const isSelected = form.vehicleId === v.id;
                                const vColor = v.color ? CAR_COLORS.find(c => c.name === v.color) : undefined;
                                return (
                                    <label key={v.id}
                                        className={`flex items-center gap-3.5 p-3.5 rounded-[14px] cursor-pointer transition-all duration-200
                                            ${isSelected
                                                ? 'bg-emerald-50/70 ring-1 ring-emerald-200'
                                                : 'hover:bg-surface-50'}`}>
                                        <input type="radio" name="vehicle" value={v.id} checked={isSelected}
                                            onChange={() => setForm({ ...form, vehicleId: v.id })} className="sr-only" />

                                        <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden transition-all
                                            ${isSelected
                                                ? 'bg-white border border-emerald-200 shadow-soft'
                                                : 'bg-surface-50 border border-surface-100'}`}>
                                            {logo ? (
                                                <img src={logo} alt={v.make} className="w-7 h-7 object-contain"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <Car size={18} className="text-ink-faint" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-[14px] leading-tight ${isSelected ? 'text-emerald-800' : 'text-ink'}`}>
                                                {v.make} {v.model}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-faint">
                                                <span className="font-mono">{v.year}</span>
                                                <span className="text-ink-ghost">·</span>
                                                <span className="font-mono font-semibold tracking-wide">{v.plateNumber}</span>
                                                {vColor && (
                                                    <>
                                                        <span className="text-ink-ghost">·</span>
                                                        <div className="w-2.5 h-2.5 rounded-full border border-black/10"
                                                            style={{ backgroundColor: vColor.hex }} />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                                            ${isSelected ? 'bg-emerald-600 scale-100' : 'border-2 border-surface-200 scale-90'}`}>
                                            {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 2: Manager (if enabled) */}
                    {managerSelectionEnabled && managers.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="px-5 pt-4 pb-3 border-b border-surface-100/60">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-[6px] bg-amber-100 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-amber-700">2</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-ink uppercase tracking-wider">აირჩიეთ მენეჯერი</span>
                                    </div>
                                    <span className="text-[10px] text-ink-faint font-medium">არჩევითი</span>
                                </div>
                            </div>
                            <div className="p-2.5">
                                {/* Auto */}
                                <label className={`flex items-center gap-3.5 p-3.5 rounded-[14px] cursor-pointer transition-all
                                    ${!form.managerId ? 'bg-surface-50/70 ring-1 ring-surface-200' : 'hover:bg-surface-50'}`}>
                                    <input type="radio" name="manager" value="" checked={!form.managerId}
                                        onChange={() => setForm({ ...form, managerId: '' })} className="sr-only" />
                                    <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-all
                                        ${!form.managerId ? 'bg-white border border-surface-200 shadow-soft' : 'bg-surface-50 border border-surface-100'}`}>
                                        <Sparkles size={18} className="text-ink-faint" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-[14px] leading-tight ${!form.managerId ? 'text-ink' : 'text-ink-muted'}`}>
                                            ავტომატურად მინიჭება
                                        </p>
                                        <p className="text-ink-faint text-[11px]">ადმინი შეარჩევს საუკეთესო მენეჯერს</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                                        ${!form.managerId ? 'bg-ink scale-100' : 'border-2 border-surface-200 scale-90'}`}>
                                        {!form.managerId && <Check size={11} className="text-white" strokeWidth={3} />}
                                    </div>
                                </label>

                                {managers.map((m) => {
                                    const isSelected = form.managerId === m.id;
                                    return (
                                        <label key={m.id}
                                            className={`flex items-center gap-3.5 p-3.5 rounded-[14px] cursor-pointer transition-all
                                                ${isSelected ? 'bg-amber-50/70 ring-1 ring-amber-200' : 'hover:bg-surface-50'}`}>
                                            <input type="radio" name="manager" value={m.id} checked={isSelected}
                                                onChange={() => setForm({ ...form, managerId: m.id })} className="sr-only" />
                                            <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-all
                                                ${isSelected ? 'bg-white border border-amber-200 shadow-soft' : 'bg-surface-50 border border-surface-100'}`}>
                                                <User size={18} className={isSelected ? 'text-amber-700' : 'text-ink-faint'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-[14px] leading-tight ${isSelected ? 'text-amber-800' : 'text-ink'}`}>
                                                    {m.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Phone size={10} className="text-ink-faint" />
                                                    <span className="text-ink-faint text-[11px] font-mono">{m.phone}</span>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                                                ${isSelected ? 'bg-amber-600 scale-100' : 'border-2 border-surface-200 scale-90'}`}>
                                                {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Section: Address */}
                    <div className="card overflow-hidden">
                        <div className="px-5 pt-4 pb-3 border-b border-surface-100/60">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-[6px] bg-blue-100 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-blue-700">{addressSection}</span>
                                </div>
                                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">მისამართი</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="relative">
                                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                                <input className="input pl-10 text-[14px] py-3.5"
                                    placeholder="მაგ: ვაჟა-ფშაველას #12, თბილისი"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    required />
                            </div>
                        </div>
                    </div>

                    {/* Section: Problem Description */}
                    <div className="card overflow-hidden">
                        <div className="px-5 pt-4 pb-3 border-b border-surface-100/60">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-[6px] bg-violet-100 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-violet-700">{descSection}</span>
                                </div>
                                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">პრობლემის აღწერა</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <textarea className="input min-h-[130px] resize-y text-[14px] py-3.5 leading-relaxed"
                                placeholder="აღწერეთ პრობლემა — რა ხმაურობს, რა გეუბნებათ dashboard, რა შეამჩნიეთ..."
                                value={form.problemDescription}
                                onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
                                required />
                        </div>
                    </div>

                    {/* Preview */}
                    {selectedVehicle && form.address && form.problemDescription && (
                        <div className="rounded-[14px] bg-emerald-50/50 border border-emerald-100 px-5 py-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                                {selectedLogo && <img src={selectedLogo} alt="" className="w-6 h-6 object-contain" />}
                                <div className="flex-1 min-w-0">
                                    <p className="text-emerald-800 text-[13px] font-semibold">
                                        {selectedVehicle.make} {selectedVehicle.model} · {selectedVehicle.plateNumber}
                                        {selectedManager && <span className="text-emerald-600"> · {selectedManager.name}</span>}
                                    </p>
                                    <p className="text-emerald-600/60 text-[11px] truncate">{form.address}</p>
                                </div>
                                <Sparkles size={14} className="text-emerald-400" />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={loading || !form.vehicleId || !form.address || !form.problemDescription}
                        className="w-full btn-primary py-4 text-[15px]">
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                იგზავნება...
                            </div>
                        ) : (
                            <><Send size={17} /> შეკვეთის გაგზავნა</>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
