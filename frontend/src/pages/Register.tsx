import React from 'react';
import { SignupForm } from '../components/auth/SignupForm';

export default function Register() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <main className="flex-1 flex items-start justify-center p-4 pt-24 md:pt-32">
                <SignupForm />
            </main>
        </div>
    );
}
