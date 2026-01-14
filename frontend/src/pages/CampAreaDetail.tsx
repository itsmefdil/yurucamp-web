import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Edit, Trash2, MapPin, Wifi, Car, Coffee, Tent, Info, DollarSign, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import type { CampArea } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { EditCampAreaModal } from '../components/campAreas/EditCampAreaModal';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';

export default function CampAreaDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);

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

    // Combine cover image + additional images for lightbox
    const allImages = campArea ? [
        campArea.imageUrl,
        ...(campArea.additionalImages || [])
    ].filter(Boolean) as string[] : [];

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const goToPrev = useCallback(() => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
        }
    }, [lightboxIndex]);

    const goToNext = useCallback(() => {
        if (lightboxIndex !== null && lightboxIndex < allImages.length - 1) {
            setLightboxIndex(lightboxIndex + 1);
        }
    }, [lightboxIndex, allImages.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, goToPrev, goToNext]);

    // Touch swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToNext();
            else goToPrev();
        }
        setTouchStart(null);
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
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg border-none transition-all hover:scale-105"
                                        onClick={() => setIsEditModalOpen(true)}
                                    >
                                        <Edit className="h-5 w-5" />
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

                            {/* Gallery - All Photos including Cover */}
                            {allImages.length > 0 && (
                                <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-2xl font-bold">Galeri Foto ({allImages.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {allImages.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                                                    onClick={() => openLightbox(idx)}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={idx === 0 ? 'Cover' : `Gallery ${idx}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    {idx === 0 && (
                                                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            Cover
                                                        </span>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">Perbesar</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Created By Card */}
                            {campArea.user && (
                                <Card className="border-none shadow-lg bg-white rounded-3xl p-6 ring-1 ring-black/5">
                                    <CardHeader className="p-0 mb-4">
                                        <CardTitle className="text-lg font-bold text-gray-700">Dibuat Oleh</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-200">
                                                    {campArea.user.avatarUrl ? (
                                                        <img
                                                            src={campArea.user.avatarUrl}
                                                            alt={campArea.user.fullName || 'User'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                                                            {(campArea.user.fullName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Level Badge */}
                                                <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                                                    Lv.{campArea.user.level || 1}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{campArea.user.fullName || 'Pengguna'}</p>
                                                <p className="text-sm text-orange-600 font-medium">{campArea.user.levelName || 'Camper Pemula'}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{campArea.user.exp || 0} EXP</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Price Card */}
                            <Card className="border-none shadow-lg bg-white rounded-3xl p-6 ring-1 ring-black/5">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle className="text-lg font-bold text-gray-700">Harga</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                                        <p className="text-sm text-gray-600 mb-1">per malam</p>
                                        <p className="text-3xl font-black text-orange-600">
                                            Rp {campArea.price ? parseInt(campArea.price).toLocaleString('id-ID') : '-'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location Map Card */}
                            {campArea.location && (
                                <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden ring-1 ring-black/5 sticky top-24">
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-red-500" />
                                            Lokasi
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">{campArea.location}</p>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="aspect-[4/3] w-full">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(campArea.location)}`}
                                            />
                                        </div>
                                        <div className="p-3">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campArea.location)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold text-sm transition-colors"
                                            >
                                                <MapPin className="h-4 w-4" />
                                                Buka di Google Maps
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Owner Actions */}
                            {isOwner && (
                                <Card className="border-none shadow-lg bg-white rounded-3xl p-6 ring-1 ring-black/5">
                                    <CardHeader className="p-0 mb-4">
                                        <CardTitle className="text-lg font-bold text-gray-700">Kelola Camp Area</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 space-y-3">
                                        <Button
                                            variant="secondary"
                                            className="w-full justify-start h-12 text-base font-medium rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900"
                                            onClick={() => setIsEditModalOpen(true)}
                                        >
                                            <Edit className="mr-3 h-5 w-5 text-gray-500" />
                                            Edit Informasi
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="w-full justify-start h-12 text-base font-medium rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100"
                                            onClick={handleDeleteCampArea}
                                            disabled={deleteCampAreaMutation.isPending}
                                        >
                                            <Trash2 className="mr-3 h-5 w-5" />
                                            Hapus Camp Area
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {campArea && (
                <EditCampAreaModal
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    campArea={campArea}
                />
            )}

            {/* Lightbox Modal */}
            <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
                <DialogContent
                    aria-describedby={undefined}
                    showCloseButton={false}
                    className="max-w-[95vw] md:max-w-4xl p-0 bg-black/95 border-none shadow-2xl overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <DialogTitle className="sr-only">Galeri Foto</DialogTitle>
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                        {lightboxIndex !== null && allImages[lightboxIndex] && (
                            <img
                                src={allImages[lightboxIndex]}
                                alt={`Photo ${lightboxIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        )}

                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full z-50"
                            onClick={closeLightbox}
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {/* Previous Button */}
                        {lightboxIndex !== null && lightboxIndex > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12"
                                onClick={goToPrev}
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </Button>
                        )}

                        {/* Next Button */}
                        {lightboxIndex !== null && lightboxIndex < allImages.length - 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12"
                                onClick={goToNext}
                            >
                                <ChevronRight className="h-8 w-8" />
                            </Button>
                        )}

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium">
                            {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {allImages.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
