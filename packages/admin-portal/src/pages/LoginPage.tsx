import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

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
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'შეცდომა');
        } finally { setLoading(false); }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <img src="/logo-carmed.png" alt="CarMed" style={{ height: '48px', objectFit: 'contain', marginBottom: '8px' }} />
                    <p>ადმინ პანელი</p>
                </div>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">ტელეფონი</label>
                        <input type="tel" className="form-input" placeholder="+995555000001" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">პაროლი</label>
                        <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                        {loading ? 'იტვირთება...' : 'შესვლა'}
                    </button>
                </form>
            </div>
        </div>
    );
}
