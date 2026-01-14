import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Image, MapPin, Calendar, Loader2, X, Users, DollarSign, Upload } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Event } from '../../types';

const eventSchema = z.object({
    title: z.string().min(3, "Judul minimal 3 karakter"),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    location: z.string().min(3, "Lokasi minimal 3 karakter"),
    dateStart: z.string().min(1, "Tanggal mulai harus diisi"),
    dateEnd: z.string().optional(),
    price: z.string().optional(),
    maxParticipants: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EditEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: Event | null;
}

export function EditEventModal({ open, onOpenChange, event }: EditEventModalProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: '',
            description: '',
            location: '',
            dateStart: '',
            dateEnd: '',
            price: '',
            maxParticipants: '',
        },
    });

    // Populate Data
    useEffect(() => {
        if (event && open) {
            const formatDateTime = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toISOString().slice(0, 16);
            };

            form.reset({
                title: event.title,
                description: event.description || '',
                location: event.location || '',
                dateStart: formatDateTime(event.dateStart),
                dateEnd: event.dateEnd ? formatDateTime(event.dateEnd) : '',
                price: event.price || '',
                maxParticipants: event.maxParticipants?.toString() || '',
            });

            setImageFile(null);
            setImagePreview(null);
        }
    }, [event, open, form]);

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

    const uploadToCloudinary = async (file: File) => {
        const { data: signData } = await api.get('/utils/cloudinary-signature');

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

    const onSubmit = async (data: EventFormValues) => {
        if (!event) return;

        try {
            setIsSubmitting(true);
            setUploadStatus('Menyiapkan upload...');

            let imageUrl = null;
            if (imageFile) {
                setUploadStatus('Mengupload cover baru...');
                imageUrl = await uploadToCloudinary(imageFile);
            }

            setUploadStatus('Menyimpan perubahan...');

            const payload = {
                title: data.title,
                description: data.description,
                location: data.location,
                date_start: data.dateStart,
                date_end: data.dateEnd || null,
                price: data.price || '0',
                max_participants: data.maxParticipants || null,
                imageUrl: imageUrl
            };

            await api.put(`/events/${event.id}`, payload);

            setUploadStatus('Selesai!');
            toast.success("Event berhasil diperbarui!");
            queryClient.invalidateQueries({ queryKey: ['event', event.id] });
            queryClient.invalidateQueries({ queryKey: ['events'] });

            onOpenChange(false);

        } catch (error) {
            console.error(error);
            toast.error("Gagal memperbarui event: " + (error instanceof Error ? error.message : "Error unknown"));
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    const currentCover = imagePreview || event?.imageUrl;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-[100dvh] max-w-none rounded-none sm:rounded-lg sm:h-auto sm:max-h-[90vh] sm:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 pr-12 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Edit Event</DialogTitle>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting || !form.watch('description')}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 font-semibold min-w-[100px]"
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
                            <Avatar className="w-10 h-10 border-2 border-primary/20">
                                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {getInitials(user?.fullName || '')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900">{user?.fullName || 'Pengguna'}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        🎉 Event Publik
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="px-4 pt-4">
                        <Input
                            placeholder="Judul event anda..."
                            className="border-0 text-lg font-semibold placeholder:text-gray-400 focus-visible:ring-0 px-0"
                            {...form.register('title')}
                        />
                    </div>

                    {/* Description */}
                    <div className="px-4 pb-2">
                        <Textarea
                            placeholder="Deskripsi event anda..."
                            className="border-0 resize-none min-h-[100px] text-base placeholder:text-gray-400 focus-visible:ring-0 px-0"
                            {...form.register('description')}
                        />
                    </div>

                    {/* Photo Grid */}
                    <div className="px-4 pb-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {/* Cover Image */}
                            <div
                                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100 border-2 border-primary"
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
                                <span className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium z-10">
                                    Cover
                                </span>

                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="bg-white/90 p-1.5 rounded-full shadow-sm text-xs font-medium text-gray-900 flex items-center gap-1">
                                        <Upload className="w-3 h-3" /> Ganti
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="mt-2 border-t border-gray-100">
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

                            {/* Date Start */}
                            <div className="flex items-center px-4 py-3 gap-3">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">Tanggal & Waktu Mulai</label>
                                    <Input
                                        type="datetime-local"
                                        className="border-0 focus-visible:ring-0 px-0"
                                        {...form.register('dateStart')}
                                    />
                                </div>
                            </div>

                            {/* Date End */}
                            <div className="flex items-center px-4 py-3 gap-3">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">Tanggal & Waktu Selesai (Opsional)</label>
                                    <Input
                                        type="datetime-local"
                                        className="border-0 focus-visible:ring-0 px-0"
                                        {...form.register('dateEnd')}
                                    />
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center px-4 py-3 gap-3">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <Input
                                    type="number"
                                    placeholder="Biaya (Rp) - Kosongkan jika gratis"
                                    className="border-0 focus-visible:ring-0 px-0 flex-1"
                                    {...form.register('price')}
                                />
                            </div>

                            {/* Max Participants */}
                            <div className="flex items-center px-4 py-3 gap-3">
                                <Users className="w-5 h-5 text-orange-500" />
                                <Input
                                    type="number"
                                    placeholder="Maks peserta (Kosongkan jika tidak terbatas)"
                                    className="border-0 focus-visible:ring-0 px-0 flex-1"
                                    {...form.register('maxParticipants')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-2 border-t border-gray-100">
                        <div className="flex items-center justify-around py-3">
                            <label className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                <Image className="w-6 h-6 text-green-500" />
                                <span className="text-sm font-medium">Ganti Foto</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleCoverChange}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Validation Errors */}
                    {Object.keys(form.formState.errors).length > 0 && (
                        <div className="bg-red-50 border border-red-100 mx-4 mt-4 mb-8 p-3 rounded-lg">
                            <p className="text-sm text-red-600 font-medium">Mohon lengkapi:</p>
                            <ul className="text-sm text-red-500 mt-1 space-y-1">
                                {form.formState.errors.title && <li>• {form.formState.errors.title.message}</li>}
                                {form.formState.errors.description && <li>• {form.formState.errors.description.message}</li>}
                                {form.formState.errors.location && <li>• {form.formState.errors.location.message}</li>}
                                {form.formState.errors.dateStart && <li>• {form.formState.errors.dateStart.message}</li>}
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
