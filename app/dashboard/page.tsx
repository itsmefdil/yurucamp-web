import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/layout/Footer"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const { data: campAreas } = await supabase
        .from('camp_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <DashboardView
                    profile={profile}
                    activities={activities || []}
                    campAreas={campAreas || []}
                />
            </main>
            <Footer />
        </div>
    )
}
