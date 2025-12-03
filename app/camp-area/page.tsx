import { createClient } from "@/lib/supabase/server"

import { Footer } from "@/components/layout/Footer"
import { CampAreaView } from "@/components/camp-area/camp-area-view"

export const dynamic = 'force-dynamic'

export default async function CampAreaPage() {
    const supabase = await createClient()
    const { data: campAreas } = await supabase
        .from("camp_areas")
        .select("*")
        .order("created_at", { ascending: false })

    return (
        <div className="min-h-screen flex flex-col">

            <main className="flex-1">
                <CampAreaView initialCampAreas={campAreas || []} />
            </main>
            <Footer />
        </div>
    )
}
