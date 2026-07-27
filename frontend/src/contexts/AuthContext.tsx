import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import api from '../lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401) {
                // Token is permanently invalid (refresh also failed in interceptor) — clear session
                console.warn('Auth session expired, clearing token.');
                localStorage.removeItem('token');
            } else {
                // Network error, server down, 5xx, etc. — keep session, don't log out
                console.warn('Failed to fetch user (non-auth error), keeping session:', error?.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        await fetchUser();
    };

    const logout = () => {
        // Revoke refresh token on server and clear local token
        try {
            api.post('/auth/logout').catch(() => { });
        } catch (e) {
            // ignore
        }
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
