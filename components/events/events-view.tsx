"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function EventsView() {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

    const upcomingEvents = Array.from({ length: 5 }).map((_, i) => ({
        id: i + 1,
        title: `Yuru Camp Episode ${i + 1}`,
        date: `2${i} Nov 2024`,
        time: "10:00 AM",
        location: "Yogyakarta",
        participants: 120 + i,
        description: `Mari hadir dan berbagi pengalaman dengan Yuru Camp Episode ${i + 1}.`,
        status: 'upcoming'
    }))

    const pastEvents = Array.from({ length: 3 }).map((_, i) => ({
        id: i + 10,
        title: `Yuru Camp Reunion ${i + 1}`,
        date: `1${i} Okt 2024`,
        time: "09:00 AM",
        location: "Bandung",
        participants: 85 + i,
        description: `Keseruan reuni Yuru Camp yang telah berlalu.`,
        status: 'past'
    }))

    const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents

    return (
        <div className="container mx-auto px-4 pt-24 md:pt-32 pb-24 md:pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary">Jadwal Acara</h1>
                <Button className="w-full md:w-auto rounded-full shadow-md" asChild>
                    <Link href="/tambah-acara">Buat Acara</Link>
                </Button>
            </div>

            {/* Toggle */}
            <div className="flex justify-center mb-12">
                <div className="bg-gray-100 p-1 rounded-full inline-flex">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                            activeTab === 'upcoming'
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Acara Terbaru
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                            activeTab === 'past'
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Acara Sebelumnya
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative max-w-3xl mx-auto">
                {/* Vertical Line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-4 md:ml-8" />

                <div className="space-y-8">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative pl-12 md:pl-24">
                            {/* Timeline Dot */}
                            <div className="absolute left-0 ml-4 md:ml-8 w-4 h-4 bg-primary rounded-full border-4 border-white shadow-sm -translate-x-1/2 top-8 z-10" />

                            <Card className="flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-100 animate-pulse relative shrink-0">
                                    {/* Placeholder for event image */}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {event.time}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between p-2">
                                    <CardHeader>
                                        <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                                        <CardDescription className="flex flex-col gap-2">
                                            <span className="flex items-center gap-2 text-primary">
                                                <Calendar className="h-4 w-4" />
                                                {event.date}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                {event.location}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm">
                                            {event.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center border-t bg-gray-50/50 p-4 mt-auto">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{event.participants} Peserta</span>
                                        </div>
                                        <Button size="sm" variant={activeTab === 'past' ? "outline" : "default"} asChild>
                                            <Link href={`/acara/${event.id}`}>
                                                {activeTab === 'past' ? 'Lihat Detail' : 'Daftar'}
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Scroll Placeholder */}
            <div className="flex justify-center py-12">
                <Button variant="outline" className="rounded-full px-8">Muat Lebih Banyak</Button>
            </div>
        </div>
    )
}
