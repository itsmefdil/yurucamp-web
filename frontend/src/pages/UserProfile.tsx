import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Calendar, Globe, Briefcase, Mountain } from 'lucide-react';

import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import api from '../lib/api';

interface UserProfile {
    id: string;
    fullName: string;
    avatarUrl?: string;
    bio?: string;
    level: number;
    exp: number;
    levelName: string;
    createdAt: string;
}

interface Region {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
}

interface GearList {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

interface Activity {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    date?: string;
    location?: string;
}

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();

    // Fetch user profile
    const { data: user, isLoading } = useQuery<UserProfile>({
        queryKey: ['userProfile', id],
        queryFn: async () => {
            const res = await api.get(`/users/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    // Fetch user's regions
    const { data: regions = [] } = useQuery<Region[]>({
        queryKey: ['userRegions', id],
        queryFn: async () => {
            const res = await api.get(`/users/${id}/regions`);
            return res.data;
        },
        enabled: !!id,
    });

    // Fetch user's public gear lists
    const { data: gearLists = [] } = useQuery<GearList[]>({
        queryKey: ['userGearLists', id],
        queryFn: async () => {
            const res = await api.get(`/users/${id}/gear-lists`);
            return res.data;
        },
        enabled: !!id,
    });

    // Fetch user's activities
    const { data: activities = [] } = useQuery<Activity[]>({
        queryKey: ['userActivities', id],
        queryFn: async () => {
            const res = await api.get(`/users/${id}/activities`);
            return res.data;
        },
        enabled: !!id,
    });

    // Dynamic title
    useEffect(() => {
        if (user?.fullName) {
            document.title = `${user.fullName} - Profil | YuruCamp`;
        }
        return () => {
            document.title = 'YuruCamp Indonesia';
        };
    }, [user?.fullName]);

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">User tidak ditemukan</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar />

            {/* Profile Header */}
            <div className="pt-28 md:pt-36 pb-8 px-4 bg-orange-50">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-white shadow-xl">
                                <AvatarImage src={user.avatarUrl} alt={user.fullName} className="object-cover" />
                                <AvatarFallback className="bg-orange-500 text-white text-3xl font-bold">
                                    {getInitials(user.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                                {user.level}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.fullName}</h1>
                            <Badge className="mt-2 bg-orange-100 text-orange-600 hover:bg-orange-100">
                                {user.levelName}
                            </Badge>
                            {user.bio && (
                                <p className="mt-3 text-gray-600 max-w-lg">{user.bio}</p>
                            )}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-gray-500">
                                <span>{user.exp} EXP</span>
                                <span>•</span>
                                <span>Bergabung {new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full pb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Regions */}
                        {regions.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                        <Globe className="w-4 h-4 text-orange-500" />
                                        Komunitas
                                    </h3>
                                    <div className="space-y-2">
                                        {regions.map((region) => (
                                            <Link
                                                key={region.id}
                                                to={`/r/${region.slug}`}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                                    {region.imageUrl ? (
                                                        <img src={region.imageUrl} alt={region.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        region.name[0]
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{region.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Gear Lists */}
                        {gearLists.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                        Gear Lists
                                    </h3>
                                    <div className="space-y-2">
                                        {gearLists.map((gear) => (
                                            <Link
                                                key={gear.id}
                                                to={`/g/${gear.id}`}
                                                className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-700">{gear.name}</p>
                                                {gear.description && (
                                                    <p className="text-xs text-gray-400 line-clamp-1">{gear.description}</p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Main Content - Activities */}
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Mountain className="w-4 h-4 text-green-500" />
                            Aktifitas ({activities.length})
                        </h3>
                        {activities.length === 0 ? (
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-8 text-center text-gray-500">
                                    Belum ada aktifitas
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <Link key={activity.id} to={`/a/${activity.id}`} className="block group">
                                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="flex gap-4 p-4">
                                                    {activity.imageUrl && (
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={activity.imageUrl}
                                                                alt={activity.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-1">
                                                            {activity.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{activity.description}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                            {activity.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {activity.location}
                                                                </span>
                                                            )}
                                                            {activity.date && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(activity.date).toLocaleDateString('id-ID')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
