"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image as ImageIcon, MapPin, X, Plus, Calendar, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Activity } from "@/types/activity"

interface ActivityFormProps {
    initialData?: Activity | null
    action: (formData: FormData) => Promise<{ error?: string }>
    buttonText?: string
}

export function ActivityForm({ initialData, action, buttonText = "Tambah Aktifitas" }: ActivityFormProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(initialData?.image_url || null)
    const [loading, setLoading] = useState(false)
    const [additionalImages, setAdditionalImages] = useState<string[]>((initialData?.additional_images as string[]) || [])

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

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
        <Card className="border-none shadow-lg bg-white overflow-hidden">
            <form onSubmit={handleSubmit}>
                <CardContent className="p-8 space-y-6">
                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <Label>Foto Sampul</Label>
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
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 rounded-full h-8 w-8"
                                        onClick={() => {
                                            setSelectedImage(null)
                                            // Reset file input
                                            const fileInput = document.getElementById('image-upload') as HTMLInputElement
                                            if (fileInput) fileInput.value = ''
                                        }}
                                        type="button"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <label htmlFor="image-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Klik untuk upload foto sampul</p>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Additional Images */}
                    <div className="space-y-2">
                        <Label>Foto Tambahan (Maksimal 5)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors">
                                    <input
                                        name="additional_images"
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () => {
                                                    const img = document.getElementById(`preview-${i}`) as HTMLImageElement
                                                    if (img) img.src = reader.result as string
                                                    const placeholder = document.getElementById(`placeholder-${i}`)
                                                    if (placeholder) placeholder.style.display = 'none'
                                                    img.style.display = 'block'
                                                }
                                                reader.readAsDataURL(file)
                                            } else {
                                                const img = document.getElementById(`preview-${i}`) as HTMLImageElement
                                                if (img) {
                                                    img.src = ''
                                                    img.style.display = 'none'
                                                }
                                                const placeholder = document.getElementById(`placeholder-${i}`)
                                                if (placeholder) placeholder.style.display = 'flex'
                                            }
                                        }}
                                    />
                                    <div id={`placeholder-${i}`} className="flex flex-col items-center justify-center pointer-events-none" style={{ display: additionalImages[i] ? 'none' : 'flex' }}>
                                        <Plus className="h-6 w-6 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-400">Foto {i + 1}</span>
                                    </div>
                                    <img
                                        id={`preview-${i}`}
                                        src={additionalImages[i] || ""}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                        style={{ display: additionalImages[i] ? 'block' : 'none' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Select name="category" defaultValue={initialData?.category || undefined}>
                                <SelectTrigger className="rounded-xl py-6 bg-gray-50 border-gray-200">
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
                        <div className="space-y-2">
                            <Label htmlFor="date">Tanggal</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    defaultValue={initialData?.date || ""}
                                    className="rounded-xl pl-10 py-6 bg-gray-50 border-gray-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Judul Aktifitas</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Contoh: Camping Ceria di Danau Toba"
                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                            required
                            defaultValue={initialData?.title || ""}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Jelaskan detail aktifitas..."
                            className="rounded-xl bg-gray-50 border-gray-200 min-h-[120px] resize-none"
                            defaultValue={initialData?.description || ""}
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Lokasi</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                id="location"
                                name="location"
                                placeholder="Cari lokasi..."
                                className="rounded-xl pl-10 py-6 bg-gray-50 border-gray-200"
                                defaultValue={initialData?.location || ""}
                            />
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
                </CardContent>
            </form>
        </Card>
    )
}
