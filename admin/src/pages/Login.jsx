import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Phone, ArrowRight, AlertCircle, Info, Zap } from 'lucide-react';

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await login(mobile, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-background-accents">
                <div className="accent-circle circle-1"></div>
                <div className="accent-circle circle-2"></div>
            </div>

            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '56px', borderRadius: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        display: 'inline-flex',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        padding: '20px',
                        borderRadius: '24px',
                        marginBottom: '24px',
                        boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
                    }}>
                        <ShieldCheck size={40} color="white" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px', color: 'var(--primary)', marginBottom: '8px' }}>admin console</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '15px' }}>flash deals security protocol</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '16px',
                        borderRadius: '16px',
                        marginBottom: '32px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    }}>
                        <AlertCircle color="#dc2626" size={20} />
                        <p style={{ color: '#991b1b', fontSize: '14px', fontWeight: '800' }}>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="input-group-modern">
                        <label>mobile credentials</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '18px' }} />
                            <input
                                type="number"
                                placeholder="enter registered mobile"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                required
                                className="modern-auth-input"
                            />
                        </div>
                    </div>

                    <div className="input-group-modern">
                        <label>security key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '18px' }} />
                            <input
                                type="password"
                                placeholder="enter admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="modern-auth-input"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-modern btn-modern-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '18px' }}
                    >
                        {loading ? 'authenticating...' : (
                            <>
                                <Zap size={18} fill="white" />
                                <span>initialize command</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '20px', display: 'flex', gap: '14px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <Info size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', color: '#444', fontWeight: '600', lineHeight: 1.6 }}>
                        this system is for authorized personnel only. all access attempts are monitored via ip protocol.
                    </p>
                </div>
            </div>

            <style>{`
        .login-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }
        .login-background-accents {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        .accent-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .circle-1 {
          width: 500px;
          height: 500px;
          background: #3b82f6;
          top: -100px;
          right: -100px;
        }
        .circle-2 {
          width: 400px;
          height: 400px;
          background: #8b5cf6;
          bottom: -50px;
          left: -50px;
        }
        .input-group-modern label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          text-transform: lowercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 8px;
          margin-left: 4px;
        }
        .modern-auth-input {
          width: 100%;
          padding: 18px 18px 18px 56px;
          border-radius: 18px;
          border: 2px solid #eef2f6;
          background: #fdfdfe;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .modern-auth-input:focus {
          border-color: var(--accent);
          background: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        .glass-card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
        }
      `}</style>
        </div>
    );
};

export default Login;
