import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Edit, Trash2, MapPin, Wifi, Car, Coffee, Tent, Info, DollarSign } from 'lucide-react';
import api from '../lib/api';
import type { CampArea } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function CampAreaDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch camp area detail
    const { data: campArea, isLoading } = useQuery({
        queryKey: ['camp-area', id],
        queryFn: async () => {
            const response = await api.get(`/camp-areas/${id}`);
            return response.data as CampArea;
        },
        enabled: !!id,
    });

    // Delete camp area mutation
    const deleteCampAreaMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/camp-areas/${id}`);
        },
        onSuccess: () => {
            toast.success('Camp area berhasil dihapus');
            navigate('/camp-areas');
        },
        onError: () => {
            toast.error('Gagal menghapus camp area');
        },
    });

    const handleDeleteCampArea = () => {
        if (confirm('Apakah Anda yakin ingin menghapus camp area ini?')) {
            deleteCampAreaMutation.mutate();
        }
    };

    const getFacilityIcon = (facility: string) => {
        switch (facility.toLowerCase()) {
            case 'wifi': return <Wifi className="h-5 w-5" />;
            case 'parkir': return <Car className="h-5 w-5" />;
            case 'kantin': return <Coffee className="h-5 w-5" />;
            case 'sewa tenda': return <Tent className="h-5 w-5" />;
            case 'pusat info': return <Info className="h-5 w-5" />;
            default: return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!campArea) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Camp area tidak ditemukan</h2>
                    <Button asChild>
                        <Link to="/camp-areas">Kembali ke Camp Areas</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = user?.id === campArea.userId;

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <Navbar />
            <main className="flex-1 pb-24 md:pb-12">
                <div className="container mx-auto px-4 pt-24 md:pt-32">
                    {/* Hero Image */}
                    <div className="relative h-[45vh] md:h-[60vh] w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                        {campArea.imageUrl ? (
                            <img
                                src={campArea.imageUrl}
                                alt={campArea.name}
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
                                <Link to="/camp-areas">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                            {isOwner && (
                                <>
                                    <Button variant="secondary" size="icon" className="rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg border-none transition-all hover:scale-105" asChild>
                                        <Link to={`/dashboard/edit-camp-area/${campArea.id}`}>
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="rounded-full shadow-lg"
                                        onClick={handleDeleteCampArea}
                                        disabled={deleteCampAreaMutation.isPending}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-white/90 mb-3 md:mb-4 text-sm md:text-base font-medium">
                                    {campArea.price && (
                                        <span className="bg-green-500/90 backdrop-blur-sm px-3 md:px-4 py-1.5 rounded-full text-white text-xs md:text-sm font-bold shadow-lg flex items-center gap-1">
                                            <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                                            Rp {parseInt(campArea.price).toLocaleString('id-ID')}
                                        </span>
                                    )}
                                    {campArea.location && (
                                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/10 text-xs md:text-base">
                                            <MapPin className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
                                            {campArea.location}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 drop-shadow-xl leading-tight tracking-tight">
                                    {campArea.name}
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
                                        <h2 className="text-2xl font-bold mb-4">Deskripsi</h2>
                                        <div
                                            className="prose md:prose-lg max-w-none text-gray-600 leading-loose"
                                            dangerouslySetInnerHTML={{ __html: campArea.description || "Tidak ada deskripsi." }}
                                        />
                                    </div>

                                    {campArea.facilities && campArea.facilities.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold mb-4">Fasilitas</h2>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {campArea.facilities.map((facility, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                        <div className="text-orange-500">
                                                            {getFacilityIcon(facility)}
                                                        </div>
                                                        <span className="font-medium text-gray-700">{facility}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Additional Images Gallery */}
                            {campArea.additionalImages && campArea.additionalImages.length > 0 && (
                                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-2xl font-bold">Galeri Foto</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {campArea.additionalImages.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                                                    <img
                                                        src={img}
                                                        alt={`Gallery ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <Card className="border-none shadow-lg bg-white rounded-3xl p-6 ring-1 ring-black/5 sticky top-24">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-xl font-bold">Informasi Booking</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    <div className="bg-orange-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Harga per malam</p>
                                        <p className="text-3xl font-black text-orange-600">
                                            Rp {campArea.price ? parseInt(campArea.price).toLocaleString('id-ID') : '-'}
                                        </p>
                                    </div>
                                    <Button className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6" size="lg">
                                        Hubungi Pemilik
                                    </Button>
                                    <p className="text-xs text-center text-gray-500">
                                        Silakan hubungi pemilik untuk informasi booking lebih lanjut
                                    </p>
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
