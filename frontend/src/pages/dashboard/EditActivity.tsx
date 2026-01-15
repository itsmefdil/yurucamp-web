import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Upload, X, Plus } from 'lucide-react';

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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../../components/ui/form';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import api from '../../lib/api';
import type { Activity } from '../../types';

const activitySchema = z.object({
    title: z.string().min(3, "Judul minimal 3 karakter"),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    categoryId: z.string().min(1, "Kategori harus dipilih"),
    date: z.string().min(1, "Tanggal harus diisi"),
    location: z.string().min(3, "Lokasi minimal 3 karakter"),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

export default function EditActivity() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Split additional images into existing (URLs) and new (Files)
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newAdditionalFiles, setNewAdditionalFiles] = useState<File[]>([]);
    const [newAdditionalPreviews, setNewAdditionalPreviews] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch existing activity data
    const { data: activity, isLoading: isLoadingActivity } = useQuery({
        queryKey: ['activity', id],
        queryFn: async () => {
            const response = await api.get(`/activities/${id}`);
            return response.data as Activity;
        },
        enabled: !!id,
    });

    // Fetch categories
    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data as Array<{ id: string; name: string; createdAt: string }>;
        },
    });

    const form = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
            date: '',
            location: '',
        },
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (activity && categories && categories.length > 0 && !isLoadingCategories) {
            const formData = {
                title: activity.title,
                description: activity.description || '',
                categoryId: activity.categoryId || '',
                date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : '',
                location: activity.location || '',
            };

            console.log('Setting form data:', formData);
            console.log('Available categories:', categories);
            form.reset(formData);

            if (activity.imageUrl) {
                setImagePreview(activity.imageUrl);
            }

            if (activity.additionalImages) {
                setExistingImages(activity.additionalImages);
            }
        }
    }, [activity, categories, isLoadingCategories, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = existingImages.length + newAdditionalFiles.length + files.length;

        if (totalImages > 10) {
            toast.error("Maksimal 10 foto tambahan");
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`File ${file.name} terlalu besar (max 5MB)`);
                return false;
            }
            return true;
        });

        console.log('Adding files to state:', validFiles.length, validFiles.map(f => f.name));
        setNewAdditionalFiles(prev => [...prev, ...validFiles]);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAdditionalPreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input so same files can be selected again if needed (though unlikely in this flow)
        e.target.value = '';
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewAdditionalImage = (index: number) => {
        setNewAdditionalFiles(prev => prev.filter((_, i) => i !== index));
        setNewAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ActivityFormValues) => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('categoryId', data.categoryId);
            formData.append('date', data.date);
            formData.append('location', data.location);

            // Only append 'image' if a new file was selected
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Append kept images (existing URLs)
            // Backend expects 'kept_images' which can be an array of strings
            existingImages.forEach(url => {
                formData.append('kept_images', url);
            });

            // Append new additional images
            console.log('Submitting newAdditionalFiles:', newAdditionalFiles.length, newAdditionalFiles.map(f => f.name));
            newAdditionalFiles.forEach(file => {
                formData.append('additional_images', file);
            });

            await api.put(`/activities/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Aktifitas berhasil diperbarui!");
            navigate(`/a/${id}`);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memperbarui aktifitas");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingActivity) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <h2 className="text-xl font-bold">Activity tidak ditemukan</h2>
                <Button onClick={() => navigate('/activities')}>Kembali</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 pt-24 md:pt-32">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Aktifitas</h1>
                        <p className="text-gray-600">Perbarui informasi aktifitas anda.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Validation errors:", errors))} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Judul Aktifitas</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: Camping di Danau Toba" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kategori</FormLabel>
                                                <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih kategori" />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tanggal</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lokasi</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Lokasi kegiatan" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deskripsi</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ceritakan pengalaman anda..."
                                                    className="min-h-[150px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4">
                                    <div>
                                        <FormLabel>Foto Utama</FormLabel>
                                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 hover:bg-gray-50 transition-colors cursor-pointer relative" onClick={() => document.getElementById('main-image-upload')?.click()}>
                                            {imagePreview ? (
                                                <div className="relative w-full h-64">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                        <span className="text-white font-medium">Ganti Foto</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                                        <span className="relative cursor-pointer rounded-md bg-white font-semibold text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 hover:text-orange-500">
                                                            Upload foto
                                                        </span>
                                                        <p className="pl-1">atau drag and drop</p>
                                                    </div>
                                                    <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 5MB</p>
                                                </div>
                                            )}
                                            <input
                                                id="main-image-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <FormLabel>Foto Tambahan (max 10)</FormLabel>
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* Existing Images */}
                                            {existingImages.map((url, index) => (
                                                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                    <img src={url} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(index)}
                                                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* New Additional Images */}
                                            {newAdditionalPreviews.map((preview, index) => (
                                                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                    <img src={preview} alt={`New ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewAdditionalImage(index)}
                                                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Add Button */}
                                            {(existingImages.length + newAdditionalFiles.length) < 10 && (
                                                <div
                                                    className="aspect-square rounded-lg border border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => document.getElementById('additional-image-upload')?.click()}
                                                >
                                                    <div className="text-center">
                                                        <Plus className="mx-auto h-8 w-8 text-gray-400" />
                                                        <span className="text-xs text-gray-500 mt-1 block">Add More</span>
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                id="additional-image-upload"
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAdditionalImagesChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(`/a/${id}`)}
                                        disabled={isSubmitting}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-orange-500 hover:bg-orange-600 text-white min-w-[120px]"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            "Simpan Perubahan"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
