'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect } from 'react'

interface InfiniteCarouselProps {
    images: string[]
}

export function InfiniteCarousel({ images }: InfiniteCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        skipSnaps: false,
        dragFree: false,
    })

    // Color classes for each image
    const colorClasses = [
        "bg-orange-100 rotate-[-3deg]",
        "bg-blue-100 rotate-[2deg]",
        "bg-green-100 rotate-[-2deg]",
        "bg-yellow-100 rotate-[3deg]",
        "bg-pink-100 rotate-[-1deg]"
    ]

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    useEffect(() => {
        if (emblaApi) {
            // Optional: Add any additional embla event listeners here
        }
    }, [emblaApi])

    return (
        <div className="overflow-hidden pb-12 px-4 mask-linear-fade max-w-screen-xl mx-auto" ref={emblaRef}>
            <div className="flex gap-3 md:gap-8 touch-pan-x">
                {images.map((img, i) => {
                    const colorIndex = i % colorClasses.length
                    return (
                        <div
                            key={i}
                            className={`shrink-0 w-44 h-60 md:w-64 md:h-80 ${colorClasses[colorIndex]} rounded-2xl shadow-lg transform hover:scale-105 hover:z-10 transition-all duration-300 border-4 border-white overflow-hidden active:scale-95`}
                        >
                            <div
                                className="w-full h-full opacity-50 mix-blend-multiply bg-cover bg-center"
                                style={{ backgroundImage: `url('${img}')` }}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
