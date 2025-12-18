import { Footer } from "@/components/layout/Footer"
import { EditCampAreaForm } from "@/components/camp-area/edit-camp-area-form"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { updateCampArea } from "@/app/actions/camp-area"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditCampAreaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: campArea, error } = await supabase
        .from("camp_areas")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !campArea) {
        notFound()
    }

    if (campArea.user_id !== user.id) {
        redirect("/camp-area")
    }

    const updateAction = updateCampArea.bind(null, id)

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
                        <h1 className="text-2xl font-black text-gray-800">Edit Lokasi Camping</h1>
                    </div>
                    <EditCampAreaForm
                        initialData={campArea}
                        action={updateAction}
                        buttonText="Simpan Perubahan"
                    />
                </div>
            </main>
            <Footer />
        </div>
    )
}
