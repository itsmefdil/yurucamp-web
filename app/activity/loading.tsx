import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Footer } from "@/components/layout/Footer"

export default function ActivityLoading() {
    return (
        <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
            <div className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium opacity-50 cursor-not-allowed">
                        <Plus className="mr-1 h-4 w-4" /> Buat Postingan
                    </Button>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-3 w-[80px]" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-[250px] w-full rounded-md" />
                            <div className="flex justify-between pt-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    )
}
