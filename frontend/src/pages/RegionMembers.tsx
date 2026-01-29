
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import {
    Loader2,
    ArrowLeft,
    Search,
    Users,
    Shield
} from 'lucide-react';
import { useState } from 'react';
import api from '../lib/api';

interface Member {
    id: string;
    fullName: string;
    avatarUrl?: string;
    level: number;
    joinedAt: string;
    role: 'member' | 'admin';
}

interface Region {
    id: string;
    name: string;
    slug: string;
}

export default function RegionMembers() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch region details first to get ID
    const { data: region, isLoading: loadingRegion } = useQuery<Region>({
        queryKey: ['region', slug],
        queryFn: async () => {
            const res = await api.get(`/regions/by-slug/${slug}`);
            return res.data;
        },
        enabled: !!slug,
    });

    // Fetch members
    const { data: members = [], isLoading: loadingMembers } = useQuery<Member[]>({
        queryKey: ['regionMembers', region?.id],
        queryFn: async () => {
            const res = await api.get(`/regions/${region?.id}/members`);
            return res.data;
        },
        enabled: !!region?.id,
    });

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const filteredMembers = members.filter(member =>
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const admins = filteredMembers.filter(m => m.role === 'admin');
    const regularMembers = filteredMembers.filter(m => m.role !== 'admin');

    if (loadingRegion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!region) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Region tidak ditemukan</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-24 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            className="mb-2 -ml-2 text-gray-500 hover:text-gray-900"
                            onClick={() => navigate(`/r/${slug}`)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Region
                        </Button>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="w-8 h-8 text-orange-500" />
                            Anggota Region
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {members.length} orang bergabung di {region.name}
                        </p>
                    </div>

                    <div className="w-full md:w-72">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Cari anggota..."
                                className="pl-9 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loadingMembers ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Admins */}
                        {admins.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-orange-500" />
                                    Admin Region
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {admins.map(member => (
                                        <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4">
                                            <Avatar className="w-12 h-12 border-2 border-orange-100">
                                                <AvatarImage src={member.avatarUrl} />
                                                <AvatarFallback className="bg-orange-50 text-orange-600 font-bold">
                                                    {getInitials(member.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{member.fullName}</h3>
                                                <p className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full w-fit mt-1">
                                                    Admin
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regular Members */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Anggota ({regularMembers.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {regularMembers.map(member => (
                                    <Link key={member.id} to={`/u/${member.id}`} className="group">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all flex items-center gap-4">
                                            <Avatar className="w-12 h-12 border border-gray-100 group-hover:border-orange-100">
                                                <AvatarImage src={member.avatarUrl} />
                                                <AvatarFallback className="bg-gray-100 text-gray-600 group-hover:bg-orange-50 group-hover:text-orange-600 font-bold transition-colors">
                                                    {getInitials(member.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{member.fullName}</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Bergabung {new Date(member.joinedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {regularMembers.length === 0 && (
                                    <p className="text-gray-500 col-span-full">Tidak ada anggota yang cocok dengan pencarian.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
