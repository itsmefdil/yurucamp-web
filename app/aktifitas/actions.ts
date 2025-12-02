"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
        .select("user_id")
        .eq("id", activityId)
        .single()

    if (fetchError || !activity) {
        return { error: "Activity not found" }
    }

    if (activity.user_id !== user.id) {
        return { error: "You are not authorized to delete this activity" }
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
