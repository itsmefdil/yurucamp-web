import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { refreshAccessToken } from '../lib/api';
import { toast } from 'sonner';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    // `login` changes identity on every AuthProvider render; make sure the exchange runs once
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const completeLogin = async () => {
            // The backend no longer puts the access token in the URL. It sets the refresh
            // cookie, which we exchange for an access token. `?token=` is still accepted
            // for the short window where an older backend is deployed.
            const token = searchParams.get('token') ?? await refreshAccessToken();
            if (!token) throw new Error('No access token');
            await login(token);
        };

        completeLogin()
            .then(() => {
                toast.success('Login berhasil!');
                navigate('/dashboard', { replace: true });
            })
            .catch((error) => {
                console.error('Login error:', error);
                toast.error('Login gagal');
                navigate('/login', { replace: true });
            });
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
