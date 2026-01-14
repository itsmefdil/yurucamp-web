import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Home, Mountain, Tent, Calendar, PlayCircle, LogIn, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserNav } from './UserNav';

export function Navbar() {
    const { user } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full lg:top-4 lg:px-4 bg-transparent">
            <div className="container mx-auto bg-white/80 backdrop-blur-md lg:bg-white/90 lg:backdrop-blur-md rounded-none lg:rounded-full lg:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-b border-white/20 lg:border-2 lg:border-white/50 relative">
                <div className="flex h-14 lg:h-20 items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Link to="/">
                            <img src="/logo.png" alt="YuruCamp Logo" className="h-8 lg:h-10 w-auto object-contain hover:scale-105 transition-transform" />
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8 text-base font-bold text-gray-600">
                        <Link to="/" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Home className="w-4 h-4" />
                            Beranda
                        </Link>

                        <Link to="/activities" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Mountain className="w-4 h-4" />
                            Aktifitas
                        </Link>

                        <Link to="/camp-areas" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Tent className="w-4 h-4" />
                            Camp Area
                        </Link>

                        <Link to="/events" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Calendar className="w-4 h-4" />
                            Acara
                        </Link>

                        <Link to="/watch" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <PlayCircle className="w-4 h-4" />
                            Nonton
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <UserNav user={user} />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="rounded-full" asChild>
                                    <Link to="/login">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Masuk
                                    </Link>
                                </Button>
                                <Button size="sm" className="rounded-full" asChild>
                                    <Link to="/register">
                                        Daftar
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
