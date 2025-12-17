"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { joinEvent, leaveEvent } from "@/app/actions/events"
import { useRouter } from "next/navigation"

interface JoinEventButtonProps {
    eventId: string
    isParticipating: boolean
    className?: string
    isFull?: boolean
}

export function JoinEventButton({ eventId, isParticipating, className, isFull }: JoinEventButtonProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleJoin = () => {
        startTransition(async () => {
            const result = await joinEvent(eventId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Berhasil mendaftar acara! 🎉")
                router.refresh()
            }
        })
    }

    const handleLeave = () => {
        startTransition(async () => {
            const result = await leaveEvent(eventId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.info("Pendaftaran dibatalkan.")
                router.refresh()
            }
        })
    }

    if (isParticipating) {
        return (
            <Button
                size="lg"
                variant="outline"
                className={`border-red-500 text-red-500 hover:bg-red-50 ${className}`}
                disabled={isPending}
                onClick={handleLeave}
            >
                {isPending ? "Memproses..." : "Batal Daftar"}
            </Button>
        )
    }

    return (
        <Button
            size="lg"
            className={`rounded-full shadow-lg ${className}`}
            disabled={isPending || isFull}
            onClick={handleJoin}
        >
            {isPending ? "Memproses..." : isFull ? "Kuota Penuh" : "Daftar Sekarang"}
        </Button>
    )
}
