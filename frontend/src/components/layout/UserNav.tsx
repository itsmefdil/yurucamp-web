import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User as UserIcon, Settings, LogOut, ChevronDown, Info, Backpack, Star, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types';

interface UserNavProps {
    user: User;
}

export function UserNav({ user }: UserNavProps) {
    const { logout } = useAuth();

    const name = user.fullName || 'User';
    const avatarUrl = user.avatarUrl;

    const initials = name !== 'User'
        ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.[0].toUpperCase() ?? "U";

    // Level badge color based on level
    const getLevelColor = (level: number) => {
        if (level >= 6) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
        if (level >= 5) return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
        if (level >= 4) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
        if (level >= 3) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
        if (level >= 2) return 'bg-gradient-to-r from-teal-400 to-green-400 text-white';
        return 'bg-gray-200 text-gray-600';
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-auto rounded-full p-1 pr-4 hover:bg-gray-100 transition-all duration-200 group">
                    <div className="flex items-center gap-3 text-left">
                        <div className="relative">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            {/* Level Badge on Avatar */}
                            {user.level && (
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow ${getLevelColor(user.level)}`}>
                                    {user.level}
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:flex flex-col">
                            <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors line-clamp-1 max-w-[100px] lg:max-w-[150px]">
                                {name}
                            </span>
                            <span className="text-xs text-gray-500 line-clamp-1 max-w-[100px] lg:max-w-[150px]">
                                {user.levelName || 'Camper Pemula'}
                            </span>
                        </div>

                        <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                        <p className="text-sm font-semibold leading-none">
                            {name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                        {/* EXP Progress */}
                        <div className="pt-2 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className={`px-2 py-0.5 rounded-full font-medium ${getLevelColor(user.level || 1)}`}>
                                    <Star className="w-3 h-3 inline mr-1" />
                                    {user.levelName || 'Camper Pemula'}
                                </span>
                                <span className="text-muted-foreground">
                                    {user.exp || 0} EXP
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                                    style={{ width: `${Math.min(100, ((5 - (user.expToNextLevel || 5)) / 5) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground text-right">
                                {user.expToNextLevel || 5} EXP lagi untuk naik level
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                {user.role === 'admin' ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/admin" className="flex items-center w-full">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard Admin</span>
                        </Link>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/dashboard/settings" className="flex items-center w-full">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Pengaturan</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link to="/gear-lists" className="cursor-pointer">
                        <Backpack className="mr-2 h-4 w-4" />
                        <span>Gear List</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/about" className="flex items-center w-full">
                        <Info className="mr-2 h-4 w-4" />
                        <span>Tentang</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
