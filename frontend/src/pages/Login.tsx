import { useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const LOGIN_ERRORS: Record<string, string> = {
    oauth: 'Login dengan Google gagal. Silakan coba lagi.',
    oauth_state: 'Sesi login kedaluwarsa atau tidak valid. Silakan coba lagi.',
};

export default function Login() {
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        if (!error) return;
        toast.error(LOGIN_ERRORS[error] ?? 'Login gagal. Silakan coba lagi.', { id: 'login-error' });
        // Drop the param so a refresh doesn't show the toast again
        setSearchParams({}, { replace: true });
    }, [searchParams, setSearchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F0] p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
                <Link to="/">
                    <img src="/logo.png" alt="YuruCamp" className="h-16 w-auto hover:scale-105 transition-transform drop-shadow-sm" />
                </Link>
                <LoginForm />

                <p className="text-center text-xs text-gray-400 font-medium">
                    &copy; {new Date().getFullYear()} Komunitas Yuru Camp
                </p>
            </div>
        </div>
    );
}
