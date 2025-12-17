"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Mountain, Tent, Calendar, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { href: "/", label: "Beranda", icon: Home },
        { href: "/aktifitas", label: "Aktifitas", icon: Mountain },
        { href: "/camp-area", label: "Camp Area", icon: Tent },
        { href: "/acara", label: "Acara", icon: Calendar },
        { href: "/watch", label: "Nonton", icon: PlayCircle },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/80 backdrop-blur-lg border-t border-gray-100 pb-safe">
            <nav className="flex items-center justify-around p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-2 rounded-xl transition-colors duration-200",
                                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-pill"
                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30
                                    }}
                                />
                            )}

                            <item.icon
                                className={cn(
                                    "h-6 w-6 relative z-10 transition-transform duration-200",
                                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.5]"
                                )}
                            />
                            <span className={cn(
                                "text-[10px] font-medium mt-1 relative z-10 transition-all duration-200",
                                isActive ? "font-bold" : ""
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
