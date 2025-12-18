'use client'

import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Share2, Heart, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { notFound, useParams } from "next/navigation"
import { JoinEventButton } from "@/components/events/join-event-button"
import { ParticipantsModal } from "@/components/events/participants-modal"
import { DeleteEventButton } from "@/components/events/delete-event-button"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function EventDetailPage() {
    const params = useParams()
    const id = params.id as string

    const [event, setEvent] = useState<any>(null)
    const [participants, setParticipants] = useState<any[]>([])
    const [participantsCount, setParticipantsCount] = useState(0)
    const [isUserParticipating, setIsUserParticipating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return

            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            // Fetch event
            const { data: eventData } = await supabase
                .from("events")
                .select(`
                    *,
                    organizer:organizer_id (
                        full_name,
                        avatar_url,
                        phone
                    )
                `)
                .eq("id", id)
                .single()

            if (!eventData) {
                setLoading(false)
                return
            }
            setEvent(eventData)

            // Fetch participants
            const { data: participantsData, count } = await supabase
                .from("event_participants")
                .select(`
                    user:user_id (
                        full_name,
                        avatar_url
                    )
                `, { count: 'exact' })
                .eq("event_id", id)

            setParticipants(participantsData || [])
            setParticipantsCount(count || 0)

            // Check participation
            if (user) {
                const { data: userParticipation } = await supabase
                    .from("event_participants")
                    .select("id")
                    .eq("event_id", id)
                    .eq("user_id", user.id)
                    .single()
                setIsUserParticipating(!!userParticipation)
            }

            setLoading(false)
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
                <main className="flex-1 pb-24 md:pb-12">
                    <div className="container mx-auto pt-32 px-4">
                        <Skeleton className="h-[400px] w-full rounded-3xl mb-8" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-12">
                                <Skeleton className="h-[200px] w-full rounded-3xl" />
                                <Skeleton className="h-[150px] w-full rounded-3xl" />
                            </div>
                            <div className="space-y-8">
                                <Skeleton className="h-[300px] w-full rounded-3xl" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (!event) {
        return notFound()
    }

    const isOrganizer = user?.id === event.organizer_id

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <main className="flex-1 pb-24 md:pb-12">
                {/* Hero Section */}
                <div className="relative bg-primary/5 pt-32 pb-12 md:py-32 px-4">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-1/2 bg-gray-200 rounded-3xl overflow-hidden shadow-lg relative group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={event.image_url || "/event-placeholder.jpg"}
                                    alt={event.title}
                                    className="w-full h-auto object-contain"
                                />
                                <div className="absolute top-4 left-4 z-20">
                                    <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 shadow-sm" asChild>
                                        <Link href="/event">
                                            <ArrowLeft className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 shadow-sm">
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Event Info */}
                            <div className="w-full md:w-1/2 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 text-primary font-bold mb-2 uppercase tracking-wider text-sm">
                                        <span className="bg-orange-100 px-3 py-1 rounded-full">Gathering</span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 leading-tight">
                                        {event.title}
                                    </h1>
                                    <div className="flex flex-col gap-3 text-gray-600">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">
                                                    {new Date(event.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                                <p className="text-sm">
                                                    {new Date(event.date_start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{event.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{participantsCount || 0} / {event.max_participants || '-'} Peserta</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarFallback>{event.organizer?.full_name?.[0] || "A"}</AvatarFallback>
                                        <AvatarImage src={event.organizer?.avatar_url} />
                                    </Avatar>
                                    <div>
                                        <p className="text-sm text-gray-500">Diselenggarakan oleh</p>
                                        <p className="font-bold text-gray-900">{event.organizer?.full_name || "Admin YuruCamp"}</p>
                                    </div>
                                </div>

                                <div className="hidden md:flex gap-4">
                                    {isOrganizer ? (
                                        <>
                                            <Button size="lg" className="flex-1 rounded-full text-lg py-6 shadow-lg" asChild>
                                                <Link href={`/event/${event.id}/edit`}>
                                                    Edit Acara
                                                </Link>
                                            </Button>
                                            <DeleteEventButton id={event.id} />
                                        </>
                                    ) : (
                                        <JoinEventButton
                                            eventId={event.id}
                                            isParticipating={isUserParticipating}
                                            isFull={event.max_participants ? (participantsCount || 0) >= event.max_participants : false}
                                            className="flex-1"
                                        />
                                    )}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="flex-1 rounded-full text-lg py-6 border-2"
                                        asChild
                                        disabled={!event.organizer?.phone}
                                    >
                                        {event.organizer?.phone ? (
                                            <a
                                                href={`https://wa.me/${event.organizer.phone.replace(/^0/, '62').replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Hubungi Panitia
                                            </a>
                                        ) : (
                                            <span>Hubungi Panitia</span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Description */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-primary rounded-full" />
                                    Tentang Acara
                                </h2>
                                <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {event.description}
                                </div>
                            </section>


                            {/* Requirements */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-green-500 rounded-full" />
                                    Persyaratan
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        "Membawa tenda sendiri (atau sewa)",
                                        "Membawa perlengkapan pribadi",
                                        "Obat-obatan pribadi",
                                        "Pakaian ganti secukupnya",
                                        "Tumbler / botol minum",
                                        "Semangat membara!"
                                    ].map((req, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            <span className="text-gray-700 font-medium">{req}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Participants */}
                            <Card className="border-none shadow-lg bg-white rounded-3xl p-6">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-xl font-bold flex justify-between items-center">
                                        Peserta
                                        <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                                            {participantsCount || 0}/{event.max_participants || '∞'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {participants && participants.length > 0 ? (
                                        <>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {participants.slice(0, 12).map((p: any, i: number) => (
                                                    <Avatar key={i} className="h-10 w-10 border-2 border-white shadow-sm -ml-2 first:ml-0 hover:z-10 hover:scale-110 transition-transform cursor-pointer" title={p.user?.full_name}>
                                                        <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">{p.user?.full_name?.[0] || "?"}</AvatarFallback>
                                                        <AvatarImage src={p.user?.avatar_url} />
                                                    </Avatar>
                                                ))}
                                                {(participantsCount || 0) > 12 && (
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border-2 border-white shadow-sm -ml-2 z-0">
                                                        +{(participantsCount || 0) - 12}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Bergabunglah dengan teman-teman baru!
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <p>Belum ada peserta. Jadilah yang pertama!</p>
                                        </div>
                                    )}
                                    <ParticipantsModal
                                        participants={participants || []}
                                        totalCount={participantsCount || 0}
                                        maxParticipants={event.max_participants}
                                    />
                                </CardContent>
                            </Card>

                            {/* Related Events */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-lg px-2">Acara Lainnya</h3>
                                {[1, 2].map((i) => (
                                    <div key={i} className="group cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                                                    Hiking Ceria Gunung Prau
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1">12 Des 2024 • Wonosobo</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-20 left-0 right-0 bg-white border-t p-4 z-40 md:hidden flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div>
                    <p className="text-sm text-gray-500">Biaya Pendaftaran</p>
                    <p className="text-xl font-bold text-primary">Rp {event.price ? event.price.toLocaleString('id-ID') : 'Gratis'}</p>
                </div>
                {isOrganizer ? (
                    <Button className="rounded-full px-8 shadow-md" asChild>
                        <Link href={`/event/${event.id}/edit`}>
                            Edit
                        </Link>
                    </Button>
                ) : (
                    <JoinEventButton
                        eventId={event.id}
                        isParticipating={isUserParticipating}
                        isFull={event.max_participants ? (participantsCount || 0) >= event.max_participants : false}
                        className="rounded-full px-8 shadow-md"
                    />
                )}
            </div>

            <Footer />
        </div>
    )
}

