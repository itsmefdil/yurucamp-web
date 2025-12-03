import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AddCampAreaForm } from "@/components/camp-area/add-camp-area-form"
import { createCampArea } from "@/app/camp-area/actions"

export default function AddCampAreaPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Tambah Lokasi Camping</h1>
                    <AddCampAreaForm action={createCampArea} />
                </div>
            </main>
            <Footer />
        </div>
    )
}
