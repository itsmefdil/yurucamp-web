import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ActivityForm } from "@/components/activities/activity-form"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { updateActivity } from "./actions"

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: activity, error } = await supabase
        .from("activities")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !activity) {
        notFound()
    }

    if (activity.user_id !== user.id) {
        redirect("/dashboard")
    }

    const updateAction = updateActivity.bind(null, id)

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full" asChild>
                            <Link href={`/aktifitas/${id}`}>
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-black text-gray-800">Edit Aktifitas</h1>
                    </div>

                    <ActivityForm
                        initialData={activity}
                        action={updateAction}
                        buttonText="Simpan Perubahan"
                    />
                </div>
            </main>
            <Footer />
        </div>
    )
}
