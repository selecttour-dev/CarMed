import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-emerald-950 text-white/80 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

            <div className="section-container py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-5">
                            <img
                                src="/logo-carmed.png"
                                alt="CarMed"
                                className="h-8 w-auto brightness-0 invert"
                            />
                        </div>
                        <p className="text-white/50 text-[14px] leading-relaxed max-w-xs">
                            პრემიუმ ავტო-სერვისი პირდაპირ თქვენს კარამდე. ჩვენი მენეჯერები ზრუნავენ თქვენს ავტომობილზე სრული გამჭვირვალობით.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold text-[13px] uppercase tracking-wider mb-5">ნავიგაცია</h4>
                        <ul className="space-y-3">
                            {[
                                { to: '/', label: 'მთავარი' },
                                { to: '/about', label: 'ჩვენს შესახებ' },
                                { to: '/contact', label: 'კონტაქტი' },
                                { to: '/login', label: 'შესვლა' },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-white/50 hover:text-emerald-400 text-[14px] transition-colors duration-200">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-semibold text-[13px] uppercase tracking-wider mb-5">სერვისები</h4>
                        <ul className="space-y-3 text-white/50 text-[14px]">
                            <li>ძრავის დიაგნოსტიკა</li>
                            <li>სავალი ნაწილების შეცვლა</li>
                            <li>ტექნიკური მომსახურეობა</li>
                            <li>აგრეგატების შეკეთება</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold text-[13px] uppercase tracking-wider mb-5">კონტაქტი</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-white/50 text-[14px]">
                                <Phone size={16} className="text-emerald-400 flex-shrink-0" />
                                +995 555 123 456
                            </li>
                            <li className="flex items-center gap-3 text-white/50 text-[14px]">
                                <Mail size={16} className="text-emerald-400 flex-shrink-0" />
                                info@carmed.ge
                            </li>
                            <li className="flex items-start gap-3 text-white/50 text-[14px]">
                                <MapPin size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                თბილისი, საქართველო
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-[13px]">
                        © {new Date().getFullYear()} CarMed. ყველა უფლება დაცულია.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-white/30 hover:text-white/60 text-[13px] transition-colors">
                            კონფიდენციალურობა
                        </a>
                        <a href="#" className="text-white/30 hover:text-white/60 text-[13px] transition-colors">
                            წესები & პირობები
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
