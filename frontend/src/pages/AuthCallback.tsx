import React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            login(token).then(() => {
                toast.success('Login berhasil!');
                navigate('/dashboard');
            }).catch((error) => {
                console.error('Login error:', error);
                toast.error('Login gagal');
                navigate('/login');
            });
        } else {
            toast.error('Token tidak ditemukan');
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Memproses login...</p>
            </div>
        </div>
    );
}
