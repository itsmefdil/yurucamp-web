import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Plus, MapPin, Tent, Wifi, Car, Coffee, Info } from 'lucide-react';
import api from '../lib/api';
import type { CampArea } from '../types';
import { useAuth } from '../contexts/AuthContext';


export default function CampAreas() {
    const { user } = useAuth();

    const { data: campAreas, isLoading } = useQuery({
        queryKey: ['camp-areas'],
        queryFn: async () => {
            const response = await api.get('/camp-areas');
            return response.data as CampArea[];
        },
    });

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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            {/* Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left max-w-2xl text-gray-800">
                            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-bold bg-orange-100 text-orange-600 hover:bg-orange-200 border-none">
                                Area Camping Terbaik
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
                                Temukan Lokasi <br />
                                <span className="text-orange-500">Camping Impian</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Jelajahi berbagai area camping dengan fasilitas lengkap untuk pengalaman outdoor yang tak terlupakan.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                {user ? (
                                    <Button
                                        size="lg"
                                        className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-base px-8 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all"
                                        asChild
                                    >
                                        <Link to="/c/add">
                                            <Plus className="mr-2 h-5 w-5" /> Tambah Camp Area
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-base px-8 shadow-lg" asChild>
                                        <Link to="/login">
                                            Login untuk Menambah Area
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:block relative w-80 h-80 lg:w-96 lg:h-96">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
                            <div className="absolute inset-4 bg-white/40 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 -mt-8 relative z-20 pb-24">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden bg-white shadow-md rounded-2xl animate-pulse">
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
                ) : campAreas && campAreas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campAreas.map((campArea) => (
                            <Link key={campArea.id} to={`/c/${campArea.id}`} className="block group">
                                <Card className="overflow-hidden bg-white group-hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-orange-200 shadow-md hover:shadow-xl rounded-2xl">
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
                                                <Badge className="bg-green-500 text-white text-xs font-bold shadow-lg">
                                                    Rp {parseInt(campArea.price).toLocaleString('id-ID')}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Bottom Overlay: Location + Facilities */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate max-w-[120px]">{campArea.location || "Lokasi"}</span>
                                                </div>

                                                {/* Facility Icons Only */}
                                                {campArea.facilities && campArea.facilities.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        {campArea.facilities.slice(0, 3).map((facility, idx) => (
                                                            <div key={idx} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-orange-600" title={facility}>
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
                                        <h3 className="font-bold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1 mb-2">
                                            {campArea.name}
                                        </h3>

                                        {/* Creator Info - Compact */}
                                        {campArea.user && (
                                            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                                                <div className="relative">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-orange-100">
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
                                                    <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 text-white text-[7px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                                                        {campArea.user.level || 1}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-600 truncate">{campArea.user.fullName || 'Pengguna'}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-200">
                        <Tent className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                        <p className="font-medium">Belum ada camp area.</p>
                    </div>
                )}
            </main>

            <Footer />


        </div>
    );
}
