import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Footer } from "@/components/layout/Footer"

export default function ActivityLoading() {
    return (
        <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
            {/* Hero Section */}
            <div className="relative bg-[#FFF8F0] overflow-hidden pt-20 pb-10 md:pt-24 md:pb-12 border-b border-orange-100">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left max-w-xl text-gray-800">
                            <div className="inline-block mb-3 px-3 py-1 text-xs font-bold bg-orange-100 text-orange-600 rounded-full transition-colors bg-white/50 border border-orange-100">
                                Komunitas Yuru Camp
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight text-gray-900">
                                Bagikan Momen <br />
                                <span className="text-orange-500">Petualanganmu</span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-md">
                                Temukan inspirasi camping, hiking, dan kegiatan seru lainnya dari teman-teman komunitas.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                <Button size="lg" className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600 font-bold text-sm px-6 shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all">
                                    <Plus className="mr-2 h-4 w-4" /> Buat Aktifitas Baru
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

            <main className="flex-1 container mx-auto px-4 -mt-6 relative z-20 pb-24">
                {/* Search Skeleton */}
                <div className="bg-white rounded-2xl shadow-xl p-4 mb-12 flex flex-col md:flex-row gap-4 items-center border border-gray-100">
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-4 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
                            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="flex justify-between pt-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    )
}
