import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Car, Search, User } from 'lucide-react';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/admin/vehicles');
                setVehicles(data.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const filtered = vehicles.filter(v => {
        if (!search) return true;
        const q = search.toLowerCase();
        return v.make.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            v.plateNumber.toLowerCase().includes(q) ||
            v.client?.name?.toLowerCase().includes(q);
    });

    const uniqueMakes = [...new Set(vehicles.map(v => v.make))].length;

    if (loading) return <div className="empty-state"><p>იტვირთება...</p></div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">მანქანები</h1>
                <p className="page-subtitle">რეგისტრირებული ავტომობილები და მფლობელები</p>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div style={{ color: '#047857', marginBottom: '8px' }}><Car size={20} /></div>
                    <div className="stat-value" style={{ fontSize: '22px' }}>{vehicles.length}</div>
                    <div className="stat-label">სულ მანქანა</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#2563EB', marginBottom: '8px' }}><User size={20} /></div>
                    <div className="stat-value" style={{ fontSize: '22px' }}>{[...new Set(vehicles.map(v => v.clientId))].length}</div>
                    <div className="stat-label">მფლობელი</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#7C3AED', marginBottom: '8px' }}><Car size={20} /></div>
                    <div className="stat-value" style={{ fontSize: '22px' }}>{uniqueMakes}</div>
                    <div className="stat-label">უნიკ. მარკა</div>
                </div>
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                    <input
                        className="form-input"
                        placeholder="ძებნა მარკა, მოდელი, ნომერი, მფლობელი..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '34px', fontSize: '13px' }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>მანქანა</th>
                            <th>ნომერი</th>
                            <th>წელი</th>
                            <th>VIN</th>
                            <th>მფლობელი</th>
                            <th>ტელეფონი</th>
                            <th>რეგისტრაცია</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                                მანქანები ვერ მოიძებნა
                            </td></tr>
                        ) : filtered.map(v => (
                            <tr key={v.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: 'rgba(4, 120, 87, 0.06)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Car size={16} style={{ color: '#047857' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{v.make}</div>
                                            <div style={{ fontSize: '11px', color: '#718096' }}>{v.model}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px',
                                        padding: '3px 8px', borderRadius: '6px',
                                        background: '#F0F4F2', color: '#1A202C',
                                    }}>
                                        {v.plateNumber}
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#4A5568' }}>
                                    {v.year || '—'}
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#A0AEC0' }}>
                                    {v.vin || '—'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #047857, #059669)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '10px', fontWeight: 700,
                                        }}>
                                            {v.client?.name?.charAt(0) || '?'}
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{v.client?.name || 'უცნობი'}</span>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#718096' }}>
                                    {v.client?.phone || '—'}
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#A0AEC0' }}>
                                    {new Date(v.createdAt).toLocaleDateString('ka-GE')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
