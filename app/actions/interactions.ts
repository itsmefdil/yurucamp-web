'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleLikeActivity(activityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Check if like exists
    const { data: existingLike } = await supabase
        .from("activity_likes")
        .select("id")
        .eq("activity_id", activityId)
        .eq("user_id", user.id)
        .single()

    if (existingLike) {
        // Unlike
        await supabase
            .from("activity_likes")
            .delete()
            .eq("id", existingLike.id)
    } else {
        // Like
        await supabase
            .from("activity_likes")
            .insert({
                activity_id: activityId,
                user_id: user.id
            })
    }

    revalidatePath(`/aktifitas/${activityId}`)
}

export async function addComment(activityId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    if (!content.trim()) {
        throw new Error("Content cannot be empty")
    }

    const { error } = await supabase
        .from("activity_comments")
        .insert({
            activity_id: activityId,
            user_id: user.id,
            content: content.trim()
        })

    if (error) {
        throw error
    }

    revalidatePath(`/aktifitas/${activityId}`)
}

export async function deleteComment(commentId: string, activityId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from("activity_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id) // Ensure user owns the comment

    if (error) {
        throw error
    }

    revalidatePath(`/aktifitas/${activityId}`)
}
