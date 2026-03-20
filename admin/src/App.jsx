import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UsersManagement from './pages/UsersManagement';
import VendorsManagement from './pages/VendorsManagement';
import OffersManagement from './pages/OffersManagement';
import VendorDetails from './pages/VendorDetails';
import TicketsManagement from './pages/TicketsManagement';
import CategoriesManagement from './pages/CategoriesManagement';
import NotificationsManagement from './pages/NotificationsManagement';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <p style={{ fontWeight: '700', color: '#1e293b' }}>initializing admin security...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/login" />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><VendorsManagement /></ProtectedRoute>} />
          <Route path="/vendors/:id" element={<ProtectedRoute><VendorDetails /></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><OffersManagement /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsManagement /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoriesManagement /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsManagement /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
