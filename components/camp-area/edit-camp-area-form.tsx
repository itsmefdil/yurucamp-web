"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Image as ImageIcon, MapPin, X, Plus, Wifi, Car, Coffee, Tent, Info, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { createCampArea } from "@/app/actions/camp-area"
import { toast } from "sonner"

interface EditCampAreaFormProps {
    initialData: any
    action: (formData: FormData) => Promise<{ error?: string } | void>
    buttonText?: string
}

export function EditCampAreaForm({ initialData, action, buttonText = "Simpan Perubahan" }: EditCampAreaFormProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(initialData?.image_url || null)
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>(initialData?.additional_images || [])
    const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>(initialData?.additional_images || [])
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(false)

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

    const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            // Filter out files that are not images or are too large (optional, but good practice)
            const validFiles = files.filter(file => file.type.startsWith('image/'))

            validFiles.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setAdditionalImagePreviews(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            })

            setAdditionalFiles(prev => [...prev, ...validFiles])
        }
        // Reset input so same files can be selected again if needed (though unlikely for multiple)
        e.target.value = ''
    }

    const removeAdditionalImage = (index: number) => {
        // Check if it's an existing image or a new file
        if (index < existingAdditionalImages.length) {
            // It's an existing image
            setExistingAdditionalImages(prev => prev.filter((_, i) => i !== index))
            setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
        } else {
            // It's a new file
            const newFileIndex = index - existingAdditionalImages.length
            setAdditionalFiles(prev => prev.filter((_, i) => i !== newFileIndex))
            setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        // Append additional files
        additionalFiles.forEach(file => {
            formData.append('additional_images', file)
        })

        // Append kept existing images
        existingAdditionalImages.forEach(url => {
            formData.append('kept_images', url)
        })

        try {
            const result = await action(formData)
            if (result && 'error' in result && result.error) {
                // Handle error (maybe show toast)
                console.error(result.error)
                toast.error(result.error)
            } else {
                toast.success("Camp Area berhasil disimpan!")
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast.error("Terjadi kesalahan saat menyimpan")
        } finally {
            setLoading(false)
        }
    }

    const hasFacility = (facility: string) => {
        return initialData?.facilities?.includes(facility)
    }

    // Refs for file inputs
    const coverInputRef = useRef<HTMLInputElement>(null)
    const galleryInputRef = useRef<HTMLInputElement>(null)

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Cover Image Area */}
            <div
                className="group relative w-full h-[30vh] md:h-[40vh] bg-gray-100 rounded-3xl overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => coverInputRef.current?.click()}
            >
                <input
                    ref={coverInputRef}
                    id="image-upload"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />
                {selectedImage ? (
                    <>
                        <img src={selectedImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
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
                    id="name"
                    name="name"
                    placeholder="Nama Camp Area..."
                    className="text-4xl md:text-5xl font-black border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-gray-300 h-auto py-2"
                    required
                    autoComplete="off"
                    defaultValue={initialData?.name}
                />

                {/* Properties Grid */}
                <div className="grid gap-4 max-w-2xl">
                    {/* Location */}
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <MapPin className="h-4 w-4" />
                            Lokasi
                        </div>
                        <Input
                            id="location"
                            name="location"
                            placeholder="Dimana lokasinya?"
                            className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9"
                            required
                            defaultValue={initialData?.location}
                        />
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-4 text-gray-600">
                        <div className="w-32 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <span className="font-bold text-xs bg-gray-200 rounded px-1">Rp</span>
                            Harga
                        </div>
                        <div className="flex items-center flex-1 gap-2">
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                placeholder="50000"
                                className="flex-1 border-none shadow-none bg-transparent hover:bg-gray-50 focus-visible:ring-0 px-2 h-9"
                                required
                                defaultValue={initialData?.price}
                            />
                            <span className="text-sm text-gray-400 whitespace-nowrap">/ malam</span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-8" />

                {/* Description */}
                <div className="min-h-[200px]">
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Jelaskan keunggulan dan detail tempat ini..."
                        className="min-h-[200px] border-none shadow-none resize-none text-lg leading-relaxed focus-visible:ring-0 px-0 placeholder:text-gray-300"
                        required
                        defaultValue={initialData?.description}
                    />
                </div>

                <div className="h-px bg-gray-100 my-8" />

                {/* Facilities */}
                <div className="space-y-4">
                    <Label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Tent className="h-5 w-5" />
                        Fasilitas
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group">
                            <Checkbox name="wifi" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" defaultChecked={hasFacility('Wifi')} />
                            <div className="flex items-center gap-2">
                                <Wifi className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">Free Wifi</span>
                            </div>
                        </label>
                        <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group">
                            <Checkbox name="parking" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" defaultChecked={hasFacility('Parkir Luas')} />
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">Parkir Luas</span>
                            </div>
                        </label>
                        <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group">
                            <Checkbox name="canteen" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" defaultChecked={hasFacility('Kantin')} />
                            <div className="flex items-center gap-2">
                                <Coffee className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">Kantin</span>
                            </div>
                        </label>
                        <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group">
                            <Checkbox name="tent" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" defaultChecked={hasFacility('Sewa Tenda')} />
                            <div className="flex items-center gap-2">
                                <Tent className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">Sewa Tenda</span>
                            </div>
                        </label>
                        <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer group">
                            <Checkbox name="info" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" defaultChecked={hasFacility('Pusat Info')} />
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-gray-500 group-hover:text-primary" />
                                <span className="font-medium text-gray-700 group-hover:text-gray-900">Pusat Info</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-8" />

                {/* Gallery */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Galeri Foto</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => galleryInputRef.current?.click()}
                            className="rounded-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Foto
                        </Button>
                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleAdditionalImagesUpload}
                            name="additional_images"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {additionalImagePreviews.map((preview, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100">
                                <img src={preview} alt={`Additional ${i}`} className="w-full h-full object-cover" />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeAdditionalImage(i)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        {additionalImagePreviews.length === 0 && (
                            <div
                                className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-200 transition-all"
                                onClick={() => galleryInputRef.current?.click()}
                            >
                                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                <span className="text-sm">Belum ada foto tambahan</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Action */}
                <div className="sticky bottom-6 flex justify-end pt-4 pointer-events-none">
                    <Button
                        type="submit"
                        className="pointer-events-auto rounded-full h-12 px-8 text-base font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
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
