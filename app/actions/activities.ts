'use server'

import { createClient } from "@/lib/supabase/server"
import { uploadImage, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"

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

    if (additionalImageFiles.length > 10) {
        return { error: "Maksimal 10 foto tambahan diperbolehkan" }
    }

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
            // Upload sequentially to avoid hitting limits or timeouts
            const filesToUpload = additionalImageFiles.filter(file => file.size > 0)

            for (const file of filesToUpload) {
                try {
                    const url = await uploadImage(file, "activities")
                    if (url) {
                        additional_images.push(url)
                    }
                } catch (err) {
                    console.error("Failed to upload one of the additional images:", err)
                    // Abort if one fails to ensure consistency
                    throw err
                }
            }
        } catch (error) {
            console.error("Error uploading additional images:", error)
            return { error: "Gagal mengupload foto tambahan" }
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

    revalidatePath("/activity")
    revalidatePath("/dashboard/activities")
    redirect("/activity")
}

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
    const keptImages = formData.getAll("kept_images") as string[]

    if (keptImages.length + additionalImageFiles.length > 10) {
        return { error: "Maksimal 10 foto tambahan diperbolehkan" }
    }

    let image_url = existingActivity.image_url
    // Start with the images the user chose to keep
    let additional_images: string[] = keptImages

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
    if (additionalImageFiles && additionalImageFiles.length > 0) {
        try {
            // Upload sequentially to avoid hitting limits or timeouts
            const filesToUpload = additionalImageFiles.filter(file => file.size > 0)

            for (const file of filesToUpload) {
                try {
                    const url = await uploadImage(file, "activities")
                    if (url) {
                        additional_images.push(url)
                    }
                } catch (err) {
                    console.error("Failed to upload one of the additional images:", err)
                    // Abort if one fails to ensure consistency
                    throw err
                }
            }
        } catch (error) {
            console.error("Error uploading additional images:", error)
            return { error: "Gagal mengupload foto tambahan" }
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

    revalidatePath("/activity")
    revalidatePath(`/activity/${id}`)
    redirect(`/activity/${id}`)
}

export async function deleteActivity(activityId: string) {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: "Unauthorized" }
    }

    // Check if activity exists and belongs to user
    const { data: activity, error: fetchError } = await supabase
        .from("activities")
        .select("user_id, image_url, additional_images")
        .eq("id", activityId)
        .single()

    if (fetchError || !activity) {
        return { error: "Activity not found" }
    }

    if (activity.user_id !== user.id) {
        return { error: "You are not authorized to delete this activity" }
    }

    // Delete activity from database first for instant feedback
    const { error: deleteError } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId)

    if (deleteError) {
        return { error: "Failed to delete activity" }
    }

    // Schedule image deletion in background
    after(async () => {
        try {
            // Delete cover image
            if (activity.image_url) {
                const publicId = getPublicIdFromUrl(activity.image_url)
                if (publicId) {
                    await deleteImage(publicId)
                }
            }

            // Delete additional images
            if (activity.additional_images && Array.isArray(activity.additional_images)) {
                for (const url of activity.additional_images) {
                    const publicId = getPublicIdFromUrl(url)
                    if (publicId) {
                        await deleteImage(publicId)
                    }
                }
            }
        } catch (error) {
            console.error("Error deleting images from Cloudinary (background task):", error)
        }
    })

    revalidatePath("/activity")
    revalidatePath("/") // Also revalidate homepage since it shows latest activities
    redirect("/activity")
}
