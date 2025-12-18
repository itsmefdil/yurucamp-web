'use client'
import Image from 'next/image'

interface InfiniteCarouselProps {
    images: string[]
}

export function InfiniteCarousel({ images }: InfiniteCarouselProps) {
    if (!images || images.length === 0) return null

    // Color classes for each image
    const colorClasses = [
        "bg-orange-100 rotate-[-3deg]",
        "bg-blue-100 rotate-[2deg]",
        "bg-green-100 rotate-[-2deg]",
        "bg-yellow-100 rotate-[3deg]",
        "bg-pink-100 rotate-[-1deg]"
    ]

    return (
        <div className="w-full max-w-[100vw] overflow-hidden py-12">
            <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 px-4 md:px-8 snap-x scroll-smooth no-scrollbar touch-pan-x items-center justify-start md:justify-center">
                {images.map((img, i) => {
                    const colorIndex = i % colorClasses.length
                    return (
                        <div
                            key={i}
                            className={`shrink-0 w-[40vw] md:w-64 aspect-[3/4] ${colorClasses[colorIndex]} rounded-2xl shadow-lg transform hover:scale-105 hover:z-10 transition-all duration-300 border-4 border-white overflow-hidden active:scale-95 relative snap-center`}
                        >
                            <Image
                                src={img}
                                alt={`Hero Image ${i + 1}`}
                                fill
                                sizes="(max-width: 768px) 40vw, 256px"
                                className="object-cover object-center opacity-80 mix-blend-multiply"
                                priority={i < 5}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
