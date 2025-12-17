import { AddEventForm } from "@/components/events/add-event-form"
import { Footer } from "@/components/layout/Footer"

export default function CreateEventPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <main className="flex-1 container mx-auto px-4 py-32">
                <AddEventForm />
            </main>
            <Footer />
        </div>
    )
}
