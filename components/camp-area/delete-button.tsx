"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteCampArea } from "@/app/camp-area/actions"
import { useState, useTransition } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteCampAreaButtonProps {
    id: string
}

export function DeleteCampAreaButton({ id }: DeleteCampAreaButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        startTransition(async () => {
            await deleteCampArea(id)
            setOpen(false)
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-white hover:bg-red-50 text-red-500 hover:text-red-600 shadow-lg border-none transition-all hover:scale-105"
                    disabled={isPending}
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Camp area ini akan dihapus secara permanen beserta semua fotonya.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        disabled={isPending}
                    >
                        {isPending ? "Menghapus..." : "Hapus"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
