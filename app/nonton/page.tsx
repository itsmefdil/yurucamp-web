"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Play, Info, ChevronRight, Star, Calendar, Film, Tv } from "lucide-react"
import Link from "next/link"

export default function WatchPage() {
    const featuredContent = {
        id: "season-2",
        title: "Yuru Camp Season 2",
        description: "The Outdoor Activities Club is back! Join Nadeshiko, Rin, and the gang as they explore new campsites, cook delicious food, and enjoy the great outdoors in winter.",
        image: "/bg-nonton.png"
    }

    const categories = [
        {
            title: "Anime Series",
            icon: Tv,
            items: [
                {
                    id: "season-1",
                    title: "Yuru Camp Season 1",
                    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=600",
                    year: "2018",
                    episodes: "12 Eps",
                    rating: "4.9"
                },
                {
                    id: "season-2",
                    title: "Yuru Camp Season 2",
                    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600",
                    year: "2021",
                    episodes: "13 Eps",
                    rating: "5.0"
                },
                {
                    id: "heya-camp",
                    title: "Heya Camp",
                    image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&q=80&w=600",
                    year: "2020",
                    episodes: "12 Eps",
                    rating: "4.7"
                }
            ]
        },
        {
            title: "Live Action Drama",
            icon: Film,
            items: [
                {
                    id: "drama-s1",
                    title: "Yuru Camp Drama S1",
                    image: "https://images.unsplash.com/photo-1496545672479-df51f3887ba6?auto=format&fit=crop&q=80&w=600",
                    year: "2020",
                    episodes: "12 Eps",
                    rating: "4.8"
                },
                {
                    id: "drama-s2",
                    title: "Yuru Camp Drama S2",
                    image: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80&w=600",
                    year: "2021",
                    episodes: "12 Eps",
                    rating: "4.7"
                }
            ]
        },
        {
            title: "Movies & Specials",
            icon: Film,
            items: [
                {
                    id: "movie",
                    title: "Yuru Camp Movie",
                    image: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&q=80&w=600",
                    year: "2022",
                    episodes: "Movie",
                    rating: "4.8"
                }
            ]
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd] text-gray-800 overflow-x-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            <main className="flex-1 pb-24">
                {/* Hero Section */}
                <div className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={featuredContent.image}
                            alt={featuredContent.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Light gradient overlay for text readability but keeping it bright */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfd] via-transparent to-transparent" />
                    </div>

                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-16 md:pt-20">
                        <div className="max-w-2xl space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <div className="flex items-center gap-2 text-primary font-black tracking-widest uppercase text-[10px] md:text-sm bg-orange-100 w-fit px-2 md:px-3 py-1 rounded-full shadow-sm">
                                <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                                #1 Camping Anime
                            </div>
                            <h1 className="text-3xl md:text-7xl font-black leading-tight text-gray-800 drop-shadow-sm">
                                {featuredContent.title}
                            </h1>
                            <p className="text-sm md:text-xl text-gray-700 line-clamp-3 leading-relaxed max-w-xl font-medium">
                                {featuredContent.description}
                            </p>
                            <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4">
                                <Button size="lg" className="rounded-full px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg font-bold shadow-lg hover:scale-105 transition-transform gap-2" asChild>
                                    <Link href={`/nonton/${featuredContent.id}`}>
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

                {/* Content Rows */}
                <div className="container mx-auto px-4 -mt-20 md:-mt-32 relative z-10 space-y-12 md:space-y-16">
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

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                                {category.items.map((item) => (
                                    <Link href={`/nonton/${item.id}`} key={item.id} className="group relative aspect-[4/5] md:aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 md:border-4 border-white ring-1 ring-gray-100">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Overlay on Hover (Desktop) & Always visible gradient (Mobile) */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-5">
                                            <h3 className="font-bold text-white text-sm md:text-lg leading-tight mb-1 md:mb-2 line-clamp-2">{item.title}</h3>
                                            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-white/90 font-medium">
                                                <span className="flex items-center gap-1 bg-yellow-400 text-black px-1 md:px-1.5 py-0.5 rounded-md">
                                                    <Star className="h-2 w-2 md:h-3 md:w-3 fill-current" /> {item.rating}
                                                </span>
                                                <span className="bg-white/20 px-1 md:px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                                    {item.episodes}
                                                </span>
                                            </div>
                                            <div className="mt-4 hidden md:flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                                                    <Play className="h-5 w-5 fill-current ml-1" />
                                                </div>
                                                <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                                                    Tonton Sekarang
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    )
}
