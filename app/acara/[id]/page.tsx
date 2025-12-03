import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Clock, Share2, Heart, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export default function EventDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">

            <main className="flex-1 pb-24 md:pb-12">
                {/* Hero Section */}
                <div className="relative bg-primary/5 pt-32 pb-12 md:py-32 px-4">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Event Image */}
                            <div className="w-full md:w-1/2 aspect-video bg-gray-200 rounded-3xl overflow-hidden shadow-lg relative group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-300">
                                    <span className="text-4xl font-bold opacity-50">Event Image {params.id}</span>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 shadow-sm">
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                    <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-red-500 shadow-sm">
                                        <Heart className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Event Info */}
                            <div className="w-full md:w-1/2 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 text-primary font-bold mb-2 uppercase tracking-wider text-sm">
                                        <span className="bg-orange-100 px-3 py-1 rounded-full">Gathering</span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 leading-tight">
                                        Gathering Nasional YuruCamp 2024 #{params.id}
                                    </h1>
                                    <div className="flex flex-col gap-3 text-gray-600">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">20 - 22 November 2024</p>
                                                <p className="text-sm">Jumat - Minggu</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Bumi Perkemahan Cibubur</p>
                                                <p className="text-sm">Jakarta Timur, DKI Jakarta</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">120 Peserta</p>
                                                <p className="text-sm">Kuota tersisa 30 orang</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm text-gray-500">Diselenggarakan oleh</p>
                                        <p className="font-bold text-gray-900">Admin YuruCamp</p>
                                    </div>
                                </div>

                                <div className="hidden md:flex gap-4">
                                    <Button size="lg" className="flex-1 rounded-full text-lg py-6 shadow-lg">
                                        Daftar Sekarang
                                    </Button>
                                    <Button size="lg" variant="outline" className="flex-1 rounded-full text-lg py-6 border-2">
                                        Hubungi Panitia
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Description */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-primary rounded-full" />
                                    Tentang Acara
                                </h2>
                                <div className="prose prose-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Halo Sobat Campers! YuruCamp Indonesia kembali mengadakan Gathering Nasional tahunan.
                                        Kali ini kita akan berkumpul di Bumi Perkemahan Cibubur untuk berbagi cerita, pengalaman,
                                        dan tentunya camping bareng!
                                    </p>
                                    <p>
                                        Acara ini terbuka untuk umum, baik pemula maupun yang sudah berpengalaman.
                                        Akan ada banyak kegiatan seru seperti workshop survival, sharing session, games,
                                        dan api unggun. Jangan sampai ketinggalan ya!
                                    </p>
                                </div>
                            </section>

                            {/* Itinerary */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-blue-500 rounded-full" />
                                    Jadwal Kegiatan
                                </h2>
                                <div className="space-y-6">
                                    {[
                                        { time: "08:00 - 10:00", title: "Registrasi Ulang", desc: "Peserta melakukan daftar ulang dan pengambilan merchandise." },
                                        { time: "10:00 - 12:00", title: "Opening Ceremony", desc: "Sambutan panitia dan perkenalan peserta." },
                                        { time: "13:00 - 15:00", title: "Workshop: Basic Survival", desc: "Belajar teknik dasar bertahan hidup di alam bebas." },
                                        { time: "19:00 - 21:00", title: "Api Unggun & BBQ", desc: "Malam keakraban sambil menikmati hidangan BBQ." },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 md:gap-6 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
                                                <div className="w-0.5 h-full bg-gray-200 my-2 group-hover:bg-primary/30 transition-colors" />
                                            </div>
                                            <div className="pb-8">
                                                <div className="flex items-center gap-2 text-sm font-bold text-primary mb-1">
                                                    <Clock className="h-4 w-4" />
                                                    {item.time}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                                                <p className="text-gray-600">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Requirements */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-green-500 rounded-full" />
                                    Persyaratan
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        "Membawa tenda sendiri (atau sewa)",
                                        "Membawa perlengkapan pribadi",
                                        "Obat-obatan pribadi",
                                        "Pakaian ganti secukupnya",
                                        "Tumbler / botol minum",
                                        "Semangat membara!"
                                    ].map((req, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            <span className="text-gray-700 font-medium">{req}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Participants */}
                            <Card className="border-none shadow-lg bg-white rounded-3xl p-6">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-xl font-bold flex justify-between items-center">
                                        Peserta
                                        <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">120/150</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <Avatar key={i} className="h-10 w-10 border-2 border-white shadow-sm -ml-2 first:ml-0 hover:z-10 hover:scale-110 transition-transform cursor-pointer">
                                                <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">U{i}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border-2 border-white shadow-sm -ml-2 z-0">
                                            +108
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Bergabunglah dengan teman-teman baru!
                                    </p>
                                    <Button variant="outline" className="w-full rounded-full">Lihat Semua Peserta</Button>
                                </CardContent>
                            </Card>

                            {/* Related Events */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-lg px-2">Acara Lainnya</h3>
                                {[1, 2].map((i) => (
                                    <div key={i} className="group cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                                                    Hiking Ceria Gunung Prau
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1">12 Des 2024 • Wonosobo</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 md:hidden flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-8">
                <div>
                    <p className="text-sm text-gray-500">Biaya Pendaftaran</p>
                    <p className="text-xl font-bold text-primary">Rp 150.000</p>
                </div>
                <Button className="rounded-full px-8 shadow-md">
                    Daftar
                </Button>
            </div>

            <Footer />
        </div>
    )
}
