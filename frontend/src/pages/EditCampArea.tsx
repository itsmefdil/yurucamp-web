import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Image, MapPin, DollarSign, Loader2, X, Wifi, Car, Coffee, Tent, Info, Upload, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { CampArea } from '../types';

const campAreaSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    location: z.string().min(3, "Lokasi minimal 3 karakter"),
    price: z.string().min(1, "Harga harus diisi"),
});

type CampAreaFormValues = z.infer<typeof campAreaSchema>;

interface FacilityOption {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const facilityOptions: FacilityOption[] = [
    { id: 'wifi', label: 'Wifi', icon: <Wifi className="w-4 h-4" /> },
    { id: 'parking', label: 'Parkir', icon: <Car className="w-4 h-4" /> },
    { id: 'canteen', label: 'Kantin', icon: <Coffee className="w-4 h-4" /> },
    { id: 'tent', label: 'Sewa Tenda', icon: <Tent className="w-4 h-4" /> },
    { id: 'info', label: 'Pusat Info', icon: <Info className="w-4 h-4" /> },
];

const facilityNameToId: Record<string, string> = {
    'Wifi': 'wifi',
    'Parkir': 'parking',
    'Kantin': 'canteen',
    'Sewa Tenda': 'tent',
    'Pusat Info': 'info',
};

export default function EditCampArea() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Additional images
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
    const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

    const form = useForm<CampAreaFormValues>({
        resolver: zodResolver(campAreaSchema),
        defaultValues: {
            name: '',
            description: '',
            location: '',
            price: '',
        },
    });

    // Fetch camp area detail
    const { data: campArea, isLoading } = useQuery({
        queryKey: ['camp-area', id],
        queryFn: async () => {
            const response = await api.get(`/camp-areas/${id}`);
            return response.data as CampArea;
        },
        enabled: !!id,
    });

    // Populate Data
    useEffect(() => {
        if (campArea) {
            // Permission check
            if (user?.id !== campArea.userId) {
                toast.error("Anda tidak memiliki akses untuk mengedit ini");
                navigate('/camp-areas');
                return;
            }

            form.reset({
                name: campArea.name,
                description: campArea.description || '',
                location: campArea.location || '',
                price: campArea.price || '',
            });

            setImageFile(null);
            setImagePreview(null);
            setExistingImages(campArea.additionalImages || []);
            setAdditionalFiles([]);
            setAdditionalPreviews([]);

            // Map facilities to IDs
            const facilityIds = (campArea.facilities || [])
                .map(f => facilityNameToId[f])
                .filter(Boolean);
            setSelectedFacilities(facilityIds);
        }
    }, [campArea, user, navigate, form]);

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 10MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleAdditionalImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} terlalu besar (>10MB)`);
                continue;
            }

            const totalAdditional = existingImages.length + additionalFiles.length + 1;
            if (totalAdditional <= 10) {
                const reader = new FileReader();
                setAdditionalFiles(prev => [...prev, file]);
                reader.onloadend = () => setAdditionalPreviews(prev => [...prev, reader.result as string]);
                reader.readAsDataURL(file);
            } else {
                toast.error("Maksimal 10 foto tambahan total");
                break;
            }
        }
        e.target.value = '';
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewAdditionalImage = (index: number) => {
        setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
        setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleFacility = (facilityId: string) => {
        setSelectedFacilities(prev =>
            prev.includes(facilityId)
                ? prev.filter(f => f !== facilityId)
                : [...prev, facilityId]
        );
    };

    const uploadToCloudinary = async (file: File) => {
        const { data: signData } = await api.get('/utils/cloudinary-signature?folder=camp_area');

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

    const onSubmit = async (data: CampAreaFormValues) => {
        if (!campArea) return;

        try {
            setIsSubmitting(true);
            setUploadStatus('Menyiapkan upload...');

            let coverUrl = null;
            if (imageFile) {
                setUploadStatus('Mengupload cover baru...');
                coverUrl = await uploadToCloudinary(imageFile);
            }

            const newAdditionalUrls: string[] = [];
            if (additionalFiles.length > 0) {
                setUploadStatus(`Mengupload ${additionalFiles.length} foto tambahan...`);
                const uploadPromises = additionalFiles.map(file => uploadToCloudinary(file));
                const results = await Promise.all(uploadPromises);
                newAdditionalUrls.push(...results);
            }

            setUploadStatus('Menyimpan perubahan...');

            const payload = {
                name: data.name,
                description: data.description,
                location: data.location,
                price: data.price,
                imageUrl: coverUrl,
                keptImages: existingImages,
                additionalImages: newAdditionalUrls,
                wifi: selectedFacilities.includes('wifi'),
                parking: selectedFacilities.includes('parking'),
                canteen: selectedFacilities.includes('canteen'),
                tent: selectedFacilities.includes('tent'),
                info: selectedFacilities.includes('info'),
            };

            await api.put(`/camp-areas/${campArea.id}`, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            setUploadStatus('Selesai!');
            toast.success("Camp area berhasil diperbarui!");
            queryClient.invalidateQueries({ queryKey: ['camp-area', campArea.id] });
            queryClient.invalidateQueries({ queryKey: ['camp-areas'] });

            navigate(`/c/${campArea.id}`);

        } catch (error) {
            console.error(error);
            toast.error("Gagal memperbarui camp area");
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const currentCover = imagePreview || campArea?.imageUrl;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-32">
                <div className="max-w-3xl mx-auto">
                    <Button
                        variant="ghost"
                        asChild
                        className="mb-4 hover:bg-orange-50 hover:text-orange-600 -ml-4"
                    >
                        <Link to={`/c/${id}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>

                    <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="border-b bg-white p-6">
                            <CardTitle className="text-2xl font-bold text-gray-800">
                                Edit Camp Area
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Photo Grid */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">
                                        Foto Camp Area
                                    </label>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {/* Cover Image */}
                                        <div className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-orange-500 bg-gray-100">
                                            {currentCover ? (
                                                <img
                                                    src={currentCover}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Image className="w-8 h-8" />
                                                </div>
                                            )}
                                            <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10">
                                                Cover
                                            </span>

                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                                                <div className="bg-white/90 p-2 rounded-full shadow-lg text-xs font-bold text-gray-900 flex items-center gap-1.5 hover:scale-105 transition-transform">
                                                    <Upload className="w-3.5 h-3.5" /> Ganti
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                                            </label>
                                        </div>

                                        {/* Existing Additional Images */}
                                        {existingImages.map((src, index) => (
                                            <div key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100 bg-gray-50">
                                                <img
                                                    src={src}
                                                    alt={`Existing ${index}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* New Additional Images */}
                                        {additionalPreviews.map((src, index) => (
                                            <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100 bg-gray-50">
                                                <img
                                                    src={src}
                                                    alt={`New ${index}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewAdditionalImage(index)}
                                                    className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add Button */}
                                        <label className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                                            <div className="bg-orange-100/50 p-3 rounded-full text-orange-500 group-hover:bg-orange-100 group-hover:scale-110 transition-all">
                                                <Image className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 group-hover:text-orange-600 text-center px-2">
                                                Tambah Foto Lain
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAdditionalImagesChange}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <label className="font-bold text-gray-700">Nama Area</label>
                                        <Input
                                            placeholder="Nama camp area..."
                                            className="h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-200"
                                            {...form.register('name')}
                                        />
                                        {form.formState.errors.name && (
                                            <span className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</span>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="font-bold text-gray-700">Deskripsi</label>
                                        <Textarea
                                            placeholder="Deskripsi camp area..."
                                            className="min-h-[150px] rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-200 resize-y"
                                            {...form.register('description')}
                                        />
                                        {form.formState.errors.description && (
                                            <span className="text-xs text-red-500 font-medium">{form.formState.errors.description.message}</span>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <label className="font-bold text-gray-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-orange-500" />
                                                Lokasi
                                            </label>
                                            <Input
                                                placeholder="Lokasi..."
                                                className="h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-200"
                                                {...form.register('location')}
                                            />
                                            {form.formState.errors.location && (
                                                <span className="text-xs text-red-500 font-medium">{form.formState.errors.location.message}</span>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="font-bold text-gray-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-500" />
                                                Harga per Malam
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="Harga..."
                                                className="h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-200"
                                                {...form.register('price')}
                                            />
                                            {form.formState.errors.price && (
                                                <span className="text-xs text-red-500 font-medium">{form.formState.errors.price.message}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Facilities */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <label className="block font-bold text-gray-700">Fasilitas Tersedia</label>
                                    <div className="flex flex-wrap gap-3">
                                        {facilityOptions.map(facility => (
                                            <button
                                                key={facility.id}
                                                type="button"
                                                onClick={() => toggleFacility(facility.id)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${selectedFacilities.includes(facility.id)
                                                    ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-sm ring-2 ring-orange-100'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {facility.icon}
                                                {facility.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Actions */}
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-12 px-6 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        asChild
                                    >
                                        <Link to={`/c/${id}`}>Batal</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all hover:scale-105"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                {uploadStatus || 'Menyimpan...'}
                                            </>
                                        ) : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
