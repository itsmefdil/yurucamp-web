
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
                {loading ? (
                    <div className="container mx-auto px-4 py-8 space-y-6">
                        <Skeleton className="h-[300px] w-full rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-[250px] w-full rounded-2xl" />
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <EventsView initialEvents={events} />
                )}
            </main>
            <Footer />
        </div>
    )
}

