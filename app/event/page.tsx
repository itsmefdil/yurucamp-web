
'use client'

import { Footer } from "@/components/layout/Footer"
import { EventsView } from "@/components/events/events-view"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from("events")
                .select("*")
                .order("date_start", { ascending: true })

            if (data) {
                setEvents(data)
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                <EventsView initialEvents={events} isLoading={loading} />
            </main>
            <Footer />
        </div>
    )
}

