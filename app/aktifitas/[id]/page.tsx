import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, MapPin, Calendar, User } from "lucide-react"
import Image from "next/image"

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 pb-24 md:pb-12">
                {/* Hero Image */}
                <div className="relative h-[30vh] md:h-[50vh] w-full bg-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    {/* Placeholder for actual image */}
                    <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-300">
                        <span className="text-4xl font-bold opacity-50">Activity Image {params.id}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 md:p-12 z-20 container mx-auto">
                        <div className="flex items-center gap-2 text-white/90 mb-2 text-sm md:text-base font-medium">
                            <span className="bg-primary px-3 py-1 rounded-full text-white text-xs md:text-sm">Hiking</span>
                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> 20 Nov 2024</span>
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Gunung Gede</span>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-extrabold text-white mb-2 md:mb-4 drop-shadow-md leading-tight">
                            Petualangan Seru di Akhir Pekan #{params.id}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-white">
                                <div className="h-10 w-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                                    <User className="h-6 w-6" />
                                </div>
                                <span className="font-semibold">Rin Shima</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-6 md:-mt-8 relative z-30">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                <CardContent className="p-5 md:p-10 space-y-4 md:space-y-6 text-base md:text-lg text-gray-700 leading-loose md:leading-relaxed">
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </p>
                                    <p>
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 my-8">
                                        <div className="aspect-square bg-gray-100 rounded-2xl" />
                                        <div className="aspect-square bg-gray-100 rounded-2xl" />
                                    </div>
                                    <p>
                                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                                    </p>
                                </CardContent>
                                <div className="px-5 md:px-10 py-4 md:py-6 bg-gray-50 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="sm" className="hover:text-red-500 hover:bg-red-50 gap-2 rounded-full">
                                            <Heart className="h-5 w-5" /> 245 Suka
                                        </Button>
                                        <Button variant="ghost" size="sm" className="hover:text-blue-500 hover:bg-blue-50 gap-2 rounded-full">
                                            <MessageCircle className="h-5 w-5" /> 42 Komentar
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </Card>

                            {/* Comments Section */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-gray-800 px-2">Komentar (42)</h3>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Card key={i} className="border-none shadow-sm bg-white">
                                            <CardContent className="p-4 flex gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-gray-800">User {i}</span>
                                                        <span className="text-xs text-muted-foreground">2 jam yang lalu</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm">
                                                        Wah keren banget fotonya! Jadi pengen ikut camping juga nih.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full rounded-full py-6">Lihat Semua Komentar</Button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-md bg-white rounded-3xl p-6 sticky top-24">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle className="text-xl font-bold">Aktifitas Lainnya</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-4 items-center group cursor-pointer">
                                            <div className="h-16 w-16 bg-gray-100 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform" />
                                            <div>
                                                <h4 className="font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                                                    Camping Ceria di Danau Toba
                                                </h4>
                                                <span className="text-xs text-muted-foreground">12 Nov 2024</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
