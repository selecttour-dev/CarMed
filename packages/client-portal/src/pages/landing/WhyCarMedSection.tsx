import { Shield, Eye, CheckCircle2, Star, Smartphone } from 'lucide-react';

export default function WhyCarMedSection() {
    return (
        <section className="py-28 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.015]"
                style={{ backgroundImage: 'radial-gradient(circle, #047857 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="section-container relative z-10">
                {/* Header */}
                <div className="max-w-2xl mb-14">
                    <p className="text-emerald-700 text-[12px] font-bold uppercase tracking-[0.2em] mb-4">რატომ ჩვენ</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mb-5">
                        საიმედო სერვისი
                        <br />
                        <span className="gradient-text-emerald">ნდობას ეფუძნება.</span>
                    </h2>
                </div>

                {/* 2x2 Feature Grid */}
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                    {[
                        {
                            Icon: Shield,
                            title: 'საგარანტიო ფონდი ₾50,000-მდე',
                            desc: 'ყველა მენეჯერს აქვს საგარანტიო ფონდი — თქვენი ავტომობილი დაცულია ნებისმიერი გაუთვალისწინებელი შემთხვევისგან.',
                            dark: true,
                        },
                        {
                            Icon: Eye,
                            title: 'კროს-ვერიფიკაცია',
                            desc: 'გადახდა ვერიფიცირდება ორმხრივად — კლიენტი და მენეჯერი ორივე ადასტურებს. არანაირი ბუნდოვანი ხარჯი.',
                            dark: false,
                        },
                        {
                            Icon: Smartphone,
                            title: 'რეალ-ტაიმ ტრეკინგი',
                            desc: 'თვალყური ადევნეთ თქვენი მანქანის სტატუსს ტელეფონიდან — ნებისმიერ დროს, ნებისმიერი ადგილიდან.',
                            dark: false,
                        },
                        {
                            Icon: CheckCircle2,
                            title: 'გარანტია სამუშაოზე & ნაწილებზე',
                            desc: 'შეცვლილ ნაწილებსა და შესრულებულ სამუშაოზე მოქმედებს სრული გარანტია. თქვენი სიმშვიდე — ჩვენი პასუხისმგებლობა.',
                            dark: true,
                        },
                    ].map((card, i) => (
                        <div key={i} className={`rounded-3xl p-8 sm:p-9 transition-all duration-300 group relative overflow-hidden ${card.dark
                            ? 'bg-ink text-white'
                            : 'bg-white border border-surface-100 hover:shadow-card hover:-translate-y-1'
                            }`}>
                            {card.dark && (
                                <>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -translate-y-1/3 translate-x-1/4" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-terracotta-500/6 rounded-full translate-y-1/3 -translate-x-1/4" />
                                </>
                            )}
                            <div className="relative z-10">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${card.dark
                                    ? 'bg-white/10 text-emerald-400'
                                    : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white'
                                    }`}>
                                    <card.Icon size={20} />
                                </div>
                                <h3 className={`text-[18px] font-bold mb-3 ${card.dark ? 'text-white' : 'text-ink'}`}>
                                    {card.title}
                                </h3>
                                <p className={`text-[14px] leading-relaxed ${card.dark ? 'text-white/40' : 'text-ink-muted'}`}>
                                    {card.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Testimonial Strip — quote only, no stats */}
                <div className="bg-emerald-950 rounded-3xl p-8 sm:p-10 sm:px-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'linear-gradient(135deg, #047857 0%, transparent 50%)' }} />
                    <div className="relative z-10">
                        <div className="flex items-center gap-0.5 mb-5">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="text-terracotta-400 fill-terracotta-400" />)}
                        </div>
                        <p className="text-white/60 text-[17px] sm:text-[20px] leading-relaxed italic max-w-2xl mb-7">
                            "მანქანა სახლიდან წაიყვანეს, შეაკეთეს და მეორე დღეს უკან დამიბრუნეს.
                            ინვოისი გამჭვირვალე იყო, ფასიც — სამართლიანი."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[12px] font-bold">
                                ნ.შ
                            </div>
                            <div>
                                <p className="text-white text-[14px] font-semibold">ნინო შ.</p>
                                <p className="text-white/30 text-[12px]">Mercedes C200 — ვაკე, თბილისი</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
