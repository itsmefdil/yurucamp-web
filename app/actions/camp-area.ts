'use server'

import { createClient } from "@/lib/supabase/server"
import { uploadImage, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"

export async function createCampArea(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const price = formData.get("price") as string
    const imageFile = formData.get("image") as File
    const additionalImageFiles = formData.getAll("additional_images") as File[]

    if (additionalImageFiles.length > 10) {
        return { error: "Maksimal 10 foto tambahan diperbolehkan" }
    }

    console.log("Form Data Received:")
    console.log("Name:", name)
    console.log("Image File:", imageFile)
    console.log("Additional Images:", additionalImageFiles.length)

    // Get facilities from checkboxes
    const facilities: string[] = []
    if (formData.get("wifi") === "on") facilities.push("Wifi")
    if (formData.get("parking") === "on") facilities.push("Parkir")
    if (formData.get("canteen") === "on") facilities.push("Kantin")
    if (formData.get("tent") === "on") facilities.push("Sewa Tenda")
    if (formData.get("info") === "on") facilities.push("Pusat Info")

    let image_url = null
    let additional_images: string[] = []

    if (imageFile && imageFile.size > 0) {
        try {
            console.log("Attempting to upload to Cloudinary...")
            image_url = await uploadImage(imageFile, "camp_areas")
            console.log("Upload successful, URL:", image_url)
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
            return { error: "Failed to upload image" }
        }
    } else {
        console.log("No image file provided or file size is 0")
    }

    if (additionalImageFiles && additionalImageFiles.length > 0) {
        try {
            console.log("Uploading additional images...")
            // Upload sequentially to avoid hitting limits or timeouts
            const filesToUpload = additionalImageFiles.filter(file => file.size > 0)

            for (const file of filesToUpload) {
                try {
                    const url = await uploadImage(file, "camp_areas")
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

    const { error } = await supabase.from("camp_areas").insert({
        name,
        description,
        location,
        price: price ? parseFloat(price) : null,
        image_url,
        additional_images: additional_images.length > 0 ? additional_images : null,
        facilities: facilities.length > 0 ? facilities : null,
        user_id: user.id
    })

    if (error) {
        console.error("Error inserting camp area:", error)
        return { error: error.message }
    }

    revalidatePath("/camp-area")
    redirect("/camp-area")
}

export async function updateCampArea(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Fetch existing data to compare images
    const { data: existingData, error: fetchError } = await supabase
        .from("camp_areas")
        .select("image_url, additional_images")
        .eq("id", id)
        .single()

    if (fetchError || !existingData) {
        return { error: "Camp area not found" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const price = formData.get("price") as string
    const imageFile = formData.get("image") as File
    const additionalImageFiles = formData.getAll("additional_images") as File[]
    const keptImages = formData.getAll("kept_images") as string[]

    if (keptImages.length + additionalImageFiles.length > 10) {
        return { error: "Maksimal 10 foto tambahan diperbolehkan" }
    }

    // Get facilities from checkboxes
    const facilities: string[] = []
    if (formData.get("wifi") === "on") facilities.push("Wifi")
    if (formData.get("parking") === "on") facilities.push("Parkir")
    if (formData.get("canteen") === "on") facilities.push("Kantin")
    if (formData.get("tent") === "on") facilities.push("Sewa Tenda")
    if (formData.get("info") === "on") facilities.push("Pusat Info")

    let image_url = null
    let additional_images: string[] = keptImages || []

    // Handle main image update
    if (imageFile && imageFile.size > 0) {
        try {
            // Delete old image if it exists
            if (existingData.image_url) {
                const publicId = getPublicIdFromUrl(existingData.image_url)
                if (publicId) {
                    await deleteImage(publicId)
                }
            }
            image_url = await uploadImage(imageFile, "camp_areas")
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
            return { error: "Failed to upload image" }
        }
    }

    // Handle removed additional images
    if (existingData.additional_images) {
        const removedImages = existingData.additional_images.filter(
            (img: string) => !keptImages.includes(img)
        )

        for (const img of removedImages) {
            const publicId = getPublicIdFromUrl(img)
            if (publicId) {
                await deleteImage(publicId)
            }
        }
    }

    // Handle additional images upload
    if (additionalImageFiles && additionalImageFiles.length > 0) {
        try {
            // Upload sequentially to avoid hitting limits or timeouts
            const filesToUpload = additionalImageFiles.filter(file => file.size > 0)

            for (const file of filesToUpload) {
                try {
                    const url = await uploadImage(file, "camp_areas")
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

    const updateData: any = {
        name,
        description,
        location,
        price: price ? parseFloat(price) : null,
        facilities: facilities.length > 0 ? facilities : null,
        additional_images: additional_images.length > 0 ? additional_images : null,
    }

    if (image_url) {
        updateData.image_url = image_url
    }

    const { error } = await supabase
        .from("camp_areas")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error updating camp area:", error)
        return { error: error.message }
    }

    revalidatePath("/camp-area")
    revalidatePath(`/camp-area/${id}`)
    redirect(`/camp-area/${id}`)
}

export async function deleteCampArea(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Fetch existing data to get images
    const { data: campArea, error: fetchError } = await supabase
        .from("camp_areas")
        .select("image_url, additional_images, user_id")
        .eq("id", id)
        .single()

    if (fetchError || !campArea) {
        return { error: "Camp area not found" }
    }

    // Check ownership
    if (campArea.user_id !== user.id) {
        return { error: "Unauthorized" }
    }

    // Delete from database first for instant feedback
    const { error } = await supabase
        .from("camp_areas")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting camp area:", error)
        return { error: error.message }
    }

    // Schedule image deletion in background
    after(async () => {
        try {
            // Delete main image
            if (campArea.image_url) {
                const publicId = getPublicIdFromUrl(campArea.image_url)
                if (publicId) {
                    await deleteImage(publicId)
                }
            }

            // Delete additional images
            if (campArea.additional_images && campArea.additional_images.length > 0) {
                for (const img of campArea.additional_images) {
                    const publicId = getPublicIdFromUrl(img)
                    if (publicId) {
                        await deleteImage(publicId)
                    }
                }
            }
        } catch (error) {
            console.error("Error deleting images from Cloudinary (background task):", error)
        }
    })

    revalidatePath("/camp-area")
    redirect("/camp-area")
}
