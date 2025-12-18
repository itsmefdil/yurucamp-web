import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/layout/Footer"

export default function WatchLoading() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <main className="flex-1 pb-24">
                {/* Hero Skeleton */}
                <div className="h-[60vh] md:h-[75vh] w-full bg-gray-100 relative">
                    <Skeleton className="w-full h-full" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4 max-w-4xl mx-auto mb-10">
                        <Skeleton className="h-12 w-3/4 md:w-1/2" />
                        <Skeleton className="h-6 w-full md:w-2/3" />
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-32 rounded-full" />
                            <Skeleton className="h-12 w-32 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Content Rows Skeleton */}
                <div className="container mx-auto px-4 -mt-10 md:-mt-20 relative z-10 space-y-12">
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="h-8 w-48" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="space-y-3">
                                        <Skeleton className="aspect-video rounded-xl" />
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    )
}
