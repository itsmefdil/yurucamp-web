"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

interface ParticipantsModalProps {
    participants: any[]
    totalCount: number
    maxParticipants: number | null
}

export function ParticipantsModal({ participants, totalCount, maxParticipants }: ParticipantsModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full rounded-full">
                    Lihat Semua Peserta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Users className="w-5 h-5 text-primary" />
                        Daftar Peserta ({totalCount}/{maxParticipants || '∞'})
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                    {participants && participants.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {participants.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                                    <Avatar className="h-10 w-10 border border-white shadow-sm">
                                        <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold">
                                            {p.user?.full_name?.[0] || "?"}
                                        </AvatarFallback>
                                        <AvatarImage src={p.user?.avatar_url} />
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {p.user?.full_name || "Tanpa Nama"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Bergabung {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                            <p>Belum ada peserta.</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
