import { useState } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate sending
        setTimeout(() => {
            setSent(true);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-surface">
            <PublicNavbar />

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-emerald-100/25 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-terracotta-100/15 rounded-full blur-[90px]" />

                <div className="section-container relative z-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                            <MessageCircle size={14} className="text-emerald-600" />
                            <span className="text-emerald-700 text-[13px] font-semibold">დაგვიკავშირდით</span>
                        </div>
                        <h1 className="text-[2.5rem] sm:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight text-ink mb-5 text-balance">
                            ჩვენ ყოველთვის
                            <br />
                            <span className="gradient-text-emerald">ხელმისაწვდომი ვართ</span>
                        </h1>
                        <p className="text-ink-muted text-lg leading-relaxed max-w-xl mx-auto">
                            გაქვთ შეკითხვა ან გჭირდებათ დახმარება? დაგვიკავშირდით ნებისმიერი გზით —
                            ჩვენი გუნდი მზადაა პასუხისთვის.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Contact Cards + Form ──────────────────────────────────── */}
            <section className="pb-28">
                <div className="section-container">
                    {/* Contact Info Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
                        {[
                            {
                                Icon: Phone,
                                title: 'ტელეფონი',
                                value: '+995 555 123 456',
                                sub: 'ყოველდღე, 09:00 — 21:00',
                                color: 'emerald',
                            },
                            {
                                Icon: Mail,
                                title: 'ელ-ფოსტა',
                                value: 'info@carmed.ge',
                                sub: 'წერეთ ნებისმიერ დროს',
                                color: 'emerald',
                            },
                            {
                                Icon: MapPin,
                                title: 'მისამართი',
                                value: 'თბილისი, საქართველო',
                                sub: 'ვაჟა-ფშაველას გამზ. #12',
                                color: 'terracotta',
                            },
                            {
                                Icon: Clock,
                                title: 'სამუშაო საათები',
                                value: 'ორშ — შაბ',
                                sub: '09:00 — 21:00',
                                color: 'emerald',
                            },
                        ].map((card, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-surface-100 p-6 
                hover:shadow-card hover:-translate-y-1 transition-all duration-300 group">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${card.color === 'terracotta'
                                    ? 'bg-terracotta-100 text-terracotta-700 group-hover:bg-terracotta-600 group-hover:text-white'
                                    : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white'
                                    }`}>
                                    <card.Icon size={20} />
                                </div>
                                <p className="text-ink-faint text-[11px] font-semibold uppercase tracking-wider mb-1.5">{card.title}</p>
                                <p className="font-bold text-ink text-[15px] mb-0.5">{card.value}</p>
                                <p className="text-ink-muted text-[13px]">{card.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Form + Map Area */}
                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Form — 3 cols */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl border border-surface-100 shadow-soft p-8 sm:p-10">
                                <h2 className="text-xl font-bold text-ink mb-1">მოგვწერეთ</h2>
                                <p className="text-ink-muted text-[14px] mb-8">შეავსეთ ფორმა და ჩვენ გიპასუხებთ უმოკლეს ვადაში</p>

                                {sent ? (
                                    <div className="py-12 text-center animate-fade-in">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                                            <CheckCircle2 size={32} className="text-emerald-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-ink mb-2">გაგზავნილია!</h3>
                                        <p className="text-ink-muted text-[15px] max-w-sm mx-auto">
                                            მადლობა მოგვწერეთ. ჩვენ გიპასუხებთ 24 საათის განმავლობაში.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider block mb-2">სახელი</label>
                                                <input className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-ink text-[14px]
                          placeholder:text-ink-faint outline-none transition-all duration-200
                          focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white"
                                                    placeholder="თქვენი სახელი"
                                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider block mb-2">ტელეფონი</label>
                                                <input type="tel" className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-ink text-[14px]
                          placeholder:text-ink-faint outline-none transition-all duration-200 font-mono
                          focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white"
                                                    placeholder="+995 555 000 000"
                                                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider block mb-2">ელ-ფოსტა</label>
                                            <input type="email" className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-ink text-[14px]
                        placeholder:text-ink-faint outline-none transition-all duration-200
                        focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white"
                                                placeholder="email@example.com"
                                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider block mb-2">შეტყობინება</label>
                                            <textarea className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-ink text-[14px]
                        placeholder:text-ink-faint outline-none transition-all duration-200 min-h-[140px] resize-y
                        focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white"
                                                placeholder="როგორ შეგვიძლია დაგეხმაროთ?"
                                                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                                        </div>
                                        <button type="submit" disabled={loading}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5
                        bg-terracotta-600 text-white font-semibold text-[15px] rounded-2xl transition-all duration-300
                        hover:bg-terracotta-700 hover:shadow-glow-terracotta hover:-translate-y-0.5
                        disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-terracotta-600/15">
                                            {loading ? (
                                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> იგზავნება...</>
                                            ) : (
                                                <><Send size={16} /> გაგზავნა</>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Right Column — Map + FAQ */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Map placeholder */}
                            <div className="bg-white rounded-3xl border border-surface-100 overflow-hidden shadow-soft">
                                <div className="h-[240px] bg-emerald-950 relative overflow-hidden">
                                    {/* Stylized map placeholder */}
                                    <div className="absolute inset-0 opacity-20"
                                        style={{ backgroundImage: 'radial-gradient(circle, #10B981 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-xl bg-terracotta-600 shadow-lg flex items-center justify-center mx-auto mb-3">
                                                <MapPin size={22} className="text-white" />
                                            </div>
                                            <p className="text-white/80 text-[14px] font-semibold">CarMed HQ</p>
                                            <p className="text-white/40 text-[12px]">თბილისი, საქართველო</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <p className="text-[14px] font-semibold text-ink mb-1">ოფისი</p>
                                    <p className="text-ink-muted text-[13px]">ვაჟა-ფშაველას გამზ. #12, თბილისი 0186</p>
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="bg-white rounded-3xl border border-surface-100 p-6 shadow-soft">
                                <h3 className="font-bold text-ink text-[15px] mb-5">ხშირი კითხვები</h3>
                                <div className="space-y-4">
                                    {[
                                        { q: 'რა ღირს სერვისი?', a: 'ფასი დამოკიდებულია კონკრეტულ პრობლემაზე. დიაგნოსტიკის შემდეგ მიიღებთ ინვოისს დეტალური ფასებით.' },
                                        { q: 'რომელ რეგიონებში მუშაობთ?', a: 'ამ ეტაპზე მხოლოდ თბილისში, მალე სხვა ქალაქებშიც.' },
                                        { q: 'როგორ ვენდო მენეჯერს?', a: 'ყველა მენეჯერი ვერიფიცირებულია, აქვს საგარანტიო ფონდი და კროს-ვერიფიკაციის სისტემა.' },
                                    ].map((faq, i) => (
                                        <div key={i} className="pb-4 border-b border-surface-100 last:border-0 last:pb-0">
                                            <p className="font-semibold text-ink text-[14px] mb-1">{faq.q}</p>
                                            <p className="text-ink-muted text-[13px] leading-relaxed">{faq.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
