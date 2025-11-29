import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default function EventsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto py-8 px-4 pb-24 md:pb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-primary">Acara Mendatang</h1>
                    <Button className="w-full md:w-auto rounded-full shadow-md" asChild>
                        <Link href="/tambah-acara">Buat Acara</Link>
                    </Button>
                </div>

                <div className="space-y-6 mb-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i} className="flex flex-col md:flex-row overflow-hidden bg-white hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-full md:w-1/4 aspect-video md:aspect-auto bg-gray-100 animate-pulse" />
                            <div className="flex-1 flex flex-col justify-between p-2">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div>
                                            <CardTitle className="text-xl mb-2">Yuru Campe Episode  {i + 1}</CardTitle>
                                            <CardDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> 2{i} Nov 2024</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Yogyakarta</span>
                                            </CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-full">Share</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        Mari hadir dan berbagi pengalaman dengan Yuru Camp Episode {i + 1}.
                                    </p>
                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground w-full sm:w-auto">
                                        <Users className="h-4 w-4" />
                                        <span>12{i} Peserta</span>
                                    </div>
                                    <Button className="w-full sm:w-auto rounded-full shadow-md" asChild>
                                        <Link href={`/acara/${i + 1}`}>Daftar Sekarang</Link>
                                    </Button>
                                </CardFooter>
                            </div>
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
