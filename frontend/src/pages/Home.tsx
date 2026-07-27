import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Footer } from '../components/layout/Footer';
import { ArrowRight, MapPin, Calendar, Activity, Tent, MessageSquare, Flame, Camera, Wifi, Car, Coffee, Info, DollarSign, Users } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import api from '../lib/api';
import type { Activity as ActivityType, CampArea, Event } from '../types';
import type { GearList } from '../types/gear';
import { formatDate } from '../lib/utils';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import DownloadPlugin from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

export default function Home() {
    // Fetch activities
    const { data: activities } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await api.get('/activities');
            return response.data as ActivityType[];
        },
    });

    // Fetch camp areas
    const { data: campAreas } = useQuery({
        queryKey: ['campAreas'],
        queryFn: async () => {
            const response = await api.get('/camp-areas');
            return response.data as CampArea[];
        },
    });

    // Fetch events
    const { data: events } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const response = await api.get('/events');
            return response.data as Event[];
        },
    });

    // Fetch regions for community preview
    const { data: regions } = useQuery({
        queryKey: ['regions'],
        queryFn: async () => {
            const response = await api.get('/regions');
            return response.data as { id: string; name: string; slug: string; imageUrl?: string; coverUrl?: string; memberCount: number }[];
        },
    });

    // Fetch hero images
    const { data: heroImages = ['/yc-bg.png', '/yc-bg.png', '/yc-bg.png', '/yc-bg.png', '/yc-bg.png'] } = useQuery({
        queryKey: ['heroImages'],
        queryFn: async () => {
            try {
                const response = await api.get('/utils/hero-images?count=5');
                return response.data;
            } catch {
                return ['/yc-bg.png', '/yc-bg.png', '/yc-bg.png', '/yc-bg.png', '/yc-bg.png'];
            }
        },
    });

    const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

    // Extract photos for Community Photo Gallery
    const galleryPhotos = React.useMemo(() => {
        const list: Array<{ url: string; title: string; location?: string; link: string; author?: string; type: string }> = [];

        if (activities) {
            activities.forEach((act) => {
                if (act.imageUrl) {
                    list.push({
                        url: act.imageUrl,
                        title: act.title,
                        location: act.location,
                        link: `/a/${act.id}`,
                        author: act.user?.fullName || undefined,
                        type: 'Aktivitas',
                    });
                }
                if (act.additionalImages && Array.isArray(act.additionalImages)) {
                    act.additionalImages.forEach((img) => {
                        if (img) {
                            list.push({
                                url: img,
                                title: act.title,
                                location: act.location,
                                link: `/a/${act.id}`,
                                author: act.user?.fullName || undefined,
                                type: 'Aktivitas',
                            });
                        }
                    });
                }
            });
        }

        if (campAreas) {
            campAreas.forEach((camp) => {
                if (camp.imageUrl) {
                    list.push({
                        url: camp.imageUrl,
                        title: camp.name,
                        location: camp.location,
                        link: `/c/${camp.id}`,
                        type: 'Camp Area',
                    });
                }
                if (camp.additionalImages && Array.isArray(camp.additionalImages)) {
                    camp.additionalImages.forEach((img) => {
                        if (img) {
                            list.push({
                                url: img,
                                title: camp.name,
                                location: camp.location,
                                link: `/c/${camp.id}`,
                                type: 'Camp Area',
                            });
                        }
                    });
                }
            });
        }

        // Limit to 8 photos for Home Page display
        return list.slice(0, 8);
    }, [activities, campAreas]);

    const getFacilityIcon = (facility: string) => {
        switch (facility.toLowerCase()) {
            case 'wifi': return <Wifi className="h-4 w-4" />;
            case 'parkir': return <Car className="h-4 w-4" />;
            case 'kantin': return <Coffee className="h-4 w-4" />;
            case 'sewa tenda': return <Tent className="h-4 w-4" />;
            case 'pusat info': return <Info className="h-4 w-4" />;
            default: return null;
        }
    };

    const PublicGearSection: React.FC = () => {
        const { data: publicGears } = useQuery({
            queryKey: ['publicGear'],
            queryFn: async () => {
                try {
                    const response = await api.get('/gear/public?limit=4');
                    return response.data as GearList[];
                } catch (e) {
                    return [] as GearList[];
                }
            },
        });

        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {publicGears?.slice(0, 4).map((g) => {
                    const owner = (g as any).user ?? (g as any).ownerInfo;
                    return (
                        <Link key={g.id} to={`/g/${g.id}`} className="block group">
                            <Card className="overflow-hidden bg-white group-hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-orange-200 shadow-md hover:shadow-xl rounded-2xl">
                                <CardContent className="p-4 flex-1">
                                    <h3 className="font-bold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-2 mb-2">{g.name}</h3>
                                    {g.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">{g.description}</p>
                                    )}
                                </CardContent>
                                <CardFooter className="p-5 pt-0 mt-auto">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="relative">
                                            <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                                <AvatarImage src={owner?.avatarUrl || undefined} />
                                                <AvatarFallback className="text-xs bg-orange-200 text-orange-700 font-bold">
                                                    {owner?.fullName?.charAt(0).toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-sm font-semibold text-gray-600 truncate">{owner?.fullName || 'Pengguna'}</span>
                                            <span className="text-[10px] text-gray-400 truncate">{g.createdAt ? new Date(g.createdAt).toLocaleDateString() : ''}</span>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    );
                })}

                {(!publicGears || publicGears.length === 0) && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                        <div className="inline-block p-4 rounded-full bg-orange-50 mb-4">
                            <Tent className="h-8 w-8 text-orange-400" />
                        </div>
                        <p className="font-bold text-lg text-gray-700">Belum ada gear publik.</p>
                        <p className="text-sm text-gray-400">Pengguna belum mengaktifkan daftar gear mereka.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex flex-col">
                <main className="flex-1 pt-4 md:pt-8 pb-24 md:pb-0">
                    {/* Hero Section */}
                    <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 px-4 overflow-hidden bg-dot-pattern">
                        <div className="container mx-auto text-center relative z-10">
                            <span className="text-sm md:text-base font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4 block">
                                Komunitas Camping
                            </span>
                            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-gray-800 mb-2">
                                Yuru<span className="text-primary">Camp</span>
                            </h1>
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-700 mb-6">
                                Indonesia
                            </h2>
                            <div className="flex justify-center gap-3 text-muted-foreground font-medium text-sm md:text-lg mb-16">
                                <span>#camping</span>
                                <span>#alam</span>
                                <span>#santai</span>
                            </div>
                        </div>

                        {/* Image Strip */}
                        <div className="pb-12 px-4 overflow-hidden md:overflow-x-auto no-scrollbar">
                            <div className="flex w-max md:w-auto md:justify-center gap-4 md:gap-8 animate-marquee md:animate-none hover:[animation-play-state:paused]">
                                {[...heroImages, ...heroImages].map((img: string, i: number) => (
                                    <div
                                        key={i}
                                        className={`shrink-0 w-48 h-64 md:w-64 md:h-80 ${[
                                            "bg-orange-100 rotate-[-3deg]",
                                            "bg-blue-100 rotate-[2deg]",
                                            "bg-green-100 rotate-[-2deg]",
                                            "bg-yellow-100 rotate-[3deg]",
                                            "bg-pink-100 rotate-[-1deg]"
                                        ][i % 5]} rounded-2xl shadow-lg transform hover:scale-105 hover:z-10 transition-all duration-300 border-4 border-white overflow-hidden`}
                                    >
                                        <div
                                            className="w-full h-full bg-cover bg-center"
                                            style={{ backgroundImage: `url('${img}')` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Agenda Kami */}
                    <section className="py-8 md:py-12 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-6 md:mb-8">
                                <h2 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight">
                                    Agenda Kami <span className="text-primary">Paling Seru</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                <div className="p-2 sm:p-3 md:p-4 rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all duration-300 group">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2.5 mb-1">
                                        <div className="p-1 rounded-md bg-orange-100/70 text-orange-500 group-hover:scale-110 transition-transform">
                                            <Activity className="h-3.5 w-3.5 md:h-5 md:w-5" />
                                        </div>
                                        <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 leading-tight">Berbagi Aktivitas</h3>
                                    </div>
                                    <p className="text-[9px] sm:text-xs text-gray-500 leading-tight md:leading-relaxed line-clamp-3 sm:line-clamp-none">
                                        Bagikan momen seru saat camping, hiking, atau kegiatan outdoor lainnya.
                                    </p>
                                </div>

                                <div className="p-2 sm:p-3 md:p-4 rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2.5 mb-1">
                                        <div className="p-1 rounded-md bg-blue-100/70 text-blue-500 group-hover:scale-110 transition-transform">
                                            <MapPin className="h-3.5 w-3.5 md:h-5 md:w-5" />
                                        </div>
                                        <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 leading-tight">Temukan Lokasi</h3>
                                    </div>
                                    <p className="text-[9px] sm:text-xs text-gray-500 leading-tight md:leading-relaxed line-clamp-3 sm:line-clamp-none">
                                        Jelajahi peta interaktif kami untuk menemukan camp area terbaik.
                                    </p>
                                </div>

                                <div className="p-2 sm:p-3 md:p-4 rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-green-200 hover:shadow-md transition-all duration-300 group">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2.5 mb-1">
                                        <div className="p-1 rounded-md bg-green-100/70 text-green-500 group-hover:scale-110 transition-transform">
                                            <Calendar className="h-3.5 w-3.5 md:h-5 md:w-5" />
                                        </div>
                                        <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 leading-tight">Ikuti Acara</h3>
                                    </div>
                                    <p className="text-[9px] sm:text-xs text-gray-500 leading-tight md:leading-relaxed line-clamp-3 sm:line-clamp-none">
                                        Gathering komunitas, workshop survival, dan acara bersih gunung.
                                    </p>
                                </div>

                                <div className="p-2 sm:p-3 md:p-4 rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-yellow-200 hover:shadow-md transition-all duration-300 group">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2.5 mb-1">
                                        <div className="p-1 rounded-md bg-yellow-100/70 text-yellow-600 group-hover:scale-110 transition-transform">
                                            <Tent className="h-3.5 w-3.5 md:h-5 md:w-5" />
                                        </div>
                                        <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 leading-tight">Camping Gear</h3>
                                    </div>
                                    <p className="text-[9px] sm:text-xs text-gray-500 leading-tight md:leading-relaxed line-clamp-3 sm:line-clamp-none">
                                        Diskusi dan review peralatan camping terbaik untuk pengalaman outdoor.
                                    </p>
                                </div>

                                <div className="p-2 sm:p-3 md:p-4 rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-red-200 hover:shadow-md transition-all duration-300 group">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2.5 mb-1">
                                        <div className="p-1 rounded-md bg-red-100/70 text-red-500 group-hover:scale-110 transition-transform">
                                            <Flame className="h-3.5 w-3.5 md:h-5 md:w-5" />
                                        </div>
                                        <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 leading-tight">Tips Survival</h3>
                                    </div>
                                    <p className="text-[9px] sm:text-xs text-gray-500 leading-tight md:leading-relaxed line-clamp-3 sm:line-clamp-none">
                                        Pelajari teknik dasar survival, cara membuat api, dan P3K.
                                    </p>
                                </div>

                                <div className="p-2 sm:p-3 md:p-4 rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all duration-300 group">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2.5 mb-1">
                                        <div className="p-1 rounded-md bg-purple-100/70 text-purple-500 group-hover:scale-110 transition-transform">
                                            <Camera className="h-3.5 w-3.5 md:h-5 md:w-5" />
                                        </div>
                                        <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 leading-tight">Galeri Foto</h3>
                                    </div>
                                    <p className="text-[9px] sm:text-xs text-gray-500 leading-tight md:leading-relaxed line-clamp-3 sm:line-clamp-none">
                                        Abadikan keindahan alam dan bagikan karya fotografimu di galeri.
                                    </p>
                                </div>

                                <div className="p-2 sm:p-3 md:p-4 rounded-lg md:rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-teal-200 hover:shadow-md transition-all duration-300 group col-span-3">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <div className="p-1 rounded-md bg-teal-100/70 text-teal-500 group-hover:scale-110 transition-transform">
                                            <MessageSquare className="h-3.5 w-3.5 md:h-5 md:w-5" />
                                        </div>
                                        <h3 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 leading-tight">Diskusi Seru</h3>
                                    </div>
                                    <p className="text-[9px] sm:text-xs text-gray-500 leading-tight md:leading-relaxed text-center">
                                        Bergabunglah dalam forum diskusi dan cari teman perjalanan baru untuk petualangan berikutnya.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Aktivitas Preview */}
                    <section className="py-10 md:py-16 container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-10">
                            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 tracking-tight text-center md:text-left">Aktivitas Terbaru</h2>
                            <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-50 rounded-full px-6 w-full md:w-auto" asChild>
                                <Link to="/activities" className="flex items-center justify-center gap-2">
                                    Lihat Semua <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                            {activities?.slice(0, 4).map((activity) => (
                                <Link key={activity.id} to={`/a/${activity.id}`} className="block group">
                                    <Card className="overflow-hidden bg-white group-hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col border border-gray-100 sm:border-2 hover:border-orange-200 shadow-sm sm:shadow-lg hover:shadow-xl rounded-xl sm:rounded-3xl">
                                        <div className="relative aspect-video bg-orange-50 overflow-hidden m-1 sm:m-2 rounded-lg sm:rounded-2xl">
                                            <img
                                                src={activity.imageUrl || "/aktivitas.jpg"}
                                                alt={activity.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                                                <div className="flex items-center gap-1 text-[9px] sm:text-xs font-bold bg-black/50 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full w-fit max-w-full">
                                                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                                                    <span className="truncate">{activity.location || "Lokasi"}</span>
                                                </div>
                                            </div>
                                            {activity.category && (
                                                <div className="absolute top-1.5 right-1.5">
                                                    <Badge className="bg-primary/90 text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5">
                                                        {typeof activity.category === 'string' ? activity.category : activity.category?.name}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="p-2 sm:p-5 pb-1 sm:pb-2">
                                            <CardTitle className="line-clamp-1 sm:line-clamp-2 text-xs sm:text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors leading-tight">
                                                {activity.title}
                                            </CardTitle>
                                            {activity.date && (
                                                <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-gray-500 mt-1 sm:mt-2">
                                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="truncate">{formatDate(activity.date)}</span>
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardFooter className="p-2 sm:p-5 pt-0 mt-auto">
                                            <div
                                                onClick={(e) => {
                                                    if (activity.user?.id) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        window.location.href = `/u/${activity.user.id}`;
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 sm:gap-3 w-full bg-orange-50/50 p-1 sm:p-2 rounded-lg sm:rounded-2xl cursor-pointer hover:bg-orange-100/70 transition-colors"
                                            >
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-5 w-5 sm:h-8 sm:w-8 border sm:border-2 border-white shadow-sm">
                                                        <AvatarImage src={activity.user?.avatarUrl || undefined} />
                                                        <AvatarFallback className="text-[9px] sm:text-xs bg-orange-200 text-orange-700 font-bold">
                                                            {activity.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="text-[10px] sm:text-sm font-semibold text-gray-600 truncate">
                                                        {activity.user?.fullName || 'Pengguna'}
                                                    </span>
                                                    {activity.user?.levelName && (
                                                        <span className="text-[8px] sm:text-[10px] text-gray-400 truncate hidden sm:block">
                                                            {activity.user.levelName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                            {(!activities || activities.length === 0) && (
                                <div className="col-span-full text-center py-12 text-gray-500 bg-orange-50 rounded-[2rem] border-2 border-dashed border-orange-200">
                                    <Tent className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                                    <p className="font-medium">Belum ada aktivitas terbaru.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Komunitas Preview */}
                    {regions && regions.length > 0 && (
                        <section className="py-10 md:py-16 container mx-auto px-4">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-10">
                                <h2 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight text-center md:text-left">
                                    Komunitas <span className="text-orange-500">Populer</span>
                                </h2>
                                <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-100 text-orange-600 font-bold rounded-full px-6 w-full md:w-auto" asChild>
                                    <Link to="/community" className="flex items-center justify-center gap-2">
                                        Lihat Semua <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                {regions.slice(0, 4).map((region) => (
                                    <Link key={region.id} to={`/r/${region.slug}`} className="block group">
                                        <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 rounded-2xl">
                                            {/* Cover */}
                                            <div className="relative h-24 bg-gradient-to-r from-orange-400 to-amber-500">
                                                {region.coverUrl && (
                                                    <img
                                                        src={region.coverUrl}
                                                        alt="Cover"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                {/* Profile Image */}
                                                <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl border-3 border-white bg-white shadow-lg overflow-hidden">
                                                    {region.imageUrl ? (
                                                        <img
                                                            src={region.imageUrl}
                                                            alt={region.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-lg font-bold">
                                                            {region.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="pt-10 pb-4 px-4">
                                                <h3 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors truncate">
                                                    {region.name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="font-medium">{region.memberCount || 0} anggota</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Camp Area Preview */}
                    <section className="py-10 md:py-16 px-4 bg-orange-50/30">
                        <div className="container mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-10">
                                <h2 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight text-center md:text-left">
                                    Rekomendasi <span className="text-orange-500">Camp Area</span>
                                </h2>
                                <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-100 text-orange-600 font-bold rounded-full px-6 w-full md:w-auto" asChild>
                                    <Link to="/camp-areas" className="flex items-center justify-center gap-2">
                                        Lihat Semua <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                {campAreas?.slice(0, 4).map((campArea) => (
                                    <Link key={campArea.id} to={`/c/${campArea.id}`} className="block group">
                                        <Card className="overflow-hidden bg-white group-hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-orange-200 shadow-md hover:shadow-xl rounded-2xl">
                                            {/* Image Section */}
                                            <div className="relative aspect-video bg-orange-50 overflow-hidden m-2 rounded-2xl">
                                                <img
                                                    src={campArea.imageUrl || "/camp.jpg"}
                                                    alt={campArea.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                                {/* Price Badge */}
                                                {campArea.price && (
                                                    <div className="absolute top-3 right-3">
                                                        <Badge className="bg-green-500 text-white text-xs font-bold shadow-lg">
                                                            Rp {parseInt(campArea.price).toLocaleString('id-ID')}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Bottom Overlay: Location + Facilities */}
                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 px-2.5 py-1 rounded-full">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="truncate max-w-[120px]">{campArea.location || "Lokasi"}</span>
                                                        </div>

                                                        {/* Facility Icons Only */}
                                                        {campArea.facilities && campArea.facilities.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                {campArea.facilities.slice(0, 3).map((facility, idx) => (
                                                                    <div key={idx} className="bg-white p-1.5 rounded-full text-orange-600" title={facility}>
                                                                        {getFacilityIcon(facility)}
                                                                    </div>
                                                                ))}
                                                                {campArea.facilities.length > 3 && (
                                                                    <div className="bg-white/80 text-gray-600 text-[10px] font-bold px-1.5 py-1 rounded-full">
                                                                        +{campArea.facilities.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-bold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1 mb-2">
                                                    {campArea.name}
                                                </h3>

                                                {/* Creator Info - Compact */}
                                                {campArea.user && (
                                                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                                                        <div className="relative">
                                                            <div className="w-7 h-7 rounded-full overflow-hidden bg-orange-100">
                                                                {campArea.user.avatarUrl ? (
                                                                    <img
                                                                        src={campArea.user.avatarUrl}
                                                                        alt={campArea.user.fullName || 'User'}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                                                        {(campArea.user.fullName || 'U').charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 text-white text-[7px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                                                                {campArea.user.level || 1}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-600 truncate">{campArea.user.fullName || 'Pengguna'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                                {(!campAreas || campAreas.length === 0) && (
                                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                                        <div className="inline-block p-4 rounded-full bg-orange-50 mb-4">
                                            <Tent className="h-8 w-8 text-orange-400" />
                                        </div>
                                        <p className="font-bold text-lg text-gray-700">Belum ada rekomendasi</p>
                                        <p className="text-sm text-gray-400">Coba cek lagi nanti ya!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Gear Publik */}
                    <section className="py-10 md:py-16 container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-10">
                            <h2 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight text-center md:text-left">Gear <span className="text-orange-500">Publik</span></h2>
                            <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-100 text-orange-600 font-bold rounded-full px-6 w-full md:w-auto" asChild>
                                <Link to="/gear/public" className="flex items-center justify-center gap-2">
                                    Lihat Semua <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <PublicGearSection />
                    </section>

                    {/* Acara Preview */}
                    <section className="py-10 md:py-16 px-4 bg-orange-50/30">
                        <div className="container mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-10">
                                <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 tracking-tight text-center md:text-left">Acara Mendatang</h2>
                                <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-100 text-orange-600 font-bold rounded-full px-6 w-full md:w-auto" asChild>
                                    <Link to="/events" className="flex items-center justify-center gap-2">
                                        Lihat Semua <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                {events?.slice(0, 4).map((event) => {
                                    const isPast = new Date(event.dateStart) < new Date();
                                    return (
                                        <Link key={event.id} to={`/e/${event.id}`} className="block group">
                                            <Card className={`overflow-hidden bg-white group-hover:-translate-y-2 transition-all duration-300 h-full flex flex-col border-2 border-transparent hover:border-orange-200 shadow-lg hover:shadow-2xl rounded-3xl ${isPast ? 'opacity-80' : ''}`}>
                                                <div className="relative aspect-video bg-orange-50 overflow-hidden m-2 rounded-2xl">
                                                    <img
                                                        src={event.imageUrl || "/event.jpg"}
                                                        alt={event.title}
                                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isPast ? 'grayscale-[30%]' : ''}`}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />

                                                    {/* Status Badge */}
                                                    <div className="absolute top-3 left-3">
                                                        {isPast ? (
                                                            <Badge className="bg-gray-600/90 text-white text-xs font-bold">
                                                                Selesai
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-green-500/90 text-white text-xs font-bold">
                                                                Akan Datang
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="absolute bottom-3 left-3 right-3 text-white">
                                                        <div className="flex items-center gap-1 text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full w-fit">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="truncate max-w-[150px]">{event.location || "Lokasi tidak tersedia"}</span>
                                                        </div>
                                                    </div>
                                                    {event.price && parseInt(event.price) > 0 && (
                                                        <div className="absolute top-3 right-3">
                                                            <Badge className="bg-green-500/90 text-white text-xs font-bold flex items-center gap-1">
                                                                <DollarSign className="h-3 w-3" />
                                                                Rp {parseInt(event.price).toLocaleString('id-ID')}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                                <CardHeader className="p-5 pb-2">
                                                    <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors leading-tight">
                                                        {event.title}
                                                    </CardTitle>
                                                    <div className="flex flex-col gap-2 mt-3">
                                                        {event.dateStart && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Calendar className="h-4 w-4 text-orange-500" />
                                                                <span className="font-medium">
                                                                    {formatDate(event.dateStart)}
                                                                    {event.dateEnd && ` - ${formatDate(event.dateEnd)}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {event.maxParticipants && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Users className="h-4 w-4 text-blue-500" />
                                                                <span className="font-medium">
                                                                    Max {event.maxParticipants} peserta
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardFooter className="p-5 pt-0 mt-auto">
                                                    <Button variant="outline" className="w-full rounded-full border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 font-semibold">
                                                        Lihat Detail
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    );
                                })}
                                {(!events || events.length === 0) && (
                                    <div className="col-span-full text-center py-12 text-gray-500 bg-orange-50 rounded-[2rem] border-2 border-dashed border-orange-200">
                                        <Calendar className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                                        <p className="font-medium">Belum ada acara mendatang.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Community Photo Gallery Section */}
                    {galleryPhotos.length > 0 && (
                        <section className="py-10 md:py-16 bg-gradient-to-b from-gray-50 to-white">
                            <div className="container mx-auto px-4">
                                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
                                    <div>
                                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold mb-3">
                                            <Camera className="h-4 w-4" /> Galeri Foto Komunitas
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                                            Momen Camping <span className="text-orange-500">Terbaik</span>
                                        </h2>
                                        <p className="text-gray-600 mt-2 text-base md:text-lg">
                                            Koleksi potret keindahan alam dan keceriaan berkemah anggota Yurucamp Indonesia
                                        </p>
                                    </div>
                                    <Button asChild variant="outline" className="rounded-full border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 font-semibold w-fit">
                                        <Link to="/gallery" className="flex items-center gap-2">
                                            Jelajahi Semua Foto <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                    {galleryPhotos.map((photo, index) => (
                                        <div
                                            key={index}
                                            className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 bg-gray-900"
                                            onClick={() => setLightboxIndex(index)}
                                        >
                                            <img
                                                src={photo.url}
                                                alt={photo.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                            />

                                            <div className="absolute top-3 left-3 z-10">
                                                <Badge className={`text-xs font-bold text-white shadow-md ${photo.type === 'Aktivitas' ? 'bg-amber-500/90 backdrop-blur-md' : 'bg-green-600/90 backdrop-blur-md'}`}>
                                                    {photo.type}
                                                </Badge>
                                            </div>

                                            {/* Hover Overlay Details */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 md:p-5 flex flex-col justify-end">
                                                <h3 className="text-white font-bold text-base md:text-lg line-clamp-1">
                                                    {photo.title}
                                                </h3>
                                                {photo.location && (
                                                    <p className="text-gray-300 text-xs md:text-sm flex items-center gap-1 mt-1 truncate">
                                                        <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                                                        {photo.location}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex items-center justify-between text-xs text-orange-300 font-semibold pt-2 border-t border-white/20">
                                                    <span>{photo.author ? `Oleh ${photo.author}` : 'Klik me-zoom'}</span>
                                                    <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                        🔍 Zoom
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <Footer />

                {/* yet-another-react-lightbox Modal */}
                <Lightbox
                    open={lightboxIndex !== null}
                    close={() => setLightboxIndex(null)}
                    index={lightboxIndex ?? 0}
                    slides={galleryPhotos.map((p) => ({
                        src: p.url,
                        title: p.title,
                        description: `${p.type}${p.location ? ` - ${p.location}` : ''}${p.author ? ` (oleh ${p.author})` : ''}`
                    }))}
                    plugins={[Thumbnails, Zoom, Fullscreen, DownloadPlugin]}
                    zoom={{ maxZoomPixelRatio: 3, zoomInMultiplier: 1.5 }}
                    thumbnails={{ position: 'bottom', width: 80, height: 80, border: 2, gap: 10 }}
                />
            </div>
        </>
    );
}
