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
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left max-w-2xl text-gray-800">
                            <div className="inline-block mb-4 px-4 py-1.5 text-sm font-bold bg-orange-100 text-orange-600 rounded-full transition-colors">
                                Adventure Awaits
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
                                Temukan <br />
                                <span className="text-orange-500">Camp Area</span> Impianmu
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Jelajahi keindahan alam Indonesia ala Yuru Camp. Dari pegunungan sejuk hingga pantai yang tenang.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-base px-8 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all" asChild>
                                    <Link href="/dashboard/add-camp-area">
                                        + Tambah Lokasi
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block relative w-80 h-80 lg:w-96 lg:h-96">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
                            <div className="absolute inset-4 bg-white/40 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-10 pb-24">
                {/* Search & Action Bar */}
                <div className="bg-white rounded-[2rem] shadow-xl p-4 mb-12 flex flex-col md:flex-row gap-4 items-center border border-orange-100/50">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Cari lokasi camping..."
                            className="pl-14 py-7 rounded-2xl border-orange-100 bg-orange-50/50 focus:bg-white focus:border-orange-300 focus:ring-orange-200 text-base transition-all"
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
                                {/* Decorative Card Offset */}
                                <div className="absolute inset-0 bg-orange-200/60 rounded-[2rem] transform translate-y-2 translate-x-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />

                                <Card className="relative bg-[#FFFCF8] border-2 border-orange-100/50 shadow-sm rounded-[2rem] overflow-hidden hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
                                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                        {camp.image_url ? (
                                            <Image
                                                src={camp.image_url}
                                                alt={camp.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-200">
                                                <MapPin className="h-12 w-12 opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                        <div className="absolute top-4 left-4">
                                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold text-orange-500 shadow-sm border-none">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span>New</span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <div className="flex items-center gap-2 text-xs font-bold mb-1 opacity-95">
                                                <span className="flex items-center gap-1.5 truncate max-w-[200px] bg-black/20 backdrop-blur-md px-2 py-1 rounded-full text-white/90">
                                                    <MapPin className="h-3.5 w-3.5 text-yellow-300" />
                                                    {camp.location || "Lokasi tidak tersedia"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-1">
                                        <h3 className="text-xl font-black text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors leading-tight">
                                            {camp.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                                            {camp.description || "Tidak ada deskripsi tersedia."}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="p-6 pt-0 flex items-center justify-between mt-auto">
                                        <div className="flex flex-col pt-4 border-t border-orange-100 w-full">
                                            <div className="flex justify-between items-end w-full">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Mulai dari</span>
                                                    <span className="text-lg font-black text-gray-800">
                                                        Rp {camp.price?.toLocaleString('id-ID') || "0"}
                                                    </span>
                                                </div>
                                                <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
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
