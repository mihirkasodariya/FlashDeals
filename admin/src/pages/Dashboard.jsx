import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Store,
    Tag,
    TrendingUp,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { token, hasPermission } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalOffers: 0,
        recentOffers: [],
        recentUsers: [],
        topImpressionOffers: [],
        topVisitOffers: [],
        monthlyStats: []
    });
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('6m');

    const API_URL = 'https://api.offerz.live/api';

    useEffect(() => {
        fetchDashboardData();
    }, [token, range]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`${API_URL}/admin/stats?range=${range}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (resp.data.success) {
                setStats(resp.data.stats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Process chart labels based on range structure
    const getChartLabel = (s) => {
        if (!s._id) return 'N/A';
        if (range === '1d') return `${s._id.hour || '0'}:00`;
        if (range === '1w' || range === '1m') return `${s._id.day || '0'} ${monthNames[(s._id.month || 1) - 1]}`;
        return monthNames[(s._id.month || 1) - 1] || 'N/A';
    };

    const chartLabels = (stats.monthlyStats || []).map(s => getChartLabel(s));
    const chartDataPoints = (stats.monthlyStats || []).map(s => s.count || 0);

    // Filter out potential N/A if it overlaps
    const finalLabels = chartLabels.length > 0 ? chartLabels : ['No Data'];
    const finalPoints = chartDataPoints.length > 0 ? chartDataPoints : [0];

    useEffect(() => {
        console.log("Dashboard analytics data updated:", stats.monthlyStats);
    }, [stats.monthlyStats]);

    const chartData = {
        labels: finalLabels,
        datasets: [{
            label: 'Growth Vector',
            data: finalPoints,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderColor: '#3b82f6',
            borderWidth: 4,
            pointRadius: 6,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#3b82f6',
            pointBorderWidth: 3,
            tension: 0.4,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleFont: { size: 14, weight: '700' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false
            }
        },
        scales: {
            y: { display: false, beginAtZero: true },
            x: { grid: { display: false }, ticks: { font: { weight: '700', size: 10 } } },
        }
    };

    if (loading && stats.monthlyStats.length === 0) return <div className="p-8">syncing platform neural network...</div>;

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Dashboard</h1>
            </header>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <StatCard
                    icon={<Users size={24} color="#3b82f6" />}
                    label="active users"
                    value={stats.totalUsers.toLocaleString()}
                    trend="+0"
                    positive={true}
                />
                <StatCard
                    icon={<Store size={24} color="#10b981" />}
                    label="storefronts"
                    value={stats.totalVendors}
                    trend="+0"
                    positive={true}
                />
                <StatCard
                    icon={<Tag size={24} color="#f59e0b" />}
                    label="Offerz"
                    value={stats.totalOffers}
                    trend="0"
                    positive={true}
                />
                <StatCard
                    icon={<TrendingUp size={24} color="#8b5cf6" />}
                    label="total activity"
                    value={(stats.topVisitOffers.reduce((acc, o) => acc + (o.visits || 0), 0)).toLocaleString()}
                    trend="+100%"
                    positive={true}
                />
            </div>

            <div className="card-modern" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>registry growth analytics</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>platform evolution over selected timeframe</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                        {['1d', '1w', '1m', '3m', '6m', '1y'].map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: range === r ? 'white' : 'transparent',
                                    color: range === r ? 'var(--primary)' : '#64748b',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: range === r ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                    {loading && stats.monthlyStats.length > 0 && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                            <div className="loader-dots">update in progress...</div>
                        </div>
                    )}
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '32px', marginBottom: '40px' }}>
                <div className="card-modern">
                    <h3 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '24px' }}>new entrants</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {stats.recentUsers.map(user => (
                            <div key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '20px', background: '#f8fafc' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    background: user.role === 'vendor' ? '#dcfce7' : '#e0f2fe',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {user.role === 'vendor' ? <Store size={20} color="#15803d" /> : <Users size={20} color="#0369a1" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '800', fontSize: '14px' }}>{user.name}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{user.mobile}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', background: user.role === 'vendor' ? '#10b981' : '#3b82f6', color: 'white' }}>{user.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-modern" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>top performing deals (by visits)</h3>
                    </div>
                    <table className="table-modern" style={{ borderSpacing: '0' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ paddingLeft: '32px' }}>flash sale</th>
                                <th>vendor</th>
                                <th style={{ textAlign: 'right', paddingRight: '32px' }}>visits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.topVisitOffers.map(offer => (
                                <tr key={offer._id}>
                                    <td style={{ paddingLeft: '32px', border: 'none' }}>
                                        <p style={{ fontWeight: '800', fontSize: '14px' }}>{offer.title}</p>
                                    </td>
                                    <td style={{ border: 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                                            <Store size={14} />
                                            <span>{offer.vendorId?.storeName || 'Unknown Vendor'}</span>
                                        </div>
                                    </td>
                                    <td style={{ border: 'none', textAlign: 'right', paddingRight: '32px' }}>
                                        <div style={{ fontWeight: '900', color: '#10b981', fontSize: '15px' }}>{offer.visits || 0}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card-modern" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>premium impressions impact</h3>
                </div>
                <table className="table-modern" style={{ borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ paddingLeft: '32px' }}>creative headline</th>
                            <th>market category</th>
                            <th style={{ textAlign: 'right', paddingRight: '32px' }}>impressions reach</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.topImpressionOffers.map(offer => (
                            <tr key={offer._id}>
                                <td style={{ paddingLeft: '32px', border: 'none' }}>
                                    <p style={{ fontWeight: '800', fontSize: '14px' }}>{offer.title}</p>
                                </td>
                                <td style={{ border: 'none' }}>
                                    <span className="badge-modern badge-info">{offer.category?.name || 'Uncategorized'}</span>
                                </td>
                                <td style={{ border: 'none', textAlign: 'right', paddingRight: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', color: '#8b5cf6', fontWeight: '900' }}>
                                        <Zap size={16} />
                                        <span>{offer.impressions || 0} reach</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card-modern" style={{ marginTop: '40px', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>freshly injected deals</h3>
                </div>
                <table className="table-modern" style={{ borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ paddingLeft: '32px' }}>headline</th>
                            <th>status</th>
                            <th style={{ textAlign: 'right', paddingRight: '32px' }}>date added</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.recentOffers.map(offer => (
                            <tr key={offer._id}>
                                <td style={{ paddingLeft: '32px', border: 'none' }}>
                                    <p style={{ fontWeight: '800', fontSize: '14px' }}>{offer.title}</p>
                                </td>
                                <td style={{ border: 'none' }}>
                                    <span className="badge-modern badge-success">active</span>
                                </td>
                                <td style={{ border: 'none', textAlign: 'right', paddingRight: '32px' }}>
                                    <div style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '13px' }}>
                                        {new Date(offer.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, positive }) => (
    <div className="stat-card-modern">
        <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'lowercase', letterSpacing: '1px', marginBottom: '12px' }}>{label}</p>
            <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '12px' }}>{value}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    background: positive ? '#dcfce7' : '#fee2e2',
                    padding: '2px 8px',
                    borderRadius: '6px'
                }}>
                    {positive ? <ArrowUpRight size={12} color="#15803d" /> : <ArrowDownRight size={12} color="#b91c1c" />}
                    <span style={{ fontSize: '11px', fontWeight: '900', color: positive ? '#15803d' : '#b91c1c' }}>{trend}</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>vs ly</span>
            </div>
        </div>
        <div className="stat-icon-box" style={{ background: positive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)' }}>
            {React.cloneElement(icon, { color: positive ? '#10b981' : '#ef4444' })}
        </div>
    </div>
);

export default Dashboard;
