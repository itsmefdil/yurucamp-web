import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Users, UserPlus, UserMinus, Info } from 'lucide-react';
import api from '../lib/api';
import type { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';
import { EditEventModal } from '../components/events/EditEventModal';
import { EventParticipantsModal } from '../components/events/EventParticipantsModal';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Fetch event detail
    const { data: event, isLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const response = await api.get(`/events/${id}`);
            return response.data as Event;
        },
        enabled: !!id,
    });

    // Check availability
    const isJoined = useMemo(() => {
        if (!user || !event?.participants) return false;
        return event.participants.some(p => p.id === user.id);
    }, [user, event]);

    const isOrganizer = user?.id === event?.organizerId;
    const isPast = event?.dateStart ? new Date(event.dateStart) < new Date() : false;

    // Combine organizer and participants for display
    const allParticipants = useMemo(() => {
        if (!event) return [];
        let parts = event.participants || [];

        // Check if organizer is already in list to avoid duplicates
        if (event.organizer && !parts.some(p => p.id === event.organizerId)) {
            // Add organizer to the start of the list
            parts = [event.organizer, ...parts];
        }
        return parts;
    }, [event]);

    // Delete event mutation
    const deleteEventMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/events/${id}`);
        },
        onSuccess: () => {
            toast.success('Event berhasil dihapus');
            navigate('/events');
        },
        onError: () => {
            toast.error('Gagal menghapus event');
        },
    });

    // Join event mutation
    const joinEventMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/events/${id}/join`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', id] });
            toast.success('Berhasil bergabung dengan event!');
        },
        onError: (error: any) => {
            if (error.response?.data?.error === 'Already joined') {
                toast.error('Anda sudah terdaftar di event ini');
            } else {
                toast.error('Gagal bergabung dengan event');
            }
        },
    });

    // Leave event mutation
    const leaveEventMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/events/${id}/leave`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', id] });
            toast.success('Anda telah keluar dari event');
        },
        onError: () => {
            toast.error('Gagal keluar dari event');
        },
    });

    const handleDeleteEvent = () => {
        if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            deleteEventMutation.mutate();
        }
    };

    const handleJoinEvent = () => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu');
            navigate('/login');
            return;
        }
        joinEventMutation.mutate();
    };

    const handleLeaveEvent = () => {
        if (confirm('Apakah Anda yakin ingin keluar dari event ini?')) {
            leaveEventMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Event tidak ditemukan</h2>
                    <Button asChild>
                        <Link to="/events">Kembali ke Events</Link>
                    </Button>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1">
                <div className="container mx-auto px-4 relative z-20 pt-24 md:pt-32 pb-24">
                    {/* Navigation */}
                    <div className="flex justify-between items-center mb-8">
                        {/* ... (Navigation content) ... */}
                        <Button variant="outline" size="icon" className="rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm" asChild>
                            <Link to="/events">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>

                        <div className="flex gap-2">
                            {isOrganizer && !isPast && (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all hover:scale-105"
                                        onClick={() => setIsEditModalOpen(true)}
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="rounded-full shadow-lg"
                                        onClick={handleDeleteEvent}
                                        disabled={deleteEventMutation.isPending}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Cover & Main Info */}
                        <div className="lg:col-span-8">
                            {/* ... (Cover Image & Title content) ... */}
                            <div
                                className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 group mb-8 cursor-pointer"
                                onClick={() => setIsLightboxOpen(true)}
                            >
                                {event.imageUrl ? (
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isPast ? 'grayscale-[50%]' : ''}`}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Calendar className="h-10 w-10 opacity-20" />
                                            <span className="text-xl font-bold opacity-30">No Image</span>
                                        </div>
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-4 left-4 pointer-events-none">
                                    <div className="flex items-center gap-2">
                                        {isPast ? (
                                            <span className="bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 shadow-lg">
                                                <Info className="h-3.5 w-3.5" /> Event Selesai
                                            </span>
                                        ) : (
                                            <span className="bg-green-500/90 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg animate-pulse flex items-center gap-1.5 border border-white/20">
                                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                                Open Registration
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                        Zoom Image
                                    </span>
                                </div>
                            </div>

                            {/* Event Title & Quick Info */}
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                                    {event.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm md:text-base font-medium">
                                    {event.dateStart && (
                                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="p-1.5 bg-orange-50 rounded-lg">
                                                <Calendar className="h-4 w-4 text-orange-500" />
                                            </div>
                                            <span>
                                                {formatDate(event.dateStart)}
                                                {event.dateEnd && ` - ${formatDate(event.dateEnd)}`}
                                            </span>
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="p-1.5 bg-red-50 rounded-lg">
                                                <MapPin className="h-4 w-4 text-red-500" />
                                            </div>
                                            <span>{event.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Content */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                                        <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                                        Tentang Event
                                    </h2>
                                    <div
                                        className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: event.description || "Tidak ada deskripsi." }}
                                    />
                                </div>

                                {/* Gear Checklist */}
                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-backpack h-5 w-5 text-orange-500"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /><path d="M8 10h8" /><path d="M9 21v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
                                        Starter Pack Camper
                                    </h3>
                                    <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                "Tenda Double Layer (Wajib)",
                                                "Sleeping Bag & Matras Empuk",
                                                "Kursi Lipat (Kenyamanan Utama!)",
                                                "Meja Lipat Portable",
                                                "Alat Masak & Kompor Compact",
                                                "Headlamp & Lampu Tenda",
                                                "Jaket & Pakaian Hangat",
                                                "Power Bank / Power Station",
                                                "Trash Bag (Bawa Sampahmu Turun)"
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-gray-700 bg-white p-2 rounded-lg text-sm font-medium shadow-sm border border-orange-100/50">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-orange-600 mt-4 italic text-center">
                                            *List ini direkomendasikan agar solo camp kamu tetap nyaman dan aman! ⛺🔥
                                        </p>
                                    </div>
                                </div>

                                {/* Google Maps Embed */}
                                {event.location && (
                                    <div className="pt-6 border-t border-gray-100">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                                            <MapPin className="h-5 w-5 text-red-500" /> Lokasi Event
                                        </h3>
                                        <div className="w-full h-80 rounded-2xl overflow-hidden shadow-inner bg-gray-100 ring-1 ring-black/5 relative group">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                title="map"
                                                scrolling="no"
                                                marginHeight={0}
                                                marginWidth={0}
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed&hl=id`}
                                                className="w-full h-full grayscale-[10%] hover:grayscale-0 transition-all duration-500"
                                            ></iframe>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="absolute bottom-4 right-4 shadow-lg bg-white text-gray-800 hover:bg-gray-50 opacity-90 hover:opacity-100"
                                                onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}`, '_blank')}
                                            >
                                                Buka di Google Maps
                                            </Button>
                                        </div>
                                        <p className="mt-3 text-sm text-gray-500 flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {event.location}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar: Registration & Organizer */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Registration Card */}
                            <Card className={`border-none shadow-xl rounded-3xl overflow-hidden ring-4 ${isPast ? 'ring-gray-700 bg-gray-50' : 'ring-white/10 bg-white'}`}>
                                <div className={`p-6 text-white text-center ${isPast ? 'bg-gray-700' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                                    <p className="text-sm font-medium opacity-90 mb-1">
                                        {isPast ? 'Event Telah Selesai' : 'Biaya Pendaftaran'}
                                    </p>
                                    <h3 className="text-3xl font-black">
                                        {event.price && parseInt(event.price) > 0
                                            ? `Rp ${parseInt(event.price).toLocaleString('id-ID')}`
                                            : 'GRATIS'}
                                    </h3>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        {/* Participants Summary */}
                                        <div
                                            className="flex items-center justify-between text-sm py-3 px-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100"
                                            onClick={() => setIsParticipantsModalOpen(true)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-blue-500" />
                                                <span className="text-gray-600">Peserta Terdaftar</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">
                                                    {allParticipants.length}
                                                    {event.maxParticipants ? `/${event.maxParticipants}` : ''}
                                                </span>
                                                {allParticipants.length > 0 && (
                                                    <div className="flex -space-x-2">
                                                        {allParticipants.slice(0, 3).map((p) => (
                                                            <Avatar key={p.id} className="h-6 w-6 border-2 border-white ring-1 ring-gray-100">
                                                                <AvatarImage src={p.avatarUrl} />
                                                                <AvatarFallback className="text-[8px] bg-orange-100 text-orange-700">
                                                                    {p.fullName?.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                        {allParticipants.length > 3 && (
                                                            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold border-2 border-white text-gray-500">
                                                                +{allParticipants.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                                            <span className="text-gray-500">Status</span>
                                            {isPast ? (
                                                <span className="font-bold text-gray-500">Selesai</span>
                                            ) : (
                                                <span className="font-bold text-green-600">Terbuka</span>
                                            )}
                                        </div>
                                    </div>

                                    {!isOrganizer ? (
                                        !isJoined ? (
                                            <Button
                                                className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all"
                                                onClick={handleJoinEvent}
                                                disabled={joinEventMutation.isPending || isPast}
                                            >
                                                <UserPlus className="mr-2 h-5 w-5" />
                                                {isPast ? 'Pendaftaran Tutup' : (joinEventMutation.isPending ? 'Mendaftar...' : 'Daftar Sekarang')}
                                            </Button>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-center text-sm font-bold border border-emerald-100 flex flex-col gap-1">
                                                    <span>🎉 Anda sudah terdaftar!</span>
                                                    {!isPast && <span className="text-xs font-normal opacity-80">Sampai jumpa di lokasi event</span>}
                                                </div>
                                                {!isPast && (
                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-2xl border-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 font-bold py-6 transition-colors"
                                                        onClick={handleLeaveEvent}
                                                        disabled={leaveEventMutation.isPending}
                                                    >
                                                        <UserMinus className="mr-2 h-5 w-5" />
                                                        Batal Ikut
                                                    </Button>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-center font-medium border border-blue-100">
                                            Anda adalah penyelenggara
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Organizer Card */}
                            {event.organizer && (
                                <Card className="border-none shadow-lg bg-white/95 backdrop-blur rounded-3xl overflow-hidden ring-1 ring-white/20">
                                    <CardHeader className="p-4 bg-gray-50 border-b border-gray-100">
                                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Diselenggarakan Oleh</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={event.organizer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer.fullName || 'User')}&background=random`}
                                                    alt={event.organizer.fullName}
                                                    className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                                                    Lv.{event.organizer.level || 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{event.organizer.fullName || 'Pengguna'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500 rounded-full"
                                                            style={{ width: `${Math.min(((event.organizer.exp || 0) % 100), 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{event.organizer.exp || 0} XP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Modals & Overlays */}
            <EditEventModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                event={event || null}
            />

            <EventParticipantsModal
                open={isParticipantsModalOpen}
                onOpenChange={setIsParticipantsModalOpen}
                participants={allParticipants}
                title={event.title}
            />

            {/* Mobile Floating Action Bar */}
            {!isOrganizer && !isPast && (
                <div className="fixed bottom-20 left-4 right-4 z-40 lg:hidden mobile-fab-enter">
                    {!isJoined ? (
                        <Button
                            className="w-full rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg shadow-2xl hover:shadow-orange-200 border-2 border-white/20 ring-4 ring-black/5"
                            onClick={handleJoinEvent}
                            disabled={joinEventMutation.isPending}
                        >
                            <UserPlus className="mr-2 h-5 w-5" />
                            {joinEventMutation.isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <div className="flex-1 bg-emerald-500 text-white p-3 rounded-2xl text-center text-sm font-bold shadow-xl border-2 border-white/20 ring-4 ring-black/5 flex items-center justify-center gap-2">
                                <span>🎉 Terdaftar</span>
                            </div>
                            <Button
                                variant="destructive"
                                className="aspect-square h-auto rounded-2xl shadow-xl border-2 border-white/20 ring-4 ring-black/5"
                                onClick={handleLeaveEvent}
                                disabled={leaveEventMutation.isPending}
                            >
                                <UserMinus className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Lightbox */}
            {isLightboxOpen && event.imageUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center">
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
