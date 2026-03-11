import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Shield, Heart, Users, Target, ArrowRight, Lightbulb, Zap, Award } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-surface">
            <PublicNavbar />

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px]" />
                <div className="section-container relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                            <Heart size={14} className="text-emerald-600" />
                            <span className="text-emerald-700 text-[13px] font-semibold">ჩვენი ისტორია</span>
                        </div>
                        <h1 className="text-[2.8rem] sm:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight text-ink mb-6 text-balance">
                            ჩვენ ვცვლით თქვენს
                            <br />
                            <span className="gradient-text-emerald">ურთიერთობას ავტო-სერვისთან</span>
                        </h1>
                        <p className="text-ink-muted text-lg leading-relaxed max-w-2xl mx-auto">
                            CarMed დაარსდა ერთი მარტივი იდეით — ავტო-სერვისი უნდა იყოს ისეთივე
                            კომფორტული, როგორც საკვების შეკვეთა. არანაირი დამალული ხარჯი, არანაირი
                            არასაჭირო ვიზიტი სერვის-ცენტრში.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Mission & Vision ──────────────────────────────────────── */}
            <section className="py-20">
                <div className="section-container">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Mission */}
                        <div className="bg-white rounded-3xl p-10 border border-surface-100 hover:shadow-card transition-all duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                                <Target size={28} />
                            </div>
                            <h2 className="text-2xl font-bold text-ink mb-4">ჩვენი მისია</h2>
                            <p className="text-ink-muted leading-relaxed text-[15px]">
                                ვქმნით პლატფორმას, სადაც ავტომობილის მომსახურება ხდება უმტკივნეულო,
                                გამჭვირვალე და ხელმისაწვდომი. ჩვენ ვეხმარებით ადამიანებს დაზოგონ დრო
                                და ენერგია, საიმისოდ რომ არ იფიქრონ სად და როგორ შეაკეთონ მანქანა.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="bg-white rounded-3xl p-10 border border-surface-100 hover:shadow-card transition-all duration-300">
                            <div className="w-14 h-14 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center mb-6">
                                <Lightbulb size={28} />
                            </div>
                            <h2 className="text-2xl font-bold text-ink mb-4">ჩვენი ხედვა</h2>
                            <p className="text-ink-muted leading-relaxed text-[15px]">
                                ვხედავთ მომავალს, სადაც თქვენ აღარ აწუხებთ მანქანის შეკეთება. ერთი თითის
                                დაჭერით იძახებთ მენეჯერს, თვალყურს ადევნებთ პროცესს ტელეფონით,
                                და მანქანა ბრუნდება შეკეთებული — თქვენს კართან.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Core Values ───────────────────────────────────────────── */}
            <section className="py-20 bg-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.012]"
                    style={{ backgroundImage: 'radial-gradient(circle, #047857 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="section-container relative z-10">
                    <div className="text-center max-w-xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-5">
                            <span className="text-emerald-700 text-[12px] font-semibold uppercase tracking-wider">ღირებულებები</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mb-4">
                            რა გვაერთიანებს
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Shield size={24} />,
                                title: 'სანდოობა',
                                desc: 'ყოველი ტრანზაქცია დადასტურებულია, ყოველი მენეჯერი ვერიფიცირებულია. თქვენი ნდობა ჩვენი საფუძველია.',
                                color: 'emerald',
                            },
                            {
                                icon: <Zap size={24} />,
                                title: 'სისწრაფე',
                                desc: 'დროში შეზღუდული ადამიანებისთვის შექმნილი — ერთი შეკვეთა, მინიმალური ჩართულობა, მაქსიმალური შედეგი.',
                                color: 'terracotta',
                            },
                            {
                                icon: <Heart size={24} />,
                                title: 'ზრუნვა',
                                desc: 'ჩვენ ვეპყრობით თქვენს მანქანას ისე, როგორც ჩვენსას. ყოველი დეტალი მნიშვნელოვანია.',
                                color: 'emerald',
                            },
                            {
                                icon: <Users size={24} />,
                                title: 'პროფესიონალიზმი',
                                desc: 'CarMed მენეჯერები არიან გამოცდილი ავტო-ენთუზიასტები, რომლებიც ძალიან კარგად იცნობენ თავიანთ საქმეს.',
                                color: 'emerald',
                            },
                            {
                                icon: <Award size={24} />,
                                title: 'გამჭვირვალობა',
                                desc: 'დამალული საფასურების გარეშე. ინვოისი, ფასი, სტატუსი — ყველაფერი ხილული და გასაგებია.',
                                color: 'terracotta',
                            },
                            {
                                icon: <Lightbulb size={24} />,
                                title: 'ინოვაცია',
                                desc: 'მუდმივად ვაუმჯობესებთ პლატფორმას ახალი ტექნოლოგიებისა და უკუკავშირის საფუძველზე.',
                                color: 'emerald',
                            },
                        ].map((val, i) => (
                            <div key={i} className="group bg-surface-white rounded-3xl p-8 border border-surface-100 
                                     hover:shadow-card hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 ${val.color === 'terracotta'
                                        ? 'bg-terracotta-100 text-terracotta-700 group-hover:bg-terracotta-600 group-hover:text-white'
                                        : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white'
                                    }`}>
                                    {val.icon}
                                </div>
                                <h3 className="text-lg font-bold text-ink mb-2">{val.title}</h3>
                                <p className="text-ink-muted text-[14px] leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Team Intro ────────────────────────────────────────────── */}
            <section className="py-24">
                <div className="section-container">
                    <div className="bg-emerald-gradient rounded-3xl p-12 md:p-16 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight">
                                ჩვენი გუნდი
                            </h2>
                            <p className="text-white/70 text-lg leading-relaxed mb-10">
                                CarMed-ის უკან დგას ტექნოლოგიების მოყვარულთა და ავტო-ენთუზიასტების
                                გუნდი, რომლის მიზანია ავტო-სერვისის ინდუსტრიის სრული ტრანსფორმაცია.
                            </p>

                            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-10">
                                {[
                                    { value: '15+', label: 'გუნდის წევრი' },
                                    { value: '8+', label: 'მენეჯერი' },
                                    { value: '2+', label: 'წლის გამოცდილება' },
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <div className="text-2xl font-extrabold font-mono mb-1">{stat.value}</div>
                                        <div className="text-white/50 text-[13px]">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <Link to="/login" className="btn-cta !bg-white !text-emerald-800 hover:!bg-white/90 text-base">
                                შემოგვიერთდით
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
