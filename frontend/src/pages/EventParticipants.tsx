import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import api from '../lib/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import type { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Copy, Dices } from 'lucide-react';
import { ParticipantGachaModal } from '../components/events/ParticipantGachaModal';
import { useState } from 'react';

export default function EventParticipants() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [isGachaOpen, setIsGachaOpen] = useState(false);

    // Fetch event detail
    const { data: event, isLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const response = await api.get(`/events/${id}`);
            return response.data as Event;
        },
        enabled: !!id,
    });

    useDocumentTitle(event ? `Peserta - ${event.title} | Yurucamp` : 'Peserta Event | Yurucamp');

    // Combine organizer and participants for display (reusing logic from EventDetail)
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

    const isOrganizer = user?.id === event?.organizerId;
    const isAdmin = user?.role === 'admin';
    const canCopy = isOrganizer || isAdmin;

    const handleCopyParticipants = async () => {
        if (!event) return;

        const lines = [`List peserta event (${event.title}) :`];
        allParticipants.forEach((p, index) => {
            const ticketInfo = p.seatCount && p.seatCount > 1 ? ` (${p.seatCount} Tiket)` : '';
            lines.push(`${index + 1}. ${p.fullName || 'Unnamed'}${ticketInfo}`);
        });

        const text = lines.join('\n');

        try {
            await navigator.clipboard.writeText(text);
            toast.success('List peserta berhasil disalin!');
        } catch (err) {
            toast.error('Gagal menyalin list');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
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
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />

            <main className="flex-1 pt-24 md:pt-32 pb-32 px-4">
                <div className="container mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-gray-600 hover:text-gray-900" asChild>
                            <Link to={`/e/${id}`}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Kembali ke Event
                            </Link>
                        </Button>

                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Users className="h-6 w-6 text-orange-600" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                                    Peserta Event
                                </h1>
                            </div>
                            {canCopy && (
                                <div className="flex gap-2 mt-2 md:mt-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 bg-white hover:bg-orange-50 text-orange-600 border-orange-200 shrink-0"
                                        onClick={() => setIsGachaOpen(true)}
                                    >
                                        <Dices className="h-4 w-4" />
                                        <span className="hidden md:inline">Gacha</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 bg-white hover:bg-orange-50 text-orange-600 border-orange-200 shrink-0"
                                        onClick={handleCopyParticipants}
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="hidden md:inline">Salin List</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-500 font-medium">
                            {event.title}
                        </p>
                    </div>

                    <ParticipantGachaModal
                        open={isGachaOpen}
                        onOpenChange={setIsGachaOpen}
                        participants={allParticipants}
                        organizerId={event.organizerId}
                    />

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                            <p className="text-sm text-gray-500 mb-1">Total Peserta</p>
                            <p className="text-2xl font-black text-gray-900">{allParticipants.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                            <p className="text-sm text-gray-500 mb-1">Kapasitas</p>
                            <p className="text-2xl font-black text-gray-900">
                                {(event.maxParticipants ?? 0) === 0 ? '∞' : event.maxParticipants}
                            </p>
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden">
                        {allParticipants.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Belum ada peserta</h3>
                                <p className="text-gray-500">Jadilah yang pertama bergabung!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {allParticipants.map((participant, index) => (
                                    <div
                                        key={participant.id}
                                        className="p-4 hover:bg-orange-50/50 transition-colors flex items-center gap-4 group"
                                    >
                                        <div className="text-gray-400 font-medium text-sm w-6 text-center">
                                            {index + 1}
                                        </div>

                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                                <AvatarImage src={participant.avatarUrl} alt={participant.fullName} />
                                                <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                                                    {participant.fullName?.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {participant.level && (
                                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white shadow-sm">
                                                    Lv.{participant.level}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-bold text-gray-900 truncate">
                                                    {participant.fullName}
                                                </h4>
                                                {participant.id === event.organizerId && (
                                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 shadow-none">
                                                        Host
                                                    </Badge>
                                                )}
                                                {participant.seatCount && participant.seatCount > 1 && (
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                        {participant.seatCount} Tiket
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                                {participant.levelName || 'Camper Pemula'}
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all" asChild>
                                            <Link to={`/u/${participant.id}`}>
                                                <ArrowLeft className="w-5 h-5 rotate-180" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
