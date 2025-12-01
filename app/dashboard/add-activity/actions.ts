'use server'

import { createClient } from "@/lib/supabase/server"
import { uploadImage } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addActivity(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const date = formData.get("date") as string
    const location = formData.get("location") as string
    const imageFile = formData.get("image") as File
    const additionalImageFiles = formData.getAll("additional_images") as File[]

    let image_url = null
    let additional_images: string[] = []

    if (imageFile && imageFile.size > 0) {
        try {
            image_url = await uploadImage(imageFile, "activities")
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
            return { error: "Failed to upload image" }
        }
    }

    if (additionalImageFiles && additionalImageFiles.length > 0) {
        try {
            const uploadPromises = additionalImageFiles
                .filter(file => file.size > 0)
                .map(file => uploadImage(file, "activities"))

            if (uploadPromises.length > 0) {
                additional_images = await Promise.all(uploadPromises)
            }
        } catch (error) {
            console.error("Error uploading additional images:", error)
            // Continue even if some additional images fail, or handle as needed
        }
    }

    const { error } = await supabase.from("activities").insert({
        title,
        description,
        category,
        date: date || null,
        location,
        image_url,
        additional_images: additional_images.length > 0 ? additional_images : null,
        user_id: user.id
    })

    if (error) {
        console.error("Error inserting activity:", error)
        return { error: error.message }
    }

    revalidatePath("/aktifitas")
    revalidatePath("/dashboard/activities") // Assuming this path exists or will exist
    redirect("/aktifitas")
}
