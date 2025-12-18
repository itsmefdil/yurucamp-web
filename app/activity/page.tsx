'use client'

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ActivityFeed } from "@/components/activities/activity-feed"
import { Skeleton } from "@/components/ui/skeleton"

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            const { data } = await supabase
                .from("activities")
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        avatar_url
                    )
                `)
                .order("created_at", { ascending: false })

            if (data) {
                setActivities(data)
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">


            {/* Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-20 pb-10 md:pt-24 md:pb-12 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left max-w-xl text-gray-800">
                            <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs font-bold bg-orange-100 text-orange-600 hover:bg-orange-200 border-none">
                                Komunitas Yuru Camp
                            </Badge>
                            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight text-gray-900">
                                Bagikan Momen <br />
                                <span className="text-orange-500">Petualanganmu</span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-md">
                                Temukan inspirasi camping, hiking, dan kegiatan seru lainnya dari teman-teman komunitas.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-sm px-6 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all" asChild>
                                    <Link href="/dashboard/add-activity">
                                        <Plus className="mr-2 h-4 w-4" /> Buat Aktifitas Baru
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block relative w-64 h-64 lg:w-72 lg:h-72">
                            {/* Decorative elements */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
                            <div className="absolute inset-4 bg-white/40 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 -mt-6 relative z-20 pb-24">
                <ActivityFeed initialActivities={activities} currentUser={user} isLoading={loading} />
            </main>
            <Footer />
        </div>
    )
}

