import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
    Loader2, ArrowLeft, Settings,
    Shield, UserMinus, ShieldAlert, ImageIcon,
    Upload, Users, Globe, FileText, X, AlertTriangle,
    Phone, MessageCircle, Instagram
} from 'lucide-react';

import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../components/ui/alert-dialog"
import { Dialog, DialogContent } from '../components/ui/dialog';
import api from '../lib/api';

interface Region {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    coverUrl: string;
    socialLinks?: string;
    instagram?: string;
    whatsappAdmin?: string;
    whatsappGroup?: string;
}

interface Member {
    id: string;
    fullName: string;
    avatarUrl: string;
    level: number;
    role: 'member' | 'admin';
    joinedAt: string;
}

export default function RegionManagement() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Fetch region details
    const { data: region, isLoading: loadingRegion } = useQuery<Region>({
        queryKey: ['region', slug],
        queryFn: async () => {
            const res = await api.get(`/regions/by-slug/${slug}`);
            return res.data;
        },
        enabled: !!slug,
    });

    const { register, handleSubmit, setValue, watch, reset } = useForm<Region>();
    const imageUrl = watch('imageUrl');
    const coverUrl = watch('coverUrl');
    const name = watch('name');

    // Populate form when region data is loaded
    if (region && !imageUrl && !watch('name')) {
        reset(region);
    }

    // Fetch members
    const { data: members = [], isLoading: loadingMembers } = useQuery<Member[]>({
        queryKey: ['regionMembers', region?.id],
        queryFn: async () => {
            const res = await api.get(`/regions/${region?.id}/members`);
            return res.data;
        },
        enabled: !!region?.id,
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async (data: Region) => {
            const res = await api.put(`/regions/${region?.id}`, data);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success('Perubahan berhasil disimpan');
            queryClient.invalidateQueries({ queryKey: ['region', slug] });
            // If slug changed, navigate
            if (data.slug !== slug) {
                navigate(`/r/${data.slug}/manage`);
            }
        },
        onError: () => {
            toast.error('Gagal update region');
        },
    });

    const onSubmit = (data: Region) => {
        updateMutation.mutate(data);
    };

    const uploadToCloudinary = async (file: File) => {
        const { data: signData } = await api.get('/utils/cloudinary-signature?folder=community');

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signData.api_key);
        formData.append("timestamp", signData.timestamp.toString());
        formData.append("signature", signData.signature);
        formData.append("folder", signData.folder);
        formData.append("transformation", signData.transformation);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Upload failed");
        return data.secure_url;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (type === 'profile') setUploadingImage(true);
            else setUploadingCover(true);

            const url = await uploadToCloudinary(file);

            if (type === 'profile') setValue('imageUrl', url);
            else setValue('coverUrl', url);

            toast.success('Upload berhasil');
        } catch (error) {
            console.error(error);
            toast.error('Gagal upload gambar');
        } finally {
            if (type === 'profile') setUploadingImage(false);
            else setUploadingCover(false);
        }
    };

    // Member Management Mutations
    const promoteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.post(`/regions/${region?.id}/admins`, { userId });
        },
        onSuccess: () => {
            toast.success('Member berhasil dipromosikan jadi admin');
            queryClient.invalidateQueries({ queryKey: ['regionMembers', region?.id] });
        },
        onError: () => toast.error('Gagal mempromosikan member'),
    });

    const demoteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.post(`/regions/${region?.id}/demote`, { userId });
        },
        onSuccess: () => {
            toast.success('Admin berhasil diturunkan jadi member');
            queryClient.invalidateQueries({ queryKey: ['regionMembers', region?.id] });
        },
        onError: () => toast.error('Gagal menurunkan admin'),
    });

    const kickMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/regions/${region?.id}/members/${userId}`);
        },
        onSuccess: () => {
            toast.success('Member berhasil dikeluarkan');
            queryClient.invalidateQueries({ queryKey: ['regionMembers', region?.id] });
        },
        onError: () => toast.error('Gagal mengeluarkan member'),
    });

    if (loadingRegion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!region) {
        return <div>Region not found</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-orange-100/40 to-yellow-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-100/40 to-orange-100/40 rounded-full blur-3xl" />
            </div>

            <Navbar />

            <div className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-32 relative z-10">
                {/* Header */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="outline" size="icon" className="rounded-full bg-white border-gray-200 hover:bg-gray-50" onClick={() => navigate(`/r/${slug}`)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <Settings className="w-8 h-8 text-orange-500" />
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Manajemen Region</h1>
                            </div>
                            <p className="text-gray-600 mt-1 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                {region.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <Tabs defaultValue="info" className="space-y-8">
                        <TabsList className="bg-white/50 backdrop-blur border border-gray-200 p-1 rounded-xl h-auto grid grid-cols-2 w-full md:w-fit mx-auto md:mx-0">
                            <TabsTrigger value="info" className="py-2.5 rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white md:w-40">
                                Informasi Dasar
                            </TabsTrigger>
                            <TabsTrigger value="members" className="py-2.5 rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white md:w-40">
                                Anggota & Admin
                            </TabsTrigger>
                        </TabsList>

                        {/* INFO TAB */}
                        <TabsContent value="info" className="space-y-8">
                            <div className="grid lg:grid-cols-5 gap-8">
                                <div className="lg:col-span-3 space-y-6">
                                    {/* Cover Image Upload */}
                                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                        <div className="p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <ImageIcon className="w-5 h-5 text-orange-500" />
                                                Cover & Logo
                                            </h2>

                                            {/* Cover Image */}
                                            <div className="mb-6">
                                                <Label className="mb-2 block">Foto Sampul (Cover)</Label>
                                                {coverUrl ? (
                                                    <div className="relative group">
                                                        <div
                                                            className="aspect-[21/9] rounded-xl overflow-hidden cursor-pointer ring-2 ring-orange-500/20"
                                                            onClick={() => setPreviewImage(coverUrl)}
                                                        >
                                                            <img
                                                                src={coverUrl}
                                                                alt="Cover"
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <label className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg cursor-pointer transition-all text-sm font-medium">
                                                            Ganti Cover
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleImageUpload(e, 'cover')}
                                                            />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center aspect-[21/9] border-2 border-dashed border-orange-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group bg-gradient-to-br from-orange-50/30 to-amber-50/30">
                                                        <div className="flex flex-col items-center gap-3 p-8">
                                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                                {uploadingCover ? <Loader2 className="w-8 h-8 animate-spin text-orange-500" /> : <Upload className="w-8 h-8 text-orange-500" />}
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="font-semibold text-gray-700">Upload Cover Region</p>
                                                                <p className="text-xs text-orange-500 mt-1">PNG, JPG recommended</p>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleImageUpload(e, 'cover')}
                                                        />
                                                    </label>
                                                )}
                                            </div>

                                            {/* Profile Logo */}
                                            <div>
                                                <Label className="mb-2 block">Logo Region</Label>
                                                <div className="flex items-center gap-6">
                                                    {imageUrl ? (
                                                        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-orange-100 group cursor-pointer" onClick={() => setPreviewImage(imageUrl)}>
                                                            <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Upload className="w-6 h-6 text-white" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                                            {uploadingImage ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
                                                        </div>
                                                    )}

                                                    <div className="flex-1">
                                                        <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer">
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Upload Logo
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleImageUpload(e, 'profile')}
                                                            />
                                                        </label>
                                                        <p className="text-xs text-gray-500 mt-2">Disarankan rasio 1:1 (Persegi)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Basic Info Form */}
                                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                        <div className="p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-orange-500" />
                                                Informasi Region
                                            </h2>
                                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                                <div>
                                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">Nama Region</Label>
                                                    <Input id="name" className="h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400" {...register('name', { required: true })} />
                                                </div>
                                                <div>
                                                    <Label htmlFor="slug" className="text-sm font-medium text-gray-700 mb-2 block">Slug URL</Label>
                                                    <div className="flex rounded-md shadow-sm">
                                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                            yurucamp.id/r/
                                                        </span>
                                                        <Input
                                                            id="slug"
                                                            className="rounded-l-none h-10 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                            {...register('slug', { required: true })}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">Deskripsi</Label>
                                                    <Textarea id="description" className="min-h-[150px] border-gray-200 focus:border-orange-400 focus:ring-orange-400 resize-none" {...register('description')} />
                                                </div>

                                                {/* Social Media Section */}
                                                <div className="pt-4 border-t border-gray-100">
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                                        <MessageCircle className="w-4 h-4 text-orange-500" />
                                                        Sosial Media & Kontak
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 mb-2 block">Instagram</Label>
                                                            <div className="relative">
                                                                <Instagram className="absolute left-3 top-2.5 h-5 w-5 text-pink-500" />
                                                                <Input
                                                                    id="instagram"
                                                                    placeholder="https://instagram.com/komunitas"
                                                                    className="pl-10 h-10 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                                    {...register('instagram')}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="whatsappAdmin" className="text-sm font-medium text-gray-700 mb-2 block">No. WhatsApp Admin ( Opsional )</Label>
                                                            <div className="relative">
                                                                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                                                                <Input
                                                                    id="whatsappAdmin"
                                                                    placeholder="628123456789"
                                                                    className="pl-10 h-10 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                                    {...register('whatsappAdmin')}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">Format: 628xxx tanpa + atau spasi</p>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="whatsappGroup" className="text-sm font-medium text-gray-700 mb-2 block">Link Grup WhatsApp ( Opsional )</Label>
                                                            <div className="relative">
                                                                <MessageCircle className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                                                                <Input
                                                                    id="whatsappGroup"
                                                                    placeholder="https://chat.whatsapp.com/xxx"
                                                                    className="pl-10 h-10 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                                    {...register('whatsappGroup')}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                                    <Button type="submit" disabled={updateMutation.isPending || uploadingImage || uploadingCover} className="bg-orange-500 hover:bg-orange-600 text-white">
                                                        {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                        Simpan Perubahan
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar - Preview & Danger Zone */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="sticky top-28 space-y-6">
                                        {/* Preview Card */}
                                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                                                <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                                                    <Globe className="w-4 h-4" />
                                                    Preview Card
                                                </h3>
                                            </div>
                                            <div className="p-6">
                                                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                                                    <div className="relative h-32 bg-gradient-to-r from-orange-400 to-amber-500">
                                                        {coverUrl && (
                                                            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                                        )}
                                                        <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xl font-bold text-orange-500">
                                                                    {(name?.[0] || 'R').toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="pt-12 pb-4 px-4 bg-white">
                                                        <h3 className="font-bold text-lg text-gray-900">
                                                            {name || 'Nama Region'}
                                                        </h3>
                                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                            <Users className="w-4 h-4" />
                                                            <span>{members.length} anggota</span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                                                            {watch('description') || 'Deskripsi region...'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-red-100 overflow-hidden">
                                            <div className="p-4 border-b border-red-50 bg-red-50">
                                                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Danger Zone
                                                </h3>
                                            </div>
                                            <div className="p-6">
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Menghapus region akan menghilangkan semua data secara permanen dan tidak dapat dikembalikan.
                                                </p>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                                                            Hapus Region Permanen
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini akan menghapus region <b>{region.name}</b> dan semua datanya secara permanen.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-600 hover:bg-red-700"
                                                                onClick={async () => {
                                                                    try {
                                                                        await api.delete(`/regions/${region.id}`);
                                                                        toast.success('Region berhasil dihapus');
                                                                        navigate('/community');
                                                                    } catch (err) {
                                                                        toast.error('Gagal menghapus region');
                                                                    }
                                                                }}
                                                            >
                                                                Ya, Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* MEMBERS TAB */}
                        <TabsContent value="members">
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-orange-500" />
                                        Manajemen Anggota ({members.length})
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Kelola peran anggota atau keluarkan anggota dari komunitas.</p>
                                </div>
                                <div className="p-6">
                                    {loadingMembers ? (
                                        <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" /></div>
                                    ) : (
                                        <div className="space-y-4">
                                            {members.map((member) => (
                                                <div key={member.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-orange-50/30 transition-colors gap-4 group">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="w-10 h-10 border border-gray-100">
                                                            <AvatarImage src={member.avatarUrl} />
                                                            <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">{member.fullName[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                                {member.fullName}
                                                                {member.role === 'admin' && (
                                                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">ADMIN</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                Level {member.level} • Bergabung {new Date(member.joinedAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        {member.role === 'member' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                onClick={() => promoteMutation.mutate(member.id)}
                                                                disabled={promoteMutation.isPending}
                                                            >
                                                                <Shield className="w-3 h-3 mr-1" />
                                                                Promote
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-gray-600"
                                                                onClick={() => demoteMutation.mutate(member.id)}
                                                                disabled={demoteMutation.isPending}
                                                            >
                                                                <ShieldAlert className="w-3 h-3 mr-1" />
                                                                Demote
                                                            </Button>
                                                        )}

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                                                                    <UserMinus className="w-4 h-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Keluarkan Anggota?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Yakin ingin mengeluarkan <b>{member.fullName}</b> dari komunitas? Mereka harus bergabung ulang jika ingin kembali.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => kickMutation.mutate(member.id)} className="bg-red-500 hover:bg-red-600">
                                                                        Ya, Keluarkan
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Footer />

            {/* Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none h-fit max-h-[90vh] flex flex-col justify-center z-[60]">
                    <div className="relative w-full flex items-center justify-center bg-black">
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-w-full max-h-[85vh] object-contain"
                            />
                        )}
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
