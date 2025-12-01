"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Mountain, Tent, Calendar, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { href: "/", label: "Beranda", icon: Home },
        { href: "/aktifitas", label: "Aktifitas", icon: Mountain },
        { href: "/camp-area", label: "Camp Area", icon: Tent },
        { href: "/acara", label: "Acara", icon: Calendar },
        { href: "/nonton", label: "Nonton", icon: PlayCircle },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-100 pb-safe">
            <nav className="flex items-center justify-around p-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 transition-all duration-200",
                                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-7 w-7 transition-transform duration-200",
                                    isActive ? "stroke-[2.5] scale-110" : "stroke-[1.5]"
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
