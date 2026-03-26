import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LifeBuoy,
    Search,
    Trash2,
    Eye,
    MoreVertical,
    Phone,
    Calendar,
    X,
    AlertCircle,
    User,
    CheckCircle2,
    Clock,
    Tag,
    AlertTriangle,
    Download,
    Send,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

const TicketsManagement = () => {
    const { token } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewModal, setViewModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, ticketId: '' });
    const [updating, setUpdating] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const API_URL = 'https://api.offerz.live/api';

    useEffect(() => {
        fetchTickets();
    }, [token]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`${API_URL}/tickets/all-tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setTickets(resp.data.tickets);
            }
        } catch (err) {
            console.error('Fetch tickets error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            setUpdating(true);
            const resp = await axios.put(`${API_URL}/tickets/update-status/${id}`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setTickets(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
                if (viewModal && viewModal._id === id) {
                    setViewModal(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            alert('Failed to update status.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteTicket = async () => {
        try {
            setUpdating(true);
            const resp = await axios.delete(`${API_URL}/tickets/${deleteModal.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success) {
                setTickets(prev => prev.filter(t => t._id !== deleteModal.id));
                setDeleteModal({ show: false, id: null, ticketId: '' });
            }
        } catch (err) {
            alert('Deletion failed.');
        } finally {
            setUpdating(false);
        }
    };

    const handleSendReply = async (e) => {
        if (e) e.preventDefault();
        if (!replyText.trim() || !viewModal) return;

        try {
            setSendingReply(true);
            const resp = await axios.post(`${API_URL}/tickets/reply/${viewModal._id}`, {
                message: replyText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (resp.data.success) {
                const updatedTicket = resp.data.ticket;
                setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
                setViewModal(updatedTicket);
                setReplyText('');
            }
        } catch (err) {
            alert('Failed to transmit message.');
        } finally {
            setSendingReply(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Open': { bg: '#eff6ff', color: '#3b82f6', icon: <Clock size={12} /> },
            'In Review': { bg: '#fffbeb', color: '#f59e0b', icon: <AlertTriangle size={12} /> },
            'Resolved': { bg: '#ecfdf5', color: '#10b981', icon: <CheckCircle2 size={12} /> },
            'Closed': { bg: '#f1f5f9', color: '#64748b', icon: <X size={12} /> }
        };
        const s = styles[status] || styles['Open'];
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800',
                backgroundColor: s.bg,
                color: s.color,
                textTransform: 'lowercase',
                letterSpacing: '0.5px'
            }}>
                {s.icon} {status}
            </span>
        );
    };

    const PriorityBadge = ({ priority }) => {
        const colors = {
            'Low': '#94a3b8',
            'Medium': '#3b82f6',
            'High': '#f59e0b',
            'Urgent': '#ef4444'
        };
        return (
            <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors[priority] || '#3b82f6',
                display: 'inline-block',
                marginRight: '8px'
            }}></span>
        );
    };

    const filteredTickets = tickets.filter(t =>
        (t.ticketId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="animate-fade-in">
                <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Support Tickets</h1>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '16px' }} />
                            <input
                                type="text"
                                placeholder="search by ticket id, subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-modern"
                                style={{ paddingLeft: '52px' }}
                            />
                        </div>
                    </div>
                </header>

                <div className="table-wrapper">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>ticket id & subject</th>
                                <th>requesting party</th>
                                <th>support category</th>
                                <th>state</th>
                                <th>creation date</th>
                                <th style={{ textAlign: 'right' }}>resolution control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map((t, idx) => (
                                <tr key={t._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                background: '#f8fafc',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <LifeBuoy size={20} color="var(--primary)" />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text)', marginBottom: '2px' }}>{t.ticketId}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{t.subject.length > 30 ? t.subject.slice(0, 30) + '...' : t.subject}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <p style={{ fontWeight: '800', color: 'var(--primary-light)', fontSize: '13px' }}>{t.userId?.name || 'Unknown'}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{t.userId?.mobile}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                                            <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text)' }}>{t.category}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={t.status} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                            <Calendar size={14} />
                                            <span style={{ fontSize: '13px' }}>{format(new Date(t.createdAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                onClick={() => setViewModal(t)}
                                                className="action-btn-modern info"
                                                title="view analysis"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ show: true, id: t._id, ticketId: t.ticketId })}
                                                className="action-btn-modern danger"
                                                title="purge ticket"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTickets.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: '0 0 32px 32px' }}>
                            <LifeBuoy size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: '#94a3b8', fontWeight: '800' }}>signal clear</h3>
                            <p style={{ color: '#cbd5e1', fontSize: '14px' }}>no support tickets require your immediate attention.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* View Ticket Details Modal */}
            {viewModal && (
                <div style={modalOverlayStyle} onClick={() => setViewModal(null)}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>support request</h2>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>registry id: {viewModal.ticketId}</p>
                            </div>
                            <button onClick={() => setViewModal(null)} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', marginBottom: '12px', letterSpacing: '0.5px' }}>subject node</p>
                                <p style={{ fontWeight: '800', fontSize: '16px', lineHeight: 1.4 }}>{viewModal.subject}</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', marginBottom: '12px', letterSpacing: '0.5px' }}>categorization</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Tag size={16} color="var(--accent)" />
                                    <span style={{ fontWeight: '800' }}>{viewModal.category}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', marginBottom: '12px', letterSpacing: '0.5px' }}>issue description</p>
                            <div style={{ background: '#fffbeb', padding: '24px', borderRadius: '24px', border: '1.5px dashed #fcd34d' }}>
                                <p style={{ fontSize: '15px', color: '#92400e', lineHeight: 1.6, fontWeight: '600', whiteSpace: 'pre-wrap' }}>{viewModal.description}</p>
                            </div>
                        </div>

                        {viewModal.attachment && (
                            <div style={{ marginBottom: '32px' }}>
                                <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', marginBottom: '12px', letterSpacing: '0.5px' }}>evidence attachment</p>
                                <a
                                    href={`https://api.offerz.live${viewModal.attachment}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px',
                                        background: '#f1f5f9',
                                        borderRadius: '16px',
                                        textDecoration: 'none',
                                        color: 'var(--primary)',
                                        fontWeight: '700'
                                    }}
                                >
                                    <Download size={20} />
                                    <span>download source documentation</span>
                                </a>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'lowercase', letterSpacing: '0.5px' }}>status modulation</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                {['Open', 'In Review', 'Resolved', 'Closed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleUpdateStatus(viewModal._id, status)}
                                        disabled={updating}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '14px',
                                            border: viewModal.status === status ? '2px solid var(--accent)' : '1px solid #e2e8f0',
                                            background: viewModal.status === status ? 'var(--accent-light)' : 'white',
                                            color: viewModal.status === status ? 'var(--accent)' : 'var(--text-muted)',
                                            fontWeight: '800',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <MessageSquare size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '900' }}>conversation history</h3>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                marginBottom: '24px',
                                maxHeight: '400px',
                                overflowY: 'auto',
                                paddingRight: '10px'
                            }}>
                                {/* Initial Description as first message style */}
                                <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px 16px 16px 4px', border: '1px solid #e2e8f0' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>{viewModal.description}</p>
                                        <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', textAlign: 'right' }}>initial request</p>
                                    </div>
                                </div>

                                {viewModal.messages?.map((msg, idx) => (
                                    <div key={idx} style={{
                                        alignSelf: msg.senderRole === 'admin' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%'
                                    }}>
                                        <div style={{
                                            background: msg.senderRole === 'admin' ? 'var(--primary)' : '#f1f5f9',
                                            color: msg.senderRole === 'admin' ? 'white' : 'var(--text)',
                                            padding: '16px',
                                            borderRadius: msg.senderRole === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            boxShadow: msg.senderRole === 'admin' ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <p style={{ fontSize: '10px', fontWeight: '800', opacity: 0.8, textTransform: 'lowercase' }}>
                                                    {msg.senderRole === 'admin' ? 'alpha control' : (msg.senderId?.name || 'user')}
                                                </p>
                                            </div>
                                            <p style={{ fontSize: '14px', fontWeight: '600', lineHeight: 1.5 }}>{msg.message}</p>
                                            <p style={{ fontSize: '9px', opacity: 0.6, marginTop: '8px', textAlign: 'right', fontWeight: '800' }}>
                                                {format(new Date(msg.createdAt), 'hh:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendReply} style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="type your response to the vendor..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '60px',
                                        background: '#f8fafc',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '20px',
                                        padding: '0 70px 0 24px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={sendingReply || !replyText.trim()}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '10px',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        opacity: sendingReply || !replyText.trim() ? 0.5 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteModal.show && (
                <div style={modalOverlayStyle} onClick={() => setDeleteModal({ show: false })}>
                    <div className="animate-fade-in" style={{ ...modalContentStyle, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={alertIconWrapperStyle}><Trash2 size={40} color="#ef4444" /></div>
                            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '12px' }}>purge support node?</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px', marginBottom: '24px' }}>
                                you are about to permanently delete ticket <span style={{ color: 'var(--text)', fontWeight: '800' }}>{deleteModal.ticketId}</span>. this is an irreversible archival override.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button onClick={() => setDeleteModal({ show: false })} className="btn-modern" style={{ background: '#f1f5f9', border: 'none', color: '#444', justifyContent: 'center' }}>abort</button>
                                <button onClick={handleDeleteTicket} disabled={updating} className="btn-modern" style={{ background: '#ef4444', border: 'none', color: 'white', justifyContent: 'center' }}>
                                    {updating ? 'purging...' : 'confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        /* Scrollbar Hiding */
        .animate-fade-in::-webkit-scrollbar {
          display: none;
        }
        .animate-fade-in {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
    paddingTop: '8vh'
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

export default TicketsManagement;
