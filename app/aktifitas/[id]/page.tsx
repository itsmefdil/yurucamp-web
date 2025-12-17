import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, MapPin, Calendar, User, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import Link from "next/link"
import { ActivityGallery } from "@/components/activities/activity-gallery"
import { DeleteActivityButton } from "@/components/activities/delete-button"
import { Edit } from "lucide-react"

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: activity, error } = await supabase
        .from("activities")
        .select(`
            *,
            profiles:user_id (
                full_name,
                avatar_url
            )
        `)
        .eq("id", id)
        .maybeSingle()

    if (error) {
        console.error("Error fetching activity:", error)
    }

    if (!activity) {
        redirect("/aktifitas")
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">

            <main className="flex-1 pb-24 md:pb-12">
                <div className="container mx-auto px-4 pt-24 md:pt-32">
                    {/* Hero Image */}
                    <div className="relative h-[45vh] md:h-[60vh] w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                        {activity.image_url ? (
                            <Image
                                src={activity.image_url}
                                alt={activity.title}
                                fill
                                className="object-cover opacity-90"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                                <span className="text-4xl font-bold opacity-30">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                        <div className="absolute top-6 left-6 z-20">
                            <Button variant="outline" size="icon" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md" asChild>
                                <Link href="/aktifitas">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                            {user && user.id === activity.user_id && (
                                <>
                                    <Button variant="secondary" size="icon" className="rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg border-none transition-all hover:scale-105" asChild>
                                        <Link href={`/dashboard/edit-activity/${activity.id}`}>
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <DeleteActivityButton id={activity.id} />
                                </>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-white/90 mb-3 md:mb-4 text-sm md:text-base font-medium animate-fade-in-up">
                                    {activity.category && (
                                        <span className="bg-primary/90 backdrop-blur-sm px-3 md:px-4 py-1.5 rounded-full text-white text-[10px] md:text-sm font-bold uppercase tracking-wider shadow-lg">
                                            {activity.category}
                                        </span>
                                    )}
                                    {activity.date && (
                                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/10 text-xs md:text-base">
                                            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
                                            {format(new Date(activity.date), "dd MMMM yyyy", { locale: idLocale })}
                                        </span>
                                    )}
                                    {activity.location && (
                                        <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/10 text-xs md:text-base">
                                            <MapPin className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
                                            {activity.location}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 drop-shadow-xl leading-tight tracking-tight">
                                    {activity.title}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 text-white bg-black/40 backdrop-blur-md px-3 md:px-4 py-2 rounded-full border border-white/10">
                                        <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white/50 ring-2 ring-black/20">
                                            <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                                            <AvatarFallback className="bg-primary text-white font-bold">{activity.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider font-bold">Dibuat oleh</span>
                                            <span className="font-bold text-xs md:text-base">{activity.profiles?.full_name || "Unknown User"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 mt-8 relative z-30">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-8">
                            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white ring-1 ring-black/5">
                                <CardContent className="p-5 md:p-10 space-y-6">
                                    <div
                                        className="prose md:prose-lg max-w-none text-gray-600 leading-loose"
                                        dangerouslySetInnerHTML={{ __html: activity.description || "" }}
                                    />
                                </CardContent>
                                <div className="px-6 md:px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" size="sm" className="hover:text-red-600 hover:bg-red-50 hover:border-red-200 gap-2 rounded-full transition-all duration-300 group">
                                            <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium">Suka</span>
                                        </Button>
                                        <Button variant="outline" size="sm" className="hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 gap-2 rounded-full transition-all duration-300 group">
                                            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium">Komentar</span>
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200 text-gray-500">
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </Card>

                            {/* Photo Gallery */}
                            {activity.additional_images && activity.additional_images.length > 0 && (
                                <ActivityGallery images={activity.additional_images} />
                            )}

                            {/* Comments Section */}
                            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 ring-1 ring-black/5">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <MessageCircle className="h-6 w-6 text-primary" />
                                    Komentar <span className="text-gray-400 text-lg font-normal">(0)</span>
                                </h3>
                                <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <MessageCircle className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <p className="font-medium text-gray-600">Belum ada komentar</p>
                                    <p className="text-sm mt-1">Jadilah yang pertama membagikan pendapatmu!</p>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-lg bg-white rounded-3xl p-6 sticky top-24 ring-1 ring-black/5">
                                <CardHeader className="p-0 mb-6 border-b border-gray-100 pb-4">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Aktifitas Lainnya
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    <div className="text-center py-8">
                                        <p className="text-sm text-muted-foreground italic">Belum ada aktifitas lain.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div >
            </main >
            <Footer />
        </div >
    )
}
