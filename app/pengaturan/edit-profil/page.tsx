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

export default function EditProfilePage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full" asChild>
                            <Link href="/pengaturan">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-black text-gray-800">Edit Profil</h1>
                    </div>

                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" className="absolute bottom-0 right-0 rounded-full shadow-md h-8 w-8 border-2 border-white">
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-primary font-bold cursor-pointer hover:underline">Ubah Foto Profil</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input id="name" defaultValue="Nadeshiko Kagamihara" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue="nadeshiko@yurucamp.id" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Input id="bio" defaultValue="Suka makan dan camping!" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Nomor Telepon</Label>
                                    <Input id="phone" type="tel" defaultValue="+62 812 3456 7890" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                                </div>
                            </div>

                            <Button className="w-full rounded-full py-6 text-lg shadow-lg">
                                Simpan Perubahan
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
