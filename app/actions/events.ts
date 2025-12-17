'use server'

import { createClient } from "@/lib/supabase/server"
import { uploadImage, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addEvent(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const date_start = formData.get("date_start") as string
    const date_end = formData.get("date_end") as string
    const price = Number(formData.get("price")) || 0
    const max_participants = Number(formData.get("max_participants")) || 0
    const imageFile = formData.get("image") as File

    let image_url = null

    if (imageFile && imageFile.size > 0) {
        try {
            image_url = await uploadImage(imageFile, "events")
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
            return { error: "Failed to upload image" }
        }
    }

    const { error } = await supabase.from("events").insert({
        title,
        description,
        location,
        date_start: date_start || null,
        date_end: date_end || null,
        price,
        max_participants,
        image_url,
        organizer_id: user.id
    })

    if (error) {
        console.error("Error inserting event:", error)
        return { error: error.message }
    }

    revalidatePath("/event")
    redirect("/event")
}

export async function updateEvent(id: string, formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Verify ownership
    const { data: existingEvent, error: fetchError } = await supabase
        .from("events")
        .select("organizer_id, image_url")
        .eq("id", id)
        .single()

    if (fetchError || !existingEvent) {
        return { error: "Event not found" }
    }

    if (existingEvent.organizer_id !== user.id) {
        return { error: "You do not have permission to edit this event" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const date_start = formData.get("date_start") as string
    const date_end = formData.get("date_end") as string
    const price = Number(formData.get("price")) || 0
    const max_participants = Number(formData.get("max_participants")) || 0
    const imageFile = formData.get("image") as File

    let image_url = existingEvent.image_url

    // Handle cover image update
    if (imageFile && imageFile.size > 0) {
        try {
            image_url = await uploadImage(imageFile, "events")
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
            return { error: "Failed to upload image" }
        }
    }

    const { error } = await supabase.from("events").update({
        title,
        description,
        location,
        date_start: date_start || null,
        date_end: date_end || null,
        price,
        max_participants,
        image_url,
    }).eq("id", id)

    if (error) {
        console.error("Error updating event:", error)
        return { error: "Failed to update event" }
    }

    revalidatePath("/event")
    revalidatePath(`/event/${id}`)
    redirect(`/event/${id}`)
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: "Unauthorized" }
    }

    // Check if event exists and belongs to user
    const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("organizer_id, image_url")
        .eq("id", eventId)
        .single()

    if (fetchError || !event) {
        return { error: "Event not found" }
    }

    if (event.organizer_id !== user.id) {
        return { error: "You are not authorized to delete this event" }
    }

    // Delete image from Cloudinary
    try {
        if (event.image_url) {
            const publicId = getPublicIdFromUrl(event.image_url)
            if (publicId) {
                await deleteImage(publicId)
            }
        }
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error)
    }

    // Delete event
    const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)

    if (deleteError) {
        return { error: "Failed to delete event" }
    }

    revalidatePath("/event")
    revalidatePath("/")
    return { success: true }
}
