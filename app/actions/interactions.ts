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

    revalidatePath(`/activity/${activityId}`)
}

export async function getVideoActivity(videoId: string) {
    const supabase = await createClient()

    const { data: activity } = await supabase
        .from("activities")
        .select(`
            id,
            video_id,
            activity_likes (count),
            activity_comments (
                id,
                content,
                created_at,
                user_id,
                profiles (
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq("video_id", videoId)
        .single()

    if (!activity) return null

    // Get current user's like status
    const { data: { user } } = await supabase.auth.getUser()
    let isLiked = false

    if (user) {
        const { data: like } = await supabase
            .from("activity_likes")
            .select("id")
            .eq("activity_id", activity.id)
            .eq("user_id", user.id)
            .single()

        isLiked = !!like
    }

    return {
        ...activity,
        isLiked,
        likeCount: activity.activity_likes[0]?.count || 0,
        currentUserId: user?.id
    }
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

    revalidatePath(`/activity/${activityId}`)
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

    revalidatePath(`/activity/${activityId}`)
}
