import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Backpack, Calendar, ArrowRight, User } from 'lucide-react';
import api from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import type { GearList } from '../../types/gear';

export default function PublicGearLists() {
    const { data: lists, isLoading } = useQuery({
        queryKey: ['publicGearLists'],
        queryFn: async () => {
            const response = await api.get('/gear/public');
            return response.data as (GearList & { user: { fullName: string; avatarUrl: string | null } })[];
        }
    });

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">Eksplor Daftar Perlengkapan</h1>
                        <p className="text-text-secondary mt-1 text-sm sm:text-base">Temukan inspirasi daftar perlengkapan dari petualang lain.</p>
                    </div>
                </div>

                {/* List Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : lists && lists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {lists.map((list) => (
                            <Link
                                key={list.id}
                                to={`/g/${list.id}`}
                                className="group block bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shrink-0">
                                        <Backpack className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                                            {list.name}
                                        </h3>
                                        <p className="text-text-tertiary text-sm line-clamp-2 mt-0.5">
                                            {list.description || 'Tidak ada deskripsi'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                        {list.user?.avatarUrl ? (
                                            <img src={list.user.avatarUrl} alt={list.user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-text-secondary truncate">
                                        Running by {list.user?.fullName}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                                    <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(list.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-primary font-semibold group-hover:gap-2 transition-all">
                                        Lihat <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4">
                            <Backpack className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Belum ada daftar publik</h3>
                        <p className="text-text-secondary">Jadilah yang pertama membagikan daftar perlengkapan Anda!</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
