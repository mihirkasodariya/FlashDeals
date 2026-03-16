import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft,
    Store,
    MapPin,
    Phone,
    ShieldCheck,
    Clock,
    FileText,
    Trash2,
    Zap,
    CheckCircle,
    XCircle,
    AlertTriangle,
    X,
    AlertCircle,
    Calendar,
    Info,
    Eye
} from 'lucide-react';
import { format, isWithinInterval, isBefore, isAfter } from 'date-fns';

const API_URL = 'http://localhost:5000/api';

// Internal Modal Styles (Consistent with Offers Page)
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    paddingTop: '12vh'
};

const modalContentStyle = {
    background: 'white',
    width: '100%',
    maxWidth: '440px',
    borderRadius: '32px',
    padding: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255,255,255,0.1)',
    maxHeight: '90vh',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
};

const closeButtonStyle = {
    background: '#f8fafc',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    cursor: 'pointer'
};

const VendorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, hasPermission } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '' });
    const [detailsModal, setDetailsModal] = useState(null);
    const [addOfferModal, setAddOfferModal] = useState({
        show: false,
        title: '',
        description: '',
        category: 'Groceries',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        image: null,
        preview: null
    });

    const categories = [
        'Groceries', 'Electronics', 'Fashion & Lifestyle', 'Footwear',
        'Home Appliances', 'Beauty & Personal Care', 'Sports & Fitness',
        'Automotive Accessories', 'Kids & Toys', 'Books & Stationary'
    ];

    useEffect(() => {
        fetchVendorDetails();
    }, [id, token]);

    const fetchVendorDetails = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`${API_URL}/admin/vendor/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setData(resp.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            setUpdating(true);
            const resp = await axios.put(`${API_URL}/admin/status/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setData(prev => ({ ...prev, vendor: resp.data.user }));
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteOffer = async () => {
        try {
            const resp = await axios.delete(`${API_URL}/admin/offer/${deleteModal.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setData(prev => ({
                    ...prev,
                    offers: prev.offers.filter(o => o._id !== deleteModal.id)
                }));
                setDeleteModal({ show: false, id: null, title: '' });
            }
        } catch (err) {
            alert('Action authorized, but protocol failed.');
        }
    };

    const handleAddOffer = async () => {
        try {
            if (!addOfferModal.image) return alert("Launch image required.");
            setUpdating(true);

            const formData = new FormData();
            formData.append('title', addOfferModal.title);
            formData.append('description', addOfferModal.description);
            formData.append('category', addOfferModal.category);
            formData.append('startDate', addOfferModal.startDate);
            formData.append('endDate', addOfferModal.endDate);
            formData.append('image', addOfferModal.image);

            const resp = await axios.post(`${API_URL}/admin/vendor/${id}/offer`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (resp.data.success) {
                setData(prev => ({
                    ...prev,
                    offers: [resp.data.offer, ...prev.offers]
                }));
                setAddOfferModal({
                    show: false,
                    title: '',
                    description: '',
                    category: 'Groceries',
                    startDate: format(new Date(), 'yyyy-MM-dd'),
                    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                    image: null,
                    preview: null
                });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to dispatch offer.');
        } finally {
            setUpdating(false);
        }
    };

    const getOfferStatus = (startDate, endDate) => {
        try {
            const now = new Date();
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return { label: 'Invalid Date', type: 'error' };
            }

            if (isWithinInterval(now, { start, end })) return { label: 'Live', type: 'success' };
            if (isBefore(now, start)) return { label: 'Upcoming', type: 'warning' };
            return { label: 'Expired', type: 'error' };
        } catch (e) {
            return { label: 'Date Error', type: 'error' };
        }
    };

    if (loading) return <div className="p-8">initializng secure registry access...</div>;
    if (!data?.vendor) return <div className="p-8">vendor registry not found.</div>;

    const { vendor, offers } = data;

    return (
        <div>
            <div className="animate-fade-in">
                <button onClick={() => navigate('/vendors')} className="btn-modern" style={{ background: 'white', border: '1px solid var(--border)', marginBottom: '32px' }}>
                    <ArrowLeft size={18} />
                    <span>back to directory</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
                    {/* Left Column: Vendor Profile */}
                    <div className="card-modern" style={{ height: 'fit-content', position: 'sticky', top: '24px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: '#f8fafc',
                                borderRadius: '32px',
                                border: '2px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                overflow: 'hidden'
                            }}>
                                {vendor.storeImage ? (
                                    <img
                                        src={`http://localhost:5000${vendor.storeImage}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt={vendor.storeName}
                                    />
                                ) : (
                                    <Store size={48} color="var(--primary)" />
                                )}
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>{vendor.storeName}</h2>
                            <StatusBadge status={vendor.status} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <InfoRow icon={<Phone size={18} />} label="Mobile Number" value={`+91 ${vendor.mobile}`} />
                            <InfoRow
                                icon={<MapPin size={18} />}
                                label="Store Address"
                                value={vendor.storeAddress || (typeof vendor.location === 'object' ? vendor.location?.address : vendor.location) || 'Not provided'}
                            />
                            <InfoRow icon={<FileText size={18} />} label="ID Document" value={vendor.idType ? `${vendor.idType}: ${vendor.idNumber}` : 'Not Uploaded'} />
                            <InfoRow icon={<Clock size={18} />} label="Member Since" value={format(new Date(vendor.createdAt), 'MMM dd, yyyy')} />
                        </div>

                        {hasPermission('edit_vendor') && (
                            <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'lowercase', color: 'var(--text-muted)', marginBottom: '16px' }}>approval panel</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button
                                        onClick={() => handleStatusUpdate('approved')}
                                        className="btn-modern"
                                        disabled={updating || vendor.status === 'approved'}
                                        style={{ background: '#dcfce7', color: '#15803d', border: 'none', justifyContent: 'center' }}
                                    >
                                        <CheckCircle size={18} />
                                        <span>approve</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        className="btn-modern"
                                        disabled={updating || vendor.status === 'rejected'}
                                        style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', justifyContent: 'center' }}
                                    >
                                        <XCircle size={18} />
                                        <span>reject</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('under_review')}
                                        className="btn-modern"
                                        disabled={updating || vendor.status === 'under_review'}
                                        style={{ gridColumn: 'span 2', background: '#fef9c3', color: '#854d0e', border: 'none', justifyContent: 'center' }}
                                    >
                                        <AlertTriangle size={18} />
                                        <span>set under review</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Offers List */}
                    <div className="card-modern">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>associated Offerz</h3>
                                <span style={{ padding: '4px 10px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '8px', fontSize: '11px', fontWeight: '800', width: 'fit-content' }}>
                                    {offers.length} active deals
                                </span>
                            </div>
                            {hasPermission('create_offer') && (
                                <button
                                    onClick={() => setAddOfferModal(p => ({ ...p, show: true }))}
                                    className="btn-modern"
                                    style={{ background: 'var(--primary)', color: 'white', border: 'none' }}
                                >
                                    <Zap size={18} />
                                    <span>create new offer</span>
                                </button>
                            )}
                        </div>

                        {offers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', background: '#f8fafc', borderRadius: '24px' }}>
                                <Zap size={40} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                <p style={{ fontWeight: '700', color: '#94a3b8' }}>no offers published by this vendor yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {offers.map(offer => {
                                    const status = getOfferStatus(offer.startDate, offer.endDate);
                                    return (
                                        <div key={offer._id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: '#fdfdfe', border: '1.5px solid #f1f5f9', borderRadius: '24px' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <img src={`http://localhost:5000${offer.image || '/uploads/offers/default.png'}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <p style={{ fontWeight: '800', fontSize: '15px' }}>{offer.title}</p>
                                                    <span className={`badge-modern badge-${status.type}`} style={{ fontSize: '9px', padding: '2px 6px' }}>{status.label}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                    <span className="badge-modern badge-info">{offer.category}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{format(new Date(offer.startDate), 'dd MMM')} live.</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{format(new Date(offer.endDate), 'dd MMM')} exp.</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '20px', marginRight: '15px' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '14px', fontWeight: '900' }}>{offer.visits || 0}</p>
                                                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'lowercase' }}>visits</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent)' }}>{offer.impressions || 0}</p>
                                                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'lowercase' }}>impressions</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => setDetailsModal(offer)}
                                                    className="action-btn-modern info"
                                                    title="specifications"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {hasPermission('delete_offer') && (
                                                    <button
                                                        onClick={() => setDeleteModal({ show: true, id: offer._id, title: offer.title })}
                                                        className="action-btn-modern danger"
                                                        title="remove offer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Manual Offer Creation Modal */}
            {addOfferModal.show && (
                <div style={modalOverlayStyle} onClick={() => setAddOfferModal(p => ({ ...p, show: false }))}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-1px' }}>deploy new merchant offer</h2>
                            <button onClick={() => setAddOfferModal(p => ({ ...p, show: false }))} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div
                                    onClick={() => document.getElementById('offerImageInput').click()}
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        background: '#f8fafc',
                                        borderRadius: '24px',
                                        border: '2px dashed #e2e8f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    {addOfferModal.preview ? (
                                        <img src={addOfferModal.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <>
                                            <Zap size={24} color="#94a3b8" />
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginTop: '8px' }}>add image</span>
                                        </>
                                    )}
                                    <input
                                        id="offerImageInput"
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setAddOfferModal(p => ({
                                                    ...p,
                                                    image: file,
                                                    preview: URL.createObjectURL(file)
                                                }));
                                            }
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>offer title</label>
                                        <input
                                            style={inputModernStyle}
                                            placeholder="e.g. 50% Off on All Shoes"
                                            value={addOfferModal.title}
                                            onChange={e => setAddOfferModal(p => ({ ...p, title: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>offer category</label>
                                        <select
                                            style={inputModernStyle}
                                            value={addOfferModal.category}
                                            onChange={e => setAddOfferModal(p => ({ ...p, category: e.target.value }))}
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>launch date</label>
                                    <input
                                        type="date"
                                        style={inputModernStyle}
                                        value={addOfferModal.startDate}
                                        onChange={e => setAddOfferModal(p => ({ ...p, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>expiry date</label>
                                    <input
                                        type="date"
                                        style={inputModernStyle}
                                        value={addOfferModal.endDate}
                                        onChange={e => setAddOfferModal(p => ({ ...p, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>deal description</label>
                                <textarea
                                    style={{ ...inputModernStyle, height: '100px', padding: '12px 16px', resize: 'none' }}
                                    placeholder="Write compelling details about this offer..."
                                    value={addOfferModal.description}
                                    onChange={e => setAddOfferModal(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            <button
                                onClick={handleAddOffer}
                                disabled={updating}
                                className="btn-modern"
                                style={{ width: '100%', background: 'var(--primary)', color: 'white', height: '54px', justifyContent: 'center', marginTop: '10px' }}
                            >
                                {updating ? 'syncing with server...' : 'dispatch live offer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Offer Details Modal */}
            {detailsModal && (
                <div style={modalOverlayStyle} onClick={() => setDetailsModal(null)}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '560px', animation: 'fadeIn 0.3s ease forwards' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>deal specifications</h2>
                            <button onClick={() => setDetailsModal(null)} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '160px' }}>
                                <img
                                    src={`http://localhost:5000${detailsModal.image || '/uploads/offers/default.png'}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    alt=""
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', marginBottom: '4px' }}>offer title</p>
                                    <p style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>{detailsModal.title}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', marginBottom: '4px' }}>category</p>
                                        <span className="badge-modern badge-info">{detailsModal.category}</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', marginBottom: '4px' }}>status</p>
                                        {(() => {
                                            if (!detailsModal.startDate || !detailsModal.endDate) return null;
                                            const status = getOfferStatus(detailsModal.startDate, detailsModal.endDate);
                                            return <span className={`badge-modern badge-${status.type}`}>{status.label}</span>;
                                        })()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Calendar size={12} color="var(--text-muted)" />
                                            <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase' }}>launch</p>
                                        </div>
                                        <p style={{ fontSize: '13px', fontWeight: '800' }}>
                                            {detailsModal.startDate ? format(new Date(detailsModal.startDate), 'MMM dd, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                    <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Calendar size={12} color="var(--text-muted)" />
                                            <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase' }}>expiry</p>
                                        </div>
                                        <p style={{ fontSize: '13px', fontWeight: '800' }}>
                                            {detailsModal.endDate ? format(new Date(detailsModal.endDate), 'MMM dd, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', background: 'var(--accent-light)', padding: '12px 16px', borderRadius: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--accent)', textTransform: 'lowercase', marginBottom: '2px' }}>total visits</p>
                                        <p style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)' }}>{detailsModal.visits || 0}</p>
                                    </div>
                                    <div style={{ width: '1px', background: 'rgba(59, 130, 246, 0.2)' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--accent)', textTransform: 'lowercase', marginBottom: '2px' }}>total impressions</p>
                                        <p style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)' }}>{detailsModal.impressions || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Info size={16} color="var(--primary)" />
                                <p style={{ fontSize: '12px', fontWeight: '900', textTransform: 'lowercase', letterSpacing: '0.5px' }}>vendor description</p>
                            </div>
                            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, fontWeight: '500' }}>
                                {detailsModal.description || 'no detailed description provided for this flash sale.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Deletion Modal */}
            {deleteModal.show && (
                <div style={modalOverlayStyle} onClick={() => setDeleteModal({ show: false, id: null, title: '' })}>
                    <div className="animate-fade-in" style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
                            <button onClick={() => setDeleteModal({ show: false, id: null, title: '' })} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', padding: '10px 0 30px' }}>
                            <div style={alertIconWrapperStyle}>
                                <AlertCircle size={48} color="#ef4444" />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '12px' }}>terminate offer?</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px', lineHeight: 1.6, padding: '0 20px' }}>
                                you are about to permanently remove <span style={{ color: 'var(--text)', fontWeight: '800' }}>"{deleteModal.title}"</span> from the platform. this action cannot be undone.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null, title: '' })}
                                className="btn-modern"
                                style={{ background: '#f1f5f9', border: 'none', color: '#444', justifyContent: 'center', padding: '16px' }}
                            >
                                preservation
                            </button>
                            <button
                                onClick={handleDeleteOffer}
                                className="btn-modern"
                                style={{ background: '#ef4444', border: 'none', color: 'white', justifyContent: 'center', padding: '16px', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}
                            >
                                confirm erasure
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease forwards;
        }
        .action-btn-modern {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: white;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .action-btn-modern:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-light);
          transform: scale(1.05);
        }
        .action-btn-modern.info {
          color: #3b82f6;
          background: #eff6ff;
          border-color: #dbeafe;
        }
        .action-btn-modern.info:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .action-btn-modern.danger {
          color: #ef4444;
          background: #fef2f2;
          border-color: #fee2e2;
        }
        .action-btn-modern.danger:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }
        .animate-fade-in::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
        <div>
            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', letterSpacing: '0.5px' }}>{label}</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{value || 'not provided'}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'approved': return <span className="badge-modern badge-success" style={{ marginTop: '8px', display: 'inline-block' }}>approved</span>;
        case 'under_review': return <span className="badge-modern badge-warning" style={{ marginTop: '8px', display: 'inline-block' }}>under review</span>;
        case 'submitted': return <span className="badge-modern badge-info" style={{ marginTop: '8px', display: 'inline-block' }}>submitted</span>;
        case 'rejected': return <span className="badge-modern badge-error" style={{ marginTop: '8px', display: 'inline-block' }}>rejected</span>;
        default: return <span className="badge-modern" style={{ marginTop: '8px', display: 'inline-block' }}>{status}</span>;
    }
};

const inputModernStyle = {
    width: '100%',
    height: '50px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    padding: '0 16px',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    transition: 'all 0.2s'
};

const alertIconWrapperStyle = {
    width: '80px',
    height: '80px',
    background: '#fee2e2',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
};

export default VendorDetails;
