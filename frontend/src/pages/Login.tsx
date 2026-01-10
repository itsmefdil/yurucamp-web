import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export default function Login() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <main className="flex-1 flex items-start justify-center p-4 pt-24 md:pt-32">
                <LoginForm />
            </main>
        </div>
    );
}
