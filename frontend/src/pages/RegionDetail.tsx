import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Loader2, Users, MapPin, Calendar, LogIn, LogOut, Settings,
    ArrowRight, MessageSquare, Tent, Share2, Plus
} from 'lucide-react';
import { toast } from 'sonner';

import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface Region {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    coverUrl?: string;
    memberCount: number;
    status: string;
}

interface Member {
    id: string;
    fullName: string;
    avatarUrl?: string;
    level: number;
    joinedAt: string;
    role: 'member' | 'admin';
}

interface Activity {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    date?: string;
    location?: string;
    createdAt: string;
    user?: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
}

interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    dateStart: string;
    dateEnd?: string;
    price: string;
    imageUrl?: string;
    maxParticipants?: number;
}

export default function RegionDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    // const [showMembersModal, setShowMembersModal] = useState(false); // Removed

    // Fetch region details
    const { data: region, isLoading: loadingRegion } = useQuery<Region>({
        queryKey: ['region', slug],
        queryFn: async () => {
            const res = await api.get(`/regions/by-slug/${slug}`);
            return res.data;
        },
        enabled: !!slug,
    });

    // Dynamic page title
    useEffect(() => {
        if (region?.name) {
            document.title = `${region.name} - Komunitas | YuruCamp`;
        } else {
            document.title = 'Komunitas | YuruCamp';
        }
        return () => {
            document.title = 'YuruCamp Indonesia';
        };
    }, [region?.name]);

    // Fetch membership status
    const { data: membership } = useQuery<{ isMember: boolean; role?: string }>({
        queryKey: ['regionMembership', region?.id],
        queryFn: async () => {
            const res = await api.get(`/regions/${region?.id}/membership`);
            return res.data;
        },
        enabled: !!region?.id && !!user,
    });

    // Fetch members (first 10 for display)
    const { data: members = [] } = useQuery<Member[]>({
        queryKey: ['regionMembers', region?.id],
        queryFn: async () => {
            const res = await api.get(`/regions/${region?.id}/members`);
            return res.data;
        },
        enabled: !!region?.id,
    });

    // Fetch activities
    const { data: activities = [] } = useQuery<Activity[]>({
        queryKey: ['regionActivities', region?.id],
        queryFn: async () => {
            const res = await api.get(`/regions/${region?.id}/activities`);
            return res.data;
        },
        enabled: !!region?.id,
    });

    // Fetch events for region
    const { data: events = [] } = useQuery<Event[]>({
        queryKey: ['regionEvents', region?.id],
        queryFn: async () => {
            const res = await api.get(`/events`, {
                params: { regionId: region?.id }
            });
            return res.data;
        },
        enabled: !!region?.id,
    });

    // Join mutation
    const joinMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/regions/${region?.id}/join`);
        },
        onSuccess: () => {
            toast.success('Berhasil bergabung!');
            queryClient.invalidateQueries({ queryKey: ['region', slug] });
            queryClient.invalidateQueries({ queryKey: ['regionMembership', region?.id] });
            queryClient.invalidateQueries({ queryKey: ['regionMembers', region?.id] });
        },
        onError: () => {
            toast.error('Gagal bergabung');
        },
    });

    // Leave mutation
    const leaveMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/regions/${region?.id}/leave`);
        },
        onSuccess: () => {
            toast.success('Berhasil keluar dari region');
            queryClient.invalidateQueries({ queryKey: ['region', slug] });
            queryClient.invalidateQueries({ queryKey: ['regionMembership', region?.id] });
            queryClient.invalidateQueries({ queryKey: ['regionMembers', region?.id] });
        },
        onError: () => {
            toast.error('Gagal keluar');
        },
    });

    if (loadingRegion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!region) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Region tidak ditemukan</p>
                </div>
                <Footer />
            </div>
        );
    }

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isMember = membership?.isMember ?? false;
    const isAdmin = membership?.role === 'admin';
    const displayMembers = members.slice(0, 5);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 relative pb-20 md:pb-0">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-100 rounded-full" />
                <div className="absolute top-1/3 -left-20 w-72 h-72 bg-yellow-50 rounded-full" />
            </div>

            <Navbar />

            {/* Hero Cover */}
            <div className="relative min-h-[400px] h-auto md:h-80 lg:h-96 w-full mt-16 md:mt-0">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800">
                    {region.coverUrl && (
                        <img
                            src={region.coverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-60"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/30" />
                </div>

                <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end py-8 md:pb-8">
                    <div className="flex flex-col items-center md:flex-row md:items-end gap-6">
                        {/* Profile Image */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white bg-white shadow-2xl overflow-hidden mb-4 md:mb-0 relative z-20">
                                {region.imageUrl ? (
                                    <img
                                        src={region.imageUrl}
                                        alt={region.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-5xl font-bold">
                                        {region.name[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-white text-center md:text-left md:mb-2 w-full">
                            <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-md truncate w-full px-2 md:px-0">{region.name}</h1>
                            <p className="text-gray-200 text-lg flex items-center justify-center md:justify-start gap-2 drop-shadow-sm">
                                <MapPin className="w-5 h-5 text-orange-400" />
                                Komunitas Region
                                <span className="mx-2">•</span>
                                <Users className="w-5 h-5 text-orange-400" />
                                {members.length} Anggota
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:flex items-center gap-3 mb-2 w-full md:w-auto">
                            {/* Status Indicators for non-active regions */}
                            {region.status === 'pending' && (
                                <div className="col-span-2 w-full mb-2 md:mb-0 md:mr-4">
                                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-sm flex items-center">
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">Menunggu Persetujuan</p>
                                            <p className="text-xs opacity-90">Komunitas ini sedang ditinjau oleh admin.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {region.status === 'rejected' && (
                                <div className="col-span-2 w-full mb-2 md:mb-0 md:mr-4">
                                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-sm">
                                        <p className="font-bold text-sm">Ditolak</p>
                                        <p className="text-xs">Komunitas ini telah ditolak oleh admin.</p>
                                    </div>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="flex gap-2 w-full md:w-auto col-span-2 md:col-span-1">
                                    <Link to={`/r/${slug}/manage`} className="flex-1 md:flex-none">
                                        <Button variant="secondary" className="w-full bg-white hover:bg-gray-50 text-gray-900 shadow-lg whitespace-nowrap">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Kelola
                                        </Button>
                                    </Link>
                                    {region.status === 'active' && (
                                        <Link to="/e/add" className="flex-1 md:flex-none">
                                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg whitespace-nowrap">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Event Baru
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}

                            {!!user && region.status === 'active' ? (
                                isMember ? (
                                    !isAdmin && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    disabled={leaveMutation.isPending}
                                                    className="w-full md:w-auto bg-red-500 hover:bg-red-600 shadow-lg col-span-1"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    Keluar
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Keluar dari Komunitas?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Apakah Anda yakin ingin keluar dari region <b>{region.name}</b>?
                                                        Anda tidak akan lagi menerima update dari komunitas ini.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                                        onClick={() => leaveMutation.mutate()}
                                                    >
                                                        Ya, Keluar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )
                                ) : (
                                    <Button
                                        onClick={() => joinMutation.mutate()}
                                        disabled={joinMutation.isPending}
                                        className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/50 col-span-2 md:col-span-1"
                                    >
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Gabung Komunitas
                                    </Button>
                                )
                            ) : !user && region.status === 'active' && (
                                <Link to="/login" className="w-full md:w-auto col-span-2 md:col-span-1">
                                    <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 shadow-lg">Log in to Join</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 md:py-12 relative z-10 flex flex-col-reverse lg:flex-row gap-6 md:gap-8">

                {/* Left Column: Feed & Tabs */}
                <div className="flex-1 min-w-0">
                    <Tabs defaultValue="activities" className="space-y-6">
                        <TabsList className="bg-white border border-gray-200 p-1.5 rounded-2xl w-full flex h-auto shadow-sm">
                            <TabsTrigger
                                value="activities"
                                className="flex-1 py-3 rounded-xl font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-gray-50 transition-all duration-300"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Aktifitas Terbaru
                            </TabsTrigger>
                            <TabsTrigger
                                value="events"
                                className="flex-1 py-3 rounded-xl font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-gray-50 transition-all duration-300"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Event ({events.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Activities Tab */}
                        <TabsContent value="activities" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activities.length === 0 ? (
                                <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none rounded-2xl">
                                    <CardContent className="py-16 text-center">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                            <MessageSquare className="w-10 h-10 text-orange-200" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Belum ada aktifitas</h3>
                                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">Jadilah member pertama yang membagikan cerita seru di region ini!</p>
                                        {isMember && (
                                            <Button className="mt-6 bg-orange-500 hover:bg-orange-600 rounded-full px-8 shadow-lg shadow-orange-200">
                                                Buat Postingan
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-6">
                                    {activities.map((activity) => (
                                        <Card key={activity.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-white rounded-2xl ring-1 ring-gray-100">
                                            <div className="flex flex-col md:flex-row">
                                                {activity.imageUrl && (
                                                    <div className="w-full md:w-56 h-56 md:h-auto bg-gray-100 relative group-hover:brightness-95 transition-all duration-500 overflow-hidden">
                                                        <img
                                                            src={activity.imageUrl}
                                                            alt={activity.title}
                                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {activity.user && (
                                                                    <div className="flex items-center gap-2 bg-gray-50 hover:bg-orange-50 px-2 py-1 rounded-full transition-colors w-fit">
                                                                        <Avatar className="w-5 h-5 border border-white">
                                                                            <AvatarImage src={activity.user.avatarUrl} />
                                                                            <AvatarFallback className="text-[10px]">{getInitials(activity.user.fullName)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-xs font-semibold text-gray-700">{activity.user.fullName}</span>
                                                                    </div>
                                                                )}
                                                                <span className="text-xs text-gray-300">•</span>
                                                                <span className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                            </div>
                                                            <h3 className="font-bold text-xl md:text-2xl text-gray-900 mb-2 group-hover:text-orange-600 transition-colors leading-tight">
                                                                <Link to={`/a/${activity.id}`}>{activity.title}</Link>
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-600 text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-6 leading-relaxed flex-1">
                                                        {activity.description}
                                                    </p>

                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                                            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                                                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                                                                {activity.location || 'Lokasi tidak ada'}
                                                            </span>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="text-orange-600 font-semibold hover:text-orange-700 hover:bg-orange-50 -mr-2" asChild>
                                                            <Link to={`/a/${activity.id}`}>
                                                                Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Events Tab */}
                        <TabsContent value="events" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {events.length === 0 ? (
                                <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none rounded-2xl">
                                    <CardContent className="py-16 text-center">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                            <Calendar className="w-10 h-10 text-orange-200" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Belum ada event</h3>
                                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">Region ini belum memiliki event mendatang.</p>
                                        {isAdmin && (
                                            <Link to="/e/add">
                                                <Button className="mt-6 bg-orange-500 hover:bg-orange-600 rounded-full px-8 shadow-lg shadow-orange-200">
                                                    Buat Event Baru
                                                </Button>
                                            </Link>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {events.map((event) => {
                                        const isPast = new Date(event.dateStart) < new Date();
                                        return (
                                            <Link key={event.id} to={`/e/${event.id}`} className="group h-full block">
                                                <Card className={`h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white rounded-2xl ring-1 ring-gray-100 hover:ring-orange-200 ${isPast ? 'opacity-70' : ''}`}>
                                                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                                        <img
                                                            src={event.imageUrl || "/event.jpg"}
                                                            alt={event.title}
                                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isPast ? 'grayscale' : ''}`}
                                                        />
                                                        <div className="absolute top-4 left-4 z-10">
                                                            {isPast ? (
                                                                <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/10 tracking-wide">
                                                                    SELESAI
                                                                </span>
                                                            ) : (
                                                                <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/30 tracking-wide flex items-center gap-1">
                                                                    <span className="relative flex h-2 w-2">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                                                    </span>
                                                                    UPCOMING
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent text-white">
                                                            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-orange-200">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span className="truncate">{event.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-5 flex-1 flex flex-col">
                                                        <div className="flex items-start gap-4 mb-3">
                                                            <div className="flex flex-col items-center justify-center bg-orange-50 text-orange-600 px-3 py-2 rounded-xl border border-orange-100 min-w-[60px]">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(event.dateStart).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                                <span className="text-2xl font-black leading-none">{new Date(event.dateStart).getDate()}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-lg text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                                                                    {event.title}
                                                                </h3>
                                                                {event.price && parseInt(event.price) === 0 && (
                                                                    <span className="inline-block mt-2 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
                                                                        GRATIS
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-dashed border-gray-100">
                                                            <span className="flex items-center gap-1.5 font-medium">
                                                                <Users className="w-4 h-4 text-gray-400" />
                                                                {event.maxParticipants ? `Max ${event.maxParticipants} Orang` : 'Tanpa Kuota'}
                                                            </span>
                                                            <span className="font-bold text-orange-600 text-sm">
                                                                {event.price && parseInt(event.price) > 0 ? `Rp ${parseInt(event.price).toLocaleString('id-ID')}` : 'Free'}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Sidebar Info */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* About Card */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100 py-4">
                            <CardTitle className="text-sm font-bold text-gray-800 flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-orange-500" />
                                    Tentang Komunitas
                                </div>
                                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                    {members.length} Anggota
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                {region.description || "Belum ada deskripsi untuk komunitas ini."}
                            </p>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Anggota Terbaru</h4>
                                <div className="flex flex-wrap gap-2">
                                    {displayMembers.map((member) => (
                                        <Link key={member.id} to={`/u/${member.id}`}>
                                            <Avatar className="w-9 h-9 border-2 border-white shadow-sm hover:scale-105 transition-transform ring-1 ring-gray-100">
                                                <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                                                <AvatarFallback className="bg-orange-100 text-orange-700 text-[10px] font-bold">
                                                    {getInitials(member.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    ))}
                                    {members.length > 5 && (
                                        <Link
                                            to={`/r/${slug}/members`}
                                            className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            +{members.length - 5}
                                        </Link>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-gray-500 hover:text-orange-600 h-8 mt-2"
                                    asChild
                                >
                                    <Link to={`/r/${slug}/members`}>
                                        Lihat Semua Anggota
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Share Card */}
                    <Card className="border-none shadow-sm bg-blue-50/50 border border-blue-100">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Share2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Bagikan Komunitas</h4>
                                    <p className="text-xs text-gray-500">Undang temanmu bergabung!</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-4 bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Link tersalin ke clipboard!');
                                }}
                            >
                                Salin Link Region
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Footer />


        </div >
    );
}
