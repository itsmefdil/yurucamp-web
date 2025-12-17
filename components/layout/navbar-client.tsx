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
import { UserNav } from "@/components/layout/user-nav"
import { User as SupabaseUser } from "@supabase/supabase-js"

interface NavbarClientProps {
    user: SupabaseUser | null
    profile: any
}

export function NavbarClient({ user, profile }: NavbarClientProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full lg:top-4 lg:px-4 bg-transparent">
            <div className="container mx-auto bg-white/80 backdrop-blur-md lg:bg-white/90 lg:backdrop-blur-md rounded-none lg:rounded-full lg:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-b border-white/20 lg:border-2 lg:border-white/50 relative">
                <div className="flex h-14 lg:h-20 items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Image src="/logo.png" alt="YuruCamp Logo" width={120} height={40} className="h-8 lg:h-10 w-auto object-contain hover:scale-105 transition-transform" />
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8 text-base font-bold text-gray-600">
                        <Link href="/" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Home className="w-4 h-4" />
                            Beranda
                        </Link>

                        <Link href="/aktifitas" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Mountain className="w-4 h-4" />
                            Aktifitas
                        </Link>

                        <Link href="/camp-area" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Tent className="w-4 h-4" />
                            Camp Area
                        </Link>

                        <Link href="/event" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <Calendar className="w-4 h-4" />
                            Acara
                        </Link>

                        <Link href="/watch" className="flex items-center gap-2 transition-colors hover:text-primary hover:scale-105 transform">
                            <PlayCircle className="w-4 h-4" />
                            Nonton
                        </Link>

                    </nav>

                    <div className="flex items-center gap-4">
                        <UserNav user={user} profile={profile} />
                    </div>
                </div>
            </div>
        </header>
    )
}
