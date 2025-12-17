import { Footer } from "@/components/layout/Footer"
import { AddCampAreaForm } from "@/components/camp-area/add-camp-area-form"
import { createCampArea } from "@/app/actions/camp-area"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddCampAreaPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-black text-gray-800">Tambah Lokasi Camping</h1>
                    </div>
                    <AddCampAreaForm action={createCampArea} />
                </div>
            </main>
            <Footer />
        </div>
    )
}
