import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Plus, MapPin, Calendar, Users, DollarSign, Clock, History, Search, X, Filter } from 'lucide-react';
import RegionSelector from '../components/ui/RegionSelector';
import api from '../lib/api';
import type { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

type EventFilter = 'upcoming' | 'past';

export default function Events() {
    const { user } = useAuth();
    const [filter, setFilter] = useState<EventFilter>('upcoming');
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: events, isLoading } = useQuery({
        queryKey: ['events', selectedRegionId],
        queryFn: async () => {
            const params = selectedRegionId ? { regionId: selectedRegionId } : {};
            const response = await api.get('/events', { params });
            return response.data as Event[];
        },
    });

    // Filter events based on date and search
    const filteredEvents = useMemo(() => {
        if (!events) return [];

        const now = new Date();
        let result = events;

        // Apply Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(event =>
                event.title.toLowerCase().includes(query) ||
                (event.location || "").toLowerCase().includes(query) ||
                (event.description || "").toLowerCase().includes(query)
            );
        }

        // Apply Date/Status Filter
        if (filter === 'upcoming') {
            return result
                .filter(event => new Date(event.dateStart) >= now)
                .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
        } else {
            return result
                .filter(event => new Date(event.dateStart) < now)
                .sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime());
        }
    }, [events, filter, searchQuery]);

    // Count for badges (based on raw events before search, to show total available in category)
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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            {/* Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-28 pb-8 md:pt-36 md:pb-12 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-4xl font-black mb-2 leading-tight text-gray-900">
                                Acara <span className="text-orange-500">Komunitas</span>
                            </h1>
                            <p className="text-sm md:text-base text-gray-600">
                                Ikuti keseruan various kegiatan outdoor
                            </p>
                        </div>
                        {/* Create Event button removed to enforce Region-based creation */}
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-6 pb-24">
                {/* Unified Search & Filter Bar */}
                <div className="mb-6 space-y-6">
                    {/* Search & Region Combined */}
                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Search Input */}
                            <div className="relative flex-1 group border-b md:border-b-0 md:border-r border-gray-100">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari event seru..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3.5 bg-transparent focus:outline-none focus:bg-orange-50/30 text-gray-800 placeholder-gray-400 font-medium transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all hover:scale-110"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Region Filter */}
                            <div className="min-w-[280px] relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <Filter className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <div className="pl-7">
                                    <RegionSelector
                                        value={selectedRegionId}
                                        onChange={setSelectedRegionId}
                                        showLabel={false}
                                        variant="ghost"
                                        className="h-full"
                                        placeholder="Semua Lokasi"
                                    />
                                </div>
                                {selectedRegionId && (
                                    <button
                                        onClick={() => setSelectedRegionId(null)}
                                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all hover:scale-110 z-20"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Filter Toggle */}
                    <div className="flex justify-center">
                        <div className="inline-flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                            <button
                                onClick={() => setFilter('upcoming')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'upcoming'
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Clock className="h-4 w-4" />
                                <span>Mendatang</span>
                                {upcomingCount > 0 && (
                                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${filter === 'upcoming'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {upcomingCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setFilter('past')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === 'past'
                                    ? 'bg-gray-700 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <History className="h-4 w-4" />
                                <span>Selesai</span>
                                {pastCount > 0 && (
                                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${filter === 'past'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {pastCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Card key={i} className="overflow-hidden bg-white shadow-lg rounded-3xl animate-pulse">
                                <div className="aspect-video bg-gray-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : filteredEvents && filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEvents.map((event) => {
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
                                                    <Badge className="bg-gray-600/90 text-white text-xs font-bold border-none">
                                                        Selesai
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-500/90 text-white text-xs font-bold border-none">
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
                                                    <Badge className="bg-green-500/90 text-white text-xs font-bold flex items-center gap-1 border-none shadow-sm">

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
