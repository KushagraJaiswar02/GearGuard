import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.auth.login({ email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true, user }; // Return user for redirection
        } catch (error) {
            console.error('Login failed', error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (data) => {
        try {
            const response = await api.auth.signup(data);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true, user };
        } catch (error) {
            console.error('Signup failed', error);
            return { success: false, message: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const canAccess = (action) => {
        if (!user) return false;

        switch (action) {
            case 'edit_equipment':
            case 'add_equipment':
                return ['Admin', 'Manager'].includes(user.role);
            case 'propose_scrap':
                return ['Technician', 'Manager'].includes(user.role);
            case 'approve_scrap':
                return ['Manager', 'Admin'].includes(user.role);
            case 'view_reports':
                return true; // Everyone
            default:
                return false;
        }
    };

    return (
        <UserContext.Provider value={{ user, login, signup, logout, canAccess, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
