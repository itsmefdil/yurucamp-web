"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Image as ImageIcon, MapPin, X, Plus, Wifi, Car, Coffee, Tent, Info, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createCampArea } from "@/app/camp-area/actions"
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

    return (
        <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Upload Area */}
                        <div className="space-y-2">
                            <Label>Foto Utama</Label>
                            <div className="relative aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors group">
                                <input
                                    id="image-upload"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />

                                        {/* Overlay to change image */}
                                        <label
                                            htmlFor="image-upload"
                                            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                        >
                                            <ImageIcon className="h-8 w-8 mb-2" />
                                            <span className="font-medium">Ganti Foto</span>
                                        </label>

                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 rounded-full h-8 w-8 z-10 hover:scale-110 transition-transform"
                                            onClick={() => {
                                                setSelectedImage(null)
                                                const input = document.getElementById('image-upload') as HTMLInputElement
                                                if (input) input.value = ''
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <label htmlFor="image-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">Klik untuk upload foto</p>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Additional Images */}
                        <div className="space-y-2">
                            <Label>Foto Tambahan</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {additionalImagePreviews.map((preview, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 border border-gray-200">
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
                                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                    <Plus className="h-6 w-6 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500 font-medium">Tambah</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleAdditionalImagesUpload}
                                        name="additional_images"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Camp Area</Label>
                            <Input id="name" name="name" placeholder="Contoh: Pine Forest Camp" className="rounded-xl py-6 bg-gray-50 border-gray-200" required defaultValue={initialData?.name} />
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Lokasi</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input id="location" name="location" placeholder="Cari lokasi..." className="rounded-xl pl-10 py-6 bg-gray-50 border-gray-200" required defaultValue={initialData?.location} />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Jelaskan keunggulan tempat ini..."
                                className="rounded-xl bg-gray-50 border-gray-200 min-h-[120px] resize-none"
                                required
                                defaultValue={initialData?.description}
                            />
                        </div>

                        {/* Facilities */}
                        <div className="space-y-3">
                            <Label>Fasilitas</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <Checkbox id="wifi" name="wifi" defaultChecked={hasFacility("Wifi")} />
                                    <Label htmlFor="wifi" className="flex items-center gap-2 cursor-pointer font-normal">
                                        <Wifi className="h-4 w-4 text-primary" /> Free Wifi
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <Checkbox id="parking" name="parking" defaultChecked={hasFacility("Parkir Luas")} />
                                    <Label htmlFor="parking" className="flex items-center gap-2 cursor-pointer font-normal">
                                        <Car className="h-4 w-4 text-primary" /> Parkir Luas
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <Checkbox id="canteen" name="canteen" defaultChecked={hasFacility("Kantin")} />
                                    <Label htmlFor="canteen" className="flex items-center gap-2 cursor-pointer font-normal">
                                        <Coffee className="h-4 w-4 text-primary" /> Kantin
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <Checkbox id="tent" name="tent" />
                                    <Label htmlFor="tent" className="flex items-center gap-2 cursor-pointer font-normal">
                                        <Tent className="h-4 w-4 text-primary" /> Sewa Tenda
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <Checkbox id="info" name="info" />
                                    <Label htmlFor="info" className="flex items-center gap-2 cursor-pointer font-normal">
                                        <Info className="h-4 w-4 text-primary" /> Pusat Info
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price">Harga Mulai Dari</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500 font-bold">Rp</span>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    placeholder="50.000"
                                    className="rounded-xl pl-10 py-6 bg-gray-50 border-gray-200"
                                    required
                                    defaultValue={initialData?.price}
                                />
                                <span className="absolute right-3 top-3 text-gray-400 text-sm">/ malam</span>
                            </div>
                        </div>

                    </div>
                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="w-full rounded-full py-6 text-lg shadow-lg gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                            {loading ? "Menyimpan..." : buttonText}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
