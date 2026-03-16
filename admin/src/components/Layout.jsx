import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Store,
  Tag,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  Search,
  Settings,
  LifeBuoy,
  Grid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { logout, user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'overview';
    if (path === '/users') return 'user ';
    if (path === '/vendors') return 'vendor directory';
    if (path === '/offers') return 'offer terminal';
    if (path === '/tickets') return 'support console';
    if (path === '/categories') return 'category management';
    return 'admin console';
  };

  return (
    <div className="layout-container">
      <aside className="sidebar-modern">
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <ShieldCheck size={26} color="white" strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h2 className="brand-name">Offerz</h2>
            <span className="brand-tagline">nexus control center</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <p className="nav-group-title">main operations</p>
            <ul className="nav-list">
              <NavItem to="/" icon={<LayoutDashboard size={20} />} label="dashboard" />
              <NavItem to="/users" icon={<Users size={20} />} label="users" />
              <NavItem to="/vendors" icon={<Store size={20} />} label="vendors" />
            </ul>
          </div>

            <div className="nav-group" style={{ marginTop: '24px' }}>
              <p className="nav-group-title">commercial hub</p>
              <ul className="nav-list">
                <NavItem to="/offers" icon={<Tag size={20} />} label="offer terminal" />
                <NavItem to="/categories" icon={<Grid size={20} />} label="categories" />
              </ul>
            </div>

            <div className="nav-group" style={{ marginTop: '24px' }}>
              <p className="nav-group-title">support grid</p>
              <ul className="nav-list">
                <NavItem to="/tickets" icon={<LifeBuoy size={20} />} label="support tickets" />
              </ul>
            </div>
        </nav>

        <div className="sidebar-profile-footer">
          <div className="user-profile-card">
            <div className="avatar-initials">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="profile-info">
              <p className="profile-name">{user?.name || 'system admin'}</p>
              <p className="profile-rank">{user?.role?.replace('_', ' ') || 'admin'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="terminate-btn">
            <LogOut size={16} />
            <span>terminate session</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* <header className="top-header"> */}
        {/* <div className="header-left"> */}
        {/* <span className="breadcrumb">Pages / {getPageTitle()}</span> */}
        {/* <h4 className="header-title">{getPageTitle()}</h4> */}
        {/* </div> */}

        {/* <div className="header-right">
          </div> */}
        {/* </header> */}

        <div className="content-inner">
          {children}
        </div>
      </main>

      <style>{`
        .sidebar-modern {
          width: 280px;
          height: 100vh;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 40px 24px;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          box-shadow: 20px 0 60px rgba(0, 0, 0, 0.1);
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 56px;
          padding: 0 8px;
        }

        .brand-icon-wrapper {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.3);
          flex-shrink: 0;
        }

        .brand-name {
          font-size: 18px;
          fontWeight: 900;
          letter-spacing: -0.5px;
          color: white;
          margin: 0;
        }

        .brand-tagline {
           font-size: 10px;
          opacity: 0.5;
          fontWeight: 800;
          text-transform: lowercase;
          letter-spacing: 1px;
          display: block;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          margin: 0 -8px;
          padding: 0 8px;
          scrollbar-width: none;
        }

        .sidebar-nav::-webkit-scrollbar {
          display: none;
        }

        .nav-group-title {
           font-size: 10px;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          text-transform: lowercase;
          letter-spacing: 1.5px;
          margin: 0 0 12px 14px;
        }

        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-item-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 14px;
          color: rgba(255,255,255,0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 700;
          text-decoration: none;
          font-size: 14px;
        }

        .nav-item-link:hover {
          color: white;
          background: rgba(255,255,255,0.04);
          transform: translateX(4px);
        }

        .nav-item-link.active {
          color: white;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .nav-item-link.active svg {
          color: #3b82f6;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
        }

        .sidebar-profile-footer {
          margin-top: auto;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .user-profile-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 20px;
          margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .avatar-initials {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          fontWeight: 900;
          font-size: 16px;
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .profile-name {
          font-size: 14px;
          fontWeight: 800;
          color: white;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .profile-rank {
           font-size: 10px;
          color: rgba(255,255,255,0.4);
          fontWeight: 700;
          text-transform: lowercase;
          margin: 2px 0 0 0;
        }

        .terminate-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: transparent;
          color: #ef4444;
           cursor: pointer;
          font-weight: 800;
          font-size: 12px;
          text-transform: lowercase;
          letter-spacing: 1px;
          transition: all 0.2s;
        }

        .terminate-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
          transform: translateY(-2px);
        }
        
        .main-content {
          margin-left: 280px;
          padding: 48px 64px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 56px;
        }
        
        .breadcrumb {
          font-size: 12px;
          color: #94a3b8;
           font-weight: 700;
          margin-bottom: 6px;
          display: block;
          text-transform: lowercase;
          letter-spacing: 0.5px;
        }
        
        .header-title {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -1.2px;
          color: #0f172a;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <li>
    <NavLink to={to} className={({ isActive }) => isActive ? 'nav-item-link active' : 'nav-item-link'}>
      {icon}
      <span>{label}</span>
    </NavLink>
  </li>
);

export default Layout;
