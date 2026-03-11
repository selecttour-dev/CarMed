import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Car, ClipboardList, Plus, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 6);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        if (menuOpen) document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, [menuOpen]);

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'მთავარი', end: true },
        { path: '/dashboard/garage', icon: Car, label: 'მანქანები' },
        { path: '/dashboard/orders', icon: ClipboardList, label: 'შეკვეთები' },
    ];

    return (
        <div className="min-h-screen bg-surface pb-28 sm:pb-0">
            {/* ═══ Navbar ═══ */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
                ${scrolled
                    ? 'bg-white/95 backdrop-blur-2xl shadow-card'
                    : 'bg-white/70 backdrop-blur-xl'
                }`}>
                <div className="section-container">
                    <div className="flex items-center justify-between h-[52px] sm:h-14">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-2.5 group">
                            <img src="/logo-carmed.png" alt="CarMed" className="h-6 sm:h-7 w-auto" />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden sm:flex items-center gap-1">
                            {navItems.map(({ path, icon: Icon, label, end }) => (
                                <NavLink key={path} to={path} end={end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-[12px] text-[13px] font-semibold transition-all duration-200 ${isActive
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-ink-muted hover:text-ink hover:bg-surface-50'
                                        }`
                                    }>
                                    <Icon size={15} />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            <NavLink to="/dashboard/orders/new"
                                className="hidden sm:flex btn-dark text-[12px] px-4 py-2">
                                <Plus size={14} strokeWidth={2.5} />
                                ახალი შეკვეთა
                            </NavLink>

                            {/* User menu */}
                            <div className="relative" ref={menuRef}>
                                <button onClick={() => setMenuOpen(!menuOpen)}
                                    className={`flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-[12px] transition-all 
                                        ${menuOpen ? 'bg-surface-50' : 'hover:bg-surface-50/60'}`}>
                                    <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-500 to-emerald-700 
                                        text-white flex items-center justify-center text-[11px] font-bold
                                        shadow-sm">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <ChevronDown size={12} className={`text-ink-faint hidden sm:block transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''
                                        }`} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-52 card-elevated p-1.5 animate-scale-in origin-top-right z-50">
                                        <div className="px-3 py-2.5 mb-1">
                                            <p className="text-[13px] font-semibold text-ink truncate">{user?.name}</p>
                                            <p className="text-[11px] text-ink-faint font-mono">{user?.phone}</p>
                                        </div>
                                        <div className="h-px bg-surface-100 mx-2 mb-1" />
                                        <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] text-ink-muted 
                                            hover:bg-surface-50 transition-colors font-medium">
                                            <Settings size={14} />
                                            პარამეტრები
                                        </Link>
                                        <button onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-3 py-2 rounded-[10px] text-[13px] text-red-500 
                                            hover:bg-red-50 transition-colors font-medium">
                                            <LogOut size={14} />
                                            გამოსვლა
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══ Content ═══ */}
            <main className="pt-[52px] sm:pt-14">
                <div className="section-container py-4 sm:py-8">
                    <Outlet />
                </div>
            </main>

            {/* ═══ Mobile Bottom Nav ═══ */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 px-4"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 10px), 10px)' }}>
                <div className="bg-white/95 backdrop-blur-2xl rounded-[16px] shadow-float border border-black/[0.04] 
                    mx-auto max-w-[360px]">
                    <div className="flex items-center justify-around h-[54px] px-1">
                        {navItems.map(({ path, icon: Icon, label, end }) => (
                            <NavLink key={path} to={path} end={end}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-0.5 px-4 py-1 rounded-[12px] transition-all duration-200 
                                    ${isActive ? 'text-emerald-700' : 'text-ink-faint'}`
                                }>
                                {({ isActive }) => (
                                    <>
                                        <div className="relative">
                                            <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                                            {isActive && (
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-semibold ${isActive ? 'text-emerald-700' : 'text-ink-faint'}`}>
                                            {label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                        <NavLink to="/dashboard/orders/new"
                            className="flex flex-col items-center gap-0.5 px-3 py-1">
                            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center -mt-1.5
                                bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-glow-emerald">
                                <Plus size={16} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-[9px] font-semibold text-ink-faint">შეკვეთა</span>
                        </NavLink>
                    </div>
                </div>
            </nav>
        </div>
    );
}
