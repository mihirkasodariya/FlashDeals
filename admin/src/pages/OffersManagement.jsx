import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Tag,
    Search,
    Filter,
    Trash2,
    Edit2,
    Zap,
    AlertTriangle,
    Eye,
    Store,
    Clock,
    X,
    AlertCircle,
    Calendar,
    Info
} from 'lucide-react';
import { format, isWithinInterval, isBefore } from 'date-fns';

const API_URL = 'http://localhost:5000/api';

// Internal Modal Styles
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

const OffersManagement = () => {
    const { token, hasPermission } = useAuth();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '' });
    const [detailsModal, setDetailsModal] = useState(null);
    const [editModal, setEditModal] = useState({
        show: false,
        id: null,
        title: '',
        description: '',
        category: '',
        startDate: '',
        endDate: '',
        image: null,
        preview: null
    });
    const [updating, setUpdating] = useState(false);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchOffers();
        fetchCategories();
    }, [token]);

    const fetchCategories = async () => {
        try {
            const resp = await axios.get(`${API_URL}/categories?activeOnly=true`);
            if (resp.data.success) {
                setCategories(resp.data.categories);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`${API_URL}/admin/offers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setOffers(resp.data.offers);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const resp = await axios.delete(`${API_URL}/admin/offer/${deleteModal.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setOffers(offers.filter(o => o._id !== deleteModal.id));
                setDeleteModal({ show: false, id: null, title: '' });
            }
        } catch (err) {
            alert('Action authorized, but protocol failed.');
        }
    };

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            const formData = new FormData();
            formData.append('title', editModal.title);
            formData.append('description', editModal.description);
            formData.append('category', editModal.category);
            formData.append('startDate', editModal.startDate);
            formData.append('endDate', editModal.endDate);
            if (editModal.image) {
                formData.append('image', editModal.image);
            }

            const resp = await axios.put(`${API_URL}/admin/offer/${editModal.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (resp.data.success) {
                setOffers(offers.map(o => o._id === editModal.id ? resp.data.offer : o));
                setEditModal({ show: false, id: null, title: '', description: '', category: '', startDate: '', endDate: '', image: null, preview: null });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update offer');
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

    const filteredOffers = offers.filter(o =>
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.category?.name || String(o.category)).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Offerz management</h1>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '16px' }} />
                        <input
                            type="text"
                            placeholder="search by deal title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-modern"
                        />
                    </div>
                </div>
            </header>

            <div className="table-wrapper">
                <table className="table-modern">
                    <thead>
                        <tr>
                            <th>flash deal anchor</th>
                            <th>category</th>
                            <th>status</th>
                            <th>lifecycle</th>
                            <th style={{ textAlign: 'center' }}>visits</th>
                            <th style={{ textAlign: 'center' }}>impressions</th>
                            <th style={{ textAlign: 'right' }}>moderation tools</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOffers.map((offer, idx) => {
                            const status = getOfferStatus(offer.startDate, offer.endDate);
                            return (
                                <tr key={offer._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                background: '#f1f5f9',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                            }}>
                                                <img
                                                    src={`http://localhost:5000${offer.image || '/uploads/offers/default.png'}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    alt=""
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>{offer.title}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                                                        <Store size={10} />
                                                        <span>{offer.vendorId?.storeName || 'Vendor'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge-modern badge-info" style={{ fontWeight: '800', background: 'rgba(59, 130, 246, 0.08)' }}>{offer.category?.name || offer.category}</span>
                                    </td>
                                    <td>
                                        <span className={`badge-modern badge-${status.type}`}>{status.label}</span>
                                    </td>
                                    <td>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: status.type === 'error' ? 'var(--error)' : '#f59e0b',
                                            fontWeight: '800',
                                            fontSize: '13px'
                                        }}>
                                            <Clock size={14} />
                                            <span>{format(new Date(offer.endDate), 'MMM dd')}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '15px' }}>{offer.visits || 0}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: '900', color: 'var(--accent)', fontSize: '15px' }}>{offer.impressions || 0}</div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {hasPermission('view_offers') && (
                                                <button
                                                    onClick={() => setDetailsModal(offer)}
                                                    className="action-btn-modern info"
                                                    title="specifications"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                            {hasPermission('edit_offer') && (
                                                <button
                                                    onClick={() => setEditModal({
                                                        show: true,
                                                        id: offer._id,
                                                        title: offer.title,
                                                        description: offer.description,
                                                        category: offer.category?._id || offer.category,
                                                        startDate: format(new Date(offer.startDate), 'yyyy-MM-dd'),
                                                        endDate: format(new Date(offer.endDate), 'yyyy-MM-dd'),
                                                        image: null,
                                                        preview: `http://localhost:5000${offer.image}`
                                                    })}
                                                    className="action-btn-modern warning"
                                                    title="edit deal"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                            {hasPermission('delete_offer') && (
                                                <button
                                                    onClick={() => setDeleteModal({ show: true, id: offer._id, title: offer.title })}
                                                    className="action-btn-modern danger"
                                                    title="terminate offer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Offer Details Modal */}
            {detailsModal && (
                <div style={modalOverlayStyle} onClick={() => setDetailsModal(null)}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
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
                                        <span className="badge-modern badge-info">{detailsModal.category?.name || detailsModal.category}</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', marginBottom: '4px' }}>status</p>
                                        {(() => {
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
                                        <p style={{ fontSize: '13px', fontWeight: '800' }}>{format(new Date(detailsModal.startDate), 'MMM dd, yyyy')}</p>
                                    </div>
                                    <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Calendar size={12} color="var(--text-muted)" />
                                            <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase' }}>expiry</p>
                                        </div>
                                        <p style={{ fontSize: '13px', fontWeight: '800' }}>{format(new Date(detailsModal.endDate), 'MMM dd, yyyy')}</p>
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
                                {detailsModal.description || 'No detailed description provided for this flash sale.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Offer Modal */}
            {editModal.show && (
                <div style={modalOverlayStyle} onClick={() => setEditModal(p => ({ ...p, show: false }))}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-1px' }}>edit flash deal</h2>
                            <button onClick={() => setEditModal(p => ({ ...p, show: false }))} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div
                                    onClick={() => document.getElementById('editOfferImageInput').click()}
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
                                    {editModal.preview ? (
                                        <img src={editModal.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <>
                                            <Zap size={24} color="#94a3b8" />
                                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginTop: '8px' }}>CHANGE IMAGE</span>
                                        </>
                                    )}
                                    <input
                                        id="editOfferImageInput"
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setEditModal(p => ({
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
                                            value={editModal.title}
                                            onChange={e => setEditModal(p => ({ ...p, title: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>offer category</label>
                                        <select
                                            style={inputModernStyle}
                                            value={editModal.category}
                                            onChange={e => setEditModal(p => ({ ...p, category: e.target.value }))}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
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
                                        value={editModal.startDate}
                                        onChange={e => setEditModal(p => ({ ...p, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>expiry date</label>
                                    <input
                                        type="date"
                                        style={inputModernStyle}
                                        value={editModal.endDate}
                                        onChange={e => setEditModal(p => ({ ...p, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>deal description</label>
                                <textarea
                                    style={{ ...inputModernStyle, height: '100px', padding: '12px 16px', resize: 'none' }}
                                    placeholder="Write compelling details about this offer..."
                                    value={editModal.description}
                                    onChange={e => setEditModal(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={updating}
                                className="btn-modern"
                                style={{ width: '100%', background: 'var(--primary)', color: 'white', height: '54px', justifyContent: 'center', marginTop: '10px' }}
                            >
                                {updating ? 'syncing changes...' : 'update offer details'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deletion Modal */}
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
                                onClick={handleDelete}
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
        .action-btn-modern.warning {
          color: #f59e0b;
          background: #fffbeb;
          border-color: #fef3c7;
        }
        .action-btn-modern.warning:hover {
          background: #f59e0b;
          color: white;
          border-color: #f59e0b;
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

export default OffersManagement;
