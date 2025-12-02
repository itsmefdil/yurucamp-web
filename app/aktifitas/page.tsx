import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/Navbar"
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
                <ActivityFeed initialActivities={activities || []} currentUser={user} />
            </main>
            <Footer />
        </div>
    )
}
