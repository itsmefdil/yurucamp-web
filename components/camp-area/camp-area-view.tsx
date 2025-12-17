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

        <div className="min-h-screen bg-[#fdfbf7] relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            {/* Hero Section */}
            <div className="relative bg-green-900 overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left max-w-2xl text-white">
                            <div className="inline-block mb-4 px-4 py-1 text-sm font-medium bg-white/20 text-white hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                                Adventure Awaits
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                                Temukan <br />
                                <span className="text-yellow-300">Camp Area</span> Impianmu
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
                                Jelajahi keindahan alam Indonesia ala Yuru Camp. Dari pegunungan sejuk hingga pantai yang tenang.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Button size="lg" className="rounded-full bg-white text-green-900 hover:bg-gray-100 font-bold text-base px-8 shadow-lg" asChild>
                                    <Link href="/dashboard/add-camp-area">
                                        + Tambah Lokasi
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block relative w-80 h-80 lg:w-96 lg:h-96">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl" />
                            {/* Optional: We could add a camping illustration here later */}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-10 pb-24">
                {/* Search & Action Bar */}
                <div className="bg-white rounded-2xl shadow-xl p-4 mb-12 flex flex-col md:flex-row gap-4 items-center border border-gray-100">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Cari lokasi camping..."
                            className="pl-12 py-6 rounded-xl border-gray-200 bg-gray-50 focus-visible:ring-green-600 focus-visible:border-green-600 text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCampAreas.map((camp) => (
                        <div key={camp.id} className="group relative h-full">
                            <Link href={`/camp-area/${camp.id}`} className="block h-full">
                                <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-3xl h-full flex flex-col group-hover:-translate-y-1">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                        {camp.image_url ? (
                                            <Image
                                                src={camp.image_url}
                                                alt={camp.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <MapPin className="h-12 w-12 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                        <div className="absolute top-4 left-4">
                                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-orange-500 shadow-sm border-none">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span>New</span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <div className="flex items-center gap-2 text-xs font-medium mb-1 opacity-90">
                                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                                    <MapPin className="h-3 w-3" />
                                                    {camp.location || "Lokasi tidak tersedia"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                            {camp.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                                            {camp.description || "Tidak ada deskripsi tersedia."}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-gray-50 mt-auto">
                                        <div className="flex flex-col pt-4">
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Mulai dari</span>
                                            <span className="text-base font-bold text-primary">
                                                Rp {camp.price?.toLocaleString('id-ID') || "0"}
                                            </span>
                                        </div>
                                        <div className="pt-4">
                                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>

                {filteredCampAreas.length === 0 && (
                    <div className="text-center py-24">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-50 mb-6">
                            <Search className="h-10 w-10 text-orange-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak ditemukan</h3>
                        <p className="text-gray-500">Coba kata kunci lain atau tambahkan lokasi baru.</p>
                    </div>
                )}

                {/* Pagination Placeholder */}
                {filteredCampAreas.length > 0 && (
                    <div className="flex justify-center mt-16">
                        <Button variant="outline" className="rounded-full px-8 border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
                            Muat Lebih Banyak
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
