import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDownRight, Navigation, Star, Car, Zap, Shield, UserCheck } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] right-[-10%] w-[900px] h-[900px] bg-emerald-200/20 rounded-full blur-[160px] animate-pulse-soft" />
                <div className="absolute bottom-[-15%] left-[-5%] w-[600px] h-[600px] bg-terracotta-100/15 rounded-full blur-[130px]" />
                <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-emerald-300/8 rounded-full blur-[90px] animate-float" />
                <div className="absolute inset-0 opacity-[0.012]"
                    style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 28px, #047857 28px, #047857 29px)`, backgroundSize: '30px 30px' }} />
                <div className="absolute inset-0 opacity-[0.012]"
                    style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 28px, #047857 28px, #047857 29px)`, backgroundSize: '30px 30px' }} />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface to-transparent" />
            </div>

            <div className="section-container relative z-10 pt-32 pb-24">
                <div className="grid lg:grid-cols-12 gap-10 xl:gap-16 items-center">
                    {/* Left — 6 cols */}
                    <div className="lg:col-span-6 animate-fade-in-up">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-emerald-100/60 shadow-soft mb-10">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
                            </div>
                            <span className="text-emerald-800 text-[13px] font-semibold tracking-wide">პრემიუმ ავტო-კონსიერჟი</span>
                        </div>

                        <h1 className="text-[2.8rem] sm:text-[3.6rem] lg:text-[4rem] xl:text-[4.8rem] font-extrabold leading-[0.95] tracking-[-0.035em] text-ink mb-7">
                            თქვენი პირადი
                            <br />
                            <span className="gradient-text-emerald">ავტო-კონსიერჟი.</span>
                        </h1>

                        <p className="text-ink-muted text-[17px] sm:text-lg leading-relaxed max-w-lg mb-12">
                            სერტიფიცირებული მენეჯერი მოვა თქვენთან, წაიყვანს მანქანას
                            და უზრუნველყოფს სრულ ციკლს — დიაგნოსტიკიდან ჩაბარებამდე.
                            <span className="font-semibold text-ink"> გამჭვირვალედ და ₾50,000-მდე დაზღვევით.</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-5 mb-14">
                            <Link to="/login" className="group inline-flex items-center gap-3 px-9 py-[18px] bg-terracotta-600 text-white 
                font-semibold text-[16px] rounded-2xl transition-all duration-300 ease-out
                hover:bg-terracotta-700 hover:shadow-glow-terracotta hover:-translate-y-0.5
                active:translate-y-0 shadow-lg shadow-terracotta-600/20">
                                <Navigation size={18} />
                                გამოიძახეთ მენეჯერი
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/about" className="inline-flex items-center gap-2 px-7 py-[18px] bg-white text-ink font-medium 
                text-[15px] rounded-2xl border border-surface-200 transition-all duration-200
                hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-700 shadow-soft">
                                როგორ მუშაობს
                                <ArrowDownRight size={16} />
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
                            {[
                                { value: '1,200+', label: 'შეკეთებული ავტო', Icon: Car },
                                { value: '98%', label: 'კმაყოფილება', Icon: Star },
                                { value: '24/7', label: 'მხარდაჭერა', Icon: Zap },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-surface-100 shadow-soft flex items-center justify-center">
                                        <stat.Icon size={16} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-ink text-[16px] font-mono tracking-tight leading-tight">{stat.value}</p>
                                        <p className="text-ink-faint text-[11px] uppercase tracking-wider font-semibold">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — 6 cols — Photo */}
                    <div className="lg:col-span-6 relative hidden lg:block">
                        <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <div className="relative rounded-[2rem] overflow-hidden shadow-elevated aspect-[3/4] max-h-[600px] group">
                                <img
                                    src="/hero-concierge.png"
                                    alt="CarMed მენეჯერი გადასცემს გასაღებს კლიენტს პრემიუმ ლოკაციაზე"
                                    className="w-full h-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-7">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5">CarMed კონსიერჟი</p>
                                            <p className="text-white text-[18px] font-bold leading-snug">
                                                პირადი მენეჯერი,
                                                <span className="text-emerald-300"> რომელსაც ენდობით.</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/10">
                                            <Star size={12} className="text-terracotta-400 fill-terracotta-400" />
                                            <span className="text-white text-[13px] font-bold">4.9</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating #1 — top-right */}
                            <div className="absolute -top-4 -right-5 bg-white rounded-2xl shadow-elevated py-3 px-4 animate-float z-20 border border-surface-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <UserCheck size={14} className="text-emerald-700" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-ink">სერტიფიცირებული მენეჯერი</p>
                                        <p className="text-[10px] text-ink-muted">ვერიფიცირებული გამოცდილება</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating #2 — bottom-left */}
                            <div className="absolute -bottom-4 -left-5 bg-white rounded-2xl shadow-elevated py-3 px-4 animate-float z-20 border border-surface-100"
                                style={{ animationDelay: '2s' }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-terracotta-100 flex items-center justify-center">
                                        <Shield size={14} className="text-terracotta-700" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-ink">დაზღვეული ₾50,000-მდე</p>
                                        <p className="text-[10px] text-ink-muted">საგარანტიო ფონდი</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
