"use server"

import { createClient } from "@/lib/supabase/server"
import { uploadImage } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateActivity(id: string, formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Verify ownership
    const { data: existingActivity, error: fetchError } = await supabase
        .from("activities")
        .select("user_id, image_url, additional_images")
        .eq("id", id)
        .single()

    if (fetchError || !existingActivity) {
        return { error: "Activity not found" }
    }

    if (existingActivity.user_id !== user.id) {
        return { error: "You do not have permission to edit this activity" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const date = formData.get("date") as string
    const location = formData.get("location") as string
    const imageFile = formData.get("image") as File
    const additionalImageFiles = formData.getAll("additional_images") as File[]

    let image_url = existingActivity.image_url
    let additional_images: string[] = existingActivity.additional_images || []

    // Handle cover image update
    if (imageFile && imageFile.size > 0) {
        try {
            image_url = await uploadImage(imageFile, "activities")
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
            return { error: "Failed to upload image" }
        }
    }

    // Handle additional images update (append new ones)
    // Note: A more complex implementation would allow deleting specific images.
    // For now, we just append new ones if any are uploaded. 
    // Ideally, the UI should allow managing the existing list.
    // If the user wants to replace, they might need to delete and re-upload.
    // But let's see how the form sends data. 
    // The current form implementation appends new files.

    if (additionalImageFiles && additionalImageFiles.length > 0) {
        try {
            const uploadPromises = additionalImageFiles
                .filter(file => file.size > 0)
                .map(file => uploadImage(file, "activities"))

            if (uploadPromises.length > 0) {
                const newImages = await Promise.all(uploadPromises)
                // For simplicity in this iteration, we'll just append.
                // A better approach for a real app would be to receive the full list of desired images (urls)
                // and new files, then reconcile.
                // But the ActivityForm doesn't support deleting yet.
                additional_images = [...additional_images, ...newImages]
            }
        } catch (error) {
            console.error("Error uploading additional images:", error)
        }
    }

    const { error } = await supabase.from("activities").update({
        title,
        description,
        category,
        date: date || null,
        location,
        image_url,
        additional_images: additional_images.length > 0 ? additional_images : null,
    }).eq("id", id)

    if (error) {
        console.error("Error updating activity:", error)
        return { error: "Failed to update activity" }
    }

    revalidatePath("/aktifitas")
    revalidatePath(`/aktifitas/${id}`)
    redirect(`/aktifitas/${id}`)
}
