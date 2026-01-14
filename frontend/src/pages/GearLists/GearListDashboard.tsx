import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, Backpack, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import type { GearList } from '../../types/gear';

export default function GearListDashboard() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');

    const { data: lists, isLoading } = useQuery({
        queryKey: ['gearLists'],
        queryFn: async () => {
            const response = await api.get('/gear');
            return response.data as GearList[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: { name: string; description?: string }) => {
            const response = await api.post('/gear', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearLists'] });
            setIsCreating(false);
            setNewListName('');
            setNewListDesc('');
            toast.success('Daftar perlengkapan berhasil dibuat!');
        },
        onError: () => {
            toast.error('Gagal membuat daftar perlengkapan');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/gear/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gearLists'] });
            toast.success('Daftar perlengkapan dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus daftar perlengkapan');
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        createMutation.mutate({ name: newListName, description: newListDesc });
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin menghapus daftar ini?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">Daftar Perlengkapan</h1>
                        <p className="text-text-secondary mt-1 text-sm sm:text-base">Kelola daftar perlengkapan hiking dan camping Anda.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Buat Daftar Baru</span>
                    </button>
                </div>

                {/* Create Form */}
                {isCreating && (
                    <div className="mb-8 bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Backpack className="w-5 h-5 text-primary" />
                                Buat Daftar Perlengkapan Baru
                            </h2>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">Nama Daftar</label>
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    placeholder="contoh: Setup Ultralight 3 Hari"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">Deskripsi <span className="text-text-tertiary font-normal">(Opsional)</span></label>
                                <textarea
                                    value={newListDesc}
                                    onChange={(e) => setNewListDesc(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                                    placeholder="Deskripsi singkat tentang daftar perlengkapan ini..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-5 py-2.5 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                                >
                                    {createMutation.isPending ? 'Membuat...' : 'Buat Daftar'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                                to={`/gear-lists/${list.id}`}
                                className="group block bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all relative"
                            >
                                <div className="absolute top-4 right-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDelete(e, list.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                                        <Backpack className="w-5 h-5 text-primary" />
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
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Backpack className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Belum ada daftar perlengkapan</h3>
                        <p className="text-text-secondary mb-6">Mulai buat daftar perlengkapan camping pertama Anda!</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Sekarang
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
