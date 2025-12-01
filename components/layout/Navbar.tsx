"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Home, Mountain, Tent, Calendar, PlayCircle, User, ChevronDown, Info } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
                        <Link href="/" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Home className="w-4 h-4" />
                            Beranda
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform outline-none">
                                Jelajahi <ChevronDown className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href="/aktifitas" className="flex items-center gap-2 cursor-pointer">
                                        <Mountain className="w-4 h-4" />
                                        Aktifitas
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/camp-area" className="flex items-center gap-2 cursor-pointer">
                                        <Tent className="w-4 h-4" />
                                        Camp Area
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href="/acara" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Calendar className="w-4 h-4" />
                            Acara
                        </Link>

                        <Link href="/nonton" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <PlayCircle className="w-4 h-4" />
                            Nonton
                        </Link>

                        <Link href="/tentang" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Info className="w-4 h-4" />
                            Tentang
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <User className="w-5 h-5 text-gray-600" />
                        </Link>
                        <Button className="rounded-full px-4 md:px-6 h-8 md:h-10 text-xs md:text-sm shadow-none md:shadow-md" asChild>
                            <Link href="/login">Masuk</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
