"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActivityGalleryProps {
    images: string[]
}

export function ActivityGallery({ images }: ActivityGalleryProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    const openGallery = (index: number) => {
        setCurrentIndex(index)
        setIsOpen(true)
    }

    const closeGallery = () => {
        setIsOpen(false)
    }

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    if (!images || images.length === 0) return null

    return (
        <>
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 px-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Galeri Foto
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer ring-1 ring-black/5"
                            onClick={() => openGallery(index)}
                        >
                            <Image
                                src={img}
                                alt={`Foto tambahan ${index + 1}`}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={closeGallery}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full z-50"
                        onClick={closeGallery}
                    >
                        <X className="h-6 w-6" />
                    </Button>

                    <div
                        className="relative w-full max-w-5xl aspect-video flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={images[currentIndex]}
                                alt={`Gallery image ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                                priority
                                quality={100}
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12 z-50 backdrop-blur-sm border border-white/10"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12 z-50 backdrop-blur-sm border border-white/10"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </>
                        )}

                        <div className="absolute -bottom-12 left-0 right-0 text-center text-white/70 text-sm font-medium">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
