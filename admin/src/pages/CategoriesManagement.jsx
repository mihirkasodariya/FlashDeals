import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Grid,
    Plus,
    Search,
    Edit2,
    X,
    Image as ImageIcon,
    Upload,
    CheckCircle2,
    Clock,
    Power,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

const CategoriesManagement = () => {
    const { token, hasPermission } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ show: false, mode: 'add', id: null, name: '', image: null, preview: null, isActive: true });
    const [confirmModal, setConfirmModal] = useState({ show: false, cat: null });
    const [updating, setUpdating] = useState(false);

    const API_URL = 'https://api.offerz.live/api';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`${API_URL}/categories`);
            if (resp.data.success) {
                setCategories(resp.data.categories);
            }
        } catch (err) {
            console.error('Fetch categories error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setModal(prev => ({
                ...prev,
                image: file,
                preview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!modal.name.trim()) return alert('Category name is required');
        if (modal.mode === 'add' && !modal.image) return alert('Category image is required');

        try {
            setUpdating(true);
            const formData = new FormData();
            formData.append('name', modal.name);
            formData.append('isActive', modal.isActive);
            if (modal.image) {
                formData.append('image', modal.image);
            }

            let resp;
            if (modal.mode === 'add') {
                resp = await axios.post(`${API_URL}/categories`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                resp = await axios.put(`${API_URL}/categories/${modal.id}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (resp.data.success) {
                fetchCategories();
                setModal({ show: false, mode: 'add', id: null, name: '', image: null, preview: null, isActive: true });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        } finally {
            setUpdating(false);
        }
    };

    const toggleStatus = async () => {
        if (!confirmModal.cat) return;
        const cat = confirmModal.cat;
        try {
            setUpdating(true);
            const resp = await axios.put(`${API_URL}/categories/${cat._id}`, {
                isActive: !cat.isActive
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (resp.data.success) {
                setCategories(prev => prev.map(c => c._id === cat._id ? resp.data.category : c));
                setConfirmModal({ show: false, cat: null });
            }
        } catch (err) {
            alert('Status toggle failed');
        } finally {
            setUpdating(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="animate-fade-in">
                <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Categories</h1>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '16px' }} />
                            <input
                                type="text"
                                placeholder="search keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-modern"
                            />
                        </div>
                        <button
                            onClick={() => setModal({ show: true, mode: 'add', id: null, name: '', image: null, preview: null, isActive: true })}
                            className="btn-modern btn-modern-primary"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={20} />
                            <span>add category</span>
                        </button>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {filteredCategories.map(cat => (
                        <div key={cat._id} className="category-card">
                            <div style={{
                                height: '180px',
                                background: '#f8fafc',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid #e2e8f0'
                            }}>
                                <img
                                    src={`https://api.offerz.live${cat.image}`}
                                    alt={cat.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <button
                                        onClick={() => setModal({
                                            show: true,
                                            mode: 'edit',
                                            id: cat._id,
                                            name: cat.name,
                                            image: null,
                                            preview: `https://api.offerz.live${cat.image}`,
                                            isActive: cat.isActive
                                        })}
                                        className="action-btn-modern info"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmModal({ show: true, cat })}
                                        className={`action-btn-modern ${cat.isActive ? 'success' : 'danger'}`}
                                        title={cat.isActive ? "Deactivate" : "Activate"}
                                    >
                                        <Power size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '20px 10px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '8px' }}>{cat.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} color="var(--text-muted)" />
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                            {format(new Date(cat.createdAt), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '10px',
                                        background: cat.isActive ? '#ecfdf5' : '#fef2f2',
                                        color: cat.isActive ? '#10b981' : '#ef4444',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontWeight: '800',
                                        textTransform: 'lowercase'
                                    }}>{cat.isActive ? 'active' : 'inactive'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {modal.show && (
                <div style={modalOverlayStyle} onClick={() => setModal({ ...modal, show: false })}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>
                                {modal.mode === 'add' ? 'add classification' : 'update classification'}
                            </h2>
                            <button onClick={() => setModal({ ...modal, show: false })} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>category name</label>
                                <input
                                    style={inputModernStyle}
                                    placeholder="e.g. personal care, electronics..."
                                    value={modal.name}
                                    onChange={e => setModal({ ...modal, name: e.target.value })}
                                />
                            </div>

                            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                                <div>
                                    <p style={{ fontWeight: '800', fontSize: '14px' }}>availability status</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>enable or disable this cluster in the marketplace</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModal(p => ({ ...p, isActive: !p.isActive }))}
                                    style={{
                                        width: '50px',
                                        height: '26px',
                                        borderRadius: '20px',
                                        background: modal.isActive ? 'var(--primary)' : '#cbd5e1',
                                        position: 'relative',
                                        border: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        left: modal.isActive ? '26px' : '4px',
                                        top: '4px',
                                        width: '18px',
                                        height: '18px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: 'all 0.3s'
                                    }}></div>
                                </button>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={labelStyle}>visual identifier</label>
                                <div
                                    onClick={() => document.getElementById('cat-image').click()}
                                    style={{
                                        height: '200px',
                                        background: '#f8fafc',
                                        border: '2px dashed #e2e8f0',
                                        borderRadius: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                >
                                    {modal.preview ? (
                                        <>
                                            <img src={modal.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                                            <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '12px', color: 'white' }}>
                                                <Upload size={20} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                                <ImageIcon size={24} color="#3b82f6" />
                                            </div>
                                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>upload cluster image</p>
                                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>png, jpg or webp (max 2mb)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="cat-image"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="btn-modern"
                                style={{ width: '100%', background: 'var(--primary)', color: 'white', height: '54px', justifyContent: 'center' }}
                            >
                                {updating ? 'synchronizing...' : (modal.mode === 'add' ? 'commit cluster' : 'save changes')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div style={modalOverlayStyle} onClick={() => setConfirmModal({ show: false, cat: null })}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            background: confirmModal.cat.isActive ? '#fffbeb' : '#ecfdf5',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <AlertTriangle size={36} color={confirmModal.cat.isActive ? '#f59e0b' : '#10b981'} />
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '12px' }}>
                            {confirmModal.cat.isActive ? 'deactivate category?' : 'activate category?'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                            are you sure you want to {confirmModal.cat.isActive ? 'hide' : 'show'} the <span style={{ color: 'var(--text)', fontWeight: '800' }}>{confirmModal.cat.name}</span> cluster in the marketplace?
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => setConfirmModal({ show: false, cat: null })}
                                className="btn-modern"
                                style={{ background: '#f1f5f9', border: 'none', color: '#444', justifyContent: 'center' }}
                            >
                                cancel
                            </button>
                            <button
                                onClick={toggleStatus}
                                disabled={updating}
                                className="btn-modern"
                                style={{
                                    background: confirmModal.cat.isActive ? '#f59e0b' : '#10b981',
                                    border: 'none',
                                    color: 'white',
                                    justifyContent: 'center'
                                }}
                            >
                                {updating ? 'processing...' : 'confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .category-card {
                    background: white;
                    padding: 12px;
                    border-radius: 32px;
                    border: 1px solid var(--border);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .category-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
                    border-color: var(--primary-light);
                }
                .action-btn-modern {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .action-btn-modern.info {
                    color: #3b82f6;
                    background: #eff6ff;
                }
                .action-btn-modern.info:hover {
                    background: #3b82f6;
                    color: white;
                    transform: scale(1.1);
                }
                .action-btn-modern.success {
                    color: #10b981;
                    background: #ecfdf5;
                }
                .action-btn-modern.success:hover {
                    background: #10b981;
                    color: white;
                    transform: scale(1.1);
                }
                .action-btn-modern.danger {
                    color: #ef4444;
                    background: #fef2f2;
                }
                .action-btn-modern.danger:hover {
                    background: #ef4444;
                    color: white;
                    transform: scale(1.1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
};

// Styles
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
    paddingTop: '10vh'
};

const modalContentStyle = {
    background: 'white',
    width: '100%',
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

const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'lowercase',
    marginBottom: '8px',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px'
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

export default CategoriesManagement;
