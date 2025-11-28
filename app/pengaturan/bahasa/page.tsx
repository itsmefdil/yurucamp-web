"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LanguagePage() {
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
                        <h1 className="text-2xl font-black text-gray-800">Bahasa</h1>
                    </div>

                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-8">
                            <RadioGroup defaultValue="id" className="space-y-4">
                                <div className="flex items-center justify-between space-x-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <Label htmlFor="id" className="flex-1 cursor-pointer font-medium">Bahasa Indonesia</Label>
                                    <RadioGroupItem value="id" id="id" />
                                </div>
                                <div className="flex items-center justify-between space-x-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <Label htmlFor="en" className="flex-1 cursor-pointer font-medium">English</Label>
                                    <RadioGroupItem value="en" id="en" />
                                </div>
                                <div className="flex items-center justify-between space-x-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                                    <Label htmlFor="jp" className="flex-1 cursor-pointer font-medium">日本語 (Japanese)</Label>
                                    <RadioGroupItem value="jp" id="jp" />
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
