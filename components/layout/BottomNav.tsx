"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, MapPin, Calendar, User, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { href: "/", label: "Beranda", icon: Home },
        { href: "/aktifitas", label: "Aktifitas", icon: Activity },
        { href: "/camp-area", label: "Camp Area", icon: MapPin },
        { href: "/acara", label: "Acara", icon: Calendar },
        { href: "/nonton", label: "Nonton", icon: PlayCircle },
        { href: "/profile", label: "Profil", icon: User },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 pb-safe">
            <nav className="flex items-center justify-around p-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 transition-all duration-200",
                                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-7 w-7 transition-transform duration-200",
                                    isActive ? "fill-current scale-105" : "stroke-[1.5]"
                                )}
                            />
                            <span className="sr-only">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
