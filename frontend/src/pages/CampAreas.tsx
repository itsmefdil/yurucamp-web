import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Plus, MapPin, Tent, Wifi, Car, Coffee, Info, ChevronLeft, ChevronRight, Search, X, Filter } from 'lucide-react';
import api from '../lib/api';
import type { CampArea } from '../types';
import { useAuth } from '../contexts/AuthContext';
import RegionSelector from '../components/ui/RegionSelector';

const ITEMS_PER_PAGE = 20;

export default function CampAreas() {
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    const { data: campAreas, isLoading } = useQuery({
        queryKey: ['camp-areas', selectedRegion],
        queryFn: async () => {
            const params = selectedRegion ? `?regionId=${selectedRegion}` : '';
            const response = await api.get(`/camp-areas${params}`);
            return response.data as CampArea[];
        },
    });

    // Client-side filtering
    const filteredCampAreas = campAreas?.filter(area =>
        area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (area.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const getFacilityIcon = (facility: string) => {
        switch (facility.toLowerCase()) {
            case 'wifi': return <Wifi className="h-4 w-4" />;
            case 'parkir': return <Car className="h-4 w-4" />;
            case 'kantin': return <Coffee className="h-4 w-4" />;
            case 'sewa tenda': return <Tent className="h-4 w-4" />;
            case 'pusat info': return <Info className="h-4 w-4" />;
            default: return null;
        }
    };

    // Pagination calculations
    const totalItems = filteredCampAreas.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCampAreas = filteredCampAreas.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleRegionChange = (regionId: string | null) => {
        setSelectedRegion(regionId);
        setCurrentPage(1); // Reset to first page on filter
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-28 pb-8 md:pt-36 md:pb-12 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-4xl font-black mb-2 leading-tight text-gray-900">
                                Area <span className="text-orange-500">Camping</span>
                            </h1>
                            <p className="text-sm md:text-base text-gray-600">
                                Jelajahi berbagai area camping dengan fasilitas lengkap
                            </p>
                        </div>
                        {user ? (
                            <Button
                                size="sm"
                                className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-bold px-6 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all"
                                asChild
                            >
                                <Link to="/c/add">
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Camp Area
                                </Link>
                            </Button>
                        ) : (
                            <Button size="sm" className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-bold px-6 shadow-lg" asChild>
                                <Link to="/login">
                                    Login untuk Menambah
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-6 pb-24">
                {/* Search & Filter Bar */}
                <div className="mb-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Search Input */}
                            <div className="relative flex-1 group border-b md:border-b-0 md:border-r border-gray-100">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari lokasi camping..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3.5 bg-transparent focus:outline-none focus:bg-orange-50/30 text-gray-800 placeholder-gray-400 font-medium transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all hover:scale-110"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Region Filter */}
                            <div className="min-w-[240px] relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <Filter className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <div className="pl-7">
                                    <RegionSelector
                                        value={selectedRegion}
                                        onChange={handleRegionChange}
                                        variant="ghost"
                                        placeholder="Semua Daerah"
                                        showLabel={false}
                                    />
                                </div>
                                {selectedRegion && (
                                    <button
                                        onClick={() => handleRegionChange(null)}
                                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all hover:scale-110 z-20"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Card key={i} className="overflow-hidden bg-white shadow-md rounded-3xl animate-pulse">
                                <div className="aspect-[4/3] bg-gray-200" />
                                <div className="p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <div className="w-7 h-7 rounded-full bg-gray-200" />
                                        <div className="h-3 bg-gray-200 rounded w-24" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : paginatedCampAreas && paginatedCampAreas.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedCampAreas.map((campArea) => (
                                <Link key={campArea.id} to={`/c/${campArea.id}`} className="block group">
                                    <Card className="overflow-hidden bg-white group-hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-orange-200 shadow-md hover:shadow-xl rounded-3xl">
                                        {/* Image Section */}
                                        <div className="relative aspect-[4/3] bg-orange-50 overflow-hidden">
                                            <img
                                                src={campArea.imageUrl || "/camp.jpg"}
                                                alt={campArea.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                            {/* Price Badge */}
                                            {campArea.price && (
                                                <div className="absolute top-3 right-3">
                                                    <Badge className="bg-green-500 text-white text-xs font-bold shadow-lg border-none">
                                                        Rp {parseInt(campArea.price).toLocaleString('id-ID')}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Bottom Overlay: Location + Facilities */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 px-2.5 py-1 rounded-full">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="truncate max-w-[120px]">{campArea.location || "Lokasi"}</span>
                                                    </div>

                                                    {/* Facility Icons Only */}
                                                    {campArea.facilities && campArea.facilities.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            {campArea.facilities.slice(0, 3).map((facility, idx) => (
                                                                <div key={idx} className="bg-white p-1.5 rounded-full text-orange-600" title={facility}>
                                                                    {getFacilityIcon(facility)}
                                                                </div>
                                                            ))}
                                                            {campArea.facilities.length > 3 && (
                                                                <div className="bg-white/80 text-gray-600 text-[10px] font-bold px-1.5 py-1 rounded-full">
                                                                    +{campArea.facilities.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1 mb-2 text-lg">
                                                {campArea.name}
                                            </h3>

                                            {/* Creator Info - Compact */}
                                            {campArea.user && (
                                                <Link
                                                    to={`/u/${campArea.userId}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 hover:bg-orange-50 -mx-4 px-4 -mb-4 pb-4 rounded-b-3xl transition-colors"
                                                >
                                                    <div className="relative">
                                                        <div className="w-7 h-7 rounded-full overflow-hidden bg-orange-100 border border-white shadow-sm">
                                                            {campArea.user.avatarUrl ? (
                                                                <img
                                                                    src={campArea.user.avatarUrl}
                                                                    alt={campArea.user.fullName || 'User'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-xs">
                                                                    {(campArea.user.fullName || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 text-white text-[7px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
                                                            {campArea.user.level || 1}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-600 truncate font-medium">{campArea.user.fullName || 'Pengguna'}</span>
                                                </Link>
                                            )}
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full w-8 h-8 p-0"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                className={`rounded-full min-w-[32px] h-8 p-0 ${currentPage === page ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="text-gray-400 px-1">...</span>;
                                    }
                                    return null;
                                })}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full w-8 h-8 p-0"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-200">
                        <Tent className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                        <p className="font-medium">Tidak ada camp area ditemukan.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
