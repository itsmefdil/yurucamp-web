import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Image, Search, Filter, Calendar, Tent, TrendingUp, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import DownloadPlugin from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface GalleryPhoto {
    id: string;
    url: string;
    type: 'activity' | 'camp_area';
    title: string;
    sourceId: string;
    createdAt: string;
    isCover: boolean;
    user?: {
        fullName: string | null;
        avatarUrl: string | null;
    };
}

export default function AdminGallery() {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'activity' | 'camp_area'>('all');
    const [timeSort, setTimeSort] = useState<'newest' | 'oldest'>('newest');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 16;

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const response = await api.get('/admin/gallery');
            setPhotos(response.data);
        } catch (error) {
            console.error('Failed to fetch admin gallery:', error);
            toast.error('Gagal memuat galeri foto');
        } finally {
            setLoading(false);
        }
    };

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

    // Filter & Sort logic
    const filteredPhotos = photos
        .filter((photo) => {
            const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (photo.user?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'all' || photo.type === typeFilter;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeSort === 'newest' ? timeB - timeA : timeA - timeB;
        });

    const totalPages = Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, timeSort]);

    const paginatedPhotos = filteredPhotos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="space-y-6 pb-24 md:pb-8 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 md:pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Image className="w-8 h-8 text-orange-500" /> Galeri Foto
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola dan tinjau semua foto yang diunggah di Aktivitas & Camp Area
                    </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 w-fit">
                    <span>Total Foto:</span>
                    <span className="text-base font-bold text-orange-600">{filteredPhotos.length}</span>
                </div>
            </div>

            {/* Controls & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Cari judul / pengunggah..."
                        className="pl-9 bg-gray-50 border-gray-200 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
                        <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
                            <SelectTrigger className="w-full sm:w-[170px] rounded-xl bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Tipe Sumber" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Sumber</SelectItem>
                                <SelectItem value="activity">Aktivitas User</SelectItem>
                                <SelectItem value="camp_area">Camp Area</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 hidden sm:block" />
                        <Select value={timeSort} onValueChange={(val: any) => setTimeSort(val)}>
                            <SelectTrigger className="w-full sm:w-[150px] rounded-xl bg-gray-50 border-gray-200">
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
            <Card className="border-none shadow-md bg-white overflow-hidden">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center justify-between">
                        <span>Menampilkan {paginatedPhotos.length} dari {filteredPhotos.length} foto</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {paginatedPhotos.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">Tidak ada foto ditemukan</h3>
                            <p className="text-sm text-gray-500 mt-1">Coba sesuaikan kata kunci atau filter tipe sumber.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                            {paginatedPhotos.map((photo, idx) => {
                                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx;
                                return (
                                    <div
                                        key={photo.id}
                                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-gray-100 ring-1 ring-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                                        onClick={() => setLightboxIndex(globalIndex)}
                                    >
                                        <img
                                            src={photo.url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Source Badge */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md text-white ${photo.type === 'activity' ? 'bg-amber-500' : 'bg-green-600'
                                                }`}>
                                                {photo.type === 'activity' ? 'Aktivitas' : 'Camp Area'}
                                            </span>
                                            {photo.isCover && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-black/60 text-white rounded-full backdrop-blur-sm w-fit">
                                                    Cover
                                                </span>
                                            )}
                                        </div>

                                        {/* Hover Details Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                                            <div className="flex justify-end gap-1.5">
                                                <Link
                                                    to={photo.type === 'activity' ? `/a/${photo.sourceId}` : `/c/${photo.sourceId}`}
                                                    target="_blank"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md transition-transform hover:scale-105"
                                                    title="Buka Halaman"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md h-7 w-7 transition-transform hover:scale-105"
                                                    onClick={(e) => handleDownload(e, photo.url, photo.title)}
                                                    title="Unduh foto"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>

                                            <div className="text-white">
                                                <p className="font-bold text-xs line-clamp-1">{photo.title}</p>
                                                <p className="text-[11px] text-gray-300 mt-0.5 truncate">
                                                    {photo.user?.fullName || 'Anonim'} • {new Date(photo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t bg-gray-50/50">
                        <div className="text-xs text-gray-500 font-medium text-center sm:text-left">
                            Halaman <span className="font-bold text-gray-800">{currentPage}</span> dari <span className="font-bold text-gray-800">{totalPages}</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg h-8 text-xs flex-1 sm:flex-none"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1 shrink-0" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="rounded-lg h-8 text-xs flex-1 sm:flex-none"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* yet-another-react-lightbox Modal */}
            <Lightbox
                open={lightboxIndex !== null}
                close={() => setLightboxIndex(null)}
                index={lightboxIndex ?? 0}
                slides={filteredPhotos.map((p) => ({
                    src: p.url,
                    title: p.title,
                    description: `${p.type === 'activity' ? 'Aktivitas' : 'Camp Area'} - Diunggah oleh ${p.user?.fullName || 'User'}`
                }))}
                plugins={[Thumbnails, Zoom, Fullscreen, DownloadPlugin]}
                zoom={{ maxZoomPixelRatio: 3, zoomInMultiplier: 1.5 }}
                thumbnails={{ position: 'bottom', width: 80, height: 80, border: 2, gap: 10 }}
            />
        </div>
    );
}
