"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotificationsPage() {
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
                        <h1 className="text-2xl font-black text-gray-800">Notifikasi</h1>
                    </div>

                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-6">
                                <h3 className="font-bold text-gray-800 text-lg">Aktivitas</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Booking Baru</Label>
                                            <p className="text-sm text-gray-500">Notifikasi saat booking berhasil dibuat</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Pengingat Jadwal</Label>
                                            <p className="text-sm text-gray-500">Ingatkan 1 hari sebelum jadwal camping</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Status Pembayaran</Label>
                                            <p className="text-sm text-gray-500">Update status pembayaran booking</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-gray-800 text-lg">Promo & Info</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Promo Spesial</Label>
                                            <p className="text-sm text-gray-500">Info diskon dan penawaran menarik</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Rekomendasi Tempat</Label>
                                            <p className="text-sm text-gray-500">Saran tempat camping baru</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Newsletter</Label>
                                            <p className="text-sm text-gray-500">Berita dan tips camping mingguan</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
