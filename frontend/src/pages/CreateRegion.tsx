import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
    Loader2, ArrowLeft, Upload, Image as ImageIcon,
    Globe, FileText, X, Users
} from 'lucide-react';

import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent } from '../components/ui/dialog';
import api from '../lib/api';

interface CreateRegionForm {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    coverUrl: string;
}

export default function CreateRegion() {
    const navigate = useNavigate();
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateRegionForm>();
    const imageUrl = watch('imageUrl');
    const coverUrl = watch('coverUrl');
    const name = watch('name');

    const createRegionMutation = useMutation({
        mutationFn: async (data: CreateRegionForm) => {
            const res = await api.post('/regions', data);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success('Permintaan pembuatan region berhasil dikirim!');
            navigate(`/r/${data.slug}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Gagal membuat region');
        },
    });

    const onSubmit = (data: CreateRegionForm) => {
        createRegionMutation.mutate(data);
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

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nameVal = e.target.value;
        const slugVal = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setValue('slug', slugVal);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-orange-100/40 to-yellow-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-100/40 to-orange-100/40 rounded-full blur-3xl" />
            </div>

            <Navbar />

            <main className="flex-1 pb-24 md:pb-12 relative z-10">
                <div className="container mx-auto px-4 pt-24 md:pt-32">
                    {/* Header */}
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="outline" size="icon" className="rounded-full bg-white border-gray-200 hover:bg-gray-50" onClick={() => navigate(-1)}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-8 h-8 text-orange-500" />
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Buat Komunitas Region</h1>
                                </div>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    Ajukan pembuatan region baru untuk komunitasmu
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-8">
                        {/* Main Form */}
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

                            {/* Basic Info */}
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-orange-500" />
                                        Informasi Region
                                    </h2>

                                    <div className="space-y-5">
                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Nama Region <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="Contoh: Yurucamp Jawa Barat"
                                                className="h-12 text-lg border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                {...register('name', { required: 'Nama wajib diisi' })}
                                                onChange={(e) => {
                                                    register('name').onChange(e);
                                                    handleNameChange(e);
                                                }}
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="slug" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Slug URL <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="flex rounded-md shadow-sm">
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                    yurucamp.id/r/
                                                </span>
                                                <Input
                                                    id="slug"
                                                    className="rounded-l-none h-10 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                    {...register('slug', { required: 'Slug wajib diisi' })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Deskripsi <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Deskripsikan tentang komunitas region ini..."
                                                className="min-h-[150px] border-gray-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
                                                {...register('description', { required: 'Deskripsi wajib diisi' })}
                                            />
                                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Preview & Actions */}
                        <div className="lg:col-span-2">
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
                                        {/* Card Preview Structure similar to Komunitas.tsx */}
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
                                                    <span>0 anggota</span>
                                                </div>
                                                <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                                                    {watch('description') || 'Deskripsi region akan muncul di sini...'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={createRegionMutation.isPending || uploadingImage || uploadingCover}
                                    className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {createRegionMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Memproses...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Globe className="w-5 h-5" />
                                            Ajukan Region Baru
                                        </span>
                                    )}
                                </Button>

                                {/* Info Note */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                                        ℹ️ Proses Pengajuan
                                    </h4>
                                    <p className="text-xs text-blue-700">
                                        Region baru akan berstatus <b>Pending</b> sampai disetujui oleh Superadmin. Anda akan otomatis menjadi Admin region ini setelah disetujui.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

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
