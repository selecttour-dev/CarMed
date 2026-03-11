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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-light)' }} />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '28px' }}>
                <h1 className="page-title" style={{ fontSize: '26px', marginBottom: '4px' }}>პროფილი</h1>
                <p className="page-subtitle" style={{ fontSize: '14px' }}>პერსონალური და საბანკო მონაცემები</p>
            </div>

            {/* Completion Status */}
            <div style={{
                padding: '16px 22px', marginBottom: '20px', borderRadius: '16px',
                background: isComplete
                    ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
                    : 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                border: `1px solid ${isComplete ? 'rgba(5,150,105,0.15)' : 'rgba(217,119,6,0.15)'}`,
                display: 'flex', alignItems: 'center', gap: '14px',
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: isComplete ? 'rgba(5,150,105,0.12)' : 'rgba(217,119,6,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    {isComplete
                        ? <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                        : <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
                    }
                </div>
                <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: isComplete ? 'var(--success)' : 'var(--warning)' }}>
                        {isComplete ? 'პროფილი შევსებულია ✓' : 'პროფილი არასრულია'}
                    </p>
                    <p style={{ fontSize: '13px', color: isComplete ? '#047857' : '#B45309', opacity: 0.85, marginTop: '2px' }}>
                        {isComplete
                            ? 'კლიენტებს შეუძლიათ თქვენი საბანკო მონაცემების ნახვა'
                            : 'შეავსეთ ყველა * ველი რომ კლიენტებმა ნახონ თქვენი მონაცემები'}
                    </p>
                </div>
            </div>

            {/* Saved Toast */}
            {saved && (
                <div style={{
                    padding: '10px 16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--success-light)', border: '1px solid rgba(5,150,105,0.15)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '16px', animation: 'fadeInUp 0.3s ease-out',
                    color: 'var(--success)', fontSize: '13px', fontWeight: 600
                }}>
                    <CheckCircle size={16} /> პროფილი წარმატებით შენახულია
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Personal Info */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'rgba(4,120,87,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <User size={16} style={{ color: 'var(--accent)' }} />
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>პირადი ინფორმაცია</h3>
                    </div>

                    <div className="grid-2">
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
                    <div className="grid-2">
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
                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: 'rgba(5,150,105,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CreditCard size={16} style={{ color: 'var(--success)' }} />
                            </div>
                            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>საბანკო მონაცემები</h3>
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
                    <div style={{
                        padding: '18px 20px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                        border: '1px solid rgba(4,120,87,0.1)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <Shield size={16} style={{ color: 'var(--accent)', marginTop: '1px', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-dark)', marginBottom: '3px' }}>ხილვადობის წესები</p>
                                <p style={{ fontSize: '11px', color: 'var(--accent)', lineHeight: 1.5, opacity: 0.8 }}>
                                    სახელი, გვარი და საბანკო რეკვიზიტები ხილულია კლიენტებისთვის. პირადი ნომერი და მისამართი მხოლოდ ადმინისტრაციას ეჩვენება.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving} style={{ gap: '8px' }}>
                    {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                    {saving ? 'ინახება...' : 'შენახვა'}
                </button>
            </div>
        </div>
    );
}
