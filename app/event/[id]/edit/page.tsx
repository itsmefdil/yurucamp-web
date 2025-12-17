import { EditEventForm } from "@/components/events/edit-event-form"
import { Footer } from "@/components/layout/Footer"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"

export default async function EditEventPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient()

    // Get user session
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: event } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!event) {
        notFound()
    }

    // Verify ownership
    if (event.organizer_id !== user.id) {
        // Redirect or show error if not owner
        redirect(`/event/${params.id}`)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <main className="flex-1 container mx-auto px-4 py-32">
                <EditEventForm event={event} />
            </main>
            <Footer />
        </div>
    )
}
