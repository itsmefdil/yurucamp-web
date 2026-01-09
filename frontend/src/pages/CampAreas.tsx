import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
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
                                    <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-base px-8 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all" asChild>
                                        <Link to="/dashboard/add-camp-area">
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
                ) : campAreas && campAreas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campAreas.map((campArea) => (
                            <Link key={campArea.id} to={`/camp-areas/${campArea.id}`} className="block group">
                                <Card className="overflow-hidden bg-white group-hover:-translate-y-2 transition-all duration-300 h-full flex flex-col border-2 border-transparent hover:border-orange-200 shadow-lg hover:shadow-2xl rounded-3xl">
                                    <div className="relative aspect-video bg-orange-50 overflow-hidden m-2 rounded-2xl">
                                        <img
                                            src={campArea.imageUrl || "/camp.jpg"}
                                            alt={campArea.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{campArea.location || "Lokasi tidak tersedia"}</span>
                                            </div>
                                        </div>
                                        {campArea.price && (
                                            <div className="absolute top-3 right-3">
                                                <Badge className="bg-green-500/90 text-white text-xs font-bold">
                                                    Rp {parseInt(campArea.price).toLocaleString('id-ID')}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="p-5 pb-2">
                                        <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors leading-tight">
                                            {campArea.name}
                                        </CardTitle>
                                        {campArea.facilities && campArea.facilities.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {campArea.facilities.slice(0, 4).map((facility, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-medium">
                                                        {getFacilityIcon(facility)}
                                                        <span>{facility}</span>
                                                    </div>
                                                ))}
                                                {campArea.facilities.length > 4 && (
                                                    <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                                        +{campArea.facilities.length - 4} lainnya
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardFooter className="p-5 pt-0 mt-auto">
                                        <Button variant="outline" className="w-full rounded-full border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 font-semibold">
                                            Lihat Detail
                                        </Button>
                                    </CardFooter>
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
