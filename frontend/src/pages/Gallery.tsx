import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Camera, Search, Filter, Calendar, MapPin, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import type { Activity, CampArea } from '../types';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import DownloadPlugin from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { toast } from 'sonner';

interface PhotoItem {
    id: string;
    url: string;
    type: 'Aktivitas' | 'Camp Area';
    title: string;
    location?: string;
    link: string;
    author?: string;
    createdAt: string;
    isCover: boolean;
}

export default function PublicGallery() {
    useDocumentTitle('Galeri Foto Komunitas | Yurucamp Indonesia');

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Aktivitas' | 'Camp Area'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Fetch activities
    const { data: activities, isLoading: loadingActivities } = useQuery({
        queryKey: ['activities'],
        queryFn: async () => {
            const response = await api.get('/activities');
            return response.data as Activity[];
        },
    });

    // Fetch camp areas
    const { data: campAreas, isLoading: loadingCampAreas } = useQuery({
        queryKey: ['campAreas'],
        queryFn: async () => {
            const response = await api.get('/camp-areas');
            return response.data as CampArea[];
        },
    });

    const isLoading = loadingActivities || loadingCampAreas;

    // Flatten photos from activities & camp areas
    const photos: PhotoItem[] = [];

    if (activities) {
        activities.forEach((act) => {
            if (act.imageUrl) {
                photos.push({
                    id: `act-cover-${act.id}`,
                    url: act.imageUrl,
                    type: 'Aktivitas',
                    title: act.title,
                    location: act.location,
                    link: `/a/${act.id}`,
                    author: act.user?.fullName || undefined,
                    createdAt: act.createdAt || new Date().toISOString(),
                    isCover: true,
                });
            }
            if (act.additionalImages && Array.isArray(act.additionalImages)) {
                act.additionalImages.forEach((img, idx) => {
                    if (img) {
                        photos.push({
                            id: `act-extra-${act.id}-${idx}`,
                            url: img,
                            type: 'Aktivitas',
                            title: act.title,
                            location: act.location,
                            link: `/a/${act.id}`,
                            author: act.user?.fullName || undefined,
                            createdAt: act.createdAt || new Date().toISOString(),
                            isCover: false,
                        });
                    }
                });
            }
        });
    }

    if (campAreas) {
        campAreas.forEach((camp) => {
            if (camp.imageUrl) {
                photos.push({
                    id: `camp-cover-${camp.id}`,
                    url: camp.imageUrl,
                    type: 'Camp Area',
                    title: camp.name,
                    location: camp.location,
                    link: `/c/${camp.id}`,
                    createdAt: camp.createdAt || new Date().toISOString(),
                    isCover: true,
                });
            }
            if (camp.additionalImages && Array.isArray(camp.additionalImages)) {
                camp.additionalImages.forEach((img, idx) => {
                    if (img) {
                        photos.push({
                            id: `camp-extra-${camp.id}-${idx}`,
                            url: img,
                            type: 'Camp Area',
                            title: camp.name,
                            location: camp.location,
                            link: `/c/${camp.id}`,
                            createdAt: camp.createdAt || new Date().toISOString(),
                            isCover: false,
                        });
                    }
                });
            }
        });
    }

    // Filter & Sort logic
    const filteredPhotos = photos
        .filter((photo) => {
            const matchesSearch =
                photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (photo.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (photo.author || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'all' || photo.type === typeFilter;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
        });

    const totalPages = Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE);
    const paginatedPhotos = filteredPhotos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDownload = async (e: React.MouseEvent, imageUrl: string, title: string) => {
        e.stopPropagation();
        try {
            toast.loading('Mengunduh foto...');
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.jpg`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('Foto berhasil diunduh');
        } catch (error) {
            console.error('Download failed:', error);
            toast.dismiss();
            toast.error('Gagal mengunduh foto');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
            <Navbar />

            <main className="flex-1 pt-24 pb-16 md:pt-32 md:pb-24">
                <div className="container mx-auto px-4">
                    {/* Header Banner */}
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-sm">
                            <Camera className="h-4 w-4" /> Eksplorasi Visual
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                            Galeri Foto <span className="text-orange-500">Komunitas</span>
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg mt-3">
                            Jelajahi dokumentasi keindahan lokasi camping dan petualangan seru para anggota Yurucamp Indonesia di berbagai penjuru nusantara.
                        </p>
                    </div>

                    {/* Filter & Controls Bar */}
                    <div className="bg-white p-4 sm:p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari tempat, lokasi, atau pengunggah..."
                                className="pl-10 bg-gray-50 border-gray-200 rounded-2xl h-11"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
                                <Select
                                    value={typeFilter}
                                    onValueChange={(val: any) => {
                                        setTypeFilter(val);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[170px] rounded-2xl bg-gray-50 border-gray-200 h-11">
                                        <SelectValue placeholder="Tipe Foto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Foto</SelectItem>
                                        <SelectItem value="Aktivitas">Aktivitas</SelectItem>
                                        <SelectItem value="Camp Area">Camp Area</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Calendar className="h-4 w-4 text-gray-400 hidden sm:block" />
                                <Select
                                    value={sortBy}
                                    onValueChange={(val: any) => {
                                        setSortBy(val);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px] rounded-2xl bg-gray-50 border-gray-200 h-11">
                                        <SelectValue placeholder="Urutan Waktu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Terbaru</SelectItem>
                                        <SelectItem value="oldest">Terlama</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Photo Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-3xl" />
                            ))}
                        </div>
                    ) : paginatedPhotos.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
                            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">Tidak ada foto ditemukan</h3>
                            <p className="text-gray-500 mt-1">Coba gunakan kata kunci lain atau ubah filter pencarian Anda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                            {paginatedPhotos.map((photo, idx) => {
                                const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx;
                                return (
                                    <div
                                        key={photo.id}
                                        className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 bg-gray-900"
                                        onClick={() => setLightboxIndex(globalIdx)}
                                    >
                                        <img
                                            src={photo.url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                        />

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                                            <Badge className={`text-xs font-bold text-white shadow-md ${photo.type === 'Aktivitas' ? 'bg-amber-500/90 backdrop-blur-md' : 'bg-green-600/90 backdrop-blur-md'
                                                }`}>
                                                {photo.type}
                                            </Badge>
                                        </div>

                                        {/* Hover Overlay Details */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 md:p-5 flex flex-col justify-between">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={photo.link}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md transition-transform hover:scale-110"
                                                    title="Buka Halaman Detail"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md h-8 w-8 transition-transform hover:scale-110"
                                                    onClick={(e) => handleDownload(e, photo.url, photo.title)}
                                                    title="Unduh foto"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div>
                                                <h3 className="text-white font-bold text-base md:text-lg line-clamp-1">
                                                    {photo.title}
                                                </h3>
                                                {photo.location && (
                                                    <p className="text-gray-300 text-xs md:text-sm flex items-center gap-1 mt-1 truncate">
                                                        <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                                                        {photo.location}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex items-center justify-between text-xs text-orange-300 font-semibold pt-2 border-t border-white/20">
                                                    <span className="truncate max-w-[130px]">{photo.author ? `Oleh ${photo.author}` : 'Komunitas'}</span>
                                                    <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                                                        🔍 Zoom
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 bg-white p-4 sm:px-6 rounded-3xl border shadow-sm">
                            <div className="text-xs sm:text-sm text-gray-500 font-medium text-center sm:text-left">
                                Halaman <span className="font-bold text-gray-800">{currentPage}</span> dari <span className="font-bold text-gray-800">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-full font-semibold flex-1 sm:flex-none text-xs sm:text-sm py-2"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
                                    <span>Sebelumnya</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-full font-semibold flex-1 sm:flex-none text-xs sm:text-sm py-2"
                                >
                                    <span>Berikutnya</span>
                                    <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* yet-another-react-lightbox Modal */}
            <Lightbox
                open={lightboxIndex !== null}
                close={() => setLightboxIndex(null)}
                index={lightboxIndex ?? 0}
                slides={filteredPhotos.map((p) => ({
                    src: p.url,
                    title: p.title,
                    description: `${p.type}${p.location ? ` - ${p.location}` : ''}${p.author ? ` (oleh ${p.author})` : ''}`
                }))}
                plugins={[Thumbnails, Zoom, Fullscreen, DownloadPlugin]}
                zoom={{ maxZoomPixelRatio: 3, zoomInMultiplier: 1.5 }}
                thumbnails={{ position: 'bottom', width: 80, height: 80, border: 2, gap: 10 }}
            />
        </div>
    );
}
