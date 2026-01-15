import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        // Redirect to home if not admin (or login if not logged in, but home handles that better contextually)
        // If not logged in, user will be null, so check !user first. 
        // If logged in but not admin, maybe 403 page or just home? Home is safer to avoid leaking admin existence.
        if (!user) return <Navigate to="/login" replace />;
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
