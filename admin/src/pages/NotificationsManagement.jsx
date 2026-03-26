import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Send,
    Bell,
    Users,
    Calendar,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    Type
} from 'lucide-react';

const NotificationsManagement = () => {
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState('all');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const API_URL = 'https://api.offerz.live/api';

    const handleSendNotification = async (e) => {
        e.preventDefault();

        if (!title || !body) {
            setStatus({ type: 'error', message: 'Please provide both title and body for the notification.' });
            return;
        }

        try {
            setSending(true);
            setStatus({ type: '', message: '' });

            const resp = await axios.post(`${API_URL}/admin/notifications/send`, {
                title,
                body,
                audience
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (resp.data.success) {
                const { success, failure, total } = resp.data.stats;
                setStatus({
                    type: 'success',
                    message: `Dispatched to ${total} devices. (Success: ${success}, Failed: ${failure})`
                });
                setTitle('');
                setBody('');
                setAudience('all');
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to send notification. Check server logs.'
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>Notifications</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                <div style={{ background: 'white', padding: '32px', borderRadius: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid var(--border)' }}>
                    <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={labelStyle}>
                                <Type size={14} style={{ marginRight: '6px' }} />
                                notification title
                            </label>
                            <input
                                style={inputStyle}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Good Morning! ☀️"
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                <MessageSquare size={14} style={{ marginRight: '6px' }} />
                                notification body
                            </label>
                            <textarea
                                style={{ ...inputStyle, height: '120px', padding: '16px', resize: 'none' }}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="e.g. Hope you have a great day ahead. Check out today's flash deals!"
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>
                                <Users size={14} style={{ marginRight: '6px' }} />
                                target audience segment
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    style={selectStyle}
                                    value={audience}
                                    onChange={(e) => setAudience(e.target.value)}
                                >
                                    <option value="all">All Registered Users</option>
                                    <option value="vendors">All Registered Vendors</option>
                                    <option value="users">All Registered Customers</option>
                                    <option value="7d">Registered in Last 7 Days</option>
                                    <option value="14d">Registered in Last 14 Days</option>
                                    <option value="30d">Registered in Last 30 Days</option>
                                </select>
                                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                                    <Calendar size={18} />
                                </div>
                            </div>
                        </div>

                        {status.message && (
                            <div style={{
                                padding: '16px',
                                borderRadius: '16px',
                                background: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fee2e2'}`,
                                color: status.type === 'success' ? '#166534' : '#991b1b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}>
                                {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={sending}
                            style={{
                                height: '56px',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '18px',
                                fontSize: '16px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                opacity: sending ? 0.7 : 1
                            }}
                            className="btn-hover-effect"
                        >
                            <Send size={20} />
                            {sending ? 'Sending Notifications...' : 'Send Notifications'}
                        </button>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={cardStyle}>
                        <div style={iconBoxStyle('#eff6ff', '#3b82f6')}>
                            <Bell size={24} />
                        </div>
                        <h3 style={cardTitleStyle}>Live Preview</h3>
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '900' }}>F</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>FlashDeals</p>
                                </div>
                                <p style={{ fontSize: '10px', color: '#94a3b8' }}>now</p>
                            </div>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', color: '#1e293b' }}>{title || 'Notification Title'}</h4>
                            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{body || 'Notification body content will appear here...'}</p>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <div style={iconBoxStyle('#fef2f2', '#ef4444')}>
                            <AlertCircle size={24} />
                        </div>
                        <h3 style={cardTitleStyle}>Important Note</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '12px' }}>
                            Notifications are sent to users who have registered their device token. High-frequency broadcasting may lead to user fatigue. Ensure content is relevant and timely.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                .btn-hover-effect:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 20px -3px rgba(59, 130, 246, 0.4);
                }
                .btn-hover-effect:active:not(:disabled) {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

// Internal Components/Styles
const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'lowercase',
    marginBottom: '10px',
    letterSpacing: '0.5px'
};

const inputStyle = {
    width: '100%',
    height: '52px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '0 18px',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    transition: 'all 0.2s',
    color: '#1e293b'
};

const selectStyle = {
    width: '100%',
    height: '52px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '0 18px',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    color: '#1e293b'
};

const cardStyle = {
    background: 'white',
    padding: '24px',
    borderRadius: '32px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
    border: '1px solid var(--border)'
};

const cardTitleStyle = {
    fontSize: '18px',
    fontWeight: '900',
    marginTop: '16px',
    letterSpacing: '-0.5px'
};

const iconBoxStyle = (bg, color) => ({
    width: '48px',
    height: '48px',
    background: bg,
    color: color,
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
});

export default NotificationsManagement;
