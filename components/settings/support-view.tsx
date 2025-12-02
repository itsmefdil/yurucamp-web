"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"

export function SupportView() {
    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/dashboard/pengaturan">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-black text-gray-800">Bantuan & Dukungan</h1>
            </div>

            <div className="space-y-6">
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 px-2">Pertanyaan Umum (FAQ)</h2>
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Bagaimana cara melakukan booking?</AccordionTrigger>
                                    <AccordionContent>
                                        Pilih area camping yang diinginkan, klik tombol "Booking", pilih tanggal dan jumlah orang, lalu selesaikan pembayaran.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Apakah bisa membatalkan pesanan?</AccordionTrigger>
                                    <AccordionContent>
                                        Ya, pembatalan dapat dilakukan maksimal 3 hari sebelum tanggal check-in. Pengembalian dana akan diproses dalam 1-3 hari kerja.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Metode pembayaran apa saja yang tersedia?</AccordionTrigger>
                                    <AccordionContent>
                                        Kami menerima pembayaran via Transfer Bank (BCA, Mandiri, BNI), E-Wallet (GoPay, OVO, Dana), dan Kartu Kredit.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 px-2">Hubungi Kami</h2>
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 border-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                                    <MessageCircle className="h-6 w-6" />
                                    <span className="text-xs">WhatsApp</span>
                                </Button>
                                <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 border-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                    <Mail className="h-6 w-6" />
                                    <span className="text-xs">Email</span>
                                </Button>
                                <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 border-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200">
                                    <Phone className="h-6 w-6" />
                                    <span className="text-xs">Telepon</span>
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subjek</Label>
                                    <Input id="subject" placeholder="Contoh: Masalah Pembayaran" className="rounded-xl bg-gray-50 border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Pesan</Label>
                                    <Textarea id="message" placeholder="Jelaskan masalah anda..." className="rounded-xl bg-gray-50 border-gray-200 min-h-[120px]" />
                                </div>
                                <Button className="w-full rounded-full py-6 shadow-md">
                                    Kirim Pesan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}
