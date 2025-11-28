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
        { href: "/profil", label: "Profil", icon: User },
    ]

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
            <nav className="flex items-center justify-around bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white/50 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-gray-400 hover:text-primary/70"
                            )}
                        >
                            {item.href === "/profil" ? (
                                <Link href="/profile" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-primary transition-colors">
                                    <User className="h-6 w-6" />
                                    <span className="text-xs font-medium">Profil</span>
                                </Link>
                            ) : (
                                <>
                                    <item.icon className={cn("h-6 w-6", isActive && "fill-current")} />
                                    <span className="text-[10px] font-bold sr-only">{item.label}</span>
                                </>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
