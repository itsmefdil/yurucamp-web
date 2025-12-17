"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Settings, LogOut, Edit, Heart, Tent, Ticket, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"

interface DashboardViewProps {
    profile: any
}

export function DashboardView({ profile }: DashboardViewProps) {
    const [activeTab, setActiveTab] = useState("menu")

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>{profile?.full_name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <Button size="icon" className="absolute bottom-0 right-0 rounded-full shadow-md h-10 w-10 border-2 border-white" asChild>
                        <Link href="/dashboard/pengaturan/edit-profil">
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-black text-gray-800">{profile?.full_name ?? 'User'}</h1>
                    <p className="text-gray-500 font-medium">{profile?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">Camper Pemula</span>
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Member sejak {new Date(profile?.created_at || Date.now()).getFullYear()}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button variant="outline" className="rounded-full border-2 gap-2" asChild>
                        <Link href="/dashboard/pengaturan">
                            <Settings className="h-4 w-4" />
                            Pengaturan
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        className="rounded-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => logout()}
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </Button>
                </div>
            </div>

            {/* Stats / Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Tent, label: "Camp Area", count: "12", color: "text-green-500", bg: "bg-green-50" },
                    { icon: Ticket, label: "Tiket Acara", count: "3", color: "text-blue-500", bg: "bg-blue-50" },
                    { icon: Heart, label: "Disukai", count: "48", color: "text-red-500", bg: "bg-red-50" },
                    { icon: Calendar, label: "Hari Camping", count: "24", color: "text-orange-500", bg: "bg-orange-50" },
                ].map((item, i) => (
                    <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white">
                        <CardContent className="p-6 flex flex-col items-center justify-center gap-2 text-center">
                            <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} mb-2`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">{item.count}</h3>
                            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs Section */}
            <div className="space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Button
                        onClick={() => setActiveTab("menu")}
                        variant={activeTab === "menu" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "menu" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Menu
                    </Button>
                    <Button
                        onClick={() => setActiveTab("booking")}
                        variant={activeTab === "booking" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "booking" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Riwayat Booking
                    </Button>
                    <Button
                        onClick={() => setActiveTab("events")}
                        variant={activeTab === "events" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "events" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Acara Saya
                    </Button>
                    <Button
                        onClick={() => setActiveTab("posts")}
                        variant={activeTab === "posts" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "posts" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Postingan
                    </Button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {activeTab === "booking" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {[1, 2].map((i) => (
                                <Card key={i} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-48 aspect-video md:aspect-auto bg-gray-200" />
                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-800">Pine Forest Camp {i}</h3>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" /> Lembang, Bandung
                                                        </p>
                                                    </div>
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                        Selesai
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" /> 1{i} Nov 2024
                                                    </span>
                                                    <span>•</span>
                                                    <span>2 Malam</span>
                                                    <span>•</span>
                                                    <span>Rp 150.000</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button size="sm" variant="outline" className="rounded-full">Beri Ulasan</Button>
                                                <Button size="sm" className="rounded-full">Booking Lagi</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === "events" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-32 aspect-square bg-orange-100 flex items-center justify-center text-orange-400 font-bold text-2xl">
                                            2{i}
                                            <span className="text-xs font-normal block mt-1">NOV</span>
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-800">Gathering Nasional YuruCamp {i}</h3>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" /> Cibubur, Jakarta
                                                        </p>
                                                    </div>
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                                        Terdaftar
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Tiket masuk: <span className="font-bold text-primary">Rp 50.000</span>
                                                </p>
                                            </div>
                                            <div className="flex gap-3 mt-4">
                                                <Button size="sm" variant="outline" className="rounded-full">Lihat Tiket</Button>
                                                <Button size="sm" className="rounded-full">Detail Acara</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === "posts" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-video bg-gray-200 relative group cursor-pointer">
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-5 w-5 fill-current" /> 12{i}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-5 w-5 fill-current" /> 4{i}
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <p className="text-gray-800 font-medium line-clamp-2">
                                            Camping seru di akhir pekan bersama teman-teman! Pemandangannya indah banget 😍 #YuruCamp #Camping
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">2 hari yang lalu</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === "menu" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Link href="/dashboard/add-activity">
                                <Card className="border-2 border-dashed border-gray-200 shadow-none bg-transparent hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 min-h-[200px] h-full">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                    <p className="font-bold text-gray-500">Tambah Aktifitas Baru</p>
                                </Card>
                            </Link>
                            <Link href="/dashboard/add-camp-area">
                                <Card className="border-2 border-dashed border-gray-200 shadow-none bg-transparent hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 min-h-[200px] h-full">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                        <Tent className="h-6 w-6" />
                                    </div>
                                    <p className="font-bold text-gray-500">Tambah Camp Area</p>
                                </Card>
                            </Link>
                            <Link href="/dashboard/add-event">
                                <Card className="border-2 border-dashed border-gray-200 shadow-none bg-transparent hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 min-h-[200px] h-full">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                        <Ticket className="h-6 w-6" />
                                    </div>
                                    <p className="font-bold text-gray-500">Buat Acara</p>
                                </Card>
                            </Link>
                            <Link href="/dashboard/pengaturan">
                                <Card className="border-2 border-dashed border-gray-200 shadow-none bg-transparent hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 min-h-[200px] h-full">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                        <Settings className="h-6 w-6" />
                                    </div>
                                    <p className="font-bold text-gray-500">Pengaturan Akun</p>
                                </Card>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
