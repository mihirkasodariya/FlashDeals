import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    Search,
    Filter,
    Trash2,
    Edit2,
    Eye,
    MoreVertical,
    Phone,
    Calendar,
    X,
    AlertCircle,
    Plus,
    ShieldCheck,
    UserCheck,
    Lock
} from 'lucide-react';
import { format } from 'date-fns';

const UsersManagement = () => {
    const { token, user: currentUser, hasPermission } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
    const [viewModal, setViewModal] = useState(null);
    const [createModal, setCreateModal] = useState({ show: false, name: '', mobile: '', password: '', role: 'user', permissions: [] });
    const [editModal, setEditModal] = useState({ show: false, id: null, name: '', mobile: '', password: '', role: 'user', permissions: [] });
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
    const [updating, setUpdating] = useState(false);

    const AVAILABLE_PERMISSIONS = [
        { id: 'view_users', label: 'view users' },
        { id: 'create_user', label: 'create member' },
        { id: 'edit_user', label: 'edit member' },
        { id: 'delete_user', label: 'delete member' },
        { id: 'manage_admins', label: 'manage admins' },
        { id: 'view_vendors', label: 'view vendors' },
        { id: 'create_vendor', label: 'onboard vendor' },
        { id: 'edit_vendor', label: 'edit vendor' },
        { id: 'delete_vendor', label: 'terminate vendor' },
        { id: 'view_offers', label: 'view deals' },
        { id: 'create_offer', label: 'create deals' },
        { id: 'edit_offer', label: 'edit deals' },
        { id: 'delete_offer', label: 'delete deals' },
        { id: 'manage_categories', label: 'manage categories' },
        { id: 'view_tickets', label: 'view support tickets' },
        { id: 'manage_tickets', label: 'support console' },
        { id: 'delete_ticket', label: 'delete support tickets' },
        { id: 'view_stats', label: 'view analytics' },
    ];

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchUsers();
    }, [token, activeTab]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'admin' ? '/admin/admins' : '/admin/users';
            const resp = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setUsers(resp.data.users || resp.data.admins);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!createModal.name || !createModal.mobile || !createModal.password) {
            return alert('Personal details are required for onboarding.');
        }
        try {
            setUpdating(true);
            const resp = await axios.post(`${API_URL}/admin/user`, {
                name: createModal.name,
                mobile: createModal.mobile,
                password: createModal.password,
                role: createModal.role,
                permissions: createModal.permissions
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                if (createModal.role === activeTab || (activeTab === 'admin' && createModal.role === 'super_admin')) {
                    setUsers(prev => [resp.data.user, ...prev]);
                }
                setCreateModal({ show: false, name: '', mobile: '', password: '', role: 'user', permissions: [] });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user protocol.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            setUpdating(true);
            const resp = await axios.delete(`${API_URL}/admin/user/${deleteModal.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setUsers(prev => prev.filter(u => u._id !== deleteModal.id));
                setDeleteModal({ show: false, id: null, name: '' });
            }
        } catch (err) {
            alert('Termination protocol failed locally.');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateUser = async () => {
        try {
            setUpdating(true);
            const resp = await axios.put(`${API_URL}/admin/user/${editModal.id}`, {
                name: editModal.name,
                mobile: editModal.mobile,
                password: editModal.password || undefined,
                // role: editModal.role, // Removed as per request
                // permissions: editModal.permissions // Removed as per request
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setUsers(prev => prev.map(u => u._id === editModal.id ? resp.data.user : u));
                setEditModal({ show: false, id: null, name: '', mobile: '', password: '', role: 'user', permissions: [] });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update credentials.');
        } finally {
            setUpdating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
    );

    return (
        <div>
            <div className="animate-fade-in">
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>identity nexus</h1>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setActiveTab('user')}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '10px',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    border: 'none',
                                    background: activeTab === 'user' ? 'var(--primary)' : 'white',
                                    color: activeTab === 'user' ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    boxShadow: activeTab === 'user' ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none'
                                }}
                            >
                                customers
                            </button>
                            <button
                                onClick={() => setActiveTab('admin')}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '10px',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    border: 'none',
                                    background: activeTab === 'admin' ? '#8b5cf6' : 'white',
                                    color: activeTab === 'admin' ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    boxShadow: activeTab === 'admin' ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none'
                                }}
                            >
                                administrators
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '16px' }} />
                            <input
                                type="text"
                                placeholder={`search ${activeTab}s...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-modern"
                            />
                        </div>
                        <button
                            onClick={() => setCreateModal({ 
                                show: true, 
                                name: '', 
                                mobile: '', 
                                password: '', 
                                role: activeTab === 'admin' ? 'admin' : 'user', 
                                permissions: [] 
                            })}
                            className="btn-modern btn-modern-primary"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}
                        >
                            <Plus size={20} />
                            <span>join new {activeTab}</span>
                        </button>
                    </div>
                </header>

                <div className="table-wrapper">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>member identity</th>
                                <th>contact details</th>
                                <th>joined since</th>
                                <th style={{ textAlign: 'right' }}>admin actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, idx) => (
                                <tr key={user._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                background: user.profileImage ? '#f1f5f9' : `linear-gradient(135deg, ${idx % 2 === 0 ? '#3b82f6' : '#8b5cf6'}, ${idx % 2 === 0 ? '#1d4ed8' : '#6d28d9'})`,
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '800',
                                                color: 'white',
                                                fontSize: '18px',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                overflow: 'hidden',
                                                border: user.profileImage ? '1px solid #e2e8f0' : 'none'
                                            }}>
                                                {user.profileImage ? (
                                                    <img
                                                        src={`http://localhost:5000${user.profileImage}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        alt={user.name}
                                                    />
                                                ) : (
                                                    user.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text)' }}>{user.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ background: 'var(--accent-light)', padding: '8px', borderRadius: '10px' }}>
                                                <Phone size={16} color="var(--accent)" />
                                            </div>
                                            <span style={{ fontWeight: '700', color: 'var(--primary-light)', fontSize: '14px' }}>+91 {user.mobile}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                            <Calendar size={16} />
                                            <span style={{ fontSize: '13px' }}>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                onClick={() => setViewModal(user)}
                                                className="action-btn-modern info"
                                                title="view profile"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditModal({
                                                    show: true,
                                                    id: user._id,
                                                    name: user.name,
                                                    mobile: user.mobile,
                                                    role: user.role,
                                                    permissions: user.permissions || []
                                                })}
                                                className="action-btn-modern warning"
                                                title="edit user"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ show: true, id: user._id, name: user.name })}
                                                className="action-btn-modern danger"
                                                title="delete user"
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

            {/* Create Modal */}
            {createModal.show && (
                <div style={modalOverlayStyle} onClick={() => setCreateModal({ show: false })}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>new identity protocol</h2>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>registering new {createModal.role} into the registry</p>
                            </div>
                            <button onClick={() => setCreateModal({ show: false })} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>full name</label>
                                    <input
                                        style={inputModernStyle}
                                        value={createModal.name}
                                        placeholder="legal name"
                                        onChange={e => setCreateModal(p => ({ ...p, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>mobile nexus</label>
                                    <input
                                        style={inputModernStyle}
                                        value={createModal.mobile}
                                        placeholder="10-digit primary"
                                        onChange={e => setCreateModal(p => ({ ...p, mobile: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>access secret</label>
                                    <input
                                        type="password"
                                        style={inputModernStyle}
                                        value={createModal.password}
                                        placeholder="set secure password"
                                        onChange={e => setCreateModal(p => ({ ...p, password: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreateUser}
                                disabled={updating}
                                className="btn-modern"
                                style={{ width: '100%', background: 'var(--primary)', color: 'white', marginTop: '10px', height: '54px', justifyContent: 'center' }}
                            >
                                {updating ? 'initializing registry...' : `onboard ${createModal.role}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModal && (
                <div style={modalOverlayStyle} onClick={() => setViewModal(null)}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>user identity</h2>
                            <button onClick={() => setViewModal(null)} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: viewModal.profileImage ? '#f1f5f9' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                borderRadius: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                border: '4px solid white'
                            }}>
                                {viewModal.profileImage ? (
                                    <img src={`http://localhost:5000${viewModal.profileImage}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                ) : (
                                    <span style={{ fontSize: '32px', color: 'white', fontWeight: '800' }}>{viewModal.name.charAt(0)}</span>
                                )}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '900' }}>{viewModal.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>registry id: {viewModal._id}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '24px', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Phone size={18} color="var(--accent)" />
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase' }}>mobile contact</p>
                                    <p style={{ fontWeight: '700' }}>+91 {viewModal.mobile}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <ShieldCheck size={18} color="var(--accent)" />
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase' }}>operational role</p>
                                    <p style={{ fontWeight: '700' }}>{viewModal.role}</p>
                                </div>
                            </div>
                            {viewModal.role === 'admin' && (
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <Lock size={18} color="var(--accent)" />
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase' }}>granted permissions</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                            {viewModal.permissions?.map(p => (
                                                <span key={p} style={{ fontSize: '10px', background: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: '700', border: '1px solid #e2e8f0' }}>{p}</span>
                                            ))}
                                            {(!viewModal.permissions || viewModal.permissions.length === 0) && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>no specific permissions assigned</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Calendar size={18} color="var(--accent)" />
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase' }}>enrollment date</p>
                                    <p style={{ fontWeight: '700' }}>{format(new Date(viewModal.createdAt), 'MMMM dd, yyyy')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.show && (
                <div style={modalOverlayStyle} onClick={() => setEditModal({ show: false, id: null, name: '', mobile: '', password: '', role: 'user', permissions: [] })}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>adjust credentials</h2>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>modifying {editModal.role} records</p>
                            </div>
                            <button onClick={() => setEditModal({ show: false, id: null, name: '', mobile: '', password: '', role: 'user', permissions: [] })} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>full name</label>
                                    <input
                                        style={inputModernStyle}
                                        value={editModal.name}
                                        onChange={e => setEditModal(p => ({ ...p, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>mobile registry</label>
                                    <input
                                        style={inputModernStyle}
                                        value={editModal.mobile}
                                        onChange={e => setEditModal(p => ({ ...p, mobile: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '8px', color: 'var(--text-muted)' }}>update password (optional)</label>
                                    <input
                                        type="password"
                                        style={inputModernStyle}
                                        value={editModal.password}
                                        placeholder="leave blank if same"
                                        onChange={e => setEditModal(p => ({ ...p, password: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleUpdateUser}
                                disabled={updating}
                                className="btn-modern"
                                style={{ width: '100%', background: 'var(--primary)', color: 'white', marginTop: '10px', height: '54px', justifyContent: 'center' }}
                            >
                                {updating ? 'syncing records...' : 'update credentials'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {
                deleteModal.show && (
                    <div style={modalOverlayStyle} onClick={() => setDeleteModal({ show: false })}>
                        <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={alertIconWrapperStyle}><Trash2 size={40} color="#ef4444" /></div>
                                <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '12px' }}>terminate account?</h2>
                                <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px', marginBottom: '24px' }}>
                                    are you sure you want to archive <span style={{ color: 'var(--text)', fontWeight: '800' }}>{deleteModal.name}</span>? this action is reversible by sysadmin only.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button onClick={() => setDeleteModal({ show: false })} className="btn-modern" style={{ background: '#f1f5f9', border: 'none', color: '#444', justifyContent: 'center' }}>keep</button>
                                    <button onClick={handleDeleteUser} disabled={updating} className="btn-modern" style={{ background: '#ef4444', border: 'none', color: 'white', justifyContent: 'center' }}>
                                        {updating ? 'archiving...' : 'confirm'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
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
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
        </div >
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
    transition: 'all 0.2s',
    'focus': {
        borderColor: 'var(--accent)',
        background: 'white',
        boxShadow: '0 0 0 4px var(--accent-light)'
    }
};

const alertIconWrapperStyle = {
    width: '72px',
    height: '72px',
    background: '#fef2f2',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
};

export default UsersManagement;
