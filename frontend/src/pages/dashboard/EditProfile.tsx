
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Camera, User as UserIcon, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import RegionSelector from '../../components/ui/RegionSelector';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

const profileSchema = z.object({
    fullName: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    // bio: z.string().optional(),
    avatarUrl: z.string().optional(),
    regionId: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfile() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: '',
            email: '',
            avatarUrl: '',
            regionId: null,
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                fullName: user.fullName || '',
                email: user.email || '',
                avatarUrl: user.avatarUrl || '',
                regionId: user.regionId || null,
            });
            setImagePreview(user.avatarUrl || null);
        }
    }, [user, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran foto maksimal 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const uploadToCloudinary = async (file: File) => {
        const { data: signData } = await api.get('/utils/cloudinary-signature?folder=avatars');

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signData.api_key);
        formData.append("timestamp", signData.timestamp.toString());
        formData.append("signature", signData.signature);
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

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            setIsSubmitting(true);
            let avatarUrl = data.avatarUrl;

            if (imageFile) {
                avatarUrl = await uploadToCloudinary(imageFile);
            }

            const response = await api.put('/auth/profile', {
                fullName: data.fullName,
                email: data.email,
                avatarUrl: avatarUrl,
                regionId: data.regionId
            });

            // Update local user context
            // Assuming the auth context has a way to refresh user or we manually update it
            // Since useAuth doesn't expose a 'updateUser' method directly in standard implementations, 
            // we might rely on the fact that 'login' might accept a user object or we force a reload/refetch.
            // For now, let's just toast and maybe reload window if context doesn't auto-update.
            // Actually, usually we should refetch /auth/me. 
            // If AuthContext uses a provider that fetches /me on mount, a window.location.reload() is a quick hack, 
            // but let's try to see if we can trigger a refetch or just assume success.

            updateUser(response.data);

            toast.success("Profil berhasil diperbarui!");

            // Navigate back to dashboard after short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error("Gagal memperbarui profil");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <div className="max-w-xl mx-auto">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Edit Profil</CardTitle>
                            <CardDescription className="text-center">Pebarui informasi profil anda</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group cursor-pointer">
                                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                                            <AvatarImage src={imagePreview || undefined} className="object-cover" />
                                            <AvatarFallback className="text-4xl">{user.fullName?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="w-8 h-8 text-white" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">Klik foto untuk mengganti</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nama Lengkap</Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="fullName"
                                                className="pl-10"
                                                placeholder="Nama Lengkap"
                                                {...form.register('fullName')}
                                            />
                                        </div>
                                        {form.formState.errors.fullName && (
                                            <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            disabled
                                            className="bg-gray-50"
                                            {...form.register('email')}
                                        />
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Email tidak dapat diubah
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <RegionSelector
                                            label="Region Asal / Komunitas"
                                            value={form.watch('regionId')}
                                            onChange={(val) => form.setValue('regionId', val)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            'Simpan Perubahan'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main >
            <Footer />
        </div >
    );
}
