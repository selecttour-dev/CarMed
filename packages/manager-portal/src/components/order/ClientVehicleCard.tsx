import { User, Phone, Car, MapPin, MessageSquare, Calendar, Gauge } from 'lucide-react';

interface Props {
    order: any;
    isCompleted: boolean;
}

export default function ClientVehicleCard({ order, isCompleted }: Props) {
    return (
        <div className="cv-card" style={{ opacity: isCompleted ? 0.92 : 1 }}>
            {/* Header */}
            <div className="cv-header">
                <div className="cv-header-icon">
                    <User size={15} style={{ color: '#047857' }} />
                </div>
                <span className="cv-header-title">კლიენტი & მანქანა</span>
            </div>

            <div className="cv-body">
                {/* Client + Vehicle grid */}
                <div className="cv-grid" style={{ marginBottom: (order.address || order.problemDescription) ? '14px' : 0 }}>
                    {/* Client */}
                    {order.client && (
                        <div className="cv-client">
                            <div className="cv-client-info">
                                <div className="cv-client-avatar">
                                    <User size={18} style={{ color: 'white' }} />
                                </div>
                                <div>
                                    <p className="cv-client-name">{order.client.name}</p>
                                    <p className="cv-client-phone">
                                        <Phone size={10} /> {order.client.phone}
                                    </p>
                                </div>
                            </div>
                            <a href={`tel:${order.client.phone}`} className="cv-call-btn">
                                <Phone size={15} />
                            </a>
                        </div>
                    )}

                    {/* Vehicle */}
                    {order.vehicle && (
                        <div className="cv-vehicle">
                            <div className="cv-vehicle-avatar">
                                <Car size={18} style={{ color: 'white' }} />
                            </div>
                            <div className="cv-vehicle-info">
                                <div className="cv-vehicle-name">
                                    <span className="cv-vehicle-make">{order.vehicle.make} {order.vehicle.model}</span>
                                    <span className="cv-vehicle-year">
                                        <Calendar size={9} /> {order.vehicle.year}
                                    </span>
                                </div>
                                {order.vehicle.plateNumber && (
                                    <p className="cv-vehicle-plate">
                                        <Gauge size={10} style={{ opacity: 0.5 }} /> {order.vehicle.plateNumber}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Address */}
                {order.address && (
                    <div className="cv-address" style={{ marginBottom: order.problemDescription ? '10px' : 0 }}>
                        <MapPin size={14} style={{ color: 'var(--ink-faint)', marginTop: '1px', flexShrink: 0 }} />
                        <span>{order.address}</span>
                    </div>
                )}

                {/* Problem Description */}
                {order.problemDescription && (
                    <div className="cv-problem">
                        <div className="cv-problem-header">
                            <MessageSquare size={12} style={{ color: '#EA580C' }} />
                            <span>პრობლემის აღწერა</span>
                        </div>
                        <p className="cv-problem-text">{order.problemDescription}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
