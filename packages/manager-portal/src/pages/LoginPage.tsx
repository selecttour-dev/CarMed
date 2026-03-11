import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Phone, Lock, LogIn, Loader2, AlertCircle, Shield } from 'lucide-react';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(phone, password);
            navigate('/tasks');
        } catch (err: any) {
            setError(err.response?.data?.error || 'შეცდომა');
        } finally { setLoading(false); }
    };

    return (
        <div className="login-page" style={{ position: 'relative' }}>
            {/* Premium background decorations */}
            <div style={{
                position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
            }}>
                <div style={{
                    position: 'absolute', top: '-120px', right: '-100px',
                    width: '380px', height: '380px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-100px', left: '-80px',
                    width: '320px', height: '320px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(4,120,87,0.05) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', top: '30%', left: '20%',
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)',
                }} />
            </div>

            <div style={{
                width: '100%', maxWidth: '420px',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '24px',
                padding: '44px 40px',
                boxShadow: '0 20px 60px -15px rgba(0,0,0,0.1), 0 4px 20px -5px rgba(0,0,0,0.05)',
                position: 'relative',
                animation: 'scaleIn 0.3s ease-out',
            }}>
                {/* Logo + title */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <img src="/logo-carmed.png" alt="CarMed"
                        style={{ height: '44px', marginBottom: '14px' }} />
                    <p style={{ color: 'var(--ink-muted)', fontSize: '14px', fontWeight: 500 }}>მენეჯერის პორტალი</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #FEF2F2, #FFF5F5)',
                        border: '1px solid rgba(220,38,38,0.12)',
                        color: '#DC2626', fontSize: '13px', fontWeight: 500,
                        marginBottom: '20px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        animation: 'fadeInUp 0.2s ease-out',
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>ტელეფონი</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                width: 28, height: 28, borderRadius: 8,
                                background: 'rgba(4,120,87,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Phone size={13} style={{ color: '#047857' }} />
                            </div>
                            <input type="tel" className="form-input"
                                style={{
                                    paddingLeft: '52px', borderRadius: '12px',
                                    height: '48px', fontSize: '14px',
                                    border: '1.5px solid var(--surface-200)',
                                    transition: 'all 0.2s',
                                }}
                                placeholder="+995555000002" value={phone} onChange={(e) => setPhone(e.target.value)} required
                                onFocus={e => e.currentTarget.style.borderColor = '#047857'}
                                onBlur={e => e.currentTarget.style.borderColor = 'var(--surface-200)'}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>პაროლი</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                width: 28, height: 28, borderRadius: 8,
                                background: 'rgba(234,88,12,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Lock size={13} style={{ color: '#EA580C' }} />
                            </div>
                            <input type="password" className="form-input"
                                style={{
                                    paddingLeft: '52px', borderRadius: '12px',
                                    height: '48px', fontSize: '14px',
                                    border: '1.5px solid var(--surface-200)',
                                    transition: 'all 0.2s',
                                }}
                                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                                onFocus={e => e.currentTarget.style.borderColor = '#047857'}
                                onBlur={e => e.currentTarget.style.borderColor = 'var(--surface-200)'}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        style={{
                            width: '100%', height: '50px',
                            background: 'linear-gradient(135deg, #047857, #059669)',
                            color: 'white', border: 'none',
                            borderRadius: '14px',
                            fontSize: '15px', fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-sans)',
                            boxShadow: '0 4px 16px rgba(4,120,87,0.3)',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: loading ? 0.8 : 1,
                        }}
                        onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 6px 22px rgba(4,120,87,0.4)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 16px rgba(4,120,87,0.3)')}
                    >
                        {loading ? (
                            <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> იტვირთება...</>
                        ) : (
                            <><LogIn size={17} /> შესვლა</>
                        )}
                    </button>
                </form>

                {/* Security note */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    marginTop: '24px', fontSize: '11px', color: 'var(--ink-faint)',
                }}>
                    <Shield size={12} style={{ opacity: 0.5 }} />
                    <span>დაცული კავშირი</span>
                </div>

                <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '12px' }}>
                    © 2024 CarMed · Manager Portal
                </p>
            </div>
        </div>
    );
}
