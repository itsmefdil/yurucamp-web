import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Image, MapPin, DollarSign, Loader2, X, Wifi, Car, Coffee, Tent, Info } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

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

interface AddCampAreaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddCampAreaModal({ open, onOpenChange }: AddCampAreaModalProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        let isFirstFile = !imageFile && !imagePreview;

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} terlalu besar (>10MB)`);
                continue;
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

            // Build form data for backend (using multipart/form-data pattern like backend expects)
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('location', data.location);
            formData.append('price', data.price);

            // Add facilities
            selectedFacilities.forEach(f => formData.append(f, 'on'));

            // Since we already uploaded to Cloudinary, we need to send URLs
            // But backend expects files. Let's send as JSON instead
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

            onOpenChange(false);

            // Reset form
            setImageFile(null);
            setImagePreview(null);
            setAdditionalFiles([]);
            setAdditionalPreviews([]);
            setSelectedFacilities([]);
            form.reset();

        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat camp area: " + (error instanceof Error ? error.message : "Error unknown"));
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-[100dvh] max-w-none rounded-none sm:rounded-lg sm:h-auto sm:max-h-[90vh] sm:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 pr-12 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Tambah Camp Area</DialogTitle>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting || !form.watch('description')}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-semibold min-w-[100px]"
                            size="sm"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">{uploadStatus || 'Posting...'}</span>
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
                    {allPreviews.length > 0 && (
                        <div className="px-4 pb-4">
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {allPreviews.map((preview, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
                                        onClick={() => setPreviewImage(preview)}
                                    >
                                        <img
                                            src={preview}
                                            alt={`Photo ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        {index === 0 && (
                                            <span className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium z-10">
                                                Cover
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage(index);
                                            }}
                                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-100 active:scale-90"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Details */}
                    <div className="mt-2 border-t border-gray-100">
                        <div className="divide-y divide-gray-100">
                            {/* Location */}
                            <div className="flex items-center px-4 py-3 gap-3">
                                <MapPin className="w-5 h-5 text-red-500" />
                                <Input
                                    placeholder="Lokasi camp area ( samakan dengan google maps )"
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
                                <span className="text-sm font-medium">Foto</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Validation Errors */}
                    {Object.keys(form.formState.errors).length > 0 && (
                        <div className="bg-red-50 border border-red-100 mx-4 mt-4 mb-8 p-3 rounded-lg">
                            <p className="text-sm text-red-600 font-medium">Mohon lengkapi:</p>
                            <ul className="text-sm text-red-500 mt-1 space-y-1">
                                {form.formState.errors.name && <li>• {form.formState.errors.name.message}</li>}
                                {form.formState.errors.description && <li>• {form.formState.errors.description.message}</li>}
                                {form.formState.errors.location && <li>• {form.formState.errors.location.message}</li>}
                                {form.formState.errors.price && <li>• {form.formState.errors.price.message}</li>}
                            </ul>
                        </div>
                    )}
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
