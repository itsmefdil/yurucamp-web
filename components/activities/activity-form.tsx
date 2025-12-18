"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image as ImageIcon, MapPin, X, Plus, Calendar, Loader2, Trash2, UploadCloud } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { Activity } from "@/types/activity"
import Image from "next/image"
import dynamic from "next/dynamic"

const Editor = dynamic(() => import("@/components/ui/blocknote-editor"), { ssr: false })

interface ActivityFormProps {
    initialData?: Activity | null
    action: (formData: FormData) => Promise<{ error?: string }>
    buttonText?: string
}

export function ActivityForm({ initialData, action, buttonText = "Tambah Aktifitas" }: ActivityFormProps) {
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialData?.image_url || null)
    const [loading, setLoading] = useState(false)
    const [description, setDescription] = useState(initialData?.description || "")

    // State for additional images
    const [existingImages, setExistingImages] = useState<string[]>((initialData?.additional_images as string[]) || [])
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

            // Check if adding these files would exceed the limit
            const currentTotal = existingImages.length + newFiles.length
            if (currentTotal + files.length > 10) {
                toast.error("Maksimal 10 foto tambahan")
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
                return
            }

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
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
        setNewFilePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.set('description', description)

        newFiles.forEach(file => {
            formData.append('additional_images', file)
        })

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
            if (error instanceof Error && error.message === "NEXT_REDIRECT") {
                // Ignore redirect error
                return
            }
            console.error("Error submitting form:", error)
            toast.error("Terjadi kesalahan")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Cover Image Area */}
            <div
                className="group relative w-full h-[30vh] md:h-[40vh] bg-gray-100 rounded-3xl overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
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
                            alt="Cover"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 md:bg-black/0 md:group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="bg-white/90 hover:bg-white text-gray-900 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 shadow-lg backdrop-blur-sm"
                            >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Ganti Cover
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <ImageIcon className="h-12 w-12 opacity-50" />
                        <span className="font-medium text-lg">Tambahkan Cover</span>
                    </div>
                )}
            </div>

            <div className="px-4 md:px-8 space-y-8">
                {/* Title Input */}
                <Input
                    id="title"
                    name="title"
                    placeholder="Judul Aktifitas..."
                    className="text-4xl md:text-5xl font-black border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-gray-300 h-auto py-2"
                    required
                    defaultValue={initialData?.title || ""}
                    autoComplete="off"
                />

                {/* Properties Grid */}
                <div className="grid gap-4 max-w-2xl">
                    {/* Date */}
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Tanggal
                        </div>
                        <Input
                            name="date"
                            type="date"
                            defaultValue={initialData?.date || ""}
                            className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9 w-auto"
                        />
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <MapPin className="h-4 w-4" />
                            Lokasi
                        </div>
                        <Input
                            name="location"
                            placeholder="Dimana lokasinya?"
                            className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9"
                            defaultValue={initialData?.location || ""}
                        />
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <UploadCloud className="h-4 w-4" /> {/* Using UploadCloud as generic icon or maybe Tag if available */}
                            Kategori
                        </div>
                        <Select name="category" defaultValue={initialData?.category || undefined}>
                            <SelectTrigger className="w-[200px] border-none shadow-none bg-transparent hover:bg-gray-50 focus:ring-0 px-2 h-9 text-left font-normal">
                                <SelectValue placeholder="Pilih..." />
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
                </div>

                <div className="h-px bg-gray-100 my-8" />

                {/* Editor */}
                <div className="min-h-[300px]">
                    <Editor
                        initialContent={initialData?.description || ""}
                        onChange={setDescription}
                    />
                </div>

                <div className="h-px bg-gray-100 my-8" />

                {/* Additional Images Gallery */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">
                            Galeri Foto <span className="text-sm font-normal text-gray-500 ml-2">({existingImages.length + newFiles.length}/10)</span>
                        </h3>
                        {existingImages.length + newFiles.length < 10 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Foto
                            </Button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleAdditionalImagesSelect}
                        />
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {existingImages.map((url, i) => (
                            <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100">
                                <Image
                                    src={url}
                                    alt={`Existing ${i}`}
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeExistingImage(i)}
                                    type="button"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        {newFilePreviews.map((preview, i) => (
                            <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100">
                                <Image
                                    src={preview}
                                    alt={`New ${i}`}
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeNewFile(i)}
                                    type="button"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        {existingImages.length === 0 && newFiles.length === 0 && (
                            <div
                                className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-200 transition-all"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                <span className="text-sm">Belum ada foto tambahan</span>
                            </div>
                        )}
                        {existingImages.length + newFiles.length >= 10 && (
                            <div className="col-span-full py-4 text-center text-sm text-yellow-600 bg-yellow-50 rounded-xl">
                                Maksimal 10 foto tercapai
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Action */}
                <div className="sticky bottom-6 flex justify-end pt-4">
                    <Button
                        type="submit"
                        className="rounded-full h-12 px-8 text-base font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                            <Plus className="h-5 w-5 mr-2" />
                        )}
                        {loading ? "Menyimpan..." : buttonText}
                    </Button>
                </div>
            </div>
        </form>
    )
}
