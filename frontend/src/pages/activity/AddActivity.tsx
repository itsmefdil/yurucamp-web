import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Image, Loader2, X, Upload, ArrowLeft } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import RichTextEditor from '../../components/ui/RichTextEditor';
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
import RegionSelector from '../../components/ui/RegionSelector';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { compressImage } from '../../lib/imageCompression';

const activitySchema = z.object({
    title: z.string().min(3, "Judul minimal 3 karakter"),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    categoryId: z.string().min(1, "Kategori harus dipilih"),
    date: z.string().min(1, "Tanggal harus diisi"),
    location: z.string().min(3, "Lokasi minimal 3 karakter"),
    regionId: z.string().nullable().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

export default function AddActivity() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Additional images
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
    const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    const form = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
            date: new Date().toISOString().split('T')[0],
            location: '',
            regionId: null,
        },
        mode: 'onSubmit', // Only validate on submit
    });

    useEffect(() => {
        if (user?.regionId) {
            form.setValue('regionId', user.regionId);
        }
    }, [user, form]);

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data as Array<{ id: string; name: string; createdAt: string }>;
        },
    });

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                toast.error("Ukuran file maksimal 20MB");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.info("File cover cukup besar, akan dioptimasi otomatis.");
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
            if (file.size > 20 * 1024 * 1024) {
                toast.error(`File ${file.name} terlalu besar (>20MB)`);
                continue;
            }

            const totalAdditional = additionalFiles.length + 1;
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



    const removeNewAdditionalImage = (index: number) => {
        setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
        setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadToCloudinary = async (file: File) => {
        const { data: signData } = await api.get('/utils/cloudinary-signature?folder=activities');

        // Auto compress if > 3MB
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
            if (errorMessage.includes("File size too large")) {
                throw new Error("Ukuran file terlalu besar setelah kompresi");
            }
            throw new Error(errorMessage);
        }
        return data.secure_url;
    };

    const onSubmit = async (data: ActivityFormValues) => {
        if (!imageFile) {
            toast.error("Tambahkan minimal 1 foto (Cover)");
            return;
        }

        try {
            setIsSubmitting(true);
            setUploadStatus('Menyiapkan upload...');

            // Upload Cover
            setUploadStatus('Mengupload foto cover...');
            let coverUrl = '';
            try {
                coverUrl = await uploadToCloudinary(imageFile);
            } catch (error) {
                console.error("Cover upload failed:", error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error";

                if (errorMessage.includes("terlalu besar")) {
                    toast.error("Ukuran gambar terlalu besar", {
                        description: "Pilih gambar dengan ukuran lebih kecil atau resolusi lebih rendah.",
                        duration: 5000,
                    });
                } else {
                    toast.error("Gagal mengupload foto cover", {
                        description: "Pastikan koneksi internet stabil dan coba lagi dalam beberapa saat.",
                        duration: 5000,
                    });
                }
                setIsSubmitting(false);
                setUploadStatus('');
                return;
            }

            // Upload Additional Images
            const additionalUrls: string[] = [];
            if (additionalFiles.length > 0) {
                setUploadStatus(`Mengupload ${additionalFiles.length} foto tambahan...`);
                try {
                    const uploadPromises = additionalFiles.map(file => uploadToCloudinary(file));
                    const results = await Promise.all(uploadPromises);
                    additionalUrls.push(...results);
                } catch (error) {
                    console.error("Additional images upload failed:", error);
                    toast.error("Gagal mengupload foto tambahan", {
                        description: "Beberapa foto gagal diupload. Coba kurangi jumlah atau ukuran foto.",
                        duration: 5000,
                    });
                    setIsSubmitting(false);
                    setUploadStatus('');
                    return;
                }
            }

            setUploadStatus('Menyimpan data aktivitas...');

            const payload = {
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                date: data.date,
                location: data.location,
                imageUrl: coverUrl,
                additionalImages: additionalUrls,
                regionId: data.regionId
            };

            await api.post('/activities', payload);

            setUploadStatus('Selesai!');
            toast.success("Aktivitas berhasil dibuat!");
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            navigate('/activities');
        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat aktivitas", {
                description: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
                duration: 5000,
            });
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
                        <Link to="/activities">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>

                    <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="border-b bg-white p-6">
                            <CardTitle className="text-2xl font-bold text-gray-800">
                                Buat Aktivitas Baru
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                        // Show warning toast when validation fails
                                        const errorFields = Object.keys(errors);
                                        if (errorFields.length > 0) {
                                            const firstError = errors[errorFields[0] as keyof ActivityFormValues];
                                            toast.error("Mohon lengkapi form", {
                                                description: firstError?.message || "Beberapa field belum diisi dengan benar",
                                                duration: 4000,
                                            });
                                        }
                                    })}
                                    className="space-y-6"
                                >

                                    {/* Image Upload Grid */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-700">
                                            Foto Aktivitas
                                        </label>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* Cover Image */}
                                            <div className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-orange-500 bg-gray-100">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
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
                                                        className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Add Button */}
                                            {additionalFiles.length < 9 && (
                                                <label className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                                                    <div className="bg-orange-100/50 p-3 rounded-full text-orange-500 group-hover:bg-orange-100 group-hover:scale-110 transition-all">
                                                        <Image className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-500 group-hover:text-orange-600 text-center px-2">
                                                        Tambah Foto
                                                    </span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleAdditionalImagesChange}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {!imageFile && (
                                            <p className="text-xs text-red-500 font-medium">* Minimal 1 foto (cover)</p>
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Judul Aktivitas</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Contoh: Camping di Danau Toba" {...field} className="h-12 rounded-xl" />
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
                                                            <SelectTrigger className="h-12 rounded-xl">
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
                                                        <Input type="date" {...field} className="h-12 rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="regionId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Region (Opsional)</FormLabel>
                                                <FormControl>
                                                    <RegionSelector
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Pilih Region"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lokasi</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Lokasi kegiatan" {...field} className="h-12 rounded-xl" />
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
                                                    <RichTextEditor
                                                        placeholder="Ceritakan pengalaman anda... (Support Markdown)"
                                                        className="min-h-[300px]"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => navigate('/activities')}
                                            disabled={isSubmitting}
                                            className="h-12 px-6 rounded-xl hover:bg-gray-100"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="h-12 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all hover:scale-105"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {uploadStatus ? uploadStatus : "Memposting..."}
                                                </>
                                            ) : (
                                                "Buat Aktivitas"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
