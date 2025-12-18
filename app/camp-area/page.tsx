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
                {loading ? (
                    <div className="container mx-auto px-4 py-8 space-y-6">
                        <Skeleton className="h-[200px] w-full rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-[250px] w-full rounded-2xl" />
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <CampAreaView initialCampAreas={campAreas} />
                )}
            </main>
            <Footer />
        </div>
    )
}

