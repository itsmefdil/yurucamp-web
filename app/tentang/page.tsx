"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Info, Users, Heart } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/yc-bg.png"
                            alt="Yuru Camp Scenery"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                    </div>
                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">Tentang Kami</h1>
                        <p className="text-lg md:text-xl max-w-2xl drop-shadow-md">
                            Mengenal lebih dekat dunia Yuru Camp dan komunitas penggemar di Indonesia.
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-16 md:py-24 space-y-20">
                    {/* About Yuru Camp */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider">
                                <Info className="w-5 h-5" />
                                Mengenai Anime
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-800">Apa itu Yuru Camp?</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Yuru Camp (Laid-Back Camp) adalah serial anime yang menceritakan kisah santai sekelompok gadis SMA yang menikmati kegiatan berkemah di sekitar Gunung Fuji. Dengan pemandangan alam yang indah, makanan lezat, dan suasana yang menenangkan, anime ini mengajak penonton untuk menikmati keindahan alam dan kehangatan persahabatan.
                            </p>
                        </div>
                        <div className="flex-1">
                            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl rotate-2 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="/bg-nonton.png"
                                    alt="Camping Vibes"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Community */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider">
                                <Users className="w-5 h-5" />
                                Komunitas Kami
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-800">Fanbase Indonesia</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Kami adalah komunitas penggemar Yuru Camp di Indonesia yang berdedikasi untuk berbagi informasi, mengadakan acara nonton bareng, dan tentu saja, kegiatan berkemah bersama! Tujuan kami adalah menyebarkan semangat "laid-back camping" dan menjalin persahabatan antar sesama penggemar.
                            </p>
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-sm text-orange-800 font-medium">
                                Website ini dikembangkan oleh komunitas YuruCamp Jogja-Jateng
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl -rotate-2 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="/aktifitas.jpg"
                                    alt="Community Gathering"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center space-y-6 border border-primary/10">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 fill-current" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-800">Bergabunglah Bersama Kami!</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            Ingin merasakan keseruan berkemah ala Yuru Camp? Ikuti acara kami selanjutnya atau bergabung dengan diskusi di media sosial kami.
                        </p>
                        <div className="pt-4">
                            <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform" asChild>
                                <Link href="/acara">Lihat Acara Mendatang</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
