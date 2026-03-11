import { useState, useEffect } from 'react';
import api from '../lib/api';
import { User, CreditCard, Loader2, CheckCircle, AlertCircle, Save, Shield } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function ProfilePage() {
    const { showToast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        name: '', surname: '', personalId: '', dateOfBirth: '',
        email: '', personalAddress: '',
        bankName: '', bankAccountNumber: '', bankAccountName: '',
    });

    useEffect(() => {
        api.get('/manager/profile').then(({ data }) => {
            const u = data.data;
            setProfile(u);
            setForm({
                name: u.name || '',
                surname: u.managerProfile?.surname || '',
                personalId: u.managerProfile?.personalId || '',
                dateOfBirth: u.managerProfile?.dateOfBirth?.slice(0, 10) || '',
                email: u.email || '',
                personalAddress: u.managerProfile?.personalAddress || '',
                bankName: u.managerProfile?.bankName || '',
                bankAccountNumber: u.managerProfile?.bankAccountNumber || '',
                bankAccountName: u.managerProfile?.bankAccountName || '',
            });
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true); setSaved(false);
        try {
            const { data } = await api.put('/manager/profile', form);
            setProfile(data.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) { showToast(err.response?.data?.error || 'შეცდომა', 'error'); }
        finally { setSaving(false); }
    };

    const isComplete = form.surname && form.personalId && form.bankName && form.bankAccountNumber && form.bankAccountName;

    if (loading) return (
        <div className="prof-loading">
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-light)' }} />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="prof-header">
                <h1 className="page-title prof-title">პროფილი</h1>
                <p className="page-subtitle">პერსონალური და საბანკო მონაცემები</p>
            </div>

            {/* Completion Status */}
            <div className={`prof-status ${isComplete ? 'complete' : 'incomplete'}`}>
                <div className={`prof-status-icon ${isComplete ? 'complete' : 'incomplete'}`}>
                    {isComplete
                        ? <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                        : <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
                    }
                </div>
                <div>
                    <p className="prof-status-title" style={{ color: isComplete ? 'var(--success)' : 'var(--warning)' }}>
                        {isComplete ? 'პროფილი შევსებულია ✓' : 'პროფილი არასრულია'}
                    </p>
                    <p className="prof-status-desc" style={{ color: isComplete ? '#047857' : '#B45309' }}>
                        {isComplete
                            ? 'კლიენტებს შეუძლიათ თქვენი საბანკო მონაცემების ნახვა'
                            : 'შეავსეთ ყველა * ველი რომ კლიენტებმა ნახონ თქვენი მონაცემები'}
                    </p>
                </div>
            </div>

            {/* Saved Toast */}
            {saved && (
                <div className="prof-saved-toast">
                    <CheckCircle size={16} /> პროფილი წარმატებით შენახულია
                </div>
            )}

            <div className="prof-grid">
                {/* Personal Info */}
                <div className="prof-card">
                    <div className="prof-card-header">
                        <div className="prof-card-icon" style={{ background: 'rgba(4,120,87,0.08)' }}>
                            <User size={16} style={{ color: 'var(--accent)' }} />
                        </div>
                        <h3>პირადი ინფორმაცია</h3>
                    </div>

                    <div className="prof-form-row">
                        <div className="form-group">
                            <label className="form-label">სახელი</label>
                            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">გვარი *</label>
                            <input className="form-input" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })}
                                style={!form.surname ? { borderColor: 'rgba(217,119,6,0.3)' } : {}} />
                        </div>
                    </div>
                    <div className="prof-form-row">
                        <div className="form-group">
                            <label className="form-label">პირადი ნომერი (პნ) *</label>
                            <input className="form-input" value={form.personalId}
                                onChange={(e) => { if (/^\d{0,11}$/.test(e.target.value)) setForm({ ...form, personalId: e.target.value }); }}
                                placeholder="01234567890" maxLength={11}
                                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px', ...(!form.personalId ? { borderColor: 'rgba(217,119,6,0.3)' } : {}) }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">დაბადების თარიღი</label>
                            <input type="date" className="form-input" value={form.dateOfBirth}
                                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">ტელეფონი</label>
                        <input className="form-input" value={profile?.phone || ''} disabled
                            style={{ fontFamily: 'var(--font-mono)' }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">ელ-ფოსტა</label>
                        <input className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="example@mail.com" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">მისამართი</label>
                        <input className="form-input" value={form.personalAddress} onChange={(e) => setForm({ ...form, personalAddress: e.target.value })}
                            placeholder="ქ. თბილისი, ..." />
                    </div>
                </div>

                {/* Bank + Info */}
                <div>
                    <div className="prof-card" style={{ marginBottom: '16px' }}>
                        <div className="prof-card-header">
                            <div className="prof-card-icon" style={{ background: 'rgba(5,150,105,0.08)' }}>
                                <CreditCard size={16} style={{ color: 'var(--success)' }} />
                            </div>
                            <h3>საბანკო მონაცემები</h3>
                        </div>

                        <div className="form-group">
                            <label className="form-label">ბანკი *</label>
                            <input className="form-input" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                placeholder="მაგ: საქართველოს ბანკი"
                                style={!form.bankName ? { borderColor: 'rgba(217,119,6,0.3)' } : {}} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">IBAN / ანგარიშის ნომერი *</label>
                            <input className="form-input" value={form.bankAccountNumber}
                                onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                                placeholder="GE00XX0000000000000000"
                                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px', ...(!form.bankAccountNumber ? { borderColor: 'rgba(217,119,6,0.3)' } : {}) }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">ანგარიშზე სახელი *</label>
                            <input className="form-input" value={form.bankAccountName} onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                                placeholder="სახელი გვარი"
                                style={!form.bankAccountName ? { borderColor: 'rgba(217,119,6,0.3)' } : {}} />
                        </div>
                    </div>

                    {/* Info card */}
                    <div className="prof-info-card">
                        <Shield size={16} style={{ color: 'var(--accent)', marginTop: '1px', flexShrink: 0 }} />
                        <div>
                            <p className="prof-info-title">ხილვადობის წესები</p>
                            <p className="prof-info-desc">
                                სახელი, გვარი და საბანკო რეკვიზიტები ხილულია კლიენტებისთვის. პირადი ნომერი და მისამართი მხოლოდ ადმინისტრაციას ეჩვენება.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="prof-save-wrap">
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving} style={{ gap: '8px' }}>
                    {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                    {saving ? 'ინახება...' : 'შენახვა'}
                </button>
            </div>
        </div>
    );
}
