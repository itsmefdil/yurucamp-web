'use client'

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { CampAreaView } from "@/components/camp-area/camp-area-view"
import { Skeleton } from "@/components/ui/skeleton"

export default function CampAreaPage() {
    const [campAreas, setCampAreas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from("camp_areas")
                .select("*")
                .order("created_at", { ascending: false })

            if (data) {
                setCampAreas(data)
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                <CampAreaView initialCampAreas={campAreas} isLoading={loading} />
            </main>
            <Footer />
        </div>
    )
}

