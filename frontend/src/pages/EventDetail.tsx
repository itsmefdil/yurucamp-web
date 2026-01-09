import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Users, DollarSign, UserPlus, UserMinus } from 'lucide-react';
import api from '../lib/api';
import type { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isJoined, setIsJoined] = useState(false);

    // Fetch event detail
    const { data: event, isLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const response = await api.get(`/events/${id}`);
            return response.data as Event;
        },
        enabled: !!id,
    });

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
            setIsJoined(true);
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
            setIsJoined(false);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

    const isOrganizer = user?.id === event.organizerId;

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <Navbar />
            <main className="flex-1 pb-24 md:pb-12">
                <div className="container mx-auto px-4 pt-24 md:pt-32">
                    {/* Hero Image */}
                    <div className="relative h-[45vh] md:h-[60vh] w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                        {event.imageUrl ? (
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover opacity-90"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                                <span className="text-4xl font-bold opacity-30">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                        <div className="absolute top-6 left-6 z-20">
                            <Button variant="outline" size="icon" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md" asChild>
                                <Link to="/events">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                            {isOrganizer && (
                                <>
                                    <Button variant="secondary" size="icon" className="rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg border-none transition-all hover:scale-105" asChild>
                                        <Link to={`/dashboard/edit-event/${event.id}`}>
                                            <Edit className="h-5 w-5" />
                                        </Link>
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

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-white/90 mb-3 md:mb-4 text-sm md:text-base font-medium">
                                    {event.dateStart && (
                                        <span className="bg-blue-500/90 backdrop-blur-sm px-3 md:px-4 py-1.5 rounded-full text-white text-xs md:text-sm font-bold shadow-lg flex items-center gap-1">
                                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                            {formatDate(event.dateStart)}
                                            {event.dateEnd && ` - ${formatDate(event.dateEnd)}`}
                                        </span>
                                    )}
                                    {event.location && (
                                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/10 text-xs md:text-base">
                                            <MapPin className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
                                            {event.location}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 drop-shadow-xl leading-tight tracking-tight">
                                    {event.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 mt-8 relative z-30">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-8">
                            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white ring-1 ring-black/5">
                                <CardContent className="p-5 md:p-10 space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4">Deskripsi Event</h2>
                                        <div
                                            className="prose md:prose-lg max-w-none text-gray-600 leading-loose"
                                            dangerouslySetInnerHTML={{ __html: event.description || "Tidak ada deskripsi." }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                                            <Calendar className="h-8 w-8 text-blue-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Tanggal</p>
                                                <p className="font-bold text-gray-900">
                                                    {event.dateStart && formatDate(event.dateStart)}
                                                </p>
                                                {event.dateEnd && (
                                                    <p className="text-sm text-gray-600">
                                                        s/d {formatDate(event.dateEnd)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                                            <Users className="h-8 w-8 text-purple-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Kapasitas</p>
                                                <p className="font-bold text-gray-900">
                                                    {event.maxParticipants ? `Max ${event.maxParticipants} peserta` : 'Tidak terbatas'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                                            <MapPin className="h-8 w-8 text-red-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Lokasi</p>
                                                <p className="font-bold text-gray-900">{event.location || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                                            <DollarSign className="h-8 w-8 text-green-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Biaya</p>
                                                <p className="font-bold text-gray-900">
                                                    {event.price && parseInt(event.price) > 0
                                                        ? `Rp ${parseInt(event.price).toLocaleString('id-ID')}`
                                                        : 'Gratis'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <Card className="border-none shadow-lg bg-white rounded-3xl p-6 ring-1 ring-black/5 sticky top-24">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-xl font-bold">Pendaftaran Event</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    {!isOrganizer && (
                                        <>
                                            {!isJoined ? (
                                                <Button
                                                    className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 flex items-center justify-center gap-2"
                                                    size="lg"
                                                    onClick={handleJoinEvent}
                                                    disabled={joinEventMutation.isPending}
                                                >
                                                    <UserPlus className="h-5 w-5" />
                                                    {joinEventMutation.isPending ? 'Mendaftar...' : 'Daftar Event'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold py-6 flex items-center justify-center gap-2"
                                                    size="lg"
                                                    onClick={handleLeaveEvent}
                                                    disabled={leaveEventMutation.isPending}
                                                >
                                                    <UserMinus className="h-5 w-5" />
                                                    {leaveEventMutation.isPending ? 'Membatalkan...' : 'Batal Ikut'}
                                                </Button>
                                            )}
                                        </>
                                    )}

                                    {isOrganizer && (
                                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                                            <p className="text-sm font-medium text-blue-600">
                                                Anda adalah penyelenggara event ini
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-center text-gray-500">
                                            {event.maxParticipants
                                                ? `Tersedia untuk ${event.maxParticipants} peserta`
                                                : 'Tidak ada batasan peserta'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
