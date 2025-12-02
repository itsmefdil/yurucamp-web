"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ChangePasswordForm() {
    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/dashboard/pengaturan">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-black text-gray-800">Ubah Password</h1>
            </div>

            <Card className="border-none shadow-lg bg-white overflow-hidden">
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Password Saat Ini</Label>
                        <Input id="current-password" type="password" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Password Baru</Label>
                        <Input id="new-password" type="password" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                        <Input id="confirm-password" type="password" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                    </div>

                    <div className="pt-4">
                        <Button className="w-full rounded-full py-6 text-lg shadow-lg">
                            Update Password
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
