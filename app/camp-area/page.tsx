import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CampAreaView } from "@/components/camp-area/camp-area-view"

export default function CampAreaPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <CampAreaView />
            </main>
            <Footer />
        </div>
    )
}
