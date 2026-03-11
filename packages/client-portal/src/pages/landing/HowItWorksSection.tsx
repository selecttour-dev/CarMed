import { Navigation, Search, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
    {
        step: '01',
        Icon: Navigation,
        title: 'გამოიძახეთ',
        desc: 'მიუთითეთ მისამართი და პრობლემა. პირადი მენეჯერი მოვა თქვენთან.',
        accent: false,
        detail: 'ონლაინ ფორმა',
    },
    {
        step: '02',
        Icon: Search,
        title: 'დიაგნოსტიკა',
        desc: 'მენეჯერი წაიყვანს მანქანას სერტიფიცირებულ ცენტრში სრულ შემოწმებაზე.',
        accent: false,
        detail: 'პროფ. აღჭურვილობა',
    },
    {
        step: '03',
        Icon: CreditCard,
        title: 'ინვოისი & გადახდა',
        desc: 'დეტალური ინვოისი ყველა ხარჯით. კროს-ვერიფიკაცია გამჭვირვალობისთვის.',
        accent: false,
        detail: 'ორმხრივი ვერიფიკაცია',
    },
    {
        step: '04',
        Icon: CheckCircle2,
        title: 'ჩაბარება',
        desc: 'მანქანა დაგიბრუნდებათ ადგილზე — შეკეთებული, გარანტიით.',
        accent: true,
        detail: 'სრული გარანტია',
    },
];

export default function HowItWorksSection() {
    return (
        <section className="py-28 relative overflow-hidden">
            {/* Subtle background */}
            <div className="absolute inset-0 opacity-[0.015]"
                style={{ backgroundImage: 'radial-gradient(circle, #047857 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="section-container relative z-10">
                {/* Header */}
                <div className="max-w-2xl mb-16">
                    <p className="text-emerald-700 text-[12px] font-bold uppercase tracking-[0.2em] mb-4">როგორ მუშაობს</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mb-5">
                        4 ნაბიჯი —
                        <br />
                        <span className="gradient-text-emerald">მეტი აღარაფერი.</span>
                    </h2>
                    <p className="text-ink-muted text-[16px] leading-relaxed max-w-lg">
                        თქვენ ცხოვრობთ ჩვეულ ტემპში, ჩვენ ვზრუნავთ ავტომობილზე. სრული პროცესი — ერთი ზარით.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {steps.map((item, i) => (
                        <div key={i} className="group relative">
                            <div className={`rounded-3xl p-7 border transition-all duration-300 h-full
                hover:shadow-card hover:-translate-y-1 relative overflow-hidden ${item.accent
                                    ? 'bg-ink text-white border-ink'
                                    : 'bg-white border-surface-100 hover:border-emerald-200'
                                }`}>
                                {/* Background accent for last card */}
                                {item.accent && (
                                    <>
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-terracotta-500/8 rounded-full translate-y-1/2 -translate-x-1/4" />
                                    </>
                                )}

                                <div className="relative z-10">
                                    {/* Step number */}
                                    <div className="flex items-center justify-between mb-6">
                                        <span className={`font-mono text-[13px] font-bold tracking-wider ${item.accent ? 'text-emerald-400' : 'text-emerald-600'
                                            }`}>{item.step}</span>
                                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${item.accent
                                            ? 'text-emerald-300 bg-white/10'
                                            : 'text-ink-faint bg-surface-50'
                                            }`}>{item.detail}</span>
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${item.accent
                                        ? 'bg-white/10 text-white'
                                        : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white'
                                        }`}>
                                        <item.Icon size={22} />
                                    </div>

                                    {/* Text */}
                                    <h3 className={`text-[18px] font-bold mb-2.5 ${item.accent ? 'text-white' : 'text-ink'}`}>
                                        {item.title}
                                    </h3>
                                    <p className={`text-[14px] leading-relaxed ${item.accent ? 'text-white/50' : 'text-ink-muted'}`}>
                                        {item.desc}
                                    </p>

                                    {/* Arrow on last card */}
                                    {item.accent && (
                                        <div className="mt-6 flex items-center gap-2 text-emerald-400 text-[13px] font-semibold">
                                            <span>დაიწყეთ ახლავე</span>
                                            <ArrowRight size={14} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
