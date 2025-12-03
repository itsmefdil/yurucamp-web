"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CampArea {
    id: string
    name: string
    location: string | null
    description: string | null
    image_url: string | null
    price: number | null
}

interface CampAreaViewProps {
    initialCampAreas: CampArea[]
}

export function CampAreaView({ initialCampAreas }: CampAreaViewProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredCampAreas = initialCampAreas.filter(camp =>
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (camp.location && camp.location.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="container mx-auto px-4 pt-24 md:pt-32 pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary">Temukan Camp Area</h1>
                <Button className="w-full md:w-auto rounded-full shadow-md" asChild>
                    <Link href="/dashboard/add-camp-area">Tambah Lokasi</Link>
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
                    <Card key={camp.id} className="bg-white hover:-translate-y-1 transition-transform duration-300 overflow-hidden">
                        <div className="relative aspect-[4/3] bg-gray-100">
                            {camp.image_url ? (
                                <Image
                                    src={camp.image_url}
                                    alt={camp.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <MapPin className="h-12 w-12 opacity-20" />
                                </div>
                            )}
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl line-clamp-1">{camp.name}</CardTitle>
                                {/* Rating placeholder - could be real later */}
                                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="text-sm font-bold">New</span>
                                </div>
                            </div>
                            <CardDescription className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {camp.location || "Lokasi tidak tersedia"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {camp.description || "Tidak ada deskripsi"}
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
