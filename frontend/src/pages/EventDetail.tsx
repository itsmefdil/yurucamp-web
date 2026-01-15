import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Users, UserPlus, UserMinus, Info, Ticket, CheckCircle, Share2, Plus, Minus } from 'lucide-react';
import api from '../lib/api';
import type { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';
import { EventParticipantsModal } from '../components/events/EventParticipantsModal';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [seatCount, setSeatCount] = useState(1);

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

    const totalParticipantsCount = useMemo(() => {
        return allParticipants.reduce((acc, p) => acc + (p.seatCount || 1), 0);
    }, [allParticipants]);

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
            await api.post(`/events/${id}/join`, { seatCount });
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

    const handleShare = async () => {
        if (!event) return;
        const shareData = {
            title: event.title,
            text: `Yuk ikut event ${event.title} di Yurucamp!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link berhasil disalin!');
            } catch (err) {
                toast.error('Gagal menyalin link');
            }
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
        <div className="min-h-screen flex flex-col relative bg-[#FDFBF7] overflow-x-hidden">
            {/* Abstract Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-orange-100/40 to-amber-100/40 blur-[120px]" />
                <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-orange-50/50 to-yellow-50/50 blur-[100px]" />
                <div className="absolute -bottom-[10%] right-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-t from-orange-50/30 to-amber-50/30 blur-[140px]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 pb-24 md:pb-12">
                    <div className="container mx-auto px-4 pt-24 md:pt-32">
                        {/* Navigation Bar */}
                        <div className="flex justify-between items-center mb-8">
                            <Button variant="outline" size="icon" className="rounded-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm" asChild>
                                <Link to="/events">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all hover:scale-105"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-5 w-5" />
                                </Button>

                                {isOrganizer && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all hover:scale-105"
                                            asChild
                                        >
                                            <Link to={`/e/${id}/edit`}>
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
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Image & Organizer */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Poster Image */}
                                <div
                                    className="relative w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 group cursor-pointer"
                                    onClick={() => setIsLightboxOpen(true)}
                                >
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.title}
                                            className={`w-full h-auto max-h-[70vh] object-contain bg-gray-100 transition-transform duration-700 group-hover:scale-105 ${isPast ? 'grayscale-[50%]' : ''}`}
                                        />
                                    ) : (
                                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
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

                                    {/* Edit Actions for Owner */}
                                    {isOrganizer && (
                                        <Link
                                            to={`/e/${id}/edit`}
                                            className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="rounded-full shadow-lg h-8 w-8 bg-white/90 hover:bg-white text-gray-900"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {/* Organizer Card (Moved here) */}
                                {event.organizer && (
                                    <Card className="border-none shadow-lg bg-white rounded-3xl p-6 ring-1 ring-black/5">
                                        <CardHeader className="p-0 mb-4">
                                            <CardTitle className="text-lg font-bold text-gray-700">Penyelenggara</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                                                        <AvatarImage src={event.organizer.avatarUrl} />
                                                        <AvatarFallback className="bg-orange-500 text-white text-xl font-bold">
                                                            {event.organizer.fullName?.[0] || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {event.organizer.level && (
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
                                                            {event.organizer.level}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 truncate">{event.organizer.fullName || 'Pengguna'}</h4>
                                                    {event.organizer.levelName && (
                                                        <p className="text-sm text-orange-600 font-medium">{event.organizer.levelName}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Participants Summary (Mobile/Left Column) */}
                                <div className="bg-white rounded-3xl p-6 shadow-lg ring-1 ring-black/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-700">Peserta</h3>
                                        <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                                            {totalParticipantsCount} / {event.maxParticipants}
                                        </span>
                                    </div>
                                    <div className="flex -space-x-2 overflow-hidden mb-4 p-1 pl-2">
                                        {allParticipants.slice(0, 5).map((p) => (
                                            <Avatar key={p.id} className="inline-block border-2 border-white ring-2 ring-gray-100 w-10 h-10">
                                                <AvatarImage src={p.avatarUrl} />
                                                <AvatarFallback className="bg-gray-100 text-gray-600">{p.fullName?.[0]}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {allParticipants.length > 5 && (
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600 ring-2 ring-gray-100 z-10">
                                                +{allParticipants.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="outline" className="w-full rounded-full" onClick={() => setIsParticipantsModalOpen(true)}>
                                        Lihat Semua
                                    </Button>
                                </div>
                            </div>

                            {/* Right Column: Details & Description */}
                            <div className="lg:col-span-8 space-y-4 md:space-y-6">
                                {/* Header Section */}
                                <div>

                                    {/* Event Title */}
                                    <div className="mb-6 md:mb-8">
                                        <h1 className="text-2xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4 leading-tight tracking-tight">
                                            {event.title}
                                        </h1>
                                    </div>

                                    {/* Info Card (Light Themed) */}
                                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl ring-1 ring-black/5 mb-6 md:mb-8">
                                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-8">
                                            {/* Date & Time */}
                                            <div className="flex gap-2 md:gap-4">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                                    <Calendar className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-gray-500 text-xs md:text-sm mb-0.5 md:mb-1 font-medium">Tanggal & Waktu</p>
                                                    <p className="font-bold text-sm md:text-lg text-gray-900 truncate">{formatDate(event.dateStart)}</p>
                                                    {event.dateEnd && <p className="text-gray-500 text-xs md:text-sm truncate">{formatDate(event.dateEnd)}</p>}
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div className="flex gap-2 md:gap-4">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-gray-500 text-xs md:text-sm mb-0.5 md:mb-1 font-medium">Lokasi</p>
                                                    <p className="font-bold text-sm md:text-lg text-gray-900 break-words">{event.location || 'TBA'}</p>
                                                </div>
                                            </div>

                                            {/* Capacity */}
                                            <div className="flex gap-2 md:gap-4">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                                    <Users className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-gray-500 text-xs md:text-sm mb-0.5 md:mb-1 font-medium">Kapasitas</p>
                                                    <p className="font-bold text-sm md:text-lg text-gray-900">
                                                        {totalParticipantsCount} {(event.maxParticipants ?? 0) > 0 ? `/ ${event.maxParticipants}` : ''} Peserta
                                                    </p>
                                                    {(event.maxParticipants ?? 0) === 0 ? (
                                                        <span className="text-orange-600 text-xs md:text-sm">Tidak Dibatasi</span>
                                                    ) : ((event.maxParticipants ?? 0) - totalParticipantsCount) > 0 ? (
                                                        <span className="text-emerald-600 text-xs md:text-sm">Sisa {(event.maxParticipants ?? 0) - totalParticipantsCount} slot</span>
                                                    ) : (
                                                        <span className="text-red-500 text-xs md:text-sm">Penuh</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex gap-2 md:gap-4">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                                    <Ticket className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-gray-500 text-xs md:text-sm mb-0.5 md:mb-1 font-medium">Harga Tiket</p>
                                                    <p className="font-bold text-sm md:text-lg text-gray-900">
                                                        {event.price && parseInt(event.price) > 0
                                                            ? `Rp ${parseInt(event.price).toLocaleString('id-ID')}`
                                                            : 'Gratis'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button Area */}
                                        <div className="mt-8 pt-6 border-t border-gray-100">
                                            {!isOrganizer ? (
                                                isJoined ? (
                                                    <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                                            <CheckCircle className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-emerald-700">Anda sudah terdaftar!</p>
                                                            <p className="text-sm text-emerald-600">Sampai jumpa di lokasi.</p>
                                                        </div>
                                                        {!isPast && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="rounded-lg"
                                                                onClick={handleLeaveEvent}
                                                                disabled={leaveEventMutation.isPending}
                                                            >
                                                                <UserMinus className="h-4 w-4 mr-1" /> Batal
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (!isPast && ((event.maxParticipants ?? 0) === 0 || totalParticipantsCount < (event.maxParticipants ?? 0))) ? (
                                                    <div className="space-y-4">
                                                        {/* Seat Selector */}
                                                        <div className="flex items-center justify-between bg-orange-50 p-3 rounded-xl border border-orange-100">
                                                            <span className="text-sm font-bold text-gray-700">Jumlah Orang</span>
                                                            <div className="flex items-center gap-3 bg-white rounded-lg p-1 shadow-sm border border-orange-100">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-md text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                                    onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                                                                    disabled={seatCount <= 1}
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                                <span className="font-bold text-gray-800 w-4 text-center">{seatCount}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-md text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                                    onClick={() => setSeatCount(seatCount + 1)}
                                                                    disabled={event.maxParticipants ? (seatCount >= (event.maxParticipants - totalParticipantsCount)) : false}
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            size="lg"
                                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 text-lg rounded-xl shadow-lg shadow-orange-500/20 transform transition-all active:scale-[0.98]"
                                                            onClick={handleJoinEvent}
                                                            disabled={joinEventMutation.isPending}
                                                        >
                                                            <UserPlus className="h-5 w-5 mr-2" />
                                                            {joinEventMutation.isPending ? 'Memproses...' : `Daftar (${seatCount} Orang)`}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button size="lg" disabled className="w-full bg-gray-200 text-gray-500 h-14 rounded-xl font-bold">
                                                        {isPast ? 'Event Selesai' : ((event.maxParticipants ?? 0) > 0 && totalParticipantsCount >= (event.maxParticipants ?? 0) ? 'Kuota Penuh' : 'Pendaftaran Tutup')}
                                                    </Button>
                                                )
                                            ) : (
                                                <div className="bg-orange-50 text-orange-700 p-4 rounded-xl text-center font-medium border border-orange-100">
                                                    Anda adalah penyelenggara event ini
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Detailed Content - Separate Cards */}
                                    <div className="space-y-4 md:space-y-6">
                                        {/* Card 1: Tentang Event */}
                                        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl ring-1 ring-black/5">
                                            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-gray-800">
                                                <span className="w-1 md:w-1.5 h-5 md:h-6 bg-orange-500 rounded-full"></span>
                                                Tentang Event
                                            </h2>
                                            <div className="prose prose-sm md:prose-lg prose-orange max-w-none text-gray-600 leading-relaxed font-medium">
                                                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                                    {event.description || "Tidak ada deskripsi."}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Card 2: Starter Pack Camper */}
                                        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl ring-1 ring-black/5">
                                            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-gray-800">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-backpack h-5 w-5 text-orange-500"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /><path d="M8 10h8" /><path d="M9 21v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
                                                Starter Pack Camper
                                            </h3>
                                            <div className="bg-orange-50 rounded-xl md:rounded-2xl p-3 md:p-5 border border-orange-100">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
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
                                                        <div key={idx} className="flex items-center gap-2 text-gray-700 bg-white p-2 rounded-lg text-xs md:text-sm font-medium shadow-sm border border-orange-100/50">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] md:text-xs text-orange-600 mt-3 md:mt-4 italic text-center">
                                                    *List ini direkomendasikan agar solo camp kamu tetap nyaman dan aman! ⛺🔥
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card 3: Lokasi Event */}
                                        {event.location && (
                                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl ring-1 ring-black/5">
                                                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-gray-800">
                                                    <MapPin className="h-5 w-5 text-orange-500" /> Lokasi Event
                                                </h3>
                                                <div className="w-full h-60 md:h-80 rounded-xl md:rounded-2xl overflow-hidden shadow-inner bg-gray-100 ring-1 ring-black/5 relative group">
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
                                                        className="absolute bottom-3 right-3 md:bottom-4 md:right-4 shadow-lg bg-white text-gray-800 hover:bg-gray-50 opacity-90 hover:opacity-100 text-xs md:text-sm"
                                                        onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}`, '_blank')}
                                                    >
                                                        Buka di Google Maps
                                                    </Button>
                                                </div>
                                                <p className="mt-2 md:mt-3 text-xs md:text-sm text-gray-500 flex items-center gap-1.5">
                                                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                                                    {event.location}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />

                {/* Modals & Overlays */}

                <EventParticipantsModal
                    open={isParticipantsModalOpen}
                    onOpenChange={setIsParticipantsModalOpen}
                    participants={allParticipants}
                    title={event.title}
                />

                {/* Mobile Floating Action Bar */}
                {
                    !isOrganizer && !isPast && (
                        <div className="fixed bottom-20 left-4 right-4 z-40 lg:hidden mobile-fab-enter">
                            {!isJoined ? (
                                <div className="space-y-2">
                                    {(!isPast && ((event.maxParticipants ?? 0) === 0 || totalParticipantsCount < (event.maxParticipants ?? 0))) && (
                                        <div className="bg-white/95 backdrop-blur-md p-2 rounded-xl border border-orange-100 shadow-xl flex items-center justify-between ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2">
                                            <span className="text-xs font-bold text-gray-700 pl-2">Jumlah</span>
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-0.5 shadow-inner">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-md text-orange-600 hover:bg-white hover:shadow-sm transition-all"
                                                    onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                                                    disabled={seatCount <= 1}
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </Button>
                                                <span className="font-bold text-gray-800 w-5 text-center text-sm tabular-nums">{seatCount}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-md text-orange-600 hover:bg-white hover:shadow-sm transition-all"
                                                    onClick={() => setSeatCount(seatCount + 1)}
                                                    disabled={event.maxParticipants ? (seatCount >= (event.maxParticipants - totalParticipantsCount)) : false}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    <Button
                                        className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 text-sm shadow-xl hover:shadow-orange-200 border border-white/20 ring-2 ring-black/5"
                                        onClick={handleJoinEvent}
                                        disabled={joinEventMutation.isPending}
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {joinEventMutation.isPending ? 'Proses...' : `Daftar (${seatCount} Orang)`}
                                    </Button>
                                </div>
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
                    )
                }

                {/* Lightbox */}
                {
                    isLightboxOpen && event.imageUrl && (
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
                    )
                }
            </div >
        </div >
    );
}
