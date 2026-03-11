import { useState, useEffect } from 'react';
import api from '../lib/api';
import {
    Plus, UserX, UserCheck, Search, Clock, Activity,
    Phone, Mail, Calendar, ChevronRight, X
} from 'lucide-react';

const ROLE_MAP: Record<string, { label: string; color: string; bg: string }> = {
    ADMIN: { label: 'ადმინი', color: '#7C3AED', bg: '#F5F3FF' },
    MANAGER: { label: 'მენეჯერი', color: '#2563EB', bg: '#EFF6FF' },
    CLIENT: { label: 'კლიენტი', color: '#059669', bg: '#ECFDF5' },
};

const ACTION_ICONS: Record<string, string> = {
    LOGIN: 'L',
    LOGOUT: 'O',
    STATUS_CHANGE: 'S',
    ORDER_CREATE: 'N',
    INVOICE_CREATE: 'I',
    PAYMENT: 'P',
    FEE_PAID: 'F',
    PROFILE_UPDATE: 'E',
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'ახლახან';
    if (minutes < 60) return `${minutes} წთ წინ`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} სთ წინ`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} დღე წინ`;
    return d.toLocaleDateString('ka-GE');
}

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', phone: '', password: '', email: '', companyFeePercent: '20' });

    // User detail panel
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            const { data } = await api.get(`/admin/users?${params}`);
            setUsers(data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [search, roleFilter]);

    const toggleUserStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        if (!confirm(`ნამდვილად გსურთ მომხმარებლის ${newStatus === 'BLOCKED' ? 'დაბლოკვა' : 'გააქტიურება'}?`)) return;
        try {
            await api.put(`/admin/users/${userId}/status`, { status: newStatus });
            fetchUsers();
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, status: newStatus });
            }
        } catch (err: any) { alert(err.response?.data?.error || 'შეცდომა'); }
    };

    const createManager = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/managers', createForm);
            setShowCreateModal(false);
            setCreateForm({ name: '', phone: '', password: '', email: '', companyFeePercent: '20' });
            fetchUsers();
        } catch (err: any) { alert(err.response?.data?.error || 'შეცდომა'); }
    };

    const openUserDetail = async (user: any) => {
        setSelectedUser(user);
        setLoadingLogs(true);
        try {
            const { data } = await api.get(`/admin/users/${user.id}/activity?limit=100`);
            setActivityLogs(data.data || []);
        } catch (e) { console.error(e); setActivityLogs([]); }
        finally { setLoadingLogs(false); }
    };

    // Stats
    const totalManagers = users.filter(u => u.role === 'MANAGER').length;
    const totalClients = users.filter(u => u.role === 'CLIENT').length;
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length;

    return (
        <div className="animate-fade-in">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">მომხმარებლები</h1>
                    <p className="page-subtitle">მენეჯერებისა და კლიენტების მართვა · აქტიურობის ლოგირება</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} /> მენეჯერის დამატება
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                    { label: 'სულ', value: users.length, icon: 'U', color: '#0EA5E9' },
                    { label: 'მენეჯერები', value: totalManagers, icon: 'M', color: '#7C3AED' },
                    { label: 'კლიენტები', value: totalClients, icon: 'C', color: '#059669' },
                    { label: 'აქტიური', value: activeUsers, icon: 'A', color: '#D97706' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: `${s.color}10`, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                        }}>{s.icon}</div>
                        <div>
                            <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: '11px', color: 'var(--ink-faint)', fontWeight: 600 }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" style={{ paddingLeft: '36px' }} placeholder="ძიება სახელით, ტელეფონით..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {[
                    { key: '', label: 'ყველა' },
                    { key: 'MANAGER', label: 'მენეჯერი' },
                    { key: 'CLIENT', label: 'კლიენტი' },
                    { key: 'ADMIN', label: 'ადმინი' },
                ].map((r) => (
                    <button key={r.key} className={`btn btn-sm ${roleFilter === r.key ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRoleFilter(r.key)} style={{ fontSize: '12px' }}>
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Main Layout: Table + Detail Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 380px' : '1fr', gap: '16px' }}>

                {/* Users Table */}
                {loading ? <div className="empty-state"><p>იტვირთება...</p></div> : (
                    <div className="table-container" style={{ overflow: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>მომხმარებელი</th>
                                    <th>ტელეფონი</th>
                                    <th>როლი</th>
                                    <th>სტატუსი</th>
                                    <th>შეკვეთები</th>
                                    <th>ბოლო შესვლა</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const role = ROLE_MAP[user.role] || ROLE_MAP.CLIENT;
                                    const isSelected = selectedUser?.id === user.id;
                                    return (
                                        <tr key={user.id} onClick={() => openUserDetail(user)}
                                            style={{
                                                cursor: 'pointer',
                                                background: isSelected ? 'rgba(37, 99, 235, 0.04)' : undefined,
                                                borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                                            }}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        background: role.bg, display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontWeight: 700, fontSize: '12px',
                                                        color: role.color,
                                                    }}>{user.name.charAt(0)}</div>
                                                    <div>
                                                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{user.name}</span>
                                                        {user.managerProfile?.surname && (
                                                            <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}> {user.managerProfile.surname}</span>
                                                        )}
                                                        {user.email && (
                                                            <div style={{ fontSize: '10px', color: 'var(--ink-faint)' }}>{user.email}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-mono" style={{ fontSize: '12px' }}>{user.phone}</td>
                                            <td>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '6px', fontSize: '10px',
                                                    fontWeight: 700, background: role.bg, color: role.color,
                                                }}>{role.label}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span className={`badge badge-${user.status.toLowerCase()}`}>
                                                        <span className="badge-dot"></span>
                                                        {user.status === 'ACTIVE' ? 'აქტიური' : 'დაბლოკილი'}
                                                    </span>
                                                    {user.role === 'MANAGER' && user.managerProfile && (
                                                        <span style={{
                                                            padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                                                            background: user.managerProfile.isAvailable ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                            color: user.managerProfile.isAvailable ? '#22C55E' : '#EF4444',
                                                        }}>
                                                            {user.managerProfile.isAvailable ? '✓' : '—'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-mono" style={{ fontSize: '12px', fontWeight: 700 }}>
                                                {user.role === 'CLIENT' ? user._count?.clientOrders || 0 : user._count?.managerOrders || 0}
                                            </td>
                                            <td style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                                                {user.lastLoginAt ? timeAgo(user.lastLoginAt) : '—'}
                                            </td>
                                            <td>
                                                <ChevronRight size={14} style={{ color: 'var(--ink-faint)' }} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* User Detail Panel */}
                {selectedUser && (
                    <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: '16px', alignSelf: 'start', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px', borderBottom: '1px solid var(--surface-100)',
                            background: ROLE_MAP[selectedUser.role]?.bg || '#F8FAFC',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'white', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontWeight: 800, fontSize: '16px',
                                        color: ROLE_MAP[selectedUser.role]?.color || '#0EA5E9',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    }}>{selectedUser.name.charAt(0)}</div>
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{selectedUser.name}</h3>
                                        <p style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                                            {ROLE_MAP[selectedUser.role]?.label}
                                            {selectedUser.managerProfile?.companyFeePercent !== undefined &&
                                                ` · ${selectedUser.managerProfile.companyFeePercent}% საკომისიო`}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} style={{
                                    background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '8px',
                                    width: '28px', height: '28px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer',
                                }}><X size={14} /></button>
                            </div>

                            {/* Quick Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-muted)' }}>
                                    <Phone size={11} /> {selectedUser.phone}
                                </div>
                                {selectedUser.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-muted)' }}>
                                        <Mail size={11} /> {selectedUser.email}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-muted)' }}>
                                    <Calendar size={11} /> რეგ: {new Date(selectedUser.createdAt).toLocaleDateString('ka-GE')}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-muted)' }}>
                                    <Clock size={11} /> {selectedUser.lastLoginAt ? timeAgo(selectedUser.lastLoginAt) : 'არასდროს'}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                                <button
                                    className={`btn btn-sm ${selectedUser.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                                    onClick={() => toggleUserStatus(selectedUser.id, selectedUser.status)}
                                    style={{ fontSize: '11px', flex: 1 }}>
                                    {selectedUser.status === 'ACTIVE'
                                        ? <><UserX size={12} /> დაბლოკვა</>
                                        : <><UserCheck size={12} /> გააქტიურება</>}
                                </button>
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                <Activity size={14} style={{ color: 'var(--primary)' }} />
                                <h4 style={{ fontSize: '13px', fontWeight: 700 }}>აქტიურობის ისტორია</h4>
                                <span style={{
                                    marginLeft: 'auto', fontSize: '10px', fontWeight: 700,
                                    padding: '2px 6px', borderRadius: '6px', background: 'var(--surface-50)',
                                    color: 'var(--ink-faint)',
                                }}>{activityLogs.length}</span>
                            </div>

                            {loadingLogs ? (
                                <p style={{ fontSize: '12px', color: 'var(--ink-faint)', textAlign: 'center', padding: '16px' }}>იტვირთება...</p>
                            ) : activityLogs.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '24px', fontSize: '12px',
                                    color: 'var(--ink-faint)', background: 'var(--surface-50)',
                                    borderRadius: '10px',
                                }}>
                                    <Activity size={20} style={{ opacity: 0.3, marginBottom: '6px' }} />
                                    <p>აქტიურობა ჯერ არ ჩაწერილა</p>
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    {/* Timeline line */}
                                    <div style={{
                                        position: 'absolute', left: '11px', top: '8px', bottom: '8px',
                                        width: '2px', background: 'var(--surface-100)',
                                    }} />

                                    {activityLogs.map((log: any, i: number) => (
                                        <div key={log.id || i} style={{
                                            display: 'flex', gap: '10px', padding: '6px 0',
                                            position: 'relative',
                                        }}>
                                            {/* Dot */}
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                background: 'white', border: '2px solid var(--surface-100)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '11px', flexShrink: 0, zIndex: 1,
                                            }}>
                                                {ACTION_ICONS[log.action] || '📌'}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.4 }}>
                                                    {log.description}
                                                </p>
                                                <p style={{ fontSize: '10px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                                                    {new Date(log.createdAt).toLocaleString('ka-GE', {
                                                        day: '2-digit', month: '2-digit', year: '2-digit',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                    {log.ipAddress && ` · ${log.ipAddress}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Manager Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">ახალი მენეჯერი</h2>
                        <form onSubmit={createManager}>
                            <div className="form-group">
                                <label className="form-label">სახელი</label>
                                <input className="form-input" placeholder="სახელი გვარი" value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">ტელეფონი</label>
                                    <input className="form-input" placeholder="+995..." value={createForm.phone}
                                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">პაროლი</label>
                                    <input type="password" className="form-input" placeholder="••••••" value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">ელ-ფოსტა</label>
                                    <input className="form-input" placeholder="email@example.com" value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">კომპანიის საკომისიო (%)</label>
                                    <input type="number" className="form-input" placeholder="20" value={createForm.companyFeePercent}
                                        onChange={(e) => setCreateForm({ ...createForm, companyFeePercent: e.target.value })} required />
                                </div>
                            </div>
                            <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>გაუქმება</button>
                                <button type="submit" className="btn btn-primary">შექმნა</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
