'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { uploadImage, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary"

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function loginWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
    })

    if (data.url) {
        redirect(data.url)
    }

    if (error) {
        return { error: error.message }
    }
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    // Fetch current profile to get old avatar URL
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const bio = formData.get('bio') as string
    const phone = formData.get('phone') as string
    const avatarFile = formData.get('avatar') as File

    let avatarUrl = undefined
    if (avatarFile && avatarFile.size > 0) {
        try {
            avatarUrl = await uploadImage(avatarFile, 'avatars')

            // Delete old avatar if it exists and is a Cloudinary image
            if (currentProfile?.avatar_url) {
                const publicId = getPublicIdFromUrl(currentProfile.avatar_url)
                if (publicId) {
                    await deleteImage(publicId)
                }
            }
        } catch (error) {
            console.error("Error uploading avatar:", error)
            return { error: "Failed to upload avatar" }
        }
    }

    // Update profiles table
    const updateData: any = {
        full_name: fullName,
        email: email,
        bio: bio,
        phone: phone,
        updated_at: new Date().toISOString(),
    }

    if (avatarUrl) {
        updateData.avatar_url = avatarUrl
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (profileError) {
        return { error: profileError.message }
    }

    // Update auth.users metadata (optional, but good for sync)
    const authUpdateData: any = { full_name: fullName }
    if (avatarUrl) {
        authUpdateData.avatar_url = avatarUrl
        authUpdateData.picture = avatarUrl
    }

    const { error: authError } = await supabase.auth.updateUser({
        data: authUpdateData
    })

    if (authError) {
        return { error: authError.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/pengaturan/edit-profil')
    return { success: "Profile updated successfully" }
}
