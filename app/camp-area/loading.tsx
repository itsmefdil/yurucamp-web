import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CampAreaLoading() {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                {/* Static Hero Section */}
                <div className="relative bg-[#FFF8F0] overflow-hidden pt-20 pb-10 md:pt-24 md:pb-12 border-b border-orange-100">
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left max-w-xl text-gray-800">
                                <div className="inline-block mb-3 px-3 py-1 text-xs font-bold bg-orange-100 text-orange-600 rounded-full transition-colors">
                                    Adventure Awaits
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight text-gray-900">
                                    Temukan <br />
                                    <span className="text-orange-500">Camp Area</span> Impianmu
                                </h1>
                                <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-md">
                                    Jelajahi keindahan alam Indonesia ala Yuru Camp. Dari pegunungan sejuk hingga pantai yang tenang.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                    <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-sm px-6 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all" asChild>
                                        <Link href="/dashboard/add-camp-area">
                                            + Tambah Lokasi
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="hidden md:block relative w-64 h-64 lg:w-72 lg:h-72">
                                <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
                                <div className="absolute inset-4 bg-white/40 rounded-full blur-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-6 relative z-10 pb-24">
                    <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 mb-6 flex gap-4 overflow-x-auto">
                        <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-[250px] w-full rounded-2xl" />
                                <Skeleton className="h-6 w-[200px]" />
                                <Skeleton className="h-4 w-[150px]" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
