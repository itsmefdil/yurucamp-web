"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary"

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

    // Delete images from Cloudinary
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
            await Promise.all(
                activity.additional_images.map(async (url: string) => {
                    const publicId = getPublicIdFromUrl(url)
                    if (publicId) {
                        await deleteImage(publicId)
                    }
                })
            )
        }
    } catch (error) {
        console.error("Error deleting images from Cloudinary:", error)
        // Continue with database deletion even if image deletion fails
    }

    // Delete activity
    const { error: deleteError } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId)

    if (deleteError) {
        return { error: "Failed to delete activity" }
    }

    revalidatePath("/aktifitas")
    revalidatePath("/") // Also revalidate homepage since it shows latest activities
    return { success: true }
}
