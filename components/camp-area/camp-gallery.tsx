"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CampAreaGalleryProps {
    images: string[]
}

export function CampAreaGallery({ images }: CampAreaGalleryProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Swipe state
    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)

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

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX
    }

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return

        const distance = touchStartX.current - touchEndX.current
        const minSwipeDistance = 50

        if (distance > minSwipeDistance) {
            // Swiped Left -> Next
            setCurrentIndex((prev) => (prev + 1) % images.length)
        } else if (distance < -minSwipeDistance) {
            // Swiped Right -> Prev
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
        }

        // Reset
        touchStartX.current = null
        touchEndX.current = null
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") nextImage()
        if (e.key === "ArrowLeft") prevImage()
        if (e.key === "Escape") closeGallery()
    }

    if (!images || images.length === 0) return null

    return (
        <>
            {/* Thumbnail Grid (Main Page View) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gray-100",
                            index === 0 ? "col-span-2 row-span-2" : ""
                        )}
                        onClick={() => openGallery(index)}
                    >
                        <Image
                            src={img}
                            alt={`Foto camp area ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg h-8 w-8" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal - Milky Glass Theme */}
            {isOpen && (
                <div
                    className="fixed left-0 right-0 bottom-0 top-14 lg:top-28 z-[60] bg-white/80 backdrop-blur-2xl animate-in fade-in duration-300 overflow-hidden"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    autoFocus
                >
                    <div className="flex w-full h-full flex-col lg:flex-row">

                        {/* LEFT COLUMN: Sidebar Grid (Desktop Only) */}
                        <div className="hidden lg:flex flex-col w-80 h-full border-r border-gray-200/50 bg-white/40 overflow-y-auto custom-scrollbar p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-900 font-bold text-lg">Semua Foto</h3>
                                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">{images.length}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                                            currentIndex === idx ? "border-primary opacity-100 shadow-md scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                        onClick={() => setCurrentIndex(idx)}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Thumb ${idx}`}
                                            fill
                                            className="object-cover"
                                            sizes="150px"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT/MAIN COLUMN: Main Image Viewer */}
                        <div className="flex-1 relative flex items-center justify-center w-full h-full">

                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-full z-50 h-10 w-10 transition-colors"
                                onClick={closeGallery}
                            >
                                <X className="h-6 w-6" />
                            </Button>

                            {/* Mobile Navigation (Swipe + Edges) & Desktop Navigation (Arrows) */}
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 hover:bg-black/5 rounded-full h-12 w-12 lg:h-14 lg:w-14 z-50 transition-all hover:scale-110 hidden md:flex"
                                        onClick={prevImage}
                                    >
                                        <ChevronLeft className="h-8 w-8" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 hover:bg-black/5 rounded-full h-12 w-12 lg:h-14 lg:w-14 z-50 transition-all hover:scale-110 hidden md:flex"
                                        onClick={nextImage}
                                    >
                                        <ChevronRight className="h-8 w-8" />
                                    </Button>
                                </>
                            )}

                            {/* Main Image Container with Touch Handlers */}
                            <div
                                className="relative w-full h-full p-4 md:p-12 flex items-center justify-center touch-pan-y"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative w-full h-full max-w-5xl">
                                    <Image
                                        src={images[currentIndex]}
                                        alt={`Full screen gallery ${currentIndex + 1}`}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        priority
                                        quality={95}
                                    />
                                </div>
                            </div>

                            {/* Count Overlay */}
                            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                                <span className="text-gray-900 text-sm font-medium tracking-widest bg-white/50 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
                                    {currentIndex + 1} / {images.length}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
