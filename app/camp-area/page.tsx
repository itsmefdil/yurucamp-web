import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star } from "lucide-react"
import Link from "next/link"

export default function CampAreaPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto py-8 px-4 pb-24 md:pb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-primary">Temukan Camp Area</h1>
                    <Button className="w-full md:w-auto rounded-full shadow-md" asChild>
                        <Link href="/tambah-camp-area">Tambah Lokasi</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="bg-white hover:-translate-y-1 transition-transform duration-300">
                            <div className="aspect-[4/3] bg-blue-100 animate-pulse rounded-t-3xl" />
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">Camp Area {i + 1}</CardTitle>
                                    <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span className="text-sm font-bold">4.8</span>
                                    </div>
                                </div>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" /> Lokasi {i + 1}, Jawa Barat
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    Tempat camping yang nyaman dengan fasilitas lengkap. Cocok untuk keluarga dan pemula. Pemandangan indah dan udara sejuk.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full rounded-full text-lg py-6 shadow-md" asChild>
                                    <Link href={`/camp-area/${i + 1}`}>Lihat Detail</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Pagination Scroll Placeholder */}
                <div className="flex justify-center py-8">
                    <Button variant="outline" className="w-full md:w-auto">Muat Lebih Banyak</Button>
                </div>
            </main>
            <Footer />
        </div>
    )
}
