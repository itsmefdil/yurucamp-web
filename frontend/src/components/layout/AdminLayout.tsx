import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Menu,
    X,
    Tent,
    Calendar,
    Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// Assuming generic button/classes if ui components not fully setup, but let's try to stick to standard jsx
// If 'cn' utility exists (it likely does in shadcn/ui projects), I'll import it. 
// I saw 'lib/utils' in list_dir so 'cn' is likely there.

// Simple 'cn' fallback if not available (I'll assume it is based on standard scaffolding but will check file)
// actually I'll just check lib/utils exists. It does.
import { cn } from '../../lib/utils';

export function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/camp-areas', label: 'Camp Areas', icon: Tent },
        { href: '/admin/activities', label: 'Activities', icon: Users },
        { href: '/admin/events', label: 'Events', icon: Calendar },
        { href: '/admin/regions', label: 'Regions', icon: Globe },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans text-slate-900">
            {/* Sidebar Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b shrink-0">
                    <Tent className="h-6 w-6 text-orange-500 mr-2" />
                    <span className="font-bold text-xl">Admin Panel</span>
                    <button
                        className="ml-auto lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-orange-50 text-orange-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t shrink-0">
                    <button
                        className="w-full flex items-center px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={logout}
                    >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="lg:hidden p-2 -ml-2 text-gray-600"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center ml-auto space-x-4">
                        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            Back to Website
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
