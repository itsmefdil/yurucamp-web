import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function EventLoading() {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative bg-[#FFF8F0] overflow-hidden pt-20 pb-10 md:pt-24 md:pb-12 border-b border-orange-100">
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left max-w-xl text-gray-800">
                                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 text-xs font-bold bg-orange-100 text-orange-600 rounded-full">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Jadwal Yuru Camp</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight text-gray-900">
                                    Temukan <br />
                                    <span className="text-orange-500">Petualanganmu!</span>
                                </h1>
                                <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-md">
                                    Bergabunglah dengan acara seru, nikmati alam, dan buat kenangan tak terlupakan bersama teman baru.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                    <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-sm px-6 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all" asChild>
                                        <Link href="/event/create">
                                            Buat Acara Baru
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="hidden md:block relative w-64 h-64 lg:w-72 lg:h-72">
                                {/* Decorative elements */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
                                <div className="absolute inset-4 bg-white/40 rounded-full blur-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-8 relative z-20 pb-24">
                    {/* Toggle Filter Skeleton */}
                    <div className="flex justify-center mb-12">
                        <Skeleton className="h-12 w-64 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                                <Skeleton className="h-[200px] w-full rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Skeleton className="h-8 w-20 rounded-full" />
                                    <Skeleton className="h-8 w-20 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
