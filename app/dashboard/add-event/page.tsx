import { Footer } from "@/components/layout/Footer"
import { AddEventForm } from "@/components/events/add-event-form"

export default function AddEventPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <AddEventForm />
            </main>
            <Footer />
        </div>
    )
}
