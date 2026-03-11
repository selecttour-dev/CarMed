import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Car, Plus, Edit3, Trash2, X, Search, Calendar, Hash, Check, Shield } from 'lucide-react';
import { searchMakes, fetchModelsForMake, filterModels, CAR_COLORS, getMakeLogo } from '../data/carDatabase';

interface Vehicle {
    id: string; make: string; model: string; year: number;
    plateNumber: string; vin?: string; color?: string;
}

export default function GaragePage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
    const [form, setForm] = useState({ make: '', model: '', year: '', plateNumber: '', vin: '', color: '' });

    const [makeSearch, setMakeSearch] = useState('');
    const [modelSearch, setModelSearch] = useState('');
    const [showMakeDropdown, setShowMakeDropdown] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);

    const makeRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<HTMLDivElement>(null);

    const fetchVehicles = async () => {
        try { const { data } = await api.get('/client/vehicles'); setVehicles(data.data || []); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchVehicles(); }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (makeRef.current && !makeRef.current.contains(e.target as Node)) setShowMakeDropdown(false);
            if (modelRef.current && !modelRef.current.contains(e.target as Node)) setShowModelDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editVehicle) { await api.put(`/client/vehicles/${editVehicle.id}`, form); }
            else { await api.post('/client/vehicles', form); }
            closeModal();
            fetchVehicles();
        } catch (error: any) { alert(error.response?.data?.error || 'შეცდომა'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ნამდვილად წაშალოთ?')) return;
        try { await api.delete(`/client/vehicles/${id}`); fetchVehicles(); }
        catch (e: any) { alert(e.response?.data?.error || 'შეცდომა'); }
    };

    const closeModal = () => {
        setShowModal(false); setEditVehicle(null);
        setForm({ make: '', model: '', year: '', plateNumber: '', vin: '', color: '' });
        setMakeSearch(''); setModelSearch(''); setAvailableModels([]);
    };

    const openEdit = async (v: Vehicle) => {
        setEditVehicle(v);
        setForm({ make: v.make, model: v.model, year: v.year.toString(), plateNumber: v.plateNumber, vin: v.vin || '', color: v.color || '' });
        setMakeSearch(v.make); setModelSearch(v.model);
        setShowModal(true);
        try { const models = await fetchModelsForMake(v.make); setAvailableModels(models); } catch { setAvailableModels([]); }
    };

    const openCreate = () => {
        setEditVehicle(null);
        setForm({ make: '', model: '', year: '', plateNumber: '', vin: '', color: '' });
        setMakeSearch(''); setModelSearch(''); setShowModal(true);
    };

    const selectMake = async (brand: string) => {
        setForm({ ...form, make: brand, model: '' });
        setMakeSearch(brand); setModelSearch(''); setShowMakeDropdown(false);
        setLoadingModels(true);
        try { const models = await fetchModelsForMake(brand); setAvailableModels(models); }
        catch { setAvailableModels([]); }
        finally { setLoadingModels(false); }
    };

    const selectModel = (model: string) => {
        setForm({ ...form, model }); setModelSearch(model); setShowModelDropdown(false);
    };

    const filteredMakes = searchMakes(makeSearch);
    const filteredModels = filterModels(availableModels, modelSearch);
    const selectedMakeLogo = getMakeLogo(form.make);
    const selectedColor = CAR_COLORS.find(c => c.name === form.color);

    const completionPercent = [form.make, form.model, form.year, form.plateNumber].filter(Boolean).length * 25;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
                <div>
                    <h1 className="page-title">ჩემი გარაჟი</h1>
                    <p className="page-subtitle">{vehicles.length} ავტომობილი რეგისტრირებული</p>
                </div>
                <button className="btn-primary text-[13px] px-5 py-2.5" onClick={openCreate}>
                    <Plus size={15} strokeWidth={2.5} /> ავტომობილის დამატება
                </button>
            </div>

            {/* Vehicle List */}
            {loading ? (
                <div className="card p-16 text-center">
                    <div className="w-7 h-7 border-[2.5px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                </div>
            ) : vehicles.length === 0 ? (
                <div className="card p-16 text-center animate-fade-in-up-1">
                    <div className="w-16 h-16 rounded-[18px] bg-surface-50 flex items-center justify-center mx-auto mb-5">
                        <Car size={30} className="text-ink-faint" />
                    </div>
                    <h3 className="text-[17px] font-bold text-ink mb-2">გარაჟი ცარიელია</h3>
                    <p className="text-ink-muted text-[13px] mb-6 max-w-xs mx-auto">
                        დაამატეთ პირველი ავტომობილი და სარგებლეთ CarMed სერვისებით
                    </p>
                    <button className="btn-primary text-[14px] px-6 py-3" onClick={openCreate}>
                        <Plus size={16} /> დამატება
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up-1">
                    {vehicles.map((v) => {
                        const logo = getMakeLogo(v.make);
                        const vColor = CAR_COLORS.find(c => c.name === v.color);
                        return (
                            <div key={v.id} className="card-interactive group relative overflow-hidden">
                                {/* Action buttons */}
                                <div className="absolute top-3.5 right-3.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                    <button className="p-1.5 rounded-[10px] bg-white/90 backdrop-blur-sm border border-surface-100 
                                        text-ink-faint hover:text-ink transition-colors" onClick={() => openEdit(v)}>
                                        <Edit3 size={12} />
                                    </button>
                                    <button className="p-1.5 rounded-[10px] bg-white/90 backdrop-blur-sm border border-surface-100 
                                        text-ink-faint hover:text-red-500 hover:border-red-200 hover:bg-red-50/80 transition-all" onClick={() => handleDelete(v.id)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-[16px] bg-surface-50 border border-surface-100
                                            flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {logo ? (
                                                <img src={logo} alt={v.make} className="w-9 h-9 object-contain"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <Car size={24} className="text-ink-faint" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-ink text-[16px] leading-tight truncate">{v.make} {v.model}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge bg-surface-50 text-ink-muted text-[10px] font-mono">{v.year}</span>
                                                {vColor && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 rounded-full border border-black/10"
                                                            style={{ backgroundColor: vColor.hex }} />
                                                        <span className="text-ink-faint text-[10px]">{v.color}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plate */}
                                    <div className="flex items-center gap-3">
                                        <div className="inline-flex items-center bg-white rounded-[8px] border-2 border-slate-200 overflow-hidden">
                                            <div className="bg-blue-700 px-1.5 py-1.5 flex flex-col items-center justify-center gap-0">
                                                <span className="text-[6px] font-bold text-white leading-none">GE</span>
                                                <div className="w-2 h-1.5 mt-[1px]">
                                                    <svg viewBox="0 0 30 20" className="w-full h-full">
                                                        <rect width="30" height="20" fill="#F5F5F5" />
                                                        <rect x="12" y="0" width="6" height="20" fill="#FF0000" />
                                                        <rect x="0" y="7" width="30" height="6" fill="#FF0000" />
                                                        <rect x="3" y="3" width="4" height="4" fill="#FF0000" />
                                                        <rect x="23" y="3" width="4" height="4" fill="#FF0000" />
                                                        <rect x="3" y="13" width="4" height="4" fill="#FF0000" />
                                                        <rect x="23" y="13" width="4" height="4" fill="#FF0000" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 font-mono text-[13px] font-bold text-slate-800 tracking-[0.15em]">{v.plateNumber}</span>
                                        </div>
                                        {v.vin && (
                                            <span className="text-ink-ghost text-[10px] font-mono truncate" title={v.vin}>VIN: {v.vin.slice(0, 11)}…</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ Modal ═══ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-[20px] shadow-float w-full max-w-lg animate-scale-in max-h-[92vh] overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="relative px-6 pt-5 pb-4 flex-shrink-0 border-b border-surface-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center overflow-hidden flex-shrink-0 transition-all
                                        ${selectedMakeLogo
                                            ? 'bg-surface-50 border border-surface-100'
                                            : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}`}>
                                        {selectedMakeLogo ? (
                                            <img src={selectedMakeLogo} alt={form.make} className="w-6 h-6 object-contain" />
                                        ) : (
                                            <Car size={18} className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-ink">
                                            {editVehicle ? 'რედაქტირება' : 'ახალი ავტომობილი'}
                                        </h2>
                                        {form.make && form.model ? (
                                            <p className="text-emerald-600 text-[11px] font-medium mt-0.5">{form.make} {form.model}</p>
                                        ) : (
                                            <p className="text-ink-faint text-[11px] mt-0.5">შეავსეთ ინფორმაცია</p>
                                        )}
                                    </div>
                                </div>
                                <button className="p-2 rounded-[10px] hover:bg-surface-50 text-ink-faint hover:text-ink transition-all" onClick={closeModal}>
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Completion bar */}
                            <div className="mt-3 h-1 bg-surface-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                                    style={{ width: `${completionPercent}%` }} />
                            </div>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-5">

                                {/* Section: Brand & Model */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-[6px] bg-emerald-100 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-emerald-700">1</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-ink uppercase tracking-wider">ავტომობილი</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Make */}
                                        <div ref={makeRef} className="relative">
                                            <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">მარკა</label>
                                            <div className="relative">
                                                {selectedMakeLogo ? (
                                                    <img src={selectedMakeLogo} alt="" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 object-contain" />
                                                ) : (
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                                                )}
                                                <input
                                                    className="input pl-9 pr-8"
                                                    placeholder="მარკა..."
                                                    value={makeSearch}
                                                    onChange={(e) => { setMakeSearch(e.target.value); setShowMakeDropdown(true); setForm({ ...form, make: '', model: '' }); }}
                                                    onFocus={() => setShowMakeDropdown(true)}
                                                    required={!form.make}
                                                />
                                                {form.make && (
                                                    <button type="button" onClick={() => { setForm({ ...form, make: '', model: '' }); setMakeSearch(''); setAvailableModels([]); setModelSearch(''); }}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-100 text-ink-faint hover:text-ink">
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            {showMakeDropdown && (
                                                <div className="absolute z-30 top-full mt-1 w-[calc(200%+0.75rem)] card-elevated max-h-[280px] overflow-y-auto animate-fade-in">
                                                    {filteredMakes.length === 0 ? (
                                                        <div className="p-4 text-center text-ink-faint text-[13px]">არ მოიძებნა</div>
                                                    ) : (
                                                        <div className="p-1.5 grid grid-cols-2 gap-0.5">
                                                            {filteredMakes.map((car) => (
                                                                <button key={car.brand} type="button" onClick={() => selectMake(car.brand)}
                                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-left transition-all
                                                                        ${form.make === car.brand
                                                                            ? 'bg-emerald-50 ring-1 ring-emerald-200'
                                                                            : 'hover:bg-surface-50'}`}>
                                                                    <div className="w-7 h-7 rounded-[8px] bg-surface-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-surface-100/50">
                                                                        <img src={car.logo} alt={car.brand} className="w-5 h-5 object-contain"
                                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                                    </div>
                                                                    <span className={`text-[12px] font-medium truncate ${form.make === car.brand ? 'text-emerald-700' : 'text-ink'}`}>{car.brand}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Model */}
                                        <div ref={modelRef} className="relative">
                                            <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">მოდელი</label>
                                            <div className="relative">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                                                <input
                                                    className="input pl-9 pr-4 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    placeholder={form.make ? (loadingModels ? 'იტვირთება...' : 'მოდელი...') : 'ჯერ მარკა'}
                                                    value={modelSearch}
                                                    onChange={(e) => { setModelSearch(e.target.value); setForm({ ...form, model: e.target.value }); setShowModelDropdown(true); }}
                                                    onFocus={() => form.make && setShowModelDropdown(true)}
                                                    disabled={!form.make}
                                                    required
                                                />
                                            </div>
                                            {showModelDropdown && form.make && (
                                                <div className="absolute z-30 top-full mt-1 w-full card-elevated max-h-[220px] overflow-y-auto animate-fade-in">
                                                    {loadingModels ? (
                                                        <div className="p-4 text-center">
                                                            <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                                                            <p className="text-ink-faint text-[11px] mt-1.5">მოდელების ჩატვირთვა...</p>
                                                        </div>
                                                    ) : filteredModels.length === 0 ? (
                                                        <div className="p-4 text-center text-ink-faint text-[12px]">
                                                            {modelSearch ? 'ჩაწერეთ ხელით' : 'მოდელები ვერ მოიძებნა'}
                                                        </div>
                                                    ) : (
                                                        <div className="p-1">
                                                            {filteredModels.map((model) => (
                                                                <button key={model} type="button" onClick={() => selectModel(model)}
                                                                    className={`w-full text-left px-3 py-2 rounded-[10px] text-[13px] transition-all
                                                                        ${form.model === model
                                                                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                                                            : 'hover:bg-surface-50 text-ink'}`}>
                                                                    {model}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-surface-100" />

                                {/* Section: Details */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-[6px] bg-blue-100 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-blue-700">2</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-ink uppercase tracking-wider">დეტალები</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">წელი</label>
                                            <div className="relative">
                                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                                                <input className="input pl-9 font-mono"
                                                    placeholder="2024" value={form.year}
                                                    onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 4); setForm({ ...form, year: val }); }}
                                                    inputMode="numeric" maxLength={4} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">ნომერი</label>
                                            <div className="relative">
                                                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                                                <input className="input pl-9 font-mono uppercase tracking-wider"
                                                    placeholder="AA-123-AA" value={form.plateNumber}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                                                        let formatted = '';
                                                        for (let i = 0; i < raw.length && i < 7; i++) {
                                                            if (i === 2 || i === 5) formatted += '-';
                                                            formatted += raw[i];
                                                        }
                                                        setForm({ ...form, plateNumber: formatted });
                                                    }}
                                                    maxLength={9} required />
                                            </div>
                                        </div>
                                    </div>

                                    {/* VIN */}
                                    <div>
                                        <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                                            VIN <span className="normal-case font-normal text-ink-faint">(არასავალდებულო)</span>
                                        </label>
                                        <div className="relative">
                                            <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                                            <input className="input pl-9 font-mono uppercase"
                                                placeholder="WBA3A5C5XCF256789" value={form.vin}
                                                onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
                                                maxLength={17} />
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-surface-100" />

                                {/* Section: Color */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-[6px] bg-violet-100 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-violet-700">3</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-ink uppercase tracking-wider">ფერი</span>
                                        <span className="text-[10px] text-ink-faint font-normal normal-case ml-1">(არასავალდებულო)</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {CAR_COLORS.map((color) => {
                                            const isSelected = form.color === color.name;
                                            const isWhite = color.hex === '#FFFFFF';
                                            return (
                                                <button key={color.name} type="button"
                                                    onClick={() => setForm({ ...form, color: isSelected ? '' : color.name })}
                                                    className="group/c relative" title={`${color.name} (${color.nameEn})`}>
                                                    <div className={`w-8 h-8 rounded-full transition-all duration-200 
                                                        ${isSelected
                                                            ? 'ring-2 ring-emerald-400 ring-offset-2 scale-110'
                                                            : `hover:scale-110 hover:ring-2 hover:ring-surface-300 hover:ring-offset-1 ${isWhite ? 'ring-1 ring-surface-200' : ''}`}`}
                                                        style={{ backgroundColor: color.hex }} />
                                                    {isSelected && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                            <Check size={8} className="text-white" strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedColor && (
                                        <p className="text-[11px] text-ink-muted mt-2">{selectedColor.name} · {selectedColor.nameEn}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="sticky bottom-0 bg-white border-t border-surface-100 px-6 py-4 flex gap-3">
                                <button type="button" onClick={closeModal}
                                    className="btn-secondary text-[13px] px-5 py-2.5">
                                    გაუქმება
                                </button>
                                <button type="submit"
                                    disabled={!form.make || !form.model || !form.year || !form.plateNumber}
                                    className="flex-1 btn-primary text-[13px] py-2.5">
                                    <Check size={15} strokeWidth={2.5} />
                                    {editVehicle ? 'შენახვა' : 'ავტომობილის დამატება'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
