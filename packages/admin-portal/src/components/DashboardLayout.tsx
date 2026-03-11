import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, ClipboardList, Wallet, LogOut, Settings, Package, Car, Bell } from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const handleLogout = async () => { await logout(); navigate('/login'); };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src="/logo-carmed.png" alt="CarMed" style={{ height: '36px', objectFit: 'contain' }} />
                    <div className="sidebar-brand-text">Admin</div>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={18} /> დეშბორდი
                    </NavLink>
                    <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Users size={18} /> მომხმარებლები
                    </NavLink>
                    <NavLink to="/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <ClipboardList size={18} /> შეკვეთები
                    </NavLink>
                    <NavLink to="/finance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Wallet size={18} /> ფინანსები
                    </NavLink>
                    <NavLink to="/parts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Package size={18} /> ნაწილები
                    </NavLink>
                    <NavLink to="/vehicles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Car size={18} /> მანქანები
                    </NavLink>
                    <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Bell size={18} /> შეტყობინებები
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Settings size={18} /> პარამეტრები
                    </NavLink>
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{user?.name?.charAt(0) || 'A'}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">ადმინი</div>
                        </div>
                    </div>
                    <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '8px' }}>
                        <LogOut size={18} /> გასვლა
                    </button>
                </div>
            </aside>
            <main className="main-content"><Outlet /></main>
        </div>
    );
}
