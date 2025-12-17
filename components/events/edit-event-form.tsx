"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Image as ImageIcon, MapPin, Plus, Calendar, Clock, Users, Ticket, Save, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useTransition, useRef } from "react"
import { updateEvent, deleteEvent } from "@/app/actions/events"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EditEventFormProps {
    event: any
}

export function EditEventForm({ event }: EditEventFormProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(event.image_url)
    const [isPending, startTransition] = useTransition()
    const [isDeleting, startDeleteTransition] = useTransition()
    const coverInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateEvent(event.id, formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Berhasil! Acara berhasil diperbarui.")
            }
        })
    }

    const handleDelete = async () => {
        startDeleteTransition(async () => {
            const result = await deleteEvent(event.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Acara berhasil dihapus.")
            }
        })
    }

    // Helper to format date for datetime-local input
    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        const offset = date.getTimezoneOffset()
        const localDate = new Date(date.getTime() - (offset * 60 * 1000))
        return localDate.toISOString().slice(0, 16)
    }

    return (
        <form action={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-24">
            {/* Header / Back Button / Delete */}
            <div className="flex items-center justify-between px-4 md:px-0 pt-4 md:pt-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full" asChild>
                        <Link href={`/event/${event.id}`}>
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <h1 className="text-lg font-bold text-gray-400">Edit Acara</h1>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus acara ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Acara dan data terkait akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Cover Image Area */}
            <div
                className="group relative w-full h-[25vh] md:h-[40vh] bg-gray-100 md:rounded-3xl overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => coverInputRef.current?.click()}
            >
                <input
                    ref={coverInputRef}
                    name="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />
                {selectedImage ? (
                    <>
                        <img
                            src={selectedImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 text-xs"
                            >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Ganti Banner
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <ImageIcon className="h-12 w-12 opacity-50" />
                        <span className="font-medium text-lg text-center px-4">Tambahkan Banner Acara</span>
                    </div>
                )}
            </div>

            <div className="px-4 md:px-8 space-y-8">
                {/* Title Input */}
                <Input
                    id="title"
                    name="title"
                    defaultValue={event.title}
                    placeholder="Nama Acara..."
                    className="text-3xl md:text-5xl font-black border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-gray-300 h-auto py-2"
                    required
                    autoComplete="off"
                />

                {/* Properties Grid */}
                <div className="grid gap-6 max-w-3xl">
                    {/* Location */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600">
                        <div className="md:w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <MapPin className="h-4 w-4" />
                            Lokasi
                        </div>
                        <Input
                            name="location"
                            defaultValue={event.location}
                            placeholder="Dimana acara ini?"
                            className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9 p-0 md:p-2"
                            required
                        />
                    </div>

                    {/* Start Date */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600">
                        <div className="md:w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Mulai
                        </div>
                        <Input
                            name="date_start"
                            type="datetime-local"
                            defaultValue={formatDateForInput(event.date_start)}
                            className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9 w-auto p-0 md:p-2"
                            required
                        />
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600">
                        <div className="md:w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Clock className="h-4 w-4" />
                            Selesai
                        </div>
                        <Input
                            name="date_end"
                            type="datetime-local"
                            defaultValue={formatDateForInput(event.date_end)}
                            className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9 w-auto p-0 md:p-2"
                        />
                    </div>

                    {/* Price */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600">
                        <div className="md:w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Ticket className="h-4 w-4" />
                            Harga
                        </div>
                        <Input
                            name="price"
                            type="number"
                            defaultValue={event.price}
                            placeholder="0 (Gratis)"
                            className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9 p-0 md:p-2"
                        />
                    </div>

                    {/* Capacity */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600">
                        <div className="md:w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Users className="h-4 w-4" />
                            Kuota
                        </div>
                        <Input
                            name="max_participants"
                            type="number"
                            defaultValue={event.max_participants}
                            placeholder="Tidak terbatas"
                            className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9 p-0 md:p-2"
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-8" />

                {/* Description */}
                <div>
                    <Textarea
                        id="description"
                        name="description"
                        required
                        defaultValue={event.description}
                        placeholder="Jelaskan detail acara, itinerary, dan persyaratan..."
                        className="min-h-[300px] border-none shadow-none focus-visible:ring-0 resize-none text-lg leading-relaxed p-0 placeholder:text-gray-300"
                    />
                </div>

                {/* Submit Action */}
                <div className="fixed bottom-20 md:bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-0 flex justify-end z-40 pb-safe">
                    <Button
                        type="submit"
                        className="w-full md:w-auto rounded-full h-12 px-8 text-base font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 gap-2"
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </div>
        </form>
    )
}
