import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ImagePlus, MapPin, Calendar, Loader2, X, Users, DollarSign, ArrowLeft, FileText, Tent, Mountain, TreePine, Globe } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import RegionSelector from '../../components/ui/RegionSelector';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
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
    regionId: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EditEvent() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Fetch event data
    const { data: event, isLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const response = await api.get(`/events/${id}`);
            return response.data as Event;
        },
        enabled: !!id,
    });

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
            regionId: '',
        },
    });

    // Populate form when event loads
    useEffect(() => {
        if (event) {
            // Format for datetime-local input (needs YYYY-MM-DDTHH:mm in LOCAL time)
            const formatDateTimeLocal = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            form.reset({
                title: event.title,
                description: event.description || '',
                location: event.location || '',
                dateStart: formatDateTimeLocal(event.dateStart),
                dateEnd: event.dateEnd ? formatDateTimeLocal(event.dateEnd) : '',
                price: event.price || '',
                maxParticipants: event.maxParticipants?.toString() || '',
                regionId: event.regionId || '',
            });
        }
    }, [event, form]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const uploadToCloudinary = async (file: File) => {
        const { data: signData } = await api.get('/utils/cloudinary-signature?folder=events');

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

            // Convert datetime-local to ISO string with timezone
            const toISOWithTimezone = (dateTimeLocal: string) => {
                if (!dateTimeLocal) return null;
                const date = new Date(dateTimeLocal);
                return date.toISOString();
            };

            const payload = {
                title: data.title,
                description: data.description,
                location: data.location,
                date_start: toISOWithTimezone(data.dateStart),
                date_end: data.dateEnd ? toISOWithTimezone(data.dateEnd) : null,
                price: data.price || '0',
                max_participants: data.maxParticipants || null,
                regionId: data.regionId || null,
                imageUrl: imageUrl
            };

            await api.put(`/events/${event.id}`, payload);

            setUploadStatus('Selesai!');
            toast.success("Event berhasil diperbarui! 🏕️");
            queryClient.invalidateQueries({ queryKey: ['event', event.id] });
            queryClient.invalidateQueries({ queryKey: ['events'] });

            navigate(`/e/${event.id}`);

        } catch (error) {
            console.error(error);
            toast.error("Gagal memperbarui event: " + (error instanceof Error ? error.message : "Error unknown"));
        } finally {
            setIsSubmitting(false);
            setUploadStatus('');
        }
    };

    const currentCover = imagePreview || event?.imageUrl;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </main>
                <Footer />
            </div>
        );
    }

    // Event not found
    if (!event) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Event tidak ditemukan</h2>
                        <Button asChild>
                            <Link to="/events">Kembali ke Events</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Check if user is the organizer
    if (user?.id !== event.organizerId) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
                        <p className="text-gray-600 mb-6">Anda bukan penyelenggara event ini.</p>
                        <Button asChild>
                            <Link to={`/e/${id}`}>Kembali ke Detail Event</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-orange-100/40 to-yellow-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-100/40 to-orange-100/40 rounded-full blur-3xl" />
            </div>

            <Navbar />

            <main className="flex-1 pb-24 md:pb-12 relative z-10">
                <div className="container mx-auto px-4 pt-24 md:pt-32">
                    {/* Header */}
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="outline" size="icon" className="rounded-full bg-white border-gray-200 hover:bg-gray-50" asChild>
                                <Link to={`/e/${id}`}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Tent className="w-8 h-8 text-orange-500" />
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Edit Event</h1>
                                </div>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <Mountain className="w-4 h-4 text-gray-400" />
                                    Perbarui detail event camping
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Cover Image Upload */}
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <ImagePlus className="w-5 h-5 text-orange-500" />
                                        Poster Event
                                    </h2>

                                    {currentCover ? (
                                        <div className="relative group">
                                            <div
                                                className="aspect-[16/9] rounded-xl overflow-hidden cursor-pointer ring-2 ring-orange-500/20"
                                                onClick={() => setPreviewImage(currentCover)}
                                            >
                                                <img
                                                    src={currentCover}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            {imagePreview && (
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                            <label className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg cursor-pointer transition-all text-sm font-medium">
                                                Ganti Foto
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center aspect-[16/9] border-2 border-dashed border-orange-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group bg-gradient-to-br from-orange-50/30 to-amber-50/30">
                                            <div className="flex flex-col items-center gap-3 p-8">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                    <Tent className="w-10 h-10 text-orange-500" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-700">Upload Poster Event</p>
                                                    <p className="text-sm text-gray-500 mt-1">Foto camping terbaik kamu!</p>
                                                    <p className="text-xs text-orange-500 mt-2">PNG, JPG hingga 10MB</p>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-orange-500" />
                                        Informasi Event
                                    </h2>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Judul Event <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="contoh: Camping Bareng di Gunung Papandayan 🏕️"
                                                className="h-12 text-lg border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                {...form.register('title')}
                                            />
                                            {form.formState.errors.title && (
                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Deskripsi <span className="text-red-500">*</span>
                                            </label>
                                            <Textarea
                                                placeholder={`Jelaskan detail camping trip kamu...`}
                                                className="min-h-[200px] border-gray-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
                                                {...form.register('description')}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">💡 Markdown didukung untuk formatting</p>
                                            {form.formState.errors.description && (
                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date & Location */}
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-red-500" />
                                        Waktu & Lokasi Camp
                                    </h2>

                                    <div className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Calendar className="w-4 h-4 inline-block mr-1 text-orange-500" />
                                                    Berangkat <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="datetime-local"
                                                    className="h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                    {...form.register('dateStart')}
                                                />
                                                {form.formState.errors.dateStart && (
                                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.dateStart.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Calendar className="w-4 h-4 inline-block mr-1 text-gray-400" />
                                                    Pulang <span className="text-gray-400 text-xs">(Opsional)</span>
                                                </label>
                                                <Input
                                                    type="datetime-local"
                                                    className="h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                    {...form.register('dateEnd')}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <TreePine className="w-4 h-4 inline-block mr-1 text-green-600" />
                                                Lokasi Camp <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="contoh: Camping Ground Ranca Upas, Ciwidey"
                                                className="h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                {...form.register('location')}
                                            />
                                            {form.formState.errors.location && (
                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Region Selector */}
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                <div className="p-6">
                                    <div className="mt-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Globe className="w-4 h-4 inline-block mr-1 text-blue-500" />
                                            Region Komunitas <span className="text-gray-400 text-xs">(Opsional)</span>
                                        </label>
                                        <RegionSelector
                                            value={form.watch('regionId')}
                                            onChange={(val) => form.setValue('regionId', val || '')}
                                            showLabel={false}
                                            placeholder="Pilih Region Komunitas (Opsional)"
                                            className="w-full"
                                            variant="default"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Acara ini akan muncul di halaman komunitas region tersebut</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket & Capacity */}
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-orange-500" />
                                        Peserta & Biaya
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <DollarSign className="w-4 h-4 inline-block mr-1 text-green-600" />
                                                Biaya Patungan <span className="text-gray-400 text-xs">(Rp)</span>
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0 = Gratis / Patungan nanti"
                                                className="h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                {...form.register('price')}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Bisa diisi nanti setelah tahu pembagian</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Tent className="w-4 h-4 inline-block mr-1 text-orange-500" />
                                                Maksimal Peserta
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0 = Tidak dibatasi"
                                                className="h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                                                {...form.register('maxParticipants')}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Tergantung kapasitas campsite</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Preview & Actions */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-28 space-y-6">
                                {/* Preview Card */}
                                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                                        <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                                            <Mountain className="w-4 h-4" />
                                            Preview Event
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                            <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 relative">
                                                {currentCover ? (
                                                    <img src={currentCover} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-orange-300">
                                                        <Tent className="w-12 h-12" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 bg-white">
                                                <h4 className="font-bold text-gray-900 truncate">
                                                    {form.watch('title') || 'Nama Event Camp'}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-red-400" />
                                                    {form.watch('location') || 'Lokasi camping'}
                                                </p>
                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                                    <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {form.watch('dateStart')
                                                            ? new Date(form.watch('dateStart') as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : 'Tanggal'}
                                                    </span>
                                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                        {(() => {
                                                            const price = form.watch('price') || '';
                                                            return price && parseInt(price as string) > 0
                                                                ? `Rp ${parseInt(price as string).toLocaleString('id-ID')}`
                                                                : 'GRATIS';
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isSubmitting}
                                    className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {uploadStatus || 'Memproses...'}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Tent className="w-5 h-5" />
                                            Simpan Perubahan
                                        </span>
                                    )}
                                </Button>

                                {/* Cancel Button */}
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl"
                                    asChild
                                >
                                    <Link to={`/e/${id}`}>
                                        Batal
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

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
        </div>
    );
}
