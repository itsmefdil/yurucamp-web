import { Dialog, DialogContent } from './dialog';
import { X } from 'lucide-react';
import { Button } from './button';

interface ImagePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageUrl?: string;
    alt?: string;
}

export function ImagePreviewDialog({ open, onOpenChange, imageUrl, alt = 'Preview' }: ImagePreviewDialogProps) {
    if (!imageUrl) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-6 w-6" />
                </Button>
                <div className="relative w-full h-[80vh] flex items-center justify-center p-4">
                    <img
                        src={imageUrl}
                        alt={alt}
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
