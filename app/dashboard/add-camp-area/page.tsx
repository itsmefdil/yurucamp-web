import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AddCampAreaForm } from "@/components/camp-area/add-camp-area-form"

export default function AddCampAreaPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <AddCampAreaForm />
            </main>
            <Footer />
        </div>
    )
}
