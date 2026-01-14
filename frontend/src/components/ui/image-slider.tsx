import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "../../lib/utils"

interface ImageSliderProps {
    images: string[]
    className?: string
}

export function ImageSlider({ images, className }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, [images.length])

    const prevSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
    }, [images.length])

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen) {
                if (e.key === "ArrowRight") nextSlide()
                if (e.key === "ArrowLeft") prevSlide()
                if (e.key === "Escape") setIsLightboxOpen(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isLightboxOpen, nextSlide, prevSlide])

    if (!images || images.length === 0) {
        return null
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Main Image */}
            <div
                className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 group cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
            >
                {/* Blurred Background */}
                <img
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex + 1} Background`}
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110"
                />

                {/* Main Image */}
                <img
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Overlay with count and expand icon */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center z-20">
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg h-10 w-10" />
                </div>

                {/* Navigation Buttons (Main View) */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30"
                            onClick={(e) => {
                                e.stopPropagation()
                                prevSlide()
                            }}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30"
                            onClick={(e) => {
                                e.stopPropagation()
                                nextSlide()
                            }}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            className={cn(
                                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all snap-start",
                                index === currentIndex
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-transparent opacity-70 hover:opacity-100"
                            )}
                            onClick={() => goToSlide(index)}
                        >
                            <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute top-4 right-4 z-50 flex gap-4 items-center">
                        <div className="text-white/80 font-medium px-4 py-2 bg-black/20 rounded-full backdrop-blur-md">
                            {currentIndex + 1} / {images.length}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <img
                                src={images[currentIndex]}
                                alt={`Full Slide ${currentIndex + 1}`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Lightbox Navigation */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    prevSlide()
                                }}
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    nextSlide()
                                }}
                            >
                                <ChevronRight className="h-8 w-8" />
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
