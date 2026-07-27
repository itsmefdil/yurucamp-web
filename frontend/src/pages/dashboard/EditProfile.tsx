
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Camera, User as UserIcon, AlertCircle, Facebook, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import RegionSelector from '../../components/ui/RegionSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useImageUploader } from '../../hooks/useImageUploader';
import api from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

const profileSchema = z.object({
    fullName: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
    avatarUrl: z.string().optional(),
    regionId: z.string().nullable().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfile() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { upload: uploadImages } = useImageUploader({ folder: 'avatars' });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: '',
            email: '',
            bio: '',
            avatarUrl: '',
            regionId: null,
            facebook: '',
            instagram: '',
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                fullName: user.fullName || '',
                email: user.email || '',
                bio: user.bio || '',
                avatarUrl: user.avatarUrl || '',
                regionId: user.regionId || null,
                facebook: user.facebook || '',
                instagram: user.instagram || '',
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

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            setIsSubmitting(true);
            let avatarUrl = data.avatarUrl;

            if (imageFile) {
                const resAvatar = await uploadImages([imageFile]);
                if (resAvatar && resAvatar.length > 0) {
                    avatarUrl = resAvatar[0];
                } else {
                    toast.error("Gagal mengunggah foto profil baru");
                    setIsSubmitting(false);
                    return;
                }
            }

            const response = await api.put('/auth/profile', {
                fullName: data.fullName,
                email: data.email,
                bio: data.bio || null,
                avatarUrl: avatarUrl,
                regionId: data.regionId,
                facebook: data.facebook || null,
                instagram: data.instagram || null,
            });

            // Refetch current user to update AuthContext and UI globally
            const meRes = await api.get('/auth/me');
            updateUser(meRes.data);

            toast.success("Profil berhasil diperbarui!");

            // Navigate back to dashboard after short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (error: any) {
            console.error('Error updating profile:', error);
            const msg = error?.response?.data?.error || error?.message || "Gagal memperbarui profil";
            toast.error(`Gagal memperbarui profil: ${msg}`);
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
                                        <Label htmlFor="bio">Bio</Label>
                                        <textarea
                                            id="bio"
                                            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                            placeholder="Ceritakan sedikit tentang dirimu..."
                                            maxLength={500}
                                            {...form.register('bio')}
                                        />
                                        <p className="text-xs text-gray-500 text-right">
                                            {form.watch('bio')?.length || 0}/500
                                        </p>
                                        {form.formState.errors.bio && (
                                            <p className="text-xs text-red-500">{form.formState.errors.bio.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <RegionSelector
                                            label="Region Asal / Komunitas"
                                            value={form.watch('regionId')}
                                            onChange={(val) => form.setValue('regionId', val)}
                                        />
                                    </div>

                                    {/* Social Media Section */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sosial Media</h3>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="facebook">Facebook</Label>
                                                <div className="relative">
                                                    <Facebook className="absolute left-3 top-2.5 h-5 w-5 text-blue-600" />
                                                    <Input
                                                        id="facebook"
                                                        className="pl-10"
                                                        placeholder="https://facebook.com/username"
                                                        {...form.register('facebook')}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="instagram">Instagram</Label>
                                                <div className="relative">
                                                    <Instagram className="absolute left-3 top-2.5 h-5 w-5 text-pink-500" />
                                                    <Input
                                                        id="instagram"
                                                        className="pl-10"
                                                        placeholder="https://instagram.com/username"
                                                        {...form.register('instagram')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
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
