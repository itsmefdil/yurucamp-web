"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Image as ImageIcon, MapPin, X, Plus, Wifi, Car, Coffee, Tent, Info } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function AddCampAreaForm() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/camp-area">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-black text-gray-800">Tambah Camp Area</h1>
            </div>

            <Card className="border-none shadow-lg bg-white overflow-hidden">
                <CardContent className="p-8 space-y-6">
                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <Label>Foto Utama</Label>
                        <div className="relative aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden hover:bg-gray-100 transition-colors group">
                            {selectedImage ? (
                                <>
                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 rounded-full h-8 w-8"
                                        onClick={() => setSelectedImage(null)}
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
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Camp Area</Label>
                        <Input
                            id="name"
                            placeholder="Contoh: Pine Forest Camp"
                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Lokasi</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                id="location"
                                placeholder="Cari lokasi..."
                                className="rounded-xl pl-10 py-6 bg-gray-50 border-gray-200"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                            id="description"
                            placeholder="Jelaskan keunggulan tempat ini..."
                            className="rounded-xl bg-gray-50 border-gray-200 min-h-[120px] resize-none"
                        />
                    </div>

                    {/* Facilities */}
                    <div className="space-y-3">
                        <Label>Fasilitas</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <Checkbox id="wifi" />
                                <Label htmlFor="wifi" className="flex items-center gap-2 cursor-pointer font-normal">
                                    <Wifi className="h-4 w-4 text-primary" /> Free Wifi
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <Checkbox id="parking" />
                                <Label htmlFor="parking" className="flex items-center gap-2 cursor-pointer font-normal">
                                    <Car className="h-4 w-4 text-primary" /> Parkir Luas
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <Checkbox id="canteen" />
                                <Label htmlFor="canteen" className="flex items-center gap-2 cursor-pointer font-normal">
                                    <Coffee className="h-4 w-4 text-primary" /> Kantin
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <Checkbox id="tent" />
                                <Label htmlFor="tent" className="flex items-center gap-2 cursor-pointer font-normal">
                                    <Tent className="h-4 w-4 text-primary" /> Sewa Tenda
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <Checkbox id="info" />
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
                                type="number"
                                placeholder="50.000"
                                className="rounded-xl pl-10 py-6 bg-gray-50 border-gray-200"
                            />
                            <span className="absolute right-3 top-3 text-gray-400 text-sm">/ malam</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="w-full rounded-full py-6 text-lg shadow-lg gap-2">
                            <Plus className="h-5 w-5" />
                            Tambah Camp Area
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
