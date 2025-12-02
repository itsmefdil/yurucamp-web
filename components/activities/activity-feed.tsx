"use client"

import { useState } from "react"
import { stripHtml } from "@/lib/utils"
import Link from "next/link"
import NextImage from "next/image"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { MapPin, Calendar, ArrowRight, Search, Filter, Trash2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity } from "@/types/activity"
import { User } from "@supabase/supabase-js"
import { deleteActivity } from "@/app/aktifitas/actions"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ActivityFeedProps {
    initialActivities: Activity[]
    currentUser: User | null
}

export function ActivityFeed({ initialActivities, currentUser }: ActivityFeedProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const filteredActivities = initialActivities.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = async (activityId: string) => {
        setIsDeleting(activityId)
        try {
            const result = await deleteActivity(activityId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Aktifitas berhasil dihapus")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat menghapus aktifitas")
        } finally {
            setIsDeleting(null)
        }
    }

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
                                            {stripHtml(activity.description || "")}
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

                            {/* Delete Button for Owner */}
                            {currentUser && currentUser.id === activity.user_id && (
                                <div className="absolute top-4 right-4 z-10">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-10 w-10 rounded-full shadow-xl bg-red-600 hover:bg-red-700 text-white ring-2 ring-white"
                                                disabled={isDeleting === activity.id}
                                            >
                                                {isDeleting === activity.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus Aktifitas?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tindakan ini tidak dapat dibatalkan. Aktifitas ini akan dihapus secara permanen dari database.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.preventDefault()
                                                        handleDelete(activity.id)
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {isDeleting === activity.id ? "Menghapus..." : "Hapus"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
