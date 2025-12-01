"use client"

import { Navbar } from "@/components/layout/Navbar"
import NextImage from "next/image"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Activity } from "@/types/activity"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { MapPin, Calendar, ArrowRight, Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const supabase = createClient()

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const { data, error } = await supabase
                    .from("activities")
                    .select(`
                        *,
                        profiles:user_id (
                            full_name,
                            avatar_url
                        )
                    `)
                    .order("created_at", { ascending: false })

                if (error) throw error

                setActivities(data || [])
            } catch (error) {
                console.error("Error fetching activities:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchActivities()
    }, [])

    const filteredActivities = activities.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-primary overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left max-w-2xl text-white">
                            <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm font-medium bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm">
                                Komunitas Yuru Camp
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                                Bagikan Momen <br />
                                <span className="text-yellow-300">Petualanganmu</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
                                Temukan inspirasi camping, hiking, dan kegiatan seru lainnya dari teman-teman komunitas.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Button size="lg" className="rounded-full bg-white text-primary hover:bg-gray-100 font-bold text-base px-8 shadow-lg" asChild>
                                    <Link href="/dashboard/add-activity">
                                        <Plus className="mr-2 h-5 w-5" /> Buat Aktifitas Baru
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block relative w-80 h-80 lg:w-96 lg:h-96">
                            {/* Decorative elements could go here */}
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 -mt-8 relative z-20 pb-24">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl shadow-xl p-4 mb-12 flex flex-col md:flex-row gap-4 items-center border border-gray-100">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Cari aktifitas, lokasi, atau teman..."
                            className="pl-12 py-6 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" size="lg" className="rounded-xl border-gray-200 hover:bg-gray-50 hover:text-primary flex-1 md:flex-none">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak ada aktifitas ditemukan</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Coba ubah kata kunci pencarianmu atau jadilah yang pertama membagikan momen seru!
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/add-activity">Buat Aktifitas Baru</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredActivities.map((activity) => (
                            <Link href={`/aktifitas/${activity.id}`} key={activity.id} className="group">
                                <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-3xl h-full flex flex-col group-hover:-translate-y-1">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                        <NextImage
                                            src={activity.image_url || "/aktifitas.jpg"}
                                            alt={activity.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 text-primary hover:bg-white shadow-sm backdrop-blur-sm border-none px-3 py-1">
                                                {activity.category || "Umum"}
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <div className="flex items-center gap-2 text-xs font-medium mb-2 opacity-90">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: id })}
                                                </span>
                                                {activity.location && (
                                                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                        <MapPin className="h-3 w-3" />
                                                        {activity.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                            {activity.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                                            {activity.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-gray-50 mt-auto">
                                        <div className="flex items-center gap-3 pt-4">
                                            <Avatar className="h-8 w-8 border border-gray-100">
                                                <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                    {activity.profiles?.full_name?.[0] || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-gray-600 truncate max-w-[120px]">
                                                {activity.profiles?.full_name || "Pengguna"}
                                            </span>
                                        </div>
                                        <div className="pt-4">
                                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
