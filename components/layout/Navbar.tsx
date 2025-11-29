"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
    return (
        <header className="sticky top-0 md:sticky md:top-4 md:mt-4 z-50 w-full md:px-4 bg-white md:bg-transparent">
            <div className="container mx-auto bg-white md:bg-white/90 md:backdrop-blur-md rounded-none md:rounded-full md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-b border-gray-100 md:border-2 md:border-white/50 relative">
                <div className="flex h-14 md:h-20 items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Image src="/logo.png" alt="YuruCamp Logo" width={120} height={40} className="h-8 md:h-10 w-auto object-contain hover:scale-105 transition-transform" />
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
                        <Button className="rounded-full px-4 md:px-6 h-8 md:h-10 text-xs md:text-sm shadow-none md:shadow-md" asChild>
                            <Link href="/login">Masuk</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
