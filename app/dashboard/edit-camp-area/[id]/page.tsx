import { Footer } from "@/components/layout/Footer"
import { EditCampAreaForm } from "@/components/camp-area/edit-camp-area-form"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { updateCampArea } from "@/app/camp-area/actions"

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
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Lokasi Camping</h1>
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
