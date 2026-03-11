import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { UserPlus, Search } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'მოლოდინში', ACCEPTED: 'მიღებული', PICKED_UP: 'წაყვანილია',
    IN_PROGRESS: 'მიმდინარეობს',
    COMPLETED: 'დასრულებული', CANCELED: 'გაუქმებული', REJECTED: 'უარყოფილი',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [assignModal, setAssignModal] = useState<{ orderId: string } | null>(null);
    const [selectedManager, setSelectedManager] = useState('');
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const params = filter ? `?status=${filter}` : '';
            const { data } = await api.get(`/admin/orders${params}`);
            setOrders(data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchManagers = async () => {
        try {
            const { data } = await api.get('/admin/managers');
            setManagers(data.data || []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchOrders(); fetchManagers(); }, [filter]);

    const assignManager = async () => {
        if (!assignModal || !selectedManager) return;
        try {
            await api.put(`/admin/orders/${assignModal.orderId}/assign`, { managerId: selectedManager });
            setAssignModal(null);
            setSelectedManager('');
            fetchOrders();
        } catch (err: any) { alert(err.response?.data?.error || 'შეცდომა'); }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">შეკვეთები</h1>
                <p className="page-subtitle">ყველა შეკვეთის მონიტორინგი და მინიჭება</p>
            </div>

            <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
                {['', 'PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
                    <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
                        {s ? STATUS_LABELS[s] : 'ყველა'}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: '36px' }}
                    placeholder="ძიება კლიენტის სახელით, ავტომობილით, მისამართით..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {loading ? <div className="empty-state"><p>იტვირთება...</p></div> : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>კლიენტი</th>
                                <th>ავტომობილი</th>
                                <th>მისამართი</th>
                                <th>სტატუსი</th>
                                <th>მენეჯერი</th>
                                <th>თარიღი</th>
                                <th>მოქმედებები</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders
                                .filter(order => {
                                    if (!search) return true;
                                    const q = search.toLowerCase();
                                    return (
                                        order.client?.name?.toLowerCase().includes(q) ||
                                        order.vehicle?.make?.toLowerCase().includes(q) ||
                                        order.vehicle?.model?.toLowerCase().includes(q) ||
                                        order.address?.toLowerCase().includes(q) ||
                                        order.manager?.name?.toLowerCase().includes(q) ||
                                        order.id?.toLowerCase().includes(q)
                                    );
                                })
                                .map((order) => (
                                    <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)} style={{ cursor: 'pointer' }}>
                                        <td className="text-mono text-sm">#{order.id.slice(0, 8)}</td>
                                        <td className="font-bold">{order.client?.name || '—'}</td>
                                        <td>{order.vehicle ? `${order.vehicle.make} ${order.vehicle.model}` : '—'}</td>
                                        <td className="text-sm">{order.address.slice(0, 30)}...</td>
                                        <td>
                                            <span className={`badge badge-${order.status.toLowerCase()}`}>
                                                <span className="badge-dot"></span>
                                                {STATUS_LABELS[order.status]}
                                            </span>
                                        </td>
                                        <td>{order.manager?.name || <span className="text-muted">—</span>}</td>
                                        <td className="text-mono text-sm">{new Date(order.createdAt).toLocaleDateString('ka-GE')}</td>
                                        <td>
                                            {order.status === 'PENDING' && !order.managerId && (
                                                <button className="btn btn-sm btn-primary" onClick={() => setAssignModal({ orderId: order.id })}>
                                                    <UserPlus size={12} /> მინიჭება
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assign Manager Modal */}
            {assignModal && (
                <div className="modal-overlay" onClick={() => setAssignModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">მენეჯერის მინიჭება</h2>
                        <div className="form-group">
                            <label className="form-label">აირჩიეთ მენეჯერი</label>
                            <select className="form-input" value={selectedManager} onChange={(e) => setSelectedManager(e.target.value)}>
                                <option value="">— აირჩიეთ —</option>
                                {managers.filter(m => m.status === 'ACTIVE').map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.phone}) — საკომისიო: {m.managerProfile?.companyFeePercent ?? 20}%
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setAssignModal(null)}>გაუქმება</button>
                            <button className="btn btn-primary" onClick={assignManager} disabled={!selectedManager}>მინიჭება</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
