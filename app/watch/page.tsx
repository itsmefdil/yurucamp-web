'use client'

import { Footer } from "@/components/layout/Footer"
import { ChevronRight, Star, Tv, Play } from "lucide-react"
import Link from "next/link"
import { WatchHero } from "@/components/watch/watch-hero"

export default function WatchPage() {
    const categories = [
        {
            title: "Anime Series",
            icon: Tv,
            items: [
                {
                    id: "season-1",
                    title: "Yuru Camp Season 1",
                    image: "https://img.youtube.com/vi/toRv2b-iCs8/maxresdefault.jpg",
                    year: "2018",
                    episodes: "12 Eps",
                    rating: "4.9"
                },
                {
                    id: "season-2",
                    title: "Yuru Camp Season 2",
                    image: "https://i.ytimg.com/vi/jycSbANT_qw/hqdefault.jpg",
                    year: "2021",
                    episodes: "13 Eps",
                    rating: "5.0"
                },
                {
                    id: "season-3",
                    title: "Yuru Camp Season 3",
                    image: "https://img.youtube.com/vi/SGs03IvU7SQ/maxresdefault.jpg",
                    year: "2024",
                    episodes: "12 Eps",
                    rating: "4.9"
                }
            ]
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd] text-gray-800 overflow-x-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
            </div>

            <main className="flex-1 pb-24">
                {/* Hero Section */}
                <WatchHero />

                {/* Content Rows */}
                <div className="container mx-auto px-4 -mt-10 md:-mt-20 relative z-10 space-y-12 md:space-y-16">
                    {categories.map((category, idx) => (
                        <div key={idx} className="space-y-4 md:space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <category.icon className="h-4 w-4 md:h-6 md:w-6" />
                                </div>
                                <h2 className="text-xl md:text-3xl font-black text-gray-800 flex items-center gap-2 group cursor-pointer">
                                    {category.title}
                                    <ChevronRight className="h-5 w-5 md:h-6 md:w-6 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {category.items.map((item) => (
                                    <Link href={`/watch/${item.id}`} key={item.id} className="group flex flex-col gap-3">
                                        <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 md:border-4 border-white ring-1 ring-gray-100">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />

                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                                                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="h-6 w-6 fill-current ml-1" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="font-bold text-gray-800 text-base md:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                            <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1 text-yellow-500">
                                                    <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" /> {item.rating}
                                                </span>
                                                <span>•</span>
                                                <span>{item.year}</span>
                                                <span>•</span>
                                                <span>{item.episodes}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Source Disclaimer */}
                <div className="container mx-auto px-4 mt-12 md:mt-16">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-500">
                            Konten anime ini tersedia secara legal dan gratis melalui channel YouTube <a href="https://www.youtube.com/@AniOneAsia" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Ani-One Asia</a>.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
