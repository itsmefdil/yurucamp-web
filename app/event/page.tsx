
import { Footer } from "@/components/layout/Footer"
import { EventsView } from "@/components/events/events-view"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
    const supabase = await createClient()
    const { data: events } = await supabase
        .from("events")
        .select("*")
        .order("date_start", { ascending: true })

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                <EventsView initialEvents={events || []} />
            </main>
            <Footer />
        </div>
    )
}
