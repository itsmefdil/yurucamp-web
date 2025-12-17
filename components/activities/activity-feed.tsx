"use client"

import { useState } from "react"
import { stripHtml } from "@/lib/utils"
import Link from "next/link"
import NextImage from "next/image"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { MapPin, Calendar, ArrowRight, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity } from "@/types/activity"
import { User } from "@supabase/supabase-js"

interface ActivityFeedProps {
    initialActivities: Activity[]
    currentUser: User | null
}

export function ActivityFeed({ initialActivities, currentUser }: ActivityFeedProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredActivities = initialActivities.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
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

            {filteredActivities.length === 0 ? (
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
                        <div key={activity.id} className="group relative h-full">
                            <Link href={`/aktifitas/${activity.id}`} className="block h-full">
                                {/* Decorative Card Offset */}
                                <div className="absolute inset-0 bg-orange-200/60 rounded-[2rem] transform translate-y-2 translate-x-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />

                                <Card className="relative bg-[#FFFCF8] border-2 border-orange-100/50 shadow-sm rounded-[2rem] overflow-hidden hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
                                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                        <NextImage
                                            src={activity.image_url || "/aktifitas.jpg"}
                                            alt={activity.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-white/90 text-orange-600 hover:bg-white shadow-sm backdrop-blur-sm border-none px-3 py-1.5 rounded-full font-bold">
                                                {activity.category || "Umum"}
                                            </Badge>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <div className="flex items-center gap-2 text-xs font-bold mb-2 opacity-95">
                                                <span className="flex items-center gap-1 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: id })}
                                                </span>
                                            </div>
                                            {activity.location && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
                                                    <MapPin className="h-3.5 w-3.5 text-yellow-300 shrink-0" />
                                                    <span className="truncate">{activity.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-1">
                                        <h3 className="text-xl font-black text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors leading-tight">
                                            {activity.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                                            {stripHtml(activity.description || "")}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="p-6 pt-0 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-3 pt-4 border-t border-orange-100 w-full">
                                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                                                <AvatarFallback className="text-xs bg-orange-100 text-orange-600 font-bold">
                                                    {activity.profiles?.full_name?.[0] || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">
                                                    {activity.profiles?.full_name || "Pengguna"}
                                                </p>
                                                <p className="text-xs text-gray-400">Pencinta Alam</p>
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
