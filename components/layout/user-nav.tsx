"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Settings, LogOut, ChevronDown } from "lucide-react"
import { logout } from "@/app/auth/actions"

export function UserNav() {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(profile)
            }
            setLoading(false)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                setProfile(profile)
            } else {
                setProfile(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    if (loading) {
        return (
            <div className="relative h-12 w-auto rounded-full p-1 pr-4 flex items-center gap-3 bg-white/50">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex flex-col gap-1.5">
                    <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-2.5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <Button className="rounded-full px-4 lg:px-6 h-8 lg:h-10 text-xs lg:text-sm shadow-none lg:shadow-md" asChild>
                <Link href="/login">Masuk</Link>
            </Button>
        )
    }

    // Get initials or first letter of email
    const name = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'User'
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture

    const initials = name !== 'User'
        ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.[0].toUpperCase() ?? "U"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-auto rounded-full p-1 pr-4 hover:bg-gray-100 transition-all duration-200 group">
                    <div className="flex items-center gap-3 text-left">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors line-clamp-1 max-w-[100px] lg:max-w-[150px]">
                                {name}
                            </span>
                            <span className="text-xs text-gray-500 line-clamp-1 max-w-[100px] lg:max-w-[150px]">
                                {user.email}
                            </span>
                        </div>

                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/pengaturan" className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
