import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, Wifi, Car, Coffee, Tent, Info, Share2, Heart } from "lucide-react"
import Image from "next/image"

export default function CampAreaDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 pb-24 md:pb-12">
                {/* Hero Image */}
                <div className="relative h-[40vh] md:h-[60vh] w-full bg-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                    {/* Placeholder for actual image */}
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-300">
                        <span className="text-4xl font-bold opacity-50">Camp Area Image {params.id}</span>
                    </div>

                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700">
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-red-500">
                            <Heart className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20 container mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-white/90 mb-2">
                                    <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-current" /> 4.8
                                    </span>
                                    <span className="text-sm font-medium flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> Jawa Barat
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
                                    Pine Forest Camp {params.id}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Main Content */}
                        <div className="space-y-8">
                            {/* Description */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tentang Tempat Ini</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    Nikmati pengalaman camping yang tak terlupakan di tengah hutan pinus yang asri.
                                    Udara sejuk dan pemandangan yang memanjakan mata akan membuat liburan anda semakin berkesan.
                                    Cocok untuk keluarga, pasangan, maupun solo camper.
                                </p>
                            </section>

                            {/* Facilities */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Fasilitas</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { icon: Wifi, label: "Free Wifi" },
                                        { icon: Car, label: "Parkir Luas" },
                                        { icon: Coffee, label: "Kantin" },
                                        { icon: Tent, label: "Sewa Tenda" },
                                        { icon: Info, label: "Pusat Informasi" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <item.icon className="h-6 w-6 text-primary" />
                                            <span className="font-medium text-gray-700">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Map Placeholder */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Lokasi</h2>
                                <div className="aspect-video w-full bg-gray-200 rounded-3xl flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <span>Peta Lokasi</span>
                                    </div>
                                </div>
                            </section>

                            {/* Reviews */}
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Ulasan (128)</h2>
                                    <Button variant="link" className="text-primary">Lihat Semua</Button>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <Card key={i} className="border-none shadow-sm bg-white">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>U{i}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800">Pengunjung {i}</h4>
                                                            <span className="text-xs text-muted-foreground">Minggu lalu</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <Star className="h-4 w-4 fill-current" />
                                                        <span className="font-bold">5.0</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600">
                                                    Tempatnya sangat bersih dan nyaman. Fasilitas lengkap, toilet bersih.
                                                    Sangat recommended untuk camping ceria bersama keluarga.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
