import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Users, Globe, Plus } from 'lucide-react';

import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import api from '../lib/api';

interface Region {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    coverUrl?: string;
    memberCount: number;
}

export default function Komunitas() {
    const { data: regions = [], isLoading } = useQuery<Region[]>({
        queryKey: ['regions'],
        queryFn: async () => {
            const res = await api.get('/regions');
            return res.data;
        },
    });

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Compact Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-28 pb-8 md:pt-36 md:pb-12 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full mb-3">
                                <Globe className="w-3 h-3" />
                                <span className="text-xs font-bold">Komunitas Regional</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black mb-2 leading-tight text-gray-900">
                                Gabung <span className="text-orange-500">Komunitas</span>
                            </h1>
                            <p className="text-sm md:text-base text-gray-600">
                                Temukan dan bergabung dengan komunitas camper di daerahmu
                            </p>
                        </div>
                        <Button className="bg-orange-500 hover:bg-orange-600 gap-2" asChild>
                            <Link to="/r/create">
                                <Plus className="w-4 h-4" />
                                Buat Komunitas
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 container mx-auto px-4 py-8 pb-24">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : regions.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Belum ada komunitas tersedia</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regions.map((region) => (
                            <Link key={region.id} to={`/r/${region.slug}`} className="block group">
                                <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 rounded-2xl">
                                    {/* Cover */}
                                    <div className="relative h-32 bg-gradient-to-r from-orange-400 to-amber-500">
                                        {region.coverUrl && (
                                            <img
                                                src={region.coverUrl}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {/* Profile Image */}
                                        <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl border-4 border-white bg-white shadow-lg overflow-hidden">
                                            {region.imageUrl ? (
                                                <img
                                                    src={region.imageUrl}
                                                    alt={region.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
                                                    {region.name[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <CardContent className="pt-12 pb-4 px-4">
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-500 transition-colors">
                                            {region.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <Users className="w-4 h-4" />
                                            <span>{region.memberCount} anggota</span>
                                        </div>
                                        {region.description && (
                                            <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                                                {region.description}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

            </div>

            <Footer />
        </div>
    );
}
