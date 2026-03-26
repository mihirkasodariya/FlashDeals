import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));

    const API_URL = 'https://api.offerz.live/api'; // Standard backend URL

    useEffect(() => {
        if (token) {
            fetchMe();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchMe = async () => {
        try {
            const resp = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.data.success && resp.data.user.role === 'admin') {
                setUser(resp.data.user);
            } else {
                logout();
            }
        } catch (err) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (mobile, password) => {
        try {
            const resp = await axios.post(`${API_URL}/auth/login`, { mobile, password });
            if (resp.data.success) {
                if (resp.data.user.role !== 'admin') {
                    throw new Error('Unauthorized: Insufficient privileges for administrative access.');
                }
                localStorage.setItem('adminToken', resp.data.token);
                setToken(resp.data.token);
                setUser(resp.data.user);
                return { success: true };
            }
            return { success: false, message: resp.data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || err.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setUser(null);
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        return false;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, token, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
