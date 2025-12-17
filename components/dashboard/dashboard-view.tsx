"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Settings, LogOut, Edit, Tent, Ticket, Plus, Mountain } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"

interface DashboardViewProps {
    profile: any
    activities: any[]
    campAreas: any[]
}

export function DashboardView({ profile, activities, campAreas }: DashboardViewProps) {
    const [activeTab, setActiveTab] = useState("camp-areas")

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
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">Camper</span>
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

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Tent, label: "Camp Area", count: campAreas.length, color: "text-green-500", bg: "bg-green-50" },
                    { icon: Mountain, label: "Aktifitas", count: activities.length, color: "text-orange-500", bg: "bg-orange-50" },
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
                        onClick={() => setActiveTab("camp-areas")}
                        variant={activeTab === "camp-areas" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "camp-areas" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Camp Area Saya
                    </Button>
                    <Button
                        onClick={() => setActiveTab("activities")}
                        variant={activeTab === "activities" ? "default" : "ghost"}
                        className={cn("rounded-full px-6 shadow-sm", activeTab !== "activities" && "text-gray-500 hover:text-primary hover:bg-orange-50")}
                    >
                        Aktifitas Saya
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
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* Camp Areas Tab */}
                    {activeTab === "camp-areas" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Daftar Camp Area</h2>
                                <Button className="rounded-full gap-2" asChild>
                                    <Link href="/dashboard/add-camp-area">
                                        <Plus className="h-4 w-4" /> Tambah Camp Area
                                    </Link>
                                </Button>
                            </div>

                            {campAreas.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Tent className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada Camp Area</h3>
                                    <p className="text-gray-500 mb-6">Mulai sewakan lahan campingmu sekarang</p>
                                    <Button variant="outline" className="rounded-full" asChild>
                                        <Link href="/dashboard/add-camp-area">Tambah Camp Area Baru</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {campAreas.map((camp) => (
                                        <Card key={camp.id} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="flex flex-col md:flex-row">
                                                <div className="w-full md:w-48 aspect-video md:aspect-auto bg-gray-200 relative">
                                                    {camp.image_url ? (
                                                        <img src={camp.image_url} alt={camp.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Tent className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 p-6 flex flex-col justify-between">
                                                    <div className="mb-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-gray-800">{camp.name}</h3>
                                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" /> {camp.location}
                                                                </p>
                                                            </div>
                                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                                Aktif
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2">{camp.description}</p>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Button size="sm" variant="outline" className="rounded-full" asChild>
                                                            <Link href={`/camp-area/${camp.id}`}>Lihat</Link>
                                                        </Button>
                                                        <Button size="sm" className="rounded-full gap-2" asChild>
                                                            <Link href={`/dashboard/edit-camp-area/${camp.id}`}>
                                                                <Edit className="h-3 w-3" /> Edit
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activities Tab */}
                    {activeTab === "activities" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Daftar Aktifitas</h2>
                                <Button className="rounded-full gap-2" asChild>
                                    <Link href="/dashboard/add-activity">
                                        <Plus className="h-4 w-4" /> Tambah Aktifitas
                                    </Link>
                                </Button>
                            </div>

                            {activities.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Mountain className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada Aktifitas</h3>
                                    <p className="text-gray-500 mb-6">Bagikan pengalaman seru campingmu</p>
                                    <Button variant="outline" className="rounded-full" asChild>
                                        <Link href="/dashboard/add-activity">Buat Aktifitas Baru</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {activities.map((activity) => (
                                        <Card key={activity.id} className="border-none shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="flex flex-col md:flex-row">
                                                <div className="w-full md:w-48 aspect-video md:aspect-auto bg-gray-200 relative">
                                                    {activity.image_url ? (
                                                        <img src={activity.image_url} alt={activity.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Mountain className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 p-6 flex flex-col justify-between">
                                                    <div className="mb-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
                                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" /> {activity.location}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" /> {activity.date ? new Date(activity.date).toLocaleDateString() : 'No Date'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Button size="sm" variant="outline" className="rounded-full" asChild>
                                                            <Link href={`/activity/${activity.id}`}>Lihat</Link>
                                                        </Button>
                                                        <Button size="sm" className="rounded-full gap-2" asChild>
                                                            <Link href={`/dashboard/edit-activity/${activity.id}`}>
                                                                <Edit className="h-3 w-3" /> Edit
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bookings Placeholder */}
                    {activeTab === "booking" && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Ticket className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada Riwayat Booking</h3>
                            <p className="text-gray-500">Riwayat booking tempat camping akan muncul di sini.</p>
                        </div>
                    )}

                    {/* Events Placeholder */}
                    {activeTab === "events" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">Acara Saya</h2>
                                <Button className="rounded-full gap-2" asChild>
                                    <Link href="/dashboard/add-event">
                                        <Plus className="h-4 w-4" /> Buat Acara
                                    </Link>
                                </Button>
                            </div>

                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Ticket className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada Acara</h3>
                                <p className="text-gray-500 mb-6">Kamu belum mendaftar atau membuat acara apapun.</p>
                                <Button variant="outline" className="rounded-full" asChild>
                                    <Link href="/event">Cari Acara Seru</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
