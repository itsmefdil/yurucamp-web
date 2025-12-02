import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { NotificationsView } from "@/components/settings/notifications-view"

export default function NotificationsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <NotificationsView />
            </main>
            <Footer />
        </div>
    )
}
