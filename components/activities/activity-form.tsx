"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image as ImageIcon, MapPin, X, Plus, Calendar, Loader2, Trash2, UploadCloud } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { Activity } from "@/types/activity"
import Image from "next/image"

interface ActivityFormProps {
    initialData?: Activity | null
    action: (formData: FormData) => Promise<{ error?: string }>
    buttonText?: string
}

export function ActivityForm({ initialData, action, buttonText = "Tambah Aktifitas" }: ActivityFormProps) {
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData?.image_url || null)
    const [loading, setLoading] = useState(false)

    // State for additional images
    // For existing images (URLs)
    const [existingImages, setExistingImages] = useState<string[]>((initialData?.additional_images as string[]) || [])
    // For new file uploads
    const [newFiles, setNewFiles] = useState<File[]>([])
    const [newFilePreviews, setNewFilePreviews] = useState<string[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAdditionalImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            const newPreviews: string[] = []

            files.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setNewFilePreviews(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            })

            setNewFiles(prev => [...prev, ...files])
        }
        // Reset input so the same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
        setNewFilePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = (index: number) => {
        // Note: This only removes it from the UI view. 
        // The backend action needs to handle actual deletion if that's a requirement.
        // For "Add Activity", this array is empty anyway.
        // For "Edit Activity", we might need to handle this differently, but for now let's allow hiding it.
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        // Append new additional images manually
        newFiles.forEach(file => {
            formData.append('additional_images', file)
        })

        // Append kept existing images
        existingImages.forEach(url => {
            formData.append('kept_images', url)
        })

        try {
            const result = await action(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Berhasil disimpan!")
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast.error("Terjadi kesalahan")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
            <form onSubmit={handleSubmit}>
                <CardContent className="p-6 md:p-8 space-y-8">
                    {/* Cover Image Section */}
                    <div className="space-y-4">
                        <Label className="text-lg font-bold text-gray-800">Foto Sampul</Label>
                        <div
                            className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden hover:bg-gray-100 transition-all cursor-pointer group"
                            onClick={() => coverInputRef.current?.click()}
                        >
                            <input
                                ref={coverInputRef}
                                name="image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverImageChange}
                            />
                            {coverImagePreview ? (
                                <>
                                    <Image
                                        src={coverImagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-medium text-sm shadow-lg">
                                            Ganti Foto
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-4 right-4 rounded-full h-8 w-8 shadow-md z-10"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setCoverImagePreview(null)
                                            if (coverInputRef.current) coverInputRef.current.value = ''
                                        }}
                                        type="button"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="h-8 w-8" />
                                    </div>
                                    <p className="font-bold text-lg">Upload Foto Sampul</p>
                                    <p className="text-sm font-medium opacity-70">Klik untuk memilih foto</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Images Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-bold text-gray-800">Foto Tambahan</Label>
                            <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                                {existingImages.length + newFiles.length} Foto
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {/* Upload Button */}
                            <div
                                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-primary/50 hover:text-primary transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleAdditionalImagesSelect}
                                />
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold">Tambah Foto</span>
                            </div>

                            {/* Existing Images */}
                            {existingImages.map((url, i) => (
                                <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm">
                                    <Image
                                        src={url}
                                        alt={`Existing ${i}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-90 hover:scale-100"
                                        onClick={() => removeExistingImage(i)}
                                        type="button"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                                        Tersimpan
                                    </div>
                                </div>
                            ))}

                            {/* New File Previews */}
                            {newFilePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm ring-2 ring-primary/20">
                                    <Image
                                        src={preview}
                                        alt={`New ${i}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-90 hover:scale-100"
                                        onClick={() => removeNewFile(i)}
                                        type="button"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <div className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                                        Baru
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Kategori</Label>
                            <Select name="category" defaultValue={initialData?.category || undefined}>
                                <SelectTrigger className="rounded-xl h-12 bg-gray-50 border-gray-200 focus:ring-primary/20">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hiking">Hiking</SelectItem>
                                    <SelectItem value="camping">Camping</SelectItem>
                                    <SelectItem value="cooking">Memasak</SelectItem>
                                    <SelectItem value="fishing">Memancing</SelectItem>
                                    <SelectItem value="other">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="date" className="text-base font-semibold">Tanggal</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    defaultValue={initialData?.date || ""}
                                    className="rounded-xl pl-12 h-12 bg-gray-50 border-gray-200 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="title" className="text-base font-semibold">Judul Aktifitas</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Contoh: Camping Ceria di Danau Toba"
                            className="rounded-xl h-12 bg-gray-50 border-gray-200 focus:ring-primary/20 text-lg"
                            required
                            defaultValue={initialData?.title || ""}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-base font-semibold">Deskripsi</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Ceritakan pengalaman serumu, tips, atau hal menarik lainnya..."
                            className="rounded-xl bg-gray-50 border-gray-200 min-h-[150px] resize-none focus:ring-primary/20 leading-relaxed"
                            defaultValue={initialData?.description || ""}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="location" className="text-base font-semibold">Lokasi</Label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                id="location"
                                name="location"
                                placeholder="Cari atau masukkan lokasi..."
                                className="rounded-xl pl-12 h-12 bg-gray-50 border-gray-200 focus:ring-primary/20"
                                defaultValue={initialData?.location || ""}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            className="w-full rounded-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            ) : (
                                <Plus className="h-6 w-6 mr-2" />
                            )}
                            {loading ? "Menyimpan..." : buttonText}
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    )
}
