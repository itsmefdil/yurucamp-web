"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, Clock, Calendar, Share2, Heart, MessageCircle, List } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

// Mock Data
const seasonData: Record<string, { title: string, description: string, episodes: { id: number, title: string, duration: string, thumbnail: string, videoId: string }[] }> = {
    "season-1": {
        title: "Yuru Camp Season 1",
        description: "Nadeshiko, a high school student who had moved from Shizuoka to Yamanashi, decides to see the famous, 1000 yen-bill-featured Mount Fuji.",
        episodes: Array.from({ length: 12 }).map((_, i) => {
            const id = i + 1
            const videoIds: Record<number, string> = {
                1: "toRv2b-iCs8",
                2: "XzE3LL7cbz4",
                3: "XUyFZeQ1mA0",
                5: "ZwFVNv1uGD0",
                6: "6Nzofu0TqKs",
                7: "H8kC21M1Sxk",
                8: "Dh8Xp2ReAYg",
                9: "mqprmP-l7GI",
                12: "aB_FSUGeQQw"
            }
            const videoId = videoIds[id] || "toRv2b-iCs8"
            return {
                id,
                title: `Episode ${id}`,
                duration: "24:00",
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                videoId: videoId
            }
        })
    },
    "season-3": {
        title: "Yuru Camp Season 3",
        description: "Nadeshiko, Rin, and the others return for more camping adventures! As they progress through the school year, new camping spots and delicious food await them.",
        episodes: Array.from({ length: 15 }).map((_, i) => {
            const id = i + 1
            const videoIds: Record<number, string> = {
                1: "SGs03IvU7SQ",
                2: "7LuhosSqSwA",
                3: "oDN1ph1F5uA",
                4: "3VnyX9fCHQ8",
                5: "Z3Ab0-4C5og",
                6: "96MgAZblVtE",
                7: "New86X5qoyo",
                8: "cSjTrH1B4LA",
                9: "ScAD90TBtQk",
                10: "GR8iFH43vVI",
                11: "JsGCvzgLQSQ",
                12: "52lGGBLFokU",
                13: "yrI9orwLXIo",
                14: "AHnXBtTbMic",
                15: "ih_Io3cYLgU"
            }
            const videoId = videoIds[id] || "SGs03IvU7SQ"
            const isOVA = id > 12
            return {
                id,
                title: isOVA ? `OVA ${id - 12}` : `Episode ${id}`,
                duration: "24:00",
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                videoId: videoId
            }
        })
    },
    "season-2": {
        title: "Yuru Camp Season 2",
        description: "The girls are back for more camping adventures! Join Nadeshiko, Rin, and the gang as they explore new campsites, cook delicious food, and enjoy the great outdoors in winter.",
        episodes: Array.from({ length: 13 }).map((_, i) => {
            const id = i + 1
            const videoIds: Record<number, string> = {
                1: "jycSbANT_qw",
                2: "dSfXILVW7yk",
                3: "hgOsGfjF0Ys",
                4: "zdyTu-LS4tY",
                5: "E4ZNjUcvlEM",
                6: "vYH9nYc81_U",
                7: "QHrfjTR88Ok",
                8: "B7Hv8unabNw",
                9: "-8dJqdzT_XU",
                10: "MAPbaAK7XRs",
                11: "I0U7RhL4CiE",
                12: "93S5Hsa8-gc",
                13: "H2Pp8oAfXJY"
            }
            const videoId = videoIds[id] || "jycSbANT_qw"
            return {
                id,
                title: `Episode ${id}`,
                duration: "24:00",
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                videoId: videoId
            }
        })
    },
    "movie": {
        title: "Yuru Camp Movie",
        description: "The girls are all grown up and building a campsite together.",
        episodes: [
            {
                id: 1,
                title: "Yuru Camp Movie",
                duration: "2:00:00",
                thumbnail: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&q=80&w=400",
                videoId: "toRv2b-iCs8"
            }
        ]
    },
    "heya-camp": {
        title: "Heya Camp",
        description: "Short adventures around Yamanashi.",
        episodes: Array.from({ length: 12 }).map((_, i) => ({
            id: i + 1,
            title: `Episode ${i + 1}: Stamp Rally`,
            duration: "3:00",
            thumbnail: `https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&q=80&w=400&text=Ep${i + 1}`,
            videoId: "toRv2b-iCs8"
        }))
    }
}

export default function WatchSessionPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const seasonId = params.seasonId as string
    const season = seasonData[seasonId] || seasonData["season-1"]

    // Get episode ID from URL query or default to 1
    const currentEpisodeId = parseInt(searchParams.get("ep") || "1")
    const currentEpisode = season.episodes.find(ep => ep.id === currentEpisodeId) || season.episodes[0]

    const handleEpisodeChange = (epId: number) => {
        router.push(`/nonton/${seasonId}?ep=${epId}`, { scroll: false })
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#1a1a1a] text-white">
            <Navbar />

            <main className="flex-1 pt-16 lg:pt-32 pb-24">
                <div className="container mx-auto px-0 md:px-4">
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
                        {/* Left Column: Player & Info */}
                        <div className="flex-1 min-w-0">
                            {/* Video Player */}
                            <div className="w-full aspect-video bg-black shadow-2xl rounded-xl md:rounded-2xl overflow-hidden ring-1 ring-white/10 relative group z-40">
                                <iframe
                                    src={`https://www.youtube.com/embed/${currentEpisode.videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&playsinline=1&cc_load_policy=1&cc_lang_pref=id`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                />
                            </div>

                            {/* Episode Info */}
                            <div className="p-4 md:p-0 mt-2 lg:mt-6 space-y-4 md:space-y-6 bg-[#1a1a1a] relative z-30">
                                <div>
                                    <div className="flex items-center gap-2 text-primary font-bold text-xs md:text-sm mb-1 md:mb-2 uppercase tracking-wider">
                                        {season.title} • Episode {currentEpisode.id}
                                    </div>
                                    <h1 className="text-xl md:text-3xl font-black text-white mb-2 md:mb-4 leading-tight">
                                        {currentEpisode.title}
                                    </h1>
                                    <p className="text-gray-400 leading-relaxed text-sm md:text-lg line-clamp-3 md:line-clamp-none">
                                        {season.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                    <Button variant="secondary" className="rounded-full gap-2 bg-white/10 text-white hover:bg-white/20 border-none h-9 md:h-10 text-xs md:text-sm shrink-0">
                                        <Heart className="h-4 w-4" /> 1.2k
                                    </Button>
                                    <Button variant="secondary" className="rounded-full gap-2 bg-white/10 text-white hover:bg-white/20 border-none h-9 md:h-10 text-xs md:text-sm shrink-0">
                                        <Share2 className="h-4 w-4" /> Share
                                    </Button>
                                    <Button variant="secondary" className="rounded-full gap-2 bg-white/10 text-white hover:bg-white/20 border-none h-9 md:h-10 text-xs md:text-sm shrink-0">
                                        <MessageCircle className="h-4 w-4" /> Comment
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Episode List */}
                        <div className="w-full lg:w-[400px] shrink-0 px-4 lg:px-0 mt-4 lg:mt-0">
                            <div className="bg-[#252525] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 h-[400px] lg:h-[calc(100vh-140px)] flex flex-col lg:sticky lg:top-28">
                                <div className="p-3 md:p-4 border-b border-white/5 bg-[#2a2a2a] flex justify-between items-center">
                                    <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                                        <List className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                        Daftar Episode
                                    </h3>
                                    <span className="text-[10px] md:text-xs font-medium bg-white/10 px-2 py-1 rounded text-gray-400">
                                        {season.episodes.length} Episode
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                    {season.episodes.map((episode) => {
                                        const isActive = episode.id === currentEpisodeId
                                        return (
                                            <div
                                                key={episode.id}
                                                onClick={() => handleEpisodeChange(episode.id)}
                                                className={cn(
                                                    "flex gap-3 p-2 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 group",
                                                    isActive ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5 border border-transparent"
                                                )}
                                            >
                                                <div className="relative w-24 md:w-32 aspect-video bg-gray-800 rounded-md md:rounded-lg overflow-hidden shrink-0">
                                                    <img
                                                        src={episode.thumbnail}
                                                        alt={episode.title}
                                                        className={cn(
                                                            "w-full h-full object-cover transition-opacity",
                                                            isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                                                        )}
                                                    />
                                                    {isActive && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center animate-pulse">
                                                                <Play className="h-3 w-3 md:h-4 md:w-4 fill-current ml-0.5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded font-mono">
                                                        {episode.duration}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <h4 className={cn(
                                                        "font-bold text-xs md:text-sm line-clamp-2 mb-1 transition-colors",
                                                        isActive ? "text-primary" : "text-gray-300 group-hover:text-white"
                                                    )}>
                                                        {episode.id}. {episode.title.split(': ')[1] || episode.title}
                                                    </h4>
                                                    <p className="text-gray-500 text-[10px] md:text-xs">
                                                        20 Nov 2024
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
