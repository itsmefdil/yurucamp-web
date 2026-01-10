import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Mountain, Tent, Calendar, PlayCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { path: '/', icon: Home, label: 'Beranda' },
    { path: '/activities', icon: Mountain, label: 'Aktifitas' },
    { path: '/camp-areas', icon: Tent, label: 'Camp' },
    { path: '/events', icon: Calendar, label: 'Acara' },
    { path: '/watch', icon: PlayCircle, label: 'Nonton' },
];

export function BottomNav() {
    const location = useLocation();

    // Don't show on login/register pages
    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                                    isActive
                                        ? "text-primary bg-primary/10"
                                        : "text-gray-500 hover:text-primary hover:bg-gray-50"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform",
                                    isActive && "scale-110"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-medium",
                                    isActive && "font-bold"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
            {/* Safe area padding for iOS devices */}
            <div className="bg-white/95 h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
}
