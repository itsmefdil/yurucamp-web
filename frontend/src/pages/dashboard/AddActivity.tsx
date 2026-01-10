import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Image, MapPin, Calendar, Tag, Loader2, X, ChevronLeft } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const activitySchema = z.object({
    title: z.string().min(3, "Judul minimal 3 karakter"),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    categoryId: z.string().min(1, "Kategori harus dipilih"),
    date: z.string().min(1, "Tanggal harus diisi"),
    location: z.string().min(3, "Lokasi minimal 3 karakter"),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

export default function AddActivity() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
    const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const form = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
            date: new Date().toISOString().split('T')[0],
            location: '',
        },
    });

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data as Array<{ id: string; name: string; createdAt: string }>;
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        let isFirstFile = !imageFile && !imagePreview;

        files.forEach((file, index) => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`File ${file.name} terlalu besar (max 5MB)`);
                return;
            }

            const reader = new FileReader();

            if (isFirstFile && index === 0) {
                // First file becomes main/cover image
                setImageFile(file);
                reader.onloadend = () => setImagePreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                // Rest become additional images
                const totalAdditional = additionalFiles.length + (isFirstFile ? index : index + 1);
                if (totalAdditional <= 10) {
                    setAdditionalFiles(prev => [...prev, file]);
                    reader.onloadend = () => setAdditionalPreviews(prev => [...prev, reader.result as string]);
                    reader.readAsDataURL(file);
                } else {
                    toast.error("Maksimal 10 foto tambahan");
                }
            }
        });

        // Reset input so same files can be selected again
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        if (index === 0 && imagePreview) {
            // Remove main image, promote first additional to main
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
            // Remove from additional images
            const adjustedIndex = imagePreview ? index - 1 : index;
            setAdditionalFiles(prev => prev.filter((_, i) => i !== adjustedIndex));
            setAdditionalPreviews(prev => prev.filter((_, i) => i !== adjustedIndex));
        }
    };

    const allPreviews = imagePreview ? [imagePreview, ...additionalPreviews] : additionalPreviews;

    const onSubmit = async (data: ActivityFormValues) => {
        if (!imageFile) {
            toast.error("Tambahkan minimal 1 foto");
            return;
        }

        try {
            setIsSubmitting(true);
            setUploadStatus('Menyiapkan data...');

            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('categoryId', data.categoryId);
            formData.append('date', data.date);
            formData.append('location', data.location);

            setUploadStatus('Mengupload foto cover...');
            formData.append('image', imageFile);

            if (additionalFiles.length > 0) {
                setUploadStatus(`Mengupload ${additionalFiles.length} foto tambahan...`);
                additionalFiles.forEach(file => {
                    formData.append('additional_images', file);
                });
            }

            setUploadStatus('Memproses postingan...');
            await api.post('/activities', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUploadStatus('Selesai!');
            toast.success("Aktifitas berhasil dibuat!");
            navigate('/activities');
        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat aktifitas");
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold">Buat Postingan</h1>
                    </div>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting || !form.watch('description')}
                        className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 font-semibold min-w-[100px]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs">{uploadStatus || 'Posting...'}</span>
                            </span>
                        ) : 'Posting'}
                    </Button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto">
                {/* User Info Section */}
                <div className="bg-white p-4 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                            <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(user?.fullName || '')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{user?.fullName || 'Pengguna'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                                    🌍 Publik
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Title Input */}
                <div className="bg-white px-4 pt-4">
                    <Input
                        placeholder="Judul cerita camping anda..."
                        className="border-0 text-xl font-semibold placeholder:text-gray-400 focus-visible:ring-0 px-0"
                        {...form.register('title')}
                    />
                </div>

                {/* Description Textarea */}
                <div className="bg-white px-4 pb-2">
                    <Textarea
                        placeholder="Bagikan pengalaman seru camping anda..."
                        className="border-0 resize-none min-h-[120px] text-base placeholder:text-gray-400 focus-visible:ring-0 px-0"
                        {...form.register('description')}
                    />
                </div>

                {/* Photo Grid */}
                {/* Photo Grid */}
                {allPreviews.length > 0 && (
                    <div className="bg-white px-4 pb-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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
                                    {/* Cover badge on first photo */}
                                    {index === 0 && (
                                        <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium z-10">
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

                {/* Detail Fields */}
                <div className="bg-white mt-2 border-t border-gray-100">
                    <div className="divide-y divide-gray-100">
                        {/* Location */}
                        <div className="flex items-center px-4 py-3 gap-3">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <Input
                                placeholder="Tambahkan lokasi"
                                className="border-0 focus-visible:ring-0 px-0 flex-1"
                                {...form.register('location')}
                            />
                        </div>

                        {/* Date */}
                        <div className="flex items-center px-4 py-3 gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <Input
                                type="date"
                                className="border-0 focus-visible:ring-0 px-0 flex-1"
                                {...form.register('date')}
                            />
                        </div>

                        {/* Category */}
                        <div className="flex items-center px-4 py-3 gap-3">
                            <Tag className="w-5 h-5 text-green-500" />
                            <Select
                                onValueChange={(value) => form.setValue('categoryId', value)}
                                defaultValue={form.watch('categoryId')}
                            >
                                <SelectTrigger className="border-0 focus:ring-0 px-0 flex-1 shadow-none">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingCategories ? (
                                        <div className="p-2 text-sm text-gray-500">Loading...</div>
                                    ) : categories && categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-gray-500">No categories available</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white mt-2 border-t border-gray-100">
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
                    <div className="bg-red-50 border border-red-100 mx-4 mt-4 p-3 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">Mohon lengkapi:</p>
                        <ul className="text-sm text-red-500 mt-1 space-y-1">
                            {form.formState.errors.title && <li>• {form.formState.errors.title.message}</li>}
                            {form.formState.errors.description && <li>• {form.formState.errors.description.message}</li>}
                            {form.formState.errors.location && <li>• {form.formState.errors.location.message}</li>}
                            {form.formState.errors.categoryId && <li>• {form.formState.errors.categoryId.message}</li>}
                            {form.formState.errors.date && <li>• {form.formState.errors.date.message}</li>}
                        </ul>
                    </div>
                )}

                {/* Bottom spacer for mobile */}
                <div className="h-20" />
            </main>

            {/* Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none h-fit max-h-[90vh] flex flex-col justify-center">
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
