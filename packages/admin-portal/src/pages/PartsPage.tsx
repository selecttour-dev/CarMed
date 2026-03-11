import { useState, useEffect, useMemo } from 'react';
import api from '../lib/api';
import { Package, Search, TrendingUp, BarChart3, ChevronDown, ChevronRight, DollarSign, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const QUALITY_LABELS: Record<string, string> = {
    OEM: 'ორიგინალი',
    AFTERMARKET: 'არაორიგინალი',
    USED_OEM: 'მეორადი ორიგ.',
    REFURBISHED: 'აღდგენილი',
};
const QUALITY_COLORS: Record<string, { bg: string; color: string }> = {
    OEM: { bg: '#ECFDF5', color: '#059669' },
    AFTERMARKET: { bg: '#FFF7ED', color: '#EA580C' },
    USED_OEM: { bg: '#F5F3FF', color: '#7C3AED' },
    REFURBISHED: { bg: '#EFF6FF', color: '#2563EB' },
};

export default function PartsPage() {
    const [parts, setParts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterMake, setFilterMake] = useState('');
    const [filterModel, setFilterModel] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterQuality, setFilterQuality] = useState('');
    const [sortBy, setSortBy] = useState<'usageCount' | 'avgClientPrice' | 'partName' | 'updatedAt'>('usageCount');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchParts = async () => {
        try {
            const params: any = {};
            if (search) params.search = search;
            if (filterMake) params.make = filterMake;
            if (filterModel) params.model = filterModel;
            const { data } = await api.get('/admin/parts-catalog', { params });
            setParts(data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchParts(); }, [search, filterMake, filterModel]);

    // Derived data
    const makes = useMemo(() => [...new Set(parts.map(p => p.make))].sort() as string[], [parts]);
    const models = useMemo(() => {
        if (!filterMake) return [];
        return [...new Set(parts.filter(p => p.make === filterMake).map(p => p.model))].sort() as string[];
    }, [parts, filterMake]);

    const filteredParts = useMemo(() => {
        let result = [...parts];
        if (filterType) result = result.filter(p => p.type === filterType);
        if (filterQuality) result = result.filter(p => p.quality === filterQuality);
        result.sort((a, b) => {
            const dir = sortDir === 'desc' ? -1 : 1;
            if (sortBy === 'partName') return dir * a.partName.localeCompare(b.partName);
            return dir * ((a[sortBy] || 0) - (b[sortBy] || 0));
        });
        return result;
    }, [parts, filterType, filterQuality, sortBy, sortDir]);

    // Stats
    const totalUsage = parts.reduce((s, p) => s + p.usageCount, 0);
    const avgClientPrice = parts.length > 0 ? parts.reduce((s, p) => s + p.avgClientPrice, 0) / parts.length : 0;
    const avgNetCost = parts.length > 0 ? parts.reduce((s, p) => s + p.avgNetCost, 0) / parts.length : 0;
    const avgMargin = avgClientPrice > 0 ? ((avgClientPrice - avgNetCost) / avgClientPrice * 100) : 0;
    const partsCount = parts.filter(p => p.type === 'PART').length;
    const laborCount = parts.filter(p => p.type === 'LABOR').length;

    const handleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const getMargin = (p: any) => {
        if (!p.avgClientPrice) return 0;
        return ((p.avgClientPrice - p.avgNetCost) / p.avgClientPrice * 100);
    };

    const getPriceSpread = (p: any) => {
        if (!p.maxClientPrice || p.maxClientPrice === p.minClientPrice) return 0;
        return ((p.maxClientPrice - p.minClientPrice) / p.avgClientPrice * 100);
    };

    if (loading) return <div className="empty-state"><p>იტვირთება...</p></div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">ნაწილების კატალოგი</h1>
                <p className="page-subtitle">ყველა ნაწილი/სერვისი — ფასების ისტორია, მარჟა და სტატისტიკა</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <div className="stat-card">
                    <div style={{ color: '#047857', marginBottom: '6px' }}><Package size={18} /></div>
                    <div className="stat-value" style={{ fontSize: '20px' }}>{parts.length}</div>
                    <div className="stat-label">უნიკალური</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#2563EB', marginBottom: '6px' }}><BarChart3 size={18} /></div>
                    <div className="stat-value" style={{ fontSize: '20px' }}>{totalUsage}</div>
                    <div className="stat-label">გამოყენება</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#7C3AED', marginBottom: '6px' }}><DollarSign size={18} /></div>
                    <div className="stat-value" style={{ fontSize: '20px' }}>₾{avgClientPrice.toFixed(0)}</div>
                    <div className="stat-label">საშ. ფასი</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#059669', marginBottom: '6px' }}><Percent size={18} /></div>
                    <div className="stat-value" style={{ fontSize: '20px', color: avgMargin > 0 ? '#047857' : '#DC2626' }}>{avgMargin.toFixed(0)}%</div>
                    <div className="stat-label">საშ. მარჟა</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#EA580C', marginBottom: '6px' }}><Package size={18} /></div>
                    <div className="stat-value" style={{ fontSize: '20px' }}>{partsCount}</div>
                    <div className="stat-label">ნაწილი</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#0891B2', marginBottom: '6px' }}><TrendingUp size={18} /></div>
                    <div className="stat-value" style={{ fontSize: '20px' }}>{laborCount}</div>
                    <div className="stat-label">სამუშაო</div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                        <input
                            className="form-input"
                            placeholder="ნაწილის ძებნა..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '34px', fontSize: '13px' }}
                        />
                    </div>
                    <select value={filterMake} onChange={e => { setFilterMake(e.target.value); setFilterModel(''); }} className="form-input" style={{ width: '150px', fontSize: '12px' }}>
                        <option value="">ყველა მარკა</option>
                        {makes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {filterMake && models.length > 0 && (
                        <select value={filterModel} onChange={e => setFilterModel(e.target.value)} className="form-input" style={{ width: '150px', fontSize: '12px' }}>
                            <option value="">ყველა მოდელი</option>
                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    )}
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-input" style={{ width: '130px', fontSize: '12px' }}>
                        <option value="">ყველა ტიპი</option>
                        <option value="PART">ნაწილი</option>
                        <option value="LABOR">სამუშაო</option>
                        <option value="OTHER">სხვა</option>
                    </select>
                    <select value={filterQuality} onChange={e => setFilterQuality(e.target.value)} className="form-input" style={{ width: '150px', fontSize: '12px' }}>
                        <option value="">ყველა ხარისხი</option>
                        <option value="OEM">🏭 ორიგინალი</option>
                        <option value="AFTERMARKET">არაორიგინალი</option>
                        <option value="USED_OEM">♻️ მეორადი ორიგ.</option>
                        <option value="REFURBISHED">აღდგენილი</option>
                    </select>
                    <div style={{ fontSize: '11px', color: '#A0AEC0', marginLeft: 'auto' }}>
                        {filteredParts.length} ჩანაწერი
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '28px' }}></th>
                            <th onClick={() => handleSort('partName')} style={{ cursor: 'pointer' }}>
                                ნაწილი {sortBy === 'partName' && (sortDir === 'desc' ? '↓' : '↑')}
                            </th>
                            <th>მარკა / მოდელი</th>
                            <th>ტიპი</th>
                            <th>ხარისხი</th>
                            <th onClick={() => handleSort('avgClientPrice')} style={{ textAlign: 'right', cursor: 'pointer' }}>
                                კლ. ფასი {sortBy === 'avgClientPrice' && (sortDir === 'desc' ? '↓' : '↑')}
                            </th>
                            <th style={{ textAlign: 'right' }}>თვითღირ.</th>
                            <th style={{ textAlign: 'right' }}>მარჟა</th>
                            <th style={{ textAlign: 'right' }}>ფასის დიაპაზონი</th>
                            <th onClick={() => handleSort('usageCount')} style={{ textAlign: 'center', cursor: 'pointer' }}>
                                # {sortBy === 'usageCount' && (sortDir === 'desc' ? '↓' : '↑')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParts.length === 0 ? (
                            <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                                ნაწილები ვერ მოიძებნა
                            </td></tr>
                        ) : filteredParts.map(part => {
                            const margin = getMargin(part);
                            const spread = getPriceSpread(part);
                            const isExpanded = expandedId === part.id;

                            return (
                                <>
                                    <tr key={part.id}
                                        onClick={() => setExpandedId(isExpanded ? null : part.id)}
                                        style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                    >
                                        <td style={{ width: '28px', padding: '10px 8px' }}>
                                            {isExpanded ? <ChevronDown size={14} color="#718096" /> : <ChevronRight size={14} color="#A0AEC0" />}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{part.partName}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, fontSize: '12px' }}>{part.make}</span>
                                            <span style={{ color: '#718096', fontSize: '12px' }}> {part.model}</span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${part.type === 'PART' ? 'paid' : part.type === 'LABOR' ? 'picked_up' : 'invoiced'}`}>
                                                <span className="badge-dot"></span>
                                                {part.type === 'PART' ? 'ნაწილი' : part.type === 'LABOR' ? 'სამუშაო' : 'სხვა'}
                                            </span>
                                        </td>
                                        <td>
                                            {part.quality ? (
                                                <span style={{
                                                    fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600,
                                                    background: QUALITY_COLORS[part.quality]?.bg || '#F0F4F2',
                                                    color: QUALITY_COLORS[part.quality]?.color || '#718096',
                                                }}>
                                                    {QUALITY_LABELS[part.quality] || part.quality}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '10px', color: '#CBD5E0' }}>—</span>
                                            )}
                                            {part.brand && (
                                                <div style={{ fontSize: '9px', color: '#718096', marginTop: '2px' }}>{part.brand}</div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#047857', fontSize: '13px' }}>
                                            ₾{part.avgClientPrice.toFixed(0)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#718096' }}>
                                            ₾{part.avgNetCost.toFixed(0)}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                                                padding: '2px 6px', borderRadius: '6px',
                                                background: margin > 30 ? 'rgba(5, 150, 105, 0.08)' : margin > 15 ? 'rgba(217, 119, 6, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                                                color: margin > 30 ? '#047857' : margin > 15 ? '#B45309' : '#DC2626',
                                                display: 'inline-flex', alignItems: 'center', gap: '2px',
                                            }}>
                                                {margin > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                {margin.toFixed(0)}%
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#A0AEC0' }}>
                                                    ₾{part.minClientPrice.toFixed(0)}
                                                </span>
                                                <div style={{
                                                    width: '40px', height: '4px', borderRadius: '2px',
                                                    background: '#E8EDEA', position: 'relative', overflow: 'hidden',
                                                }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: '2px',
                                                        background: spread > 50 ? '#DC2626' : spread > 20 ? '#D97706' : '#059669',
                                                        width: `${Math.min(spread, 100)}%`,
                                                    }} />
                                                </div>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#A0AEC0' }}>
                                                    ₾{part.maxClientPrice.toFixed(0)}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px',
                                                padding: '2px 8px', borderRadius: '8px',
                                                background: part.usageCount > 5 ? 'rgba(5, 150, 105, 0.08)' : 'rgba(0,0,0,0.04)',
                                                color: part.usageCount > 5 ? '#047857' : '#4A5568',
                                            }}>
                                                {part.usageCount}×
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Expanded Detail Row */}
                                    {isExpanded && (
                                        <tr key={`${part.id}-detail`}>
                                            <td colSpan={10} style={{ padding: '0', background: '#F8FAF9' }}>
                                                <div style={{
                                                    padding: '16px 20px 16px 42px',
                                                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
                                                    borderTop: '1px solid rgba(0,0,0,0.04)',
                                                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                                                }}>
                                                    {/* Col 1: Price Breakdown */}
                                                    <div>
                                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                                            ფასები
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                <span style={{ color: '#718096' }}>საშ. ასაღები (ნეტო):</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₾{part.avgNetCost.toFixed(2)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                <span style={{ color: '#718096' }}>საშ. კლიენტის ფასი:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#047857' }}>₾{part.avgClientPrice.toFixed(2)}</span>
                                                            </div>
                                                            <div style={{ height: '1px', background: '#E8EDEA', margin: '2px 0' }} />
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                                <span style={{ color: '#A0AEC0' }}>ბოლო ასაღები:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#4A5568' }}>₾{part.lastNetCost.toFixed(0)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                                <span style={{ color: '#A0AEC0' }}>ბოლო კლიენტი:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#047857' }}>₾{part.lastClientPrice.toFixed(0)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Col 2: Margin + Range */}
                                                    <div>
                                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                                            მარჟა და დიაპაზონი
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                            {/* Margin bar */}
                                                            <div>
                                                                <div style={{ fontSize: '11px', color: '#718096', marginBottom: '3px' }}>საშ. მარჟა (რამდენს ვადებთ):</div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <div style={{
                                                                        flex: 1, height: '8px', borderRadius: '4px', background: '#E8EDEA',
                                                                        overflow: 'hidden',
                                                                    }}>
                                                                        <div style={{
                                                                            height: '100%', borderRadius: '4px',
                                                                            background: margin > 30 ? '#059669' : margin > 15 ? '#D97706' : '#DC2626',
                                                                            width: `${Math.min(Math.max(margin, 0), 100)}%`,
                                                                            transition: 'width 0.3s',
                                                                        }} />
                                                                    </div>
                                                                    <span style={{
                                                                        fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
                                                                        color: margin > 30 ? '#047857' : margin > 15 ? '#B45309' : '#DC2626',
                                                                    }}>
                                                                        {margin.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                <span style={{ color: '#718096' }}>მოგება / 1 ცალი:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#047857' }}>
                                                                    ₾{(part.avgClientPrice - part.avgNetCost).toFixed(0)}
                                                                </span>
                                                            </div>
                                                            <div style={{ height: '1px', background: '#E8EDEA', margin: '2px 0' }} />
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                                <span style={{ color: '#A0AEC0' }}>მინ. კლიენტი:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>₾{part.minClientPrice.toFixed(0)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                                <span style={{ color: '#A0AEC0' }}>მაქს. კლიენტი:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>₾{part.maxClientPrice.toFixed(0)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                                <span style={{ color: '#A0AEC0' }}>სპრედი:</span>
                                                                <span style={{
                                                                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '10px',
                                                                    padding: '1px 5px', borderRadius: '4px',
                                                                    background: spread > 50 ? '#FEE2E2' : spread > 20 ? '#FFF7ED' : '#ECFDF5',
                                                                    color: spread > 50 ? '#DC2626' : spread > 20 ? '#EA580C' : '#059669',
                                                                }}>
                                                                    {spread.toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Col 3: Meta + Quality */}
                                                    <div>
                                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                                            🏷️ დეტალები
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                <span style={{ color: '#718096' }}>გამოყენება:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{part.usageCount}× ინვოისი</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                <span style={{ color: '#718096' }}>სულ მოგება:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#047857' }}>
                                                                    ≈ ₾{((part.avgClientPrice - part.avgNetCost) * part.usageCount).toFixed(0)}
                                                                </span>
                                                            </div>
                                                            {part.quality && (
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', alignItems: 'center' }}>
                                                                    <span style={{ color: '#718096' }}>ხარისხი:</span>
                                                                    <span style={{
                                                                        fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                                                                        background: QUALITY_COLORS[part.quality]?.bg || '#F0F4F2',
                                                                        color: QUALITY_COLORS[part.quality]?.color || '#4A5568',
                                                                    }}>
                                                                        {QUALITY_LABELS[part.quality] || part.quality}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {part.brand && (
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                                    <span style={{ color: '#718096' }}>ბრენდი:</span>
                                                                    <span style={{ fontWeight: 600, color: '#4A5568' }}>{part.brand}</span>
                                                                </div>
                                                            )}
                                                            <div style={{ height: '1px', background: '#E8EDEA', margin: '2px 0' }} />
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                                <span style={{ color: '#A0AEC0' }}>შექმნილია:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#A0AEC0' }}>
                                                                    {new Date(part.createdAt).toLocaleDateString('ka-GE')}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                                <span style={{ color: '#A0AEC0' }}>განახლება:</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#A0AEC0' }}>
                                                                    {new Date(part.updatedAt).toLocaleDateString('ka-GE')}
                                                                </span>
                                                            </div>
                                                            <div style={{ marginTop: '2px' }}>
                                                                <span style={{
                                                                    fontSize: '9px', fontWeight: 600, padding: '2px 6px',
                                                                    borderRadius: '4px', background: '#F0F4F2', color: '#718096',
                                                                    fontFamily: 'var(--font-mono)',
                                                                }}>
                                                                    ID: {part.id?.slice(0, 8)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
