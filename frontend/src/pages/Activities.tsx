import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { Plus, MapPin, Calendar, Tent, ChevronLeft, ChevronRight, Search, X, Filter, Tag } from 'lucide-react';

import RegionSelector from '../components/ui/RegionSelector';
import api from '../lib/api';
import type { Activity } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

const ITEMS_PER_PAGE = 20;

export default function Activities() {
    const { user } = useAuth();
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch categories for filter
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data as Array<{ id: string; name: string; }>;
        },
    });

    const { data: activities, isLoading } = useQuery({
        queryKey: ['activities', selectedRegionId, selectedCategoryId],
        queryFn: async () => {
            const params: any = {};
            if (selectedRegionId) params.regionId = selectedRegionId;
            if (selectedCategoryId) params.categoryId = selectedCategoryId;
            const response = await api.get('/activities', { params });
            return response.data as Activity[];
        },
    });

    // Filter activities by search query
    const filteredActivities = activities?.filter((activity) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            activity.title?.toLowerCase().includes(query) ||
            activity.location?.toLowerCase().includes(query) ||
            activity.description?.toLowerCase().includes(query) ||
            activity.user?.fullName?.toLowerCase().includes(query) ||
            activity.region?.name?.toLowerCase().includes(query)
        );
    }) || [];

    // Pagination calculations
    const totalItems = filteredActivities.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset page when region changes
    const handleRegionChange = (regionId: string | null) => {
        setSelectedRegionId(regionId);
        setCurrentPage(1);
    };

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    // Handle category change
    const handleCategoryChange = (categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            {/* Compact Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-28 pb-8 md:pt-36 md:pb-12 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-4xl font-black mb-2 leading-tight text-gray-900">
                                Aktivitas <span className="text-orange-500">Camping</span>
                            </h1>
                            <p className="text-sm md:text-base text-gray-600">
                                Temukan dan bagikan momen petualanganmu
                            </p>
                        </div>
                        {user ? (
                            <Button
                                size="sm"
                                className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-bold px-6 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all"
                                asChild
                            >
                                <Link to="/a/add">
                                    <Plus className="mr-2 h-4 w-4" /> Buat Aktivitas
                                </Link>
                            </Button>
                        ) : (
                            <Button size="sm" className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-bold px-6 shadow-lg" asChild>
                                <Link to="/login">
                                    Login untuk Membuat
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-6 pb-24">
                {/* Unified Search & Filter Bar */}
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
                                    placeholder="Cari aktivitas, lokasi, atau pengguna..."
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

                            {/* Category Filter */}
                            <div className="relative min-w-[200px] border-b md:border-b-0 md:border-r border-gray-100 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Tag className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                </div>
                                <select
                                    value={selectedCategoryId || ''}
                                    onChange={(e) => handleCategoryChange(e.target.value || null)}
                                    className="w-full pl-11 pr-10 py-3.5 bg-transparent border-none focus:outline-none focus:bg-green-50/30 text-gray-800 font-medium appearance-none cursor-pointer transition-all"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.25em 1.25em'
                                    }}
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedCategoryId && (
                                    <button
                                        onClick={() => handleCategoryChange(null)}
                                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all hover:scale-110 z-10"
                                    >
                                        <X className="h-3.5 w-3.5" />
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
                                        value={selectedRegionId}
                                        onChange={handleRegionChange}
                                        showLabel={false}
                                        className="h-full"
                                        variant="ghost"
                                    />
                                </div>
                                {selectedRegionId && (
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

                {/* Active Filters / Results Info */}
                {(searchQuery || selectedRegionId || selectedCategoryId) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap text-sm">
                        <span className="text-gray-500">Menampilkan {totalItems} hasil</span>
                        {searchQuery && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                                "{searchQuery}"
                                <button onClick={() => handleSearch('')} className="ml-1 hover:text-orange-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {selectedCategoryId && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                                {categories?.find(c => c.id === selectedCategoryId)?.name || 'Kategori'}
                                <button onClick={() => handleCategoryChange(null)} className="ml-1 hover:text-green-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {selectedRegionId && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                Region
                                <button onClick={() => handleRegionChange(null)} className="ml-1 hover:text-blue-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                )}


                {
                    isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <Card key={i} className="overflow-hidden bg-white shadow-lg rounded-3xl animate-pulse">
                                    <div className="aspect-video bg-gray-200" />
                                    <CardHeader className="p-5">
                                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                                    </CardHeader>
                                    <CardFooter className="p-5">
                                        <div className="h-10 bg-gray-200 rounded w-full" />
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : paginatedActivities && paginatedActivities.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedActivities.map((activity) => (
                                    <Link key={activity.id} to={`/a/${activity.id}`} className="block group">
                                        <Card className="overflow-hidden bg-white group-hover:-translate-y-2 transition-all duration-300 h-full flex flex-col border-2 border-transparent hover:border-orange-200 shadow-lg hover:shadow-2xl rounded-3xl">
                                            <div className="relative aspect-video bg-orange-50 overflow-hidden m-2 rounded-2xl">
                                                <img
                                                    src={activity.imageUrl || "/aktivitas.jpg"}
                                                    alt={activity.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                                                <div className="absolute bottom-3 left-3 right-3 text-white flex flex-col gap-1.5 items-start">
                                                    {activity.region && (
                                                        <div className="px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-medium border border-white/10">
                                                            {activity.region.name}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1 text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full w-fit max-w-full">
                                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">{activity.location || "Lokasi tidak tersedia"}</span>
                                                    </div>
                                                </div>
                                                {activity.category && (
                                                    <div className="absolute top-3 right-3">
                                                        <Badge className="bg-primary/90 text-white text-xs font-bold">
                                                            {typeof activity.category === 'string' ? activity.category : activity.category?.name}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader className="p-5 pb-2">
                                                <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors leading-tight">
                                                    {activity.title}
                                                </CardTitle>
                                                {activity.date && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(activity.date)}</span>
                                                    </div>
                                                )}
                                            </CardHeader>
                                            <CardFooter className="p-5 pt-0 mt-auto">
                                                <div
                                                    onClick={(e) => {
                                                        if (activity.user?.id) {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            window.location.href = `/u/${activity.user.id}`;
                                                        }
                                                    }}
                                                    className="flex items-center gap-3 w-full bg-orange-50/50 p-2 rounded-2xl cursor-pointer hover:bg-orange-100/70 transition-colors"
                                                >
                                                    <div className="relative">
                                                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                                                            <AvatarImage src={activity.user?.avatarUrl || undefined} />
                                                            <AvatarFallback className="text-xs bg-orange-200 text-orange-700 font-bold">
                                                                {activity.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {activity.user?.level && (
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-[8px] font-bold text-white flex items-center justify-center border border-white">
                                                                {activity.user.level}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-sm font-semibold text-gray-600 truncate">
                                                            {activity.user?.fullName || 'Pengguna'}
                                                        </span>
                                                        {activity.user?.levelName && (
                                                            <span className="text-[10px] text-gray-400 truncate">
                                                                {activity.user.levelName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardFooter>
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
                                        className="rounded-full"
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
                                                    className={`rounded-full min-w-[36px] ${currentPage === page ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} className="text-gray-400">...</span>;
                                        }
                                        return null;
                                    })}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>

                                    <span className="ml-4 text-sm text-gray-500">
                                        {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems}
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-200">
                            <Tent className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                            <p className="font-medium">Belum ada aktivitas.</p>
                        </div>
                    )
                }
            </main >

            <Footer />
        </div >
    );
}
