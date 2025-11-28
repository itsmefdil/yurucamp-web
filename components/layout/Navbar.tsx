"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
    return (
        <header className="sticky top-4 z-50 w-full px-4">
            <div className="container mx-auto bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white/50 relative">
                <div className="flex h-20 items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Image src="/logo.png" alt="YuruCamp Logo" width={120} height={40} className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-base font-bold text-gray-600">
                        <Link href="/" className="transition-colors hover:text-primary hover:scale-105 transform">
                            Beranda
                        </Link>
                        <Link href="/aktifitas" className="transition-colors hover:text-primary hover:scale-105 transform">
                            Aktifitas
                        </Link>
                        <Link href="/camp-area" className="transition-colors hover:text-primary hover:scale-105 transform">
                            Camp Area
                        </Link>
                        <Link href="/acara" className="transition-colors hover:text-primary hover:scale-105 transform">
                            Acara
                        </Link>
                        <Link href="/nonton" className="transition-colors hover:text-primary hover:scale-105 transform">
                            Nonton
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button className="rounded-full px-6 shadow-md" asChild>
                            <Link href="/login">Masuk</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
