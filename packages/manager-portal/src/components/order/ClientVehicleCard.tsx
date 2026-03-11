import { User, Phone, Car, MapPin, MessageSquare, Calendar, Gauge } from 'lucide-react';

interface Props {
    order: any;
    isCompleted: boolean;
}

export default function ClientVehicleCard({ order, isCompleted }: Props) {
    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
            opacity: isCompleted ? 0.92 : 1,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 24px 14px',
                background: 'linear-gradient(135deg, #F8FAF9, #F0F4F2)',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: '10px',
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'rgba(4,120,87,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <User size={15} style={{ color: '#047857' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    კლიენტი & მანქანა
                </span>
            </div>

            <div style={{ padding: '20px 24px' }}>
                {/* Client + Vehicle in a horizontal layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: order.vehicle ? '1fr 1fr' : '1fr',
                    gap: '14px',
                    marginBottom: (order.address || order.problemDescription) ? '14px' : 0,
                }}>
                    {/* Client */}
                    {order.client && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 16px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                            border: '1px solid rgba(5,150,105,0.08)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #059669, #047857)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 3px 10px rgba(5,150,105,0.25)',
                                }}>
                                    <User size={18} style={{ color: 'white' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                                        {order.client.name}
                                    </p>
                                    <p style={{
                                        fontSize: '12px', color: '#065F46',
                                        display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px',
                                    }}>
                                        <Phone size={10} /> {order.client.phone}
                                    </p>
                                </div>
                            </div>
                            <a href={`tel:${order.client.phone}`} style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                border: '1px solid rgba(0,0,0,0.06)',
                                color: '#059669',
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(5,150,105,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; }}
                            >
                                <Phone size={15} />
                            </a>
                        </div>
                    )}

                    {/* Vehicle */}
                    {order.vehicle && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 16px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #F0F7FF, #EFF6FF)',
                            border: '1px solid rgba(37,99,235,0.06)',
                        }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 12,
                                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(37,99,235,0.25)',
                            }}>
                                <Car size={18} style={{ color: 'white' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700 }}>
                                        {order.vehicle.make} {order.vehicle.model}
                                    </span>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 600,
                                        color: '#3B82F6', background: 'rgba(37,99,235,0.08)',
                                        padding: '2px 8px', borderRadius: '6px',
                                        display: 'flex', alignItems: 'center', gap: '3px',
                                    }}>
                                        <Calendar size={9} /> {order.vehicle.year}
                                    </span>
                                </div>
                                {order.vehicle.plateNumber && (
                                    <p style={{
                                        fontSize: '12px', fontFamily: 'var(--font-mono)',
                                        color: 'var(--ink-muted)', fontWeight: 600,
                                        letterSpacing: '0.05em', marginTop: '3px',
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                    }}>
                                        <Gauge size={10} style={{ opacity: 0.5 }} /> {order.vehicle.plateNumber}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Address */}
                {order.address && (
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '10px 14px', borderRadius: '10px',
                        background: '#FAFBFC',
                        marginBottom: order.problemDescription ? '10px' : 0,
                    }}>
                        <MapPin size={14} style={{ color: 'var(--ink-faint)', marginTop: '1px', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: 'var(--ink-light)', lineHeight: 1.6 }}>
                            {order.address}
                        </span>
                    </div>
                )}

                {/* Problem Description */}
                {order.problemDescription && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)',
                        border: '1px solid rgba(234,88,12,0.08)',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            marginBottom: '6px',
                        }}>
                            <MessageSquare size={12} style={{ color: '#EA580C' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C' }}>
                                პრობლემის აღწერა
                            </span>
                        </div>
                        <p style={{
                            fontSize: '13px', color: '#78350F', lineHeight: 1.6,
                            fontWeight: 500,
                        }}>
                            {order.problemDescription}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
