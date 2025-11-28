"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Image as ImageIcon, MapPin, X, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AddActivityPage() {
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
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full" asChild>
                            <Link href="/profile">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-black text-gray-800">Tambah Aktifitas</h1>
                    </div>

                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            {/* Image Upload Area */}
                            <div className="space-y-2">
                                <Label>Foto Sampul</Label>
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

                            {/* Category & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Kategori</Label>
                                    <Select>
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
                                            type="date"
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
                                    placeholder="Contoh: Camping Ceria di Danau Toba"
                                    className="rounded-xl py-6 bg-gray-50 border-gray-200"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Jelaskan detail aktifitas..."
                                    className="rounded-xl bg-gray-50 border-gray-200 min-h-[120px] resize-none"
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

                            <div className="pt-4">
                                <Button className="w-full rounded-full py-6 text-lg shadow-lg gap-2">
                                    <Plus className="h-5 w-5" />
                                    Tambah Aktifitas
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
