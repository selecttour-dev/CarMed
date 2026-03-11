import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Eye, EyeOff, Shield, CheckCircle2, Smartphone, Lock, User } from 'lucide-react';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            if (isRegister) { await register(name, phone, password); }
            else { await login(phone, password); }
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'შეცდომა, სცადეთ ხელახლა');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* ═══ Left Panel ═══ */}
            <div className="hidden lg:flex lg:w-[48%] relative bg-ink overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                <div className="absolute inset-0">
                    <img src="/hero-concierge.png" alt="" className="w-full h-full object-cover object-top opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-ink/90" />
                </div>

                <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
                    <div>
                        <Link to="/" className="group inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-16">
                            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[13px] font-medium">მთავარზე დაბრუნება</span>
                        </Link>

                        <img src="/logo-carmed.png" alt="CarMed" className="h-10 w-auto brightness-0 invert mb-12" />

                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight mb-5 font-display">
                            თქვენი პირადი<br />
                            <span className="text-emerald-400">ავტო-კონსიერჟი.</span>
                        </h2>
                        <p className="text-white/40 text-[15px] leading-relaxed max-w-sm">
                            შედით ანგარიშში ან შექმენით ახალი, რომ მართოთ სერვისები და თვალყური ადევნოთ პროცესს.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { Icon: Shield, text: 'დაზღვეული სერვისი ₾50,000-მდე' },
                            { Icon: CheckCircle2, text: 'სერტიფიცირებული მენეჯერები' },
                            { Icon: Smartphone, text: 'რეალ-ტაიმ სტატუს ტრეკინგი' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
                                    <item.Icon size={14} className="text-emerald-400" />
                                </div>
                                <span className="text-white/40 text-[13px] font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Right Panel — Form ═══ */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-surface relative">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-terracotta-100/15 rounded-full blur-[80px]" />

                <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
                    {/* Mobile top */}
                    <div className="lg:hidden mb-8">
                        <Link to="/" className="group inline-flex items-center gap-2 text-ink-muted hover:text-ink transition-colors mb-6">
                            <ArrowLeft size={16} />
                            <span className="text-[14px] font-medium">უკან</span>
                        </Link>
                        <img src="/logo-carmed.png" alt="CarMed" className="h-9 w-auto" />
                    </div>

                    {/* Form card */}
                    <div className="card-elevated p-9 sm:p-11">
                        {/* Header */}
                        <div className="text-center mb-9">
                            <div className="w-14 h-14 rounded-[16px] bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
                                {isRegister
                                    ? <User size={24} className="text-emerald-700" />
                                    : <Lock size={24} className="text-emerald-700" />}
                            </div>
                            <h3 className="text-[22px] font-bold text-ink mb-1.5 font-display">
                                {isRegister ? 'შექმენით ანგარიში' : 'შესვლა'}
                            </h3>
                            <p className="text-ink-muted text-[14px]">
                                {isRegister ? 'შეავსეთ ინფორმაცია რეგისტრაციისთვის' : 'გამოიყენეთ ტელეფონი და პაროლი'}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-[12px] px-4 py-3 text-[13px] font-medium mb-6 animate-fade-in flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isRegister && (
                                <div>
                                    <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-2">სახელი</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                                        <input type="text" className="input pl-10 text-[15px] py-3.5"
                                            placeholder="გიორგი მახარაძე" value={name}
                                            onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-2">ტელეფონის ნომერი</label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none pl-4">
                                        <span className="flex items-center gap-1.5 text-[14px] text-ink-muted font-medium pr-3 border-r border-surface-200">
                                            GE +995
                                        </span>
                                    </div>
                                    <input type="tel"
                                        className="input pl-[100px] text-[15px] py-3.5 font-mono tracking-wide"
                                        placeholder="555 000 010" value={phone}
                                        onChange={(e) => setPhone(e.target.value)} required />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-2">პაროლი</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                                    <input type={showPassword ? 'text' : 'password'}
                                        className="input pl-10 pr-12 text-[15px] py-3.5"
                                        placeholder="••••••••" value={password}
                                        onChange={(e) => setPassword(e.target.value)} required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-[10px] text-ink-faint hover:text-ink-muted
                                        hover:bg-surface-100 transition-all">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full btn-dark py-4 mt-2 text-[15px]">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        იტვირთება...
                                    </>
                                ) : isRegister ? 'რეგისტრაცია' : 'შესვლა'}
                            </button>
                        </form>

                        {/* Switch mode */}
                        <div className="text-center mt-7">
                            <span className="text-ink-faint text-[13px]">
                                {isRegister ? 'უკვე გაქვთ ანგარიში?' : 'არ გაქვთ ანგარიში?'}{' '}
                            </span>
                            <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                className="text-[13px] text-emerald-700 hover:text-emerald-800 font-semibold transition-colors hover:underline">
                                {isRegister ? 'შესვლა' : 'რეგისტრაცია'}
                            </button>
                        </div>
                    </div>

                    {/* Bottom trust */}
                    <p className="text-center text-ink-faint text-[12px] mt-6">
                        შესვლით თანხმდებით ჩვენს{' '}
                        <a href="#" className="text-emerald-700 hover:underline">წესებსა და პირობებს</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
