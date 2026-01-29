import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Image, MapPin, DollarSign, Loader2, X, Wifi, Car, Coffee, Tent, Info, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import api from '../../lib/api';
import { compressImage } from '../../lib/imageCompression';


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

export default function AddCampArea() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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
        mode: 'onSubmit',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        let isFirstFile = !imageFile && !imagePreview;

        for (const file of files) {
            if (file.size > 20 * 1024 * 1024) {
                toast.error(`File ${file.name} terlalu besar (>20MB)`);
                continue;
            }

            // Auto compress > 5MB happens in uploadToCloudinary, but we warn here if super huge
            if (file.size > 5 * 1024 * 1024) {
                toast.info(`File ${file.name} cukup besar, akan dioptimasi otomatis saat upload.`);
            }

            const reader = new FileReader();

            if (isFirstFile) {
                setImageFile(file);
                reader.onloadend = () => setImagePreview(reader.result as string);
                reader.readAsDataURL(file);
                isFirstFile = false;
            } else {
                const totalAdditional = additionalFiles.length + 1;
                if (totalAdditional <= 10) {
                    setAdditionalFiles(prev => [...prev, file]);
                    reader.onloadend = () => setAdditionalPreviews(prev => [...prev, reader.result as string]);
                    reader.readAsDataURL(file);
                } else {
                    toast.error("Maksimal 10 foto tambahan");
                    break;
                }
            }
        }
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        if (index === 0 && imagePreview) {
            if (additionalFiles.length > 0) {
                setImageFile(additionalFiles[0]);
                setImagePreview(additionalPreviews[0]);
                setAdditionalFiles(prev => prev.slice(1));
                setAdditionalPreviews(prev => prev.slice(1));
            } else {
                setImageFile(null);
                setImagePreview(null);
            }
        } else {
            const adjustedIndex = imagePreview ? index - 1 : index;
            setAdditionalFiles(prev => prev.filter((_, i) => i !== adjustedIndex));
            setAdditionalPreviews(prev => prev.filter((_, i) => i !== adjustedIndex));
        }
    };

    const toggleFacility = (facilityId: string) => {
        setSelectedFacilities(prev =>
            prev.includes(facilityId)
                ? prev.filter(f => f !== facilityId)
                : [...prev, facilityId]
        );
    };

    const allPreviews = imagePreview ? [imagePreview, ...additionalPreviews] : additionalPreviews;

    const uploadToCloudinary = async (file: File) => {
        const { data: signData } = await api.get('/utils/cloudinary-signature?folder=camp_area');

        // Auto compress if > 3MB (default)
        const compressedFile = await compressImage(file, 3);

        const formData = new FormData();
        formData.append("file", compressedFile);
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
        if (!response.ok) {
            const errorMessage = data.error?.message || "Upload failed";
            // Translate common Cloudinary errors
            if (errorMessage.includes("File size too large")) {
                throw new Error("Ukuran file terlalu besar setelah kompresi");
            }
            throw new Error(errorMessage);
        }
        return data.secure_url;
    };

    const onSubmit = async (data: CampAreaFormValues) => {
        if (!imageFile) {
            toast.error("Tambahkan minimal 1 foto");
            return;
        }

        try {
            setIsSubmitting(true);
            setUploadStatus('Menyiapkan upload...');

            // Upload Cover
            setUploadStatus('Mengupload foto cover...');
            const coverUrl = await uploadToCloudinary(imageFile);

            // Upload Additional Images
            const additionalUrls: string[] = [];
            if (additionalFiles.length > 0) {
                setUploadStatus(`Mengupload ${additionalFiles.length} foto tambahan...`);
                const uploadPromises = additionalFiles.map(file => uploadToCloudinary(file));
                const results = await Promise.all(uploadPromises);
                additionalUrls.push(...results);
            }

            setUploadStatus('Menyimpan data camp area...');

            // Build payload
            const payload = {
                name: data.name,
                description: data.description,
                location: data.location,
                price: data.price,
                imageUrl: coverUrl,
                additionalImages: additionalUrls,
                wifi: selectedFacilities.includes('wifi'),
                parking: selectedFacilities.includes('parking'),
                canteen: selectedFacilities.includes('canteen'),
                tent: selectedFacilities.includes('tent'),
                info: selectedFacilities.includes('info'),
            };

            await api.post('/camp-areas', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            setUploadStatus('Selesai!');
            toast.success("Camp area berhasil dibuat!");
            queryClient.invalidateQueries({ queryKey: ['camp-areas'] });

            navigate('/camp-areas');

        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat camp area: " + (error instanceof Error ? error.message : "Error unknown"));
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

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
                        <Link to="/camp-areas">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>

                    <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="border-b bg-white p-6">
                            <CardTitle className="text-2xl font-bold text-gray-800">
                                Tambah Camp Area
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8">
                            <form
                                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                    const errorFields = Object.keys(errors);
                                    if (errorFields.length > 0) {
                                        const firstError = errors[errorFields[0] as keyof CampAreaFormValues];
                                        toast.error("Mohon lengkapi form", {
                                            description: firstError?.message || "Beberapa field belum diisi dengan benar",
                                            duration: 4000,
                                        });
                                    }
                                })}
                                className="space-y-8"
                            >
                                {/* Photo Upload */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">
                                        Foto Camp Area
                                    </label>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {/* Upload Button */}
                                        <label className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                                            <div className="bg-orange-100/50 p-3 rounded-full text-orange-500 group-hover:bg-orange-100 group-hover:scale-110 transition-all">
                                                <Image className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 group-hover:text-orange-600">
                                                Tambah Foto
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>

                                        {/* Previews */}
                                        {allPreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {index === 0 && (
                                                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10">
                                                        Cover
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {!imageFile && (
                                        <p className="text-xs text-red-500 font-medium">* Minimal 1 foto (cover)</p>
                                    )}
                                </div>

                                {/* Main Info */}
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <label className="font-bold text-gray-700">Nama Area</label>
                                        <Input
                                            placeholder="Contoh: Ranca Upas Camping Ground"
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
                                            placeholder="Ceritakan tentang suasana, pemandangan, dan hal menarik lainnya..."
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
                                                placeholder="Nama Kota/Kabupaten"
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
                                                placeholder="Contoh: 50000"
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
                                        <Link to="/camp-areas">Batal</Link>
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
                                        ) : 'Simpan Camp Area'}
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
