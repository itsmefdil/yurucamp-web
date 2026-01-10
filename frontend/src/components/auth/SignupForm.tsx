import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Icons } from '../ui/icons';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export function SignupForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            // For now, this is a placeholder
            toast.error('Email/password signup not implemented yet. Please use Google login.');
            setError('Email/password signup not implemented yet');
        } catch (err: any) {
            setError(err.message || 'Signup failed');
            toast.error(err.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 text-center pb-8 pt-10">
                <CardTitle className="text-3xl font-black text-primary">Buat Akun Baru</CardTitle>
                <CardDescription className="text-base">
                    Gabung komunitas YuruCamp Indonesia
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nama Depan</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="Rin"
                                className="rounded-xl py-6 bg-gray-50 border-gray-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Nama Belakang</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Shima"
                                className="rounded-xl py-6 bg-gray-50 border-gray-200"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nama@contoh.com"
                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full rounded-full py-6 text-lg shadow-lg mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : 'Daftar'}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                            Atau daftar dengan
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full rounded-full py-6 border-2 gap-2 hover:bg-gray-50"
                    onClick={handleGoogleLogin}
                    type="button"
                >
                    <Icons.google className="h-5 w-5" />
                    Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center pb-10 pt-4">
                <p className="text-sm text-muted-foreground text-center">
                    Sudah punya akun?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Masuk disini
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
