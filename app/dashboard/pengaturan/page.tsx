"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-gray-800">Pengaturan</h1>
                        <p className="text-gray-500">Kelola akun dan preferensi aplikasi anda</p>
                    </div>

                    <div className="space-y-6">
                        {/* Account Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 px-2">Akun Saya</h2>
                            <Card className="border-none shadow-md bg-white overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        <Link href="/dashboard" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800">Nadeshiko Kagamihara</p>
                                                <p className="text-sm text-gray-500">nadeshiko@yurucamp.id</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                        <Link href="/dashboard/pengaturan/edit-profil" className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">Edit Profil</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                        <Link href="/dashboard/pengaturan/ubah-password" className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">Ubah Password</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Preferences Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 px-2">Preferensi</h2>
                            <Card className="border-none shadow-md bg-white overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        <Link href="/dashboard/pengaturan/notifikasi" className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                                <Bell className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">Notifikasi</p>
                                                <p className="text-xs text-gray-500">Atur notifikasi aplikasi</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                        <Link href="/dashboard/pengaturan/bahasa" className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">Bahasa</p>
                                                <p className="text-xs text-gray-500">Indonesia</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Support Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 px-2">Lainnya</h2>
                            <Card className="border-none shadow-md bg-white overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        <Link href="/dashboard/pengaturan/bantuan" className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <HelpCircle className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">Bantuan & Dukungan</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                        <Link href="/dashboard/pengaturan/privasi" className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">Kebijakan Privasi</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                        <button className="w-full flex items-center gap-4 p-4 hover:bg-red-50 transition-colors text-left group">
                                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                                                <LogOut className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-red-500">Keluar</p>
                                            </div>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        <div className="text-center pt-8 pb-4">
                            <p className="text-xs text-gray-400">YuruCamp Indonesia v1.0.0</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
