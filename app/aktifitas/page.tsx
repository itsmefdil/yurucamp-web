import { createClient } from "@/lib/supabase/server"

import { Footer } from "@/components/layout/Footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ActivityFeed } from "@/components/activities/activity-feed"

export const dynamic = 'force-dynamic'

export default async function ActivitiesPage() {
    const supabase = await createClient()
    const { data: activities } = await supabase
        .from("activities")
        .select(`
            *,
            profiles:user_id (
                full_name,
                avatar_url
            )
        `)
        .order("created_at", { ascending: false })

    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">


            {/* Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left max-w-2xl text-gray-800">
                            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-bold bg-orange-100 text-orange-600 hover:bg-orange-200 border-none">
                                Komunitas Yuru Camp
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
                                Bagikan Momen <br />
                                <span className="text-orange-500">Petualanganmu</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Temukan inspirasi camping, hiking, dan kegiatan seru lainnya dari teman-teman komunitas.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-base px-8 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all" asChild>
                                    <Link href="/dashboard/add-activity">
                                        <Plus className="mr-2 h-5 w-5" /> Buat Aktifitas Baru
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block relative w-80 h-80 lg:w-96 lg:h-96">
                            {/* Decorative elements */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
                            <div className="absolute inset-4 bg-white/40 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 -mt-8 relative z-20 pb-24">
                <ActivityFeed initialActivities={activities || []} currentUser={user} />
            </main>
            <Footer />
        </div>
    )
}
