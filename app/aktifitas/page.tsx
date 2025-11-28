import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ActivitiesPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto py-8 px-4 pb-24 md:pb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-primary">Aktifitas Komunitas</h1>
                    <Button className="w-full md:w-auto rounded-full shadow-md">Upload Aktifitas</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden bg-white hover:-translate-y-1 transition-transform duration-300">
                            <div className="aspect-video bg-orange-100 animate-pulse" />
                            <CardHeader>
                                <CardTitle className="text-xl">Aktifitas Seru {i + 1}</CardTitle>
                                <CardDescription>Diposting oleh User {i + 1}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <span className="text-xs text-muted-foreground">2 jam yang lalu</span>
                                <Button variant="ghost" size="sm" className="rounded-full hover:bg-orange-50 text-primary" asChild>
                                    <Link href={`/aktifitas/${i + 1}`}>Lihat</Link>
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
