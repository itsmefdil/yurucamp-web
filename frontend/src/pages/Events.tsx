import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Plus, MapPin, Calendar, Users, DollarSign, Clock, History } from 'lucide-react';
import api from '../lib/api';
import type { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

type EventFilter = 'upcoming' | 'past';

export default function Events() {
    const { user } = useAuth();
    const [filter, setFilter] = useState<EventFilter>('upcoming');

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const response = await api.get('/events');
            return response.data as Event[];
        },
    });

    // Filter events based on date
    const filteredEvents = useMemo(() => {
        if (!events) return [];

        const now = new Date();

        if (filter === 'upcoming') {
            return events
                .filter(event => new Date(event.dateStart) >= now)
                .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
        } else {
            return events
                .filter(event => new Date(event.dateStart) < now)
                .sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime());
        }
    }, [events, filter]);

    // Count for badges
    const upcomingCount = useMemo(() => {
        if (!events) return 0;
        const now = new Date();
        return events.filter(event => new Date(event.dateStart) >= now).length;
    }, [events]);

    const pastCount = useMemo(() => {
        if (!events) return 0;
        const now = new Date();
        return events.filter(event => new Date(event.dateStart) < now).length;
    }, [events]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            {/* Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left max-w-2xl text-gray-800">
                            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-bold bg-orange-100 text-orange-600 hover:bg-orange-200 border-none">
                                Event Komunitas
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
                                Ikuti Event <br />
                                <span className="text-orange-500">Seru Bersama</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Bergabunglah dalam berbagai event camping, hiking, dan kegiatan outdoor lainnya bersama komunitas.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                {user ? (
                                    <Button
                                        size="lg"
                                        className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-base px-8 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all"
                                        asChild
                                    >
                                        <Link to="/events/add">
                                            <Plus className="mr-2 h-5 w-5" /> Buat Event Baru
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-base px-8 shadow-lg" asChild>
                                        <Link to="/login">
                                            Login untuk Membuat Event
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:block relative w-80 h-80 lg:w-96 lg:h-96">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
                            <div className="absolute inset-4 bg-white/40 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 -mt-8 relative z-20 pb-24">
                {/* Toggle Filter */}
                <div className="flex justify-center mb-6 md:mb-8">
                    <div className="inline-flex bg-white rounded-xl md:rounded-2xl p-1 md:p-1.5 shadow-lg border border-gray-100">
                        <button
                            onClick={() => setFilter('upcoming')}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all ${filter === 'upcoming'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Event </span>Mendatang
                            {upcomingCount > 0 && (
                                <span className={`ml-0.5 md:ml-1 px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs rounded-full ${filter === 'upcoming'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    {upcomingCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setFilter('past')}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all ${filter === 'past'
                                ? 'bg-gray-700 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <History className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Event </span>Selesai
                            {pastCount > 0 && (
                                <span className={`ml-0.5 md:ml-1 px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs rounded-full ${filter === 'past'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {pastCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden bg-white shadow-lg rounded-3xl animate-pulse">
                                <div className="aspect-video bg-gray-200" />
                                <CardHeader className="p-5">
                                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                                </CardHeader>
                                <CardFooter className="p-5">
                                    <div className="h-10 bg-gray-200 rounded w-full" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : filteredEvents && filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => {
                            const isPast = new Date(event.dateStart) < new Date();

                            return (
                                <Link key={event.id} to={`/events/${event.id}`} className="block group">
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
                                                <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
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
                    </div>
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-200">
                        {filter === 'upcoming' ? (
                            <>
                                <Clock className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                                <p className="font-medium">Belum ada event mendatang.</p>
                                <p className="text-sm text-gray-400 mt-1">Jadilah yang pertama membuat event!</p>
                            </>
                        ) : (
                            <>
                                <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="font-medium">Belum ada event yang selesai.</p>
                            </>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
