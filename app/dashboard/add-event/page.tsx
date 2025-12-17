import { Footer } from "@/components/layout/Footer"
import { AddEventForm } from "@/components/events/add-event-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AddEventPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <AddEventForm />
            </main>
            <Footer />
        </div>
    )
}
