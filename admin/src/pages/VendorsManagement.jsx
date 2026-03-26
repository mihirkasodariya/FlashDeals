import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Store,
    ShieldCheck,
    Clock,
    MapPin,
    Search,
    CheckCircle,
    XCircle,
    MoreVertical,
    Phone,
    ArrowUpRight,
    Trash2,
    X,
    AlertCircle,
    Edit2,
    Eye,
    Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const VendorsManagement = () => {
    const { token, hasPermission } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [createModal, setCreateModal] = useState({ show: false, name: '', mobile: '', password: '', storeName: '', storeAddress: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
    const [editModal, setEditModal] = useState({ show: false, id: null, storeName: '', mobile: '', storeAddress: '' });
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);

    const API_URL = 'https://api.offerz.live/api';

    useEffect(() => {
        fetchVendors();
    }, [token]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`${API_URL}/admin/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setVendors(resp.data.vendors);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVendor = async () => {
        try {
            setUpdating(true);
            const resp = await axios.post(`${API_URL}/admin/vendor`, {
                name: createModal.name,
                mobile: createModal.mobile,
                password: createModal.password,
                storeName: createModal.storeName,
                storeAddress: createModal.storeAddress
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setVendors(prev => [resp.data.vendor, ...prev]);
                setCreateModal({ show: false, name: '', mobile: '', password: '', storeName: '', storeAddress: '' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create vendor protocol.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteVendor = async () => {
        try {
            setDeleting(true);
            const resp = await axios.delete(`${API_URL}/admin/vendor/${deleteModal.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setVendors(prev => prev.filter(v => v._id !== deleteModal.id));
                setDeleteModal({ show: false, id: null, name: '' });
            }
        } catch (err) {
            alert('Failed to terminate vendor account.');
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdateVendor = async () => {
        try {
            setUpdating(true);
            const resp = await axios.put(`${API_URL}/admin/user/${editModal.id}`, {
                storeName: editModal.storeName,
                mobile: editModal.mobile,
                storeAddress: editModal.storeAddress
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setVendors(prev => prev.map(v => v._id === editModal.id ? resp.data.user : v));
                setEditModal({ show: false, id: null, storeName: '', mobile: '', storeAddress: '' });
            }
        } catch (err) {
            alert('Failed to update vendor credentials.');
        } finally {
            setUpdating(false);
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.mobile.includes(searchTerm)
    );

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'approved': return <span className="badge-modern badge-success">Approved</span>;
            case 'under_review': return <span className="badge-modern badge-warning">Under Review</span>;
            case 'submitted': return <span className="badge-modern badge-info">Submitted</span>;
            case 'rejected': return <span className="badge-modern badge-error">Rejected</span>;
            default: return <span className="badge-modern">{status}</span>;
        }
    };

    return (
        <div>
            <div className="animate-fade-in">
                <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Venders</h1>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '16px' }} />
                            <input
                                type="text"
                                placeholder="search by store name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-modern"
                            />
                        </div>
                        <button
                            onClick={() => setCreateModal({ show: true, name: '', mobile: '', password: '', storeName: '', storeAddress: '' })}
                            className="btn-modern btn-modern-primary"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}
                        >
                            <Plus size={20} />
                            <span>Add New Vender</span>
                        </button>
                    </div>
                </header>

                <div className="table-wrapper">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>commercial profile</th>
                                <th>contact node</th>
                                <th>vendor status</th>
                                <th>active deals</th>
                                <th>upcoming</th>
                                <th>expired</th>
                                <th style={{ textAlign: 'right' }}>moderation control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map((v, idx) => (
                                <tr key={v._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                background: '#f8fafc',
                                                borderRadius: '20px',
                                                border: '1px solid #e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                                                overflow: 'hidden'
                                            }}>
                                                {v.storeImage ? (
                                                    <img
                                                        src={`https://api.offerz.live${v.storeImage}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        alt={v.storeName}
                                                    />
                                                ) : (
                                                    <Store size={28} color="var(--primary)" />
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>{v.storeName}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                    <MapPin size={12} color="var(--accent)" />
                                                    <span>{v.storeAddress || (typeof v.location === 'object' ? v.location?.address : v.location) || 'Location Pending'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Phone size={14} color="var(--text-muted)" />
                                                <span style={{ fontWeight: '700', color: 'var(--primary-light)', fontSize: '14px' }}>+91 {v.mobile}</span>
                                            </div>
                                            {/* <p style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '800', textTransform: 'lowercase', letterSpacing: '0.5px' }}>kyc verified</p> */}
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={v.status} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                background: '#dcfce7',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                fontWeight: '900',
                                                color: '#15803d'
                                            }}>
                                                {v.offerCounts?.active || 0}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                background: '#fef3c7',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                fontWeight: '900',
                                                color: '#b45309'
                                            }}>
                                                {v.offerCounts?.upcoming || 0}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                background: '#fee2e2',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                fontWeight: '900',
                                                color: '#b91c1c'
                                            }}>
                                                {v.offerCounts?.expired || 0}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <Link to={`/vendors/${v._id}`} className="action-btn-modern info" title="details">
                                                <Eye size={18} />
                                            </Link>
                                            <button
                                                onClick={() => setEditModal({
                                                    show: true,
                                                    id: v._id,
                                                    storeName: v.storeName,
                                                    mobile: v.mobile,
                                                    storeAddress: v.storeAddress || (typeof v.location === 'object' ? v.location?.address : v.location) || ''
                                                })}
                                                className="action-btn-modern warning"
                                                title="edit profile"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ show: true, id: v._id, name: v.storeName })}
                                                className="action-btn-modern danger"
                                                title="delete vendor"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Vendor Modal */}
            {createModal.show && (
                <div style={modalOverlayStyle} onClick={() => setCreateModal({ show: false })}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>new merchant onboarding</h2>
                            <button onClick={() => setCreateModal({ show: false })} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>admin name</label>
                                <input
                                    style={inputModernStyle}
                                    value={createModal.name}
                                    placeholder="e.g. rahul shah"
                                    onChange={e => setCreateModal(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>mobile number</label>
                                <input
                                    style={inputModernStyle}
                                    value={createModal.mobile}
                                    placeholder="10-digit number"
                                    onChange={e => setCreateModal(p => ({ ...p, mobile: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>store name</label>
                            <input
                                style={inputModernStyle}
                                value={createModal.storeName}
                                placeholder="business identification name"
                                onChange={e => setCreateModal(p => ({ ...p, storeName: e.target.value }))}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>access password</label>
                            <input
                                type="password"
                                style={inputModernStyle}
                                value={createModal.password}
                                placeholder="set secure password"
                                onChange={e => setCreateModal(p => ({ ...p, password: e.target.value }))}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '6px', color: 'var(--text-muted)' }}>commercial address</label>
                            <textarea
                                style={{ ...inputModernStyle, height: '80px', padding: '12px 16px', resize: 'none' }}
                                value={createModal.storeAddress}
                                placeholder="complete store location details"
                                onChange={e => setCreateModal(p => ({ ...p, storeAddress: e.target.value }))}
                            />
                        </div>
                        <button
                            onClick={handleCreateVendor}
                            disabled={updating}
                            className="btn-modern"
                            style={{ width: '100%', background: 'var(--primary)', color: 'white', height: '54px', justifyContent: 'center' }}
                        >
                            {updating ? 'initializing merchant...' : 'complete onboarding'}
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.show && (
                <div style={modalOverlayStyle} onClick={() => setEditModal({ show: false, id: null, storeName: '', mobile: '', storeAddress: '' })}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>edit vendor profile</h2>
                            <button onClick={() => setEditModal({ show: false, id: null, storeName: '', mobile: '', storeAddress: '' })} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>store name</label>
                                <input
                                    style={inputModernStyle}
                                    value={editModal.storeName}
                                    onChange={e => setEditModal(p => ({ ...p, storeName: e.target.value }))}
                                    placeholder="enter store name"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>mobile number</label>
                                <input
                                    style={inputModernStyle}
                                    value={editModal.mobile}
                                    onChange={e => setEditModal(p => ({ ...p, mobile: e.target.value }))}
                                    placeholder="enter mobile number"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>store address</label>
                                <textarea
                                    style={{ ...inputModernStyle, height: '100px', padding: '12px 16px', resize: 'none' }}
                                    value={editModal.storeAddress}
                                    onChange={e => setEditModal(p => ({ ...p, storeAddress: e.target.value }))}
                                    placeholder="enter store address"
                                />
                            </div>
                            <button
                                onClick={handleUpdateVendor}
                                disabled={updating}
                                className="btn-modern"
                                style={{ width: '100%', background: 'var(--primary)', color: 'white', marginTop: '10px', height: '54px', justifyContent: 'center' }}
                            >
                                {updating ? 'saving changes...' : 'update vendor registry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Termination Modal */}
            {deleteModal.show && (
                <div style={modalOverlayStyle} onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>
                    <div className="animate-fade-in" style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
                            <button onClick={() => setDeleteModal({ show: false, id: null, name: '' })} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', padding: '10px 0 30px' }}>
                            <div style={alertIconWrapperStyle}>
                                <AlertCircle size={48} color="#ef4444" />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '12px' }}>terminate vendor?</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px', lineHeight: 1.6, padding: '0 20px' }}>
                                you are about to archive <span style={{ color: 'var(--text)', fontWeight: '800' }}>"{deleteModal.name}"</span>. this will revoke all platform privileges for this vendor.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                                className="btn-modern"
                                style={{ background: '#f1f5f9', border: 'none', color: '#444', justifyContent: 'center', padding: '16px' }}
                                disabled={deleting}
                            >
                                cancel
                            </button>
                            <button
                                onClick={handleDeleteVendor}
                                className="btn-modern"
                                style={{ background: '#ef4444', border: 'none', color: 'white', justifyContent: 'center', padding: '16px', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}
                                disabled={deleting}
                            >
                                {deleting ? 'terminating...' : 'confirm termination'}
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
        .action-btn-modern.success:hover {
          border-color: var(--success);
          color: var(--success);
          background: #dcfce7;
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
      `}</style>
        </div>
    );
};

// Modal Utility Styles
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
    padding: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255,255,255,0.1)'
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

const alertIconWrapperStyle = {
    width: '80px',
    height: '80px',
    background: '#fee2e2',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
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

export default VendorsManagement;
