import { useState, useRef } from 'react';
import { Camera, Upload, X, Image, Truck, Wrench, RotateCcw } from 'lucide-react';

interface PhotoGroup {
    key: string;
    label: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
}

const PHOTO_GROUPS: PhotoGroup[] = [
    { key: 'pickup', label: 'წაყვანის ფოტოები', description: 'მანქანის მდგომარეობა წაყვანისას', icon: Truck, color: '#2563EB', bg: '#EFF6FF' },
    { key: 'repair', label: 'შეკეთების ფოტოები', description: 'პროცესის და ნაწილების ფოტოები', icon: Wrench, color: '#0891B2', bg: '#ECFEFF' },
    { key: 'return', label: 'დაბრუნების ფოტოები', description: 'შეკეთებული მანქანის ფოტოები', icon: RotateCcw, color: '#059669', bg: '#D1FAE5' },
];

interface Props {
    orderStatus: string;
    isCompleted: boolean;
}

export default function PhotoUploadSection({ orderStatus, isCompleted }: Props) {
    const [photos, setPhotos] = useState<Record<string, string[]>>({
        pickup: [],
        repair: [],
        return: [],
    });

    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleFileSelect = (groupKey: string, files: FileList | null) => {
        if (!files) return;
        const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
        setPhotos(prev => ({
            ...prev,
            [groupKey]: [...prev[groupKey], ...newPhotos],
        }));
    };

    const removePhoto = (groupKey: string, index: number) => {
        setPhotos(prev => ({
            ...prev,
            [groupKey]: prev[groupKey].filter((_, i) => i !== index),
        }));
    };

    const getVisibleGroups = () => {
        const step = {
            'PENDING': 0, 'ACCEPTED': 1, 'PICKED_UP': 2,
            'IN_PROGRESS': 3, 'COMPLETED': 4,
        }[orderStatus] || 0;

        return PHOTO_GROUPS.filter((g) => {
            if (g.key === 'pickup') return step >= 2;
            if (g.key === 'repair') return step >= 3;
            if (g.key === 'return') return step >= 4;
            return false;
        });
    };

    const visibleGroups = getVisibleGroups();
    if (visibleGroups.length === 0) return null;

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            opacity: isCompleted ? 0.9 : 1,
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px 14px',
                background: 'linear-gradient(135deg, #FAF5FF, #F3E8FF)',
                borderBottom: '1px solid rgba(139,92,246,0.06)',
                display: 'flex', alignItems: 'center', gap: '10px',
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'rgba(139,92,246,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Camera size={14} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>ფოტოები</h3>
                    <p style={{ fontSize: '11px', color: 'var(--ink-faint)', marginTop: '1px' }}>
                        {isCompleted ? 'ატვირთული ფოტოები' : 'ატვირთეთ ფოტოები თითოეული ეტაპისთვის'}
                    </p>
                </div>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visibleGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const groupPhotos = photos[group.key] || [];

                    return (
                        <div key={group.key} style={{
                            padding: '14px', borderRadius: '14px',
                            background: `${group.bg}60`, border: `1px solid ${group.color}12`,
                        }}>
                            {/* Group header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                marginBottom: groupPhotos.length > 0 ? '12px' : '0',
                            }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    background: `${group.color}12`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <GroupIcon size={14} style={{ color: group.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: group.color }}>
                                        {group.label}
                                    </span>
                                    {groupPhotos.length > 0 && (
                                        <span style={{
                                            fontSize: '10px', fontFamily: 'var(--font-mono)',
                                            color: 'var(--ink-faint)', marginLeft: '6px',
                                            background: 'rgba(0,0,0,0.04)', padding: '1px 6px', borderRadius: '4px',
                                        }}>
                                            {groupPhotos.length}
                                        </span>
                                    )}
                                </div>
                                {!isCompleted && (
                                    <button
                                        onClick={() => fileInputRefs.current[group.key]?.click()}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '5px 12px', borderRadius: '8px',
                                            background: `${group.color}12`, border: `1px solid ${group.color}18`,
                                            color: group.color, fontSize: '11px', fontWeight: 600,
                                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = `${group.color}20`}
                                        onMouseLeave={e => e.currentTarget.style.background = `${group.color}12`}
                                    >
                                        <Upload size={11} /> ატვირთვა
                                    </button>
                                )}
                                <input
                                    ref={(el) => { fileInputRefs.current[group.key] = el; }}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileSelect(group.key, e.target.files)}
                                />
                            </div>

                            {/* Photo grid */}
                            {groupPhotos.length > 0 ? (
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
                                    gap: '8px',
                                }}>
                                    {groupPhotos.map((photo, idx) => (
                                        <div key={idx} style={{
                                            position: 'relative', borderRadius: '10px', overflow: 'hidden',
                                            aspectRatio: '1', background: '#f3f4f6',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                        }}>
                                            <img src={photo} alt="" style={{
                                                width: '100%', height: '100%', objectFit: 'cover',
                                            }} />
                                            {!isCompleted && (
                                                <button
                                                    onClick={() => removePhoto(group.key, idx)}
                                                    style={{
                                                        position: 'absolute', top: 4, right: 4,
                                                        width: 20, height: 20, borderRadius: '50%',
                                                        background: 'rgba(0,0,0,0.6)', color: 'white',
                                                        border: 'none', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.9)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                                                >
                                                    <X size={10} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!isCompleted && (
                                        <button
                                            onClick={() => fileInputRefs.current[group.key]?.click()}
                                            style={{
                                                aspectRatio: '1', borderRadius: '10px',
                                                border: `2px dashed ${group.color}28`,
                                                background: 'transparent',
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center', gap: '2px',
                                                cursor: 'pointer', color: group.color,
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = `${group.color}50`}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = `${group.color}28`}
                                        >
                                            <Camera size={16} />
                                            <span style={{ fontSize: '9px', fontWeight: 600 }}>+</span>
                                        </button>
                                    )}
                                </div>
                            ) : !isCompleted ? (
                                <button
                                    onClick={() => fileInputRefs.current[group.key]?.click()}
                                    style={{
                                        width: '100%', padding: '18px', borderRadius: '12px',
                                        border: `2px dashed ${group.color}22`, background: 'transparent',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        cursor: 'pointer', color: group.color, marginTop: '8px',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${group.color}40`; e.currentTarget.style.background = `${group.color}04`; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${group.color}22`; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12,
                                        background: `${group.color}10`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Camera size={18} />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{group.description}</span>
                                    <span style={{ fontSize: '10px', opacity: 0.6 }}>დააჭირეთ ასატვირთად</span>
                                </button>
                            ) : (
                                <div style={{
                                    padding: '14px', textAlign: 'center', fontSize: '12px',
                                    color: 'var(--ink-faint)', marginTop: '6px',
                                }}>
                                    <Image size={18} style={{ marginBottom: '6px', opacity: 0.3 }} />
                                    <p>ფოტოები არ არის ატვირთული</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
