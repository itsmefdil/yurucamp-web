import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import api from '../../lib/api';
import type { Event } from '../../types';

interface DeleteEventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: Event | null;
}

export function DeleteEventDialog({ open, onOpenChange, event }: DeleteEventDialogProps) {
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!event) return;

        try {
            setIsDeleting(true);
            await api.delete(`/events/${event.id}`);

            toast.success("Event berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ['events'] });

            // If we are on the event detail page, we might want to redirect, 
            // but this dialog is primarily for dashboard use.
            // If used in detail page, the parent component handles redirect.

            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus event");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah anda yakin ingin menghapus event <span className="font-bold text-gray-900">"{event?.title}"</span>?
                        <br />
                        Tindakan ini tidak dapat dibatalkan. Data peserta dan diskusi juga akan terhapus.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menghapus...
                            </>
                        ) : (
                            'Hapus Event'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
