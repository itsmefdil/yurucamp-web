"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Camera } from "lucide-react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { updateProfile } from "@/app/auth/actions"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EditProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const [preview, setPreview] = useState<string | null>(null)

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
                setPreview(data?.avatar_url)
            }
            setLoading(false)
        }
        getProfile()
    }, [supabase])

    async function handleSubmit(formData: FormData) {
        setSaving(true)
        setMessage(null)

        const result = await updateProfile(formData)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: "Profil berhasil diperbarui!" })
            router.refresh()
        }
        setSaving(false)
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full" asChild>
                            <Link href="/dashboard/pengaturan">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-black text-gray-800">Edit Profil</h1>
                    </div>

                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <form action={handleSubmit} className="space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                            <AvatarImage src={preview || profile?.avatar_url} />
                                            <AvatarFallback>{profile?.full_name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 rounded-full shadow-md h-8 w-8 border-2 border-white bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                                            <Camera className="h-4 w-4" />
                                            <input
                                                id="avatar-upload"
                                                name="avatar"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-sm text-primary font-bold">Ubah Foto Profil</p>
                                </div>

                                {message && (
                                    <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nama Lengkap</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            defaultValue={profile?.full_name || ''}
                                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={profile?.email || ''}
                                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Input
                                            id="bio"
                                            name="bio"
                                            defaultValue={profile?.bio || ''}
                                            placeholder="Ceritakan sedikit tentang dirimu"
                                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Nomor Telepon</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            defaultValue={profile?.phone || ''}
                                            placeholder="+62..."
                                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full rounded-full py-6 text-lg shadow-lg" disabled={saving}>
                                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
