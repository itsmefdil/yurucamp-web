'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleLikeActivity(activityId?: string, videoId?: string) {
    if (!activityId && !videoId) throw new Error("Either activityId or videoId is required")

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Check if like exists
    let query = supabase.from("activity_likes").select("id").eq("user_id", user.id)

    if (activityId) {
        query = query.eq("activity_id", activityId)
    } else if (videoId) {
        query = query.eq("video_id", videoId)
    }

    const { data: existingLike } = await query.single()

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
                activity_id: activityId || null,
                video_id: videoId || null,
                user_id: user.id
            })
    }

    if (activityId) revalidatePath(`/activity/${activityId}`)
    if (videoId) revalidatePath(`/watch`) // Broad revalidation for watch pages
}

export async function getVideoActivity(videoId: string) {
    const supabase = await createClient()

    const { data: activity } = await supabase
        .from("activities")
        .select(`
            id,
            video_id,
            title,
            description,
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
        .maybeSingle()

    // Get current user's like status
    const { data: { user } } = await supabase.auth.getUser()
    let isLiked = false
    let likeCount = 0
    let comments: any[] = []

    if (activity) {
        // If activity exists, use its ID for fetching interactions if we want to combine or prefer activity-based
        // But for video-centric, we might want to query by video_id directly on interactions tables
        // However, the previous query already fetches related data via join if activity exists.
        likeCount = activity.activity_likes?.[0]?.count || 0
        comments = activity.activity_comments || []
    }

    // If no activity exists, or to be safe, we should query interactions by video_id directly
    // This part is crucial if we decide to NOT rely on activity existence
    const { count: directLikeCount } = await supabase
        .from("activity_likes")
        .select("*", { count: 'exact', head: true })
        .eq("video_id", videoId)

    const { data: directComments } = await supabase
        .from("activity_comments")
        .select(`
            id,
            content,
            created_at,
            user_id,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq("video_id", videoId)
        .order("created_at", { ascending: false })

    // Merge or prefer direct video interactions
    likeCount = directLikeCount || 0
    comments = directComments || []

    if (user) {
        const { data: like } = await supabase
            .from("activity_likes")
            .select("id")
            .eq("video_id", videoId)
            .eq("user_id", user.id)
            .maybeSingle()

        isLiked = !!like
    }

    // Return a constructed object even if activity is null
    return {
        id: activity?.id, // Might be null
        video_id: videoId,
        title: activity?.title || "",
        description: activity?.description || "",
        isLiked,
        likeCount,
        activity_comments: comments,
        currentUserId: user?.id
    }
}

export async function addComment(content: string, activityId?: string, videoId?: string) {
    if (!activityId && !videoId) throw new Error("Either activityId or videoId is required")

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
            activity_id: activityId || null,
            video_id: videoId || null,
            user_id: user.id,
            content: content.trim()
        })

    if (error) {
        throw error
    }

    if (activityId) revalidatePath(`/activity/${activityId}`)
    if (videoId) revalidatePath(`/watch`)
}

export async function deleteComment(commentId: string, activityId?: string, videoId?: string) {
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

    if (activityId) revalidatePath(`/activity/${activityId}`)
    if (videoId) revalidatePath(`/watch`)
}
