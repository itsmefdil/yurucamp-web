"use client"

import { Button } from "@/components/ui/button"
import { Play, Info, Star } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function WatchHero() {
    const backgrounds = [
        {
            id: "season-1",
            title: "Yuru Camp Season 1",
            description: "Rin menikmati berkemah sendirian di tepi danau Gunung Fuji. Nadeshiko bersepeda untuk melihat Gunung Fuji tetapi tertidur di pinggir jalan. Kedua gadis ini bertemu, dan perjalanan berkemah mereka pun dimulai.",
            image: "https://img.youtube.com/vi/toRv2b-iCs8/maxresdefault.jpg"
        },
        {
            id: "season-2",
            title: "Yuru Camp Season 2",
            description: "Klub Aktivitas Luar Ruangan kembali! Bergabunglah dengan Nadeshiko, Rin, dan teman-teman saat mereka menjelajahi tempat perkemahan baru, memasak makanan lezat, dan menikmati alam bebas di musim dingin.",
            image: "https://i.ytimg.com/vi/jycSbANT_qw/hqdefault.jpg"
        },
        {
            id: "season-3",
            title: "Yuru Camp Season 3",
            description: "Nadeshiko, Rin, dan yang lainnya kembali untuk petualangan berkemah lainnya! Seiring berjalannya tahun ajaran, tempat perkemahan baru dan makanan lezat menanti mereka.",
            image: "https://img.youtube.com/vi/SGs03IvU7SQ/maxresdefault.jpg"
        }
    ]

    const [currentBgIndex, setCurrentBgIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true)
            setTimeout(() => {
                setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length)
                setIsTransitioning(false)
            }, 500) // Wait for fade out
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const currentBg = backgrounds[currentBgIndex]

    return (
        <div className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden bg-gray-900">
            <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <img
                    src={currentBg.image}
                    alt={currentBg.title}
                    className="w-full h-full object-cover opacity-60"
                />
                {/* Light gradient overlay for text readability but keeping it bright */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfd] via-transparent to-transparent" />
            </div>

            <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-24 md:pt-32">
                <div className={`max-w-2xl space-y-4 md:space-y-6 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    <div className="flex items-center gap-2 text-primary font-black tracking-widest uppercase text-[10px] md:text-sm bg-orange-100 w-fit px-2 md:px-3 py-1 rounded-full shadow-sm">
                        <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                        #1 Camping Anime
                    </div>
                    <h1 className="text-3xl md:text-7xl font-black leading-tight text-gray-800 drop-shadow-sm">
                        {currentBg.title}
                    </h1>
                    <p className="text-sm md:text-xl text-gray-700 line-clamp-3 leading-relaxed max-w-xl font-medium">
                        {currentBg.description}
                    </p>
                    <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4">
                        <Button size="lg" className="rounded-full px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg font-bold shadow-lg hover:scale-105 transition-transform gap-2" asChild>
                            <Link href={`/watch/${currentBg.id}`}>
                                <Play className="h-4 w-4 md:h-6 md:w-6 fill-white" />
                                Mulai Nonton
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg font-bold border-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:scale-105 transition-transform gap-2 text-gray-700">
                            <Info className="h-4 w-4 md:h-6 md:w-6" />
                            Selengkapnya
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
