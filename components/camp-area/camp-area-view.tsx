"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Search } from "lucide-react"
import Link from "next/link"

export function CampAreaView() {
    const [searchQuery, setSearchQuery] = useState("")

    const campAreas = Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        name: `Camp Area ${i + 1}`,
        location: `Lokasi ${i + 1}, Jawa Barat`,
        rating: 4.8,
        description: "Tempat camping yang nyaman dengan fasilitas lengkap. Cocok untuk keluarga dan pemula. Pemandangan indah dan udara sejuk."
    }))

    const filteredCampAreas = campAreas.filter(camp =>
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="container mx-auto py-8 px-4 pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary">Temukan Camp Area</h1>
                <Button className="w-full md:w-auto rounded-full shadow-md" asChild>
                    <Link href="/tambah-camp-area">Tambah Lokasi</Link>
                </Button>
            </div>

            {/* Search Form */}
            <div className="relative max-w-xl mx-auto mb-12">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Cari nama camp area atau lokasi..."
                        className="pl-10 py-6 rounded-full shadow-sm border-gray-200 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                {filteredCampAreas.map((camp) => (
                    <Card key={camp.id} className="bg-white hover:-translate-y-1 transition-transform duration-300">
                        <div className="aspect-[4/3] bg-blue-100 animate-pulse rounded-t-3xl" />
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">{camp.name}</CardTitle>
                                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="text-sm font-bold">{camp.rating}</span>
                                </div>
                            </div>
                            <CardDescription className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {camp.location}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {camp.description}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full rounded-full text-lg py-6 shadow-md" asChild>
                                <Link href={`/camp-area/${camp.id}`}>Lihat Detail</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {filteredCampAreas.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Tidak ada camp area yang ditemukan.
                    </div>
                )}
            </div>

            {/* Pagination Scroll Placeholder */}
            <div className="flex justify-center py-8">
                <Button variant="outline" className="w-full md:w-auto">Muat Lebih Banyak</Button>
            </div>
        </div>
    )
}
