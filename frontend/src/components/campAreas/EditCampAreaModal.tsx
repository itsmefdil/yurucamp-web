import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Image, MapPin, DollarSign, Loader2, X, Wifi, Car, Coffee, Tent, Info, Upload } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { CampArea } from '../../types';

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

interface EditCampAreaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campArea: CampArea | null;
}

export function EditCampAreaModal({ open, onOpenChange, campArea }: EditCampAreaModalProps) {
    const { user } = useAuth();
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
    const [previewImage, setPreviewImage] = useState<string | null>(null);
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

    // Populate Data
    useEffect(() => {
        if (campArea && open) {
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
    }, [campArea, open, form]);

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

            onOpenChange(false);

        } catch (error) {
            console.error(error);
            toast.error("Gagal memperbarui camp area");
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    const currentCover = imagePreview || campArea?.imageUrl;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-[100dvh] max-w-none rounded-none sm:rounded-lg sm:h-auto sm:max-h-[90vh] sm:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 pr-12 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Edit Camp Area</DialogTitle>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting || !form.watch('description')}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-semibold min-w-[100px]"
                            size="sm"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">{uploadStatus || 'Menyimpan...'}</span>
                                </span>
                            ) : 'Simpan'}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {/* User Info */}
                    <div className="bg-white p-4 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10 border-2 border-orange-200">
                                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                                <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                                    {getInitials(user?.fullName || '')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900">{user?.fullName || 'Pengguna'}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        🏕️ Camp Area
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="px-4 pt-4">
                        <Input
                            placeholder="Nama camp area..."
                            className="border-0 text-lg font-semibold placeholder:text-gray-400 focus-visible:ring-0 px-0"
                            {...form.register('name')}
                        />
                    </div>

                    {/* Description */}
                    <div className="px-4 pb-2">
                        <Textarea
                            placeholder="Deskripsi camp area, keindahan lokasi, suasana, dll..."
                            className="border-0 resize-none min-h-[100px] text-base placeholder:text-gray-400 focus-visible:ring-0 px-0"
                            {...form.register('description')}
                        />
                    </div>

                    {/* Photo Grid */}
                    <div className="px-4 pb-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {/* Cover Image */}
                            <div
                                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100 border-2 border-orange-500"
                                onClick={() => currentCover && setPreviewImage(currentCover)}
                            >
                                {currentCover ? (
                                    <img
                                        src={currentCover}
                                        alt="Cover"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Image className="w-8 h-8" />
                                    </div>
                                )}
                                <span className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium z-10">
                                    Cover
                                </span>

                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="bg-white/90 p-1.5 rounded-full shadow-sm text-xs font-medium text-gray-900 flex items-center gap-1">
                                        <Upload className="w-3 h-3" /> Ganti
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                                </label>
                            </div>

                            {/* Existing Additional Images */}
                            {existingImages.map((src, index) => (
                                <div
                                    key={`existing-${index}`}
                                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
                                    onClick={() => setPreviewImage(src)}
                                >
                                    <img
                                        src={src}
                                        alt={`Existing ${index}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeExistingImage(index);
                                        }}
                                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-100 active:scale-90"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* New Additional Images */}
                            {additionalPreviews.map((src, index) => (
                                <div
                                    key={`new-${index}`}
                                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
                                    onClick={() => setPreviewImage(src)}
                                >
                                    <img
                                        src={src}
                                        alt={`New ${index}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeNewAdditionalImage(index);
                                        }}
                                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-100 active:scale-90"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="mt-2 border-t border-gray-100">
                        <div className="divide-y divide-gray-100">
                            {/* Location */}
                            <div className="flex items-center px-4 py-3 gap-3">
                                <MapPin className="w-5 h-5 text-red-500" />
                                <Input
                                    placeholder="Lokasi camp area"
                                    className="border-0 focus-visible:ring-0 px-0 flex-1"
                                    {...form.register('location')}
                                />
                            </div>

                            {/* Price */}
                            <div className="flex items-center px-4 py-3 gap-3">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <Input
                                    type="number"
                                    placeholder="Harga per malam (Rp)"
                                    className="border-0 focus-visible:ring-0 px-0 flex-1"
                                    {...form.register('price')}
                                />
                            </div>

                            {/* Facilities */}
                            <div className="px-4 py-4">
                                <p className="text-sm font-medium text-gray-700 mb-3">Fasilitas</p>
                                <div className="flex flex-wrap gap-2">
                                    {facilityOptions.map(facility => (
                                        <button
                                            key={facility.id}
                                            type="button"
                                            onClick={() => toggleFacility(facility.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${selectedFacilities.includes(facility.id)
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {facility.icon}
                                            {facility.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-2 border-t border-gray-100">
                        <div className="flex items-center justify-around py-3">
                            <label className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                <Image className="w-6 h-6 text-green-500" />
                                <span className="text-sm font-medium">Tambah Foto</span>
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
                </div>
            </DialogContent>

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
        </Dialog>
    );
}
