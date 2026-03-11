import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, ClipboardList, Wallet, User, LogOut, Loader2, AlertCircle, Power } from 'lucide-react';
import api from '../lib/api';

// Context for sharing availability + profile state across pages
interface ManagerContext {
    isAvailable: boolean;
    isProfileComplete: boolean;
    profile: any;
}
const ManagerCtx = createContext<ManagerContext>({ isAvailable: true, isProfileComplete: true, profile: null });
export const useManagerContext = () => useContext(ManagerCtx);

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isAvailable, setIsAvailable] = useState(true);
    const [isProfileComplete, setIsProfileComplete] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [toggling, setToggling] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        api.get('/manager/profile').then(({ data }) => {
            const mp = data.data?.managerProfile;
            setIsAvailable(mp?.isAvailable ?? true);
            setIsProfileComplete(mp?.isProfileComplete ?? false);
            setProfile(data.data);
            setLoaded(true);
        }).catch(() => setLoaded(true));
    }, []);

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const handleToggleAvailability = async () => {
        setToggling(true);
        try {
            await api.put('/manager/availability', { isAvailable: !isAvailable });
            setIsAvailable(!isAvailable);
        } catch (e) { console.error(e); }
        finally { setToggling(false); }
    };

    const navItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'მთავარი' },
        { path: '/tasks', icon: <ClipboardList size={18} />, label: 'დავალებები' },
        { path: '/finance', icon: <Wallet size={18} />, label: 'ფინანსები' },
        { path: '/profile', icon: <User size={18} />, label: 'პროფილი' },
    ];

    return (
        <ManagerCtx.Provider value={{ isAvailable, isProfileComplete, profile }}>
            <div className="app-layout">
                {/* ═══ Dark Sidebar (desktop) ═══ */}
                <aside className="sidebar">
                    <div className="sidebar-brand">
                        <Link to="/dashboard">
                            <img src="/logo-carmed.png" alt="CarMed" />
                        </Link>
                        <span className="sidebar-brand-label">მენეჯერი</span>
                    </div>

                    {/* Availability Toggle */}
                    <div className="sidebar-toggle-wrap">
                        <button
                            className={`sidebar-availability ${isAvailable ? 'available' : 'unavailable'}`}
                            onClick={handleToggleAvailability}
                            disabled={toggling}
                        >
                            {toggling ? (
                                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <span className="dot" />
                            )}
                            <span>{isAvailable ? 'ონლაინ — ხელმისაწვდომი' : 'ოფლაინ — არ ვმუშაობ'}</span>
                        </button>
                    </div>

                    {/* Profile warning */}
                    {loaded && !isProfileComplete && (
                        <Link to="/profile" className="sidebar-profile-warning">
                            <AlertCircle size={14} />
                            <span>პროფილი არასრულია</span>
                        </Link>
                    )}

                    <nav className="sidebar-nav">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <div className="sidebar-user">
                            <div className="sidebar-avatar">
                                {user?.name?.charAt(0) || 'M'}
                            </div>
                            <div className="sidebar-user-info">
                                <div className="sidebar-user-name">{user?.name}</div>
                                <div className="sidebar-user-role">მენეჯერი</div>
                            </div>
                        </div>
                        <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '6px' }}>
                            <LogOut size={18} /> გასვლა
                        </button>
                    </div>
                </aside>

                {/* ═══ Main Content ═══ */}
                <main className="main-content">
                    {/* Mobile top bar */}
                    <div className="mobile-top-bar">
                        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <img src="/logo-carmed.png" alt="CarMed" style={{ height: '24px' }} />
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={handleToggleAvailability}
                                disabled={toggling}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '6px 10px', borderRadius: '8px',
                                    border: 'none', cursor: 'pointer',
                                    fontSize: '11px', fontWeight: 600,
                                    fontFamily: 'var(--font-sans)',
                                    background: isAvailable ? '#ECFDF5' : '#FEF2F2',
                                    color: isAvailable ? '#059669' : '#DC2626',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {toggling ? (
                                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <Power size={12} />
                                )}
                                {isAvailable ? 'ონლაინ' : 'ოფლაინ'}
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex', alignItems: 'center',
                                    padding: '6px', borderRadius: '6px',
                                    border: 'none', cursor: 'pointer',
                                    background: 'var(--surface-50)', color: 'var(--ink-faint)',
                                }}
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>

                    {loaded && !isProfileComplete && (
                        <div className="profile-incomplete-bar">
                            <AlertCircle size={16} />
                            <span>
                                პროფილი არასრულია — <Link to="/profile">შეავსეთ აქ</Link>
                            </span>
                        </div>
                    )}

                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </ManagerCtx.Provider>
    );
}
