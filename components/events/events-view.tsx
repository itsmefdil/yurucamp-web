"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function EventsView({ initialEvents }: { initialEvents: any[] }) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

    const now = new Date()

    const upcomingEvents = initialEvents
        .filter(e => new Date(e.date_start) >= now)
        .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())

    const pastEvents = initialEvents
        .filter(e => new Date(e.date_start) < now)
        .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())

    const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-primary overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left max-w-2xl text-white">
                            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1 text-sm font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
                                <Sparkles className="w-4 h-4" />
                                <span>Jadwal Yuru Camp</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                                Temukan <br />
                                <span className="text-yellow-300">Petualanganmu!</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
                                Bergabunglah dengan acara seru, nikmati alam, dan buat kenangan tak terlupakan bersama teman baru.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Button size="lg" className="rounded-full bg-white text-primary hover:bg-gray-100 font-bold text-base px-8 shadow-lg" asChild>
                                    <Link href="/event/create">
                                        Buat Acara Baru
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block relative w-80 h-80 lg:w-96 lg:h-96">
                            {/* Decorative elements */}
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-20 pb-24">
                {/* Toggle Filter */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white p-2 rounded-full inline-flex shadow-sm border border-gray-100">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={cn(
                                "px-8 py-3 rounded-full text-sm font-bold transition-all duration-300",
                                activeTab === 'upcoming'
                                    ? "bg-primary text-white shadow-md transform scale-105"
                                    : "text-gray-500 hover:text-primary hover:bg-gray-50"
                            )}
                        >
                            Acara Terbaru
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={cn(
                                "px-8 py-3 rounded-full text-sm font-bold transition-all duration-300",
                                activeTab === 'past'
                                    ? "bg-gray-800 text-white shadow-md transform scale-105"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                            )}
                        >
                            Riwayat
                        </button>
                    </div>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div key={event.id} className="group relative">
                                {/* Decorative Card Offset */}
                                <div className="absolute inset-0 bg-orange-200/60 rounded-[2rem] transform translate-y-2 translate-x-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />

                                <Card className="relative bg-[#FFFCF8] border-2 border-orange-100/50 shadow-sm rounded-[2rem] overflow-hidden hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col">
                                    {/* Image Container */}
                                    <div className="relative h-56 bg-orange-50 overflow-hidden">
                                        <div className="absolute top-4 left-4 z-10">
                                            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(event.date_start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className={`
                                                px-3 py-1.5 rounded-full text-xs font-bold border border-white/50 shadow-sm backdrop-blur-sm
                                                ${activeTab === 'upcoming' ? 'bg-green-100/90 text-green-700' : 'bg-gray-100/90 text-gray-600'}
                                             `}>
                                                {activeTab === 'upcoming' ? 'Segera' : 'Selesai'}
                                            </div>
                                        </div>
                                        <img
                                            src={event.image_url || "/event-placeholder.jpg"}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>

                                    <CardContent className="flex-1 p-6 flex flex-col">
                                        <div className="flex items-center gap-2 text-sm font-bold text-orange-500 mb-3 uppercase tracking-wider">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(event.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>

                                        <h3 className="text-xl font-black text-gray-800 mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                            {event.title}
                                        </h3>

                                        <div className="flex items-start gap-2 text-gray-500 text-sm mb-6 flex-1">
                                            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                            <span className="line-clamp-2">{event.location}</span>
                                        </div>

                                        <Button
                                            asChild
                                            className={cn(
                                                "w-full rounded-2xl py-6 font-bold text-base shadow-sm transition-all",
                                                activeTab === 'upcoming'
                                                    ? "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md hover:scale-[1.02] active:scale-95"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            )}
                                        >
                                            <Link href={`/event/${event.id}`}>
                                                <span className="flex items-center gap-2">
                                                    {activeTab === 'upcoming' ? 'Lihat Detail' : 'Dokumentasi'}
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="mb-6 inline-flex p-6 bg-gray-50 rounded-full">
                                <Sparkles className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada acara</h3>
                            <p className="text-gray-500">Nantikan petualangan seru berikutnya!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
