import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Car } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="py-28">
            <div className="section-container">
                <div className="bg-ink rounded-[2.5rem] relative overflow-hidden">
                    {/* Background */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/8 rounded-full -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-terracotta-500/6 rounded-full translate-y-1/2 -translate-x-1/4" />
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: 'linear-gradient(135deg, #047857 0%, transparent 50%)' }} />
                    <div className="absolute inset-0 opacity-[0.02]"
                        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    <div className="relative z-10 px-10 sm:px-16 lg:px-20 py-16 sm:py-20">
                        <div className="max-w-2xl mx-auto text-center">
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-7">
                                <Car size={26} className="text-emerald-400" />
                            </div>

                            {/* Headline */}
                            <h2 className="text-3xl sm:text-4xl lg:text-[3.2rem] font-extrabold text-white tracking-tight leading-[1.05] mb-5">
                                მზად ხართ
                                <span className="text-emerald-400"> დაიწყოთ?</span>
                            </h2>
                            <p className="text-white/40 text-[16px] sm:text-[17px] max-w-md mx-auto leading-relaxed mb-10">
                                პირველი კონსულტაცია უფასოა. გამოიძახეთ მენეჯერი ახლავე ან დაგვირეკეთ.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                                <Link to="/login" className="group inline-flex items-center gap-3 px-9 py-[16px] bg-terracotta-600 text-white 
                  font-semibold text-[15px] rounded-2xl transition-all duration-300
                  hover:bg-terracotta-500 hover:shadow-glow-terracotta hover:-translate-y-0.5
                  shadow-lg shadow-terracotta-600/30">
                                    გამოიძახეთ მენეჯერი
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href="tel:+995555123456" className="inline-flex items-center gap-2.5 px-7 py-[16px] bg-white/10 text-white 
                  font-medium text-[15px] rounded-2xl border border-white/10 transition-all duration-200
                  hover:bg-white/15 hover:border-white/20">
                                    <Phone size={15} />
                                    +995 555 123 456
                                </a>
                            </div>

                            {/* Trust line */}
                            <p className="text-white/20 text-[13px]">
                                უფასო კონსულტაცია  ·  ₾50,000 დაზღვევა  ·  გარანტია სამუშაოზე
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
