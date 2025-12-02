import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { EventsView } from "@/components/events/events-view"

export default function EventsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <EventsView />
            </main>
            <Footer />
        </div>
    )
}
