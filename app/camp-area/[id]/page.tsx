import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Star, Wifi, Car, Coffee, Tent, Info, Share2, Heart, ArrowLeft, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ImageSlider } from "@/components/ui/image-slider"

import { DeleteCampAreaButton } from "@/components/camp-area/delete-button"

export const dynamic = 'force-dynamic'

export default async function CampAreaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: campArea } = await supabase
        .from("camp_areas")
        .select("*")
        .eq("id", id)
        .single()

    if (!campArea) {
        notFound()
    }

    const isOwner = user && campArea.user_id === user.id

    // Helper to check if a facility is available
    const hasFacility = (facility: string) => {
        return campArea.facilities?.includes(facility)
    }

    const facilityIcons: Record<string, any> = {
        "Wifi": Wifi,
        "Parkir": Car,
        "Kantin": Coffee,
        "Sewa Tenda": Tent,
        "Pusat Info": Info
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">

            <main className="flex-1 pb-24 md:pb-12">
                <div className="container mx-auto px-4 pt-24 md:pt-32">
                    {/* Hero Image */}
                    <div className="relative h-[40vh] md:h-[50vh] w-full bg-gray-200 rounded-3xl overflow-hidden shadow-sm">
                        {campArea.image_url ? (
                            <Image
                                src={campArea.image_url}
                                alt={campArea.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <span className="text-4xl font-bold opacity-50">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                        <div className="absolute top-6 left-6 z-20">
                            <Button variant="secondary" size="icon" className="rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg border-none transition-all hover:scale-105" asChild>
                                <Link href="/camp-area">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                            {isOwner && (
                                <>
                                    <Button variant="secondary" size="icon" className="rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg border-none transition-all hover:scale-105" asChild>
                                        <Link href={`/dashboard/edit-camp-area/${id}`}>
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <DeleteCampAreaButton id={id} />
                                </>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-white/90 mb-2">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <MapPin className="h-4 w-4" /> {campArea.location || "Lokasi tidak tersedia"}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
                                        {campArea.name}
                                    </h1>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 mt-8 relative z-30">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header Info (Mobile/Desktop) */}


                            {/* Description */}
                            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Tempat Ini</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {campArea.description || "Belum ada deskripsi untuk tempat ini."}
                                </p>
                            </section>

                            {/* Facilities Full List */}
                            {campArea.facilities && campArea.facilities.length > 0 && (
                                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Fasilitas Lengkap</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {campArea.facilities.map((facility: string, i: number) => {
                                            const Icon = facilityIcons[facility] || Info
                                            return (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                    <span className="font-medium text-gray-700 text-sm">{facility}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Gallery */}
                            {campArea.additional_images && campArea.additional_images.length > 0 && (
                                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Galeri Foto</h2>
                                    <ImageSlider images={campArea.additional_images} />
                                </section>
                            )}

                            {/* Map */}
                            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Lokasi</h2>
                                <div className="aspect-video w-full bg-gray-200 rounded-xl overflow-hidden shadow-inner">
                                    {campArea.location ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(campArea.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                        ></iframe>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <div className="text-center">
                                                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <span>Lokasi tidak tersedia</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right Column - Sticky Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <Card className="border-none shadow-lg overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-end mb-6">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Harga mulai dari</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold text-primary">
                                                        Rp {campArea.price?.toLocaleString('id-ID') || "0"}
                                                    </span>
                                                    <span className="text-gray-500 font-medium">/ malam</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking button removed as requested */}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
