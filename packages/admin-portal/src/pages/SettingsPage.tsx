import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Settings, Users, Clock, Percent, ToggleLeft, ToggleRight, Loader2, Save, Check } from 'lucide-react';

interface ManagerProfile {
    userId: string;
    userName: string;
    companyFeePercent: number;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [managers, setManagers] = useState<ManagerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);

    // Editable fields
    const [editWindowHours, setEditWindowHours] = useState('2');
    const [defaultFeePercent, setDefaultFeePercent] = useState('20');
    const [managerFees, setManagerFees] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [settingsRes, usersRes] = await Promise.all([
                api.get('/admin/settings'),
                api.get('/admin/users'),
            ]);
            const s = settingsRes.data.data;
            setSettings(s);
            setEditWindowHours(s.INVOICE_EDIT_WINDOW_HOURS || '2');
            setDefaultFeePercent(s.DEFAULT_COMPANY_FEE_PERCENT || '20');

            // Extract managers with profiles
            const allUsers = usersRes.data.data || [];
            const mgrs = allUsers
                .filter((u: any) => u.role === 'MANAGER' && u.managerProfile)
                .map((u: any) => ({
                    userId: u.id,
                    userName: u.name,
                    companyFeePercent: u.managerProfile.companyFeePercent ?? 20,
                }));
            setManagers(mgrs);
            const fees: Record<string, string> = {};
            mgrs.forEach((m: ManagerProfile) => { fees[m.userId] = String(m.companyFeePercent); });
            setManagerFees(fees);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const saveSetting = async (key: string, value: string) => {
        setSaving(key);
        try {
            await api.put('/admin/settings', { key, value });
            setSaved(key);
            setTimeout(() => setSaved(null), 2000);
        } catch (e) { console.error(e); }
        finally { setSaving(null); }
    };

    const toggleSetting = async (key: string) => {
        const newValue = settings[key] === 'true' ? 'false' : 'true';
        await saveSetting(key, newValue);
        setSettings({ ...settings, [key]: newValue });
    };

    const saveManagerFee = async (userId: string) => {
        const val = parseFloat(managerFees[userId]);
        if (isNaN(val) || val < 0 || val > 100) return;
        setSaving(`fee-${userId}`);
        try {
            await api.put(`/admin/managers/${userId}/fee`, { companyFeePercent: val });
            setManagers(prev => prev.map(m => m.userId === userId ? { ...m, companyFeePercent: val } : m));
            setSaved(`fee-${userId}`);
            setTimeout(() => setSaved(null), 2000);
        } catch (e) { console.error(e); }
        finally { setSaving(null); }
    };

    const isManagerSelectionEnabled = settings.allowClientManagerSelection === 'true';

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.25rem' }}>
                    <Settings size={22} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    სისტემის პარამეტრები
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>მართეთ სისტემის ფუნქციები, ვადები და ფინანსური პარამეტრები</p>
            </div>

            {/* ── Section 1: Invoice Edit Window ── */}
            <div style={{
                background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0',
                marginBottom: '1.5rem', overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc'
                }}>
                    <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ⏱️ ინვოისის რედაქტირების ვადა
                    </h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{
                            width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                            background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Clock size={18} style={{ color: '#2563EB' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                                რედაქტირების ფანჯარა (საათებში)
                            </h3>
                            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                                მენეჯერს ინვოისის შექმნიდან ამ დროის განმავლობაში შეუძლია რედაქტირება.
                                ამის შემდეგ უნდა გაგზავნოს კორექციის მოთხოვნა. მაგ: 0.1 = ~6 წუთი, 2 = 2 საათი.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={editWindowHours}
                                    onChange={(e) => setEditWindowHours(e.target.value)}
                                    style={{
                                        width: '100px', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                        border: '1px solid #e2e8f0', fontSize: '0.9375rem', fontWeight: 600,
                                        fontFamily: 'var(--font-mono)',
                                    }}
                                />
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>საათი</span>
                                <button
                                    onClick={() => saveSetting('INVOICE_EDIT_WINDOW_HOURS', editWindowHours)}
                                    disabled={saving === 'INVOICE_EDIT_WINDOW_HOURS'}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
                                        background: saved === 'INVOICE_EDIT_WINDOW_HOURS' ? '#059669' : '#2563EB',
                                        color: 'white', fontSize: '0.8125rem', fontWeight: 600,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    {saving === 'INVOICE_EDIT_WINDOW_HOURS' ? (
                                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                    ) : saved === 'INVOICE_EDIT_WINDOW_HOURS' ? (
                                        <><Check size={14} /> შენახულია</>
                                    ) : (
                                        <><Save size={14} /> შენახვა</>
                                    )}
                                </button>
                            </div>
                            <div style={{
                                marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8',
                                fontFamily: 'var(--font-mono)',
                            }}>
                                = {(parseFloat(editWindowHours) * 60).toFixed(0)} წუთი
                                ({(parseFloat(editWindowHours) * 3600).toFixed(0)} წამი)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 2: Manager Selection Toggle ── */}
            <div style={{
                background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0',
                marginBottom: '1.5rem', overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc'
                }}>
                    <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        შეკვეთის პარამეტრები
                    </h2>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                        <div style={{
                            width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                            background: isManagerSelectionEnabled ? '#ecfdf5' : '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Users size={18} style={{ color: isManagerSelectionEnabled ? '#059669' : '#94a3b8' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                                კლიენტის მიერ მენეჯერის არჩევა
                            </h3>
                            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                ჩართული: კლიენტი ირჩევს მენეჯერს. გამორთული: ადმინი ნიშნავს მენეჯერს.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleSetting('allowClientManagerSelection')}
                        disabled={!!saving}
                        style={{
                            background: 'none', border: 'none',
                            cursor: saving ? 'wait' : 'pointer', padding: 0, flexShrink: 0,
                            opacity: saving ? 0.5 : 1, transition: 'opacity 0.2s'
                        }}
                    >
                        {isManagerSelectionEnabled
                            ? <ToggleRight size={40} style={{ color: '#059669' }} />
                            : <ToggleLeft size={40} style={{ color: '#cbd5e1' }} />
                        }
                    </button>
                </div>
            </div>

            {/* ── Section 3: Manager Fee Percentages ── */}
            <div style={{
                background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc'
                }}>
                    <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        მენეჯერის კომპანიის % (კლიენტის ჯამიდან)
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        მენეჯერი ვალდებულია კლიენტის ჯამი ფასის ეს % კომპანიას ჩაურიცხოს. ნაგულისხმევი: {defaultFeePercent}%
                    </p>
                </div>

                {/* Default fee */}
                <div style={{
                    padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FFFBEB',
                }}>
                    <Percent size={16} style={{ color: '#D97706' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400E' }}>ნაგულისხმევი %:</span>
                    <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={defaultFeePercent}
                        onChange={(e) => setDefaultFeePercent(e.target.value)}
                        style={{
                            width: '70px', padding: '0.375rem 0.5rem', borderRadius: '0.375rem',
                            border: '1px solid #FDE68A', fontSize: '0.875rem', fontWeight: 600,
                            fontFamily: 'var(--font-mono)', textAlign: 'center',
                        }}
                    />
                    <span style={{ fontSize: '0.8125rem', color: '#92400E' }}>%</span>
                    <button
                        onClick={() => saveSetting('DEFAULT_COMPANY_FEE_PERCENT', defaultFeePercent)}
                        disabled={saving === 'DEFAULT_COMPANY_FEE_PERCENT'}
                        style={{
                            padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: 'none',
                            background: saved === 'DEFAULT_COMPANY_FEE_PERCENT' ? '#059669' : '#D97706',
                            color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                        }}
                    >
                        {saved === 'DEFAULT_COMPANY_FEE_PERCENT' ? <><Check size={12} /> OK</> : <><Save size={12} /> შენახვა</>}
                    </button>
                </div>

                {/* Per-manager fees */}
                <div style={{ padding: '0' }}>
                    {managers.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                            მენეჯერები არ მოიძებნა
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                        მენეჯერი
                                    </th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                        მიმდინარე %
                                    </th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                        ახალი %
                                    </th>
                                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {managers.map(m => (
                                    <tr key={m.userId} style={{ borderBottom: '1px solid #f9fafb' }}>
                                        <td style={{ padding: '0.75rem 1.5rem' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{m.userName}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                            <span style={{
                                                fontSize: '0.875rem', fontWeight: 700,
                                                fontFamily: 'var(--font-mono)',
                                                padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                                                background: '#F0F4F2', color: '#047857',
                                            }}>
                                                {m.companyFeePercent}%
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                step="1"
                                                min="0"
                                                max="100"
                                                value={managerFees[m.userId] || ''}
                                                onChange={(e) => setManagerFees({ ...managerFees, [m.userId]: e.target.value })}
                                                style={{
                                                    width: '60px', padding: '0.375rem 0.5rem', borderRadius: '0.375rem',
                                                    border: '1px solid #e2e8f0', fontSize: '0.875rem', fontWeight: 600,
                                                    fontFamily: 'var(--font-mono)', textAlign: 'center',
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => saveManagerFee(m.userId)}
                                                disabled={saving === `fee-${m.userId}` || managerFees[m.userId] === String(m.companyFeePercent)}
                                                style={{
                                                    padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: 'none',
                                                    background: saved === `fee-${m.userId}` ? '#059669' : managerFees[m.userId] !== String(m.companyFeePercent) ? '#2563EB' : '#e2e8f0',
                                                    color: managerFees[m.userId] !== String(m.companyFeePercent) || saved === `fee-${m.userId}` ? 'white' : '#94a3b8',
                                                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                    marginLeft: 'auto',
                                                }}
                                            >
                                                {saved === `fee-${m.userId}` ? <><Check size={12} /> OK</> : <><Save size={12} /> შენახვა</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Example explanation */}
                <div style={{
                    padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', background: '#F0FDF4',
                    fontSize: '0.8125rem', color: '#166534', lineHeight: 1.6,
                }}>
                    <strong>მაგალითი:</strong> კლიენტი გადაიხდის ₾1000-ს, ნაწილების ნეტო ფასი არის ₾500.
                    კომპანიის წილი (20%) = ₾200. მენეჯერის მოგება = ₾1000 - ₾500 - ₾200 = ₾300.
                </div>
            </div>
        </div>
    );
}
