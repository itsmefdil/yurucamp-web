import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { WatchSessionView } from "@/components/watch/watch-session-view"

export default function WatchSessionPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd] text-gray-800">
            <Navbar />

            <main className="flex-1 pt-16 lg:pt-32 pb-24">
                <WatchSessionView />
            </main>
        </div>
    )
}
