import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />
            <main className="flex-1 flex items-start justify-center p-4 pt-24 md:pt-32">
                <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="space-y-1 text-center pb-8 pt-10">
                        <CardTitle className="text-3xl font-black text-primary">Buat Akun Baru</CardTitle>
                        <CardDescription className="text-base">
                            Gabung komunitas YuruCamp Indonesia
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nama Depan</Label>
                                <Input id="firstName" placeholder="Rin" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Nama Belakang</Label>
                                <Input id="lastName" placeholder="Shima" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="nama@contoh.com" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" className="rounded-xl py-6 bg-gray-50 border-gray-200" />
                        </div>
                        <Button className="w-full rounded-full py-6 text-lg shadow-lg mt-4">
                            Daftar
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">
                                    Atau daftar dengan
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full rounded-full py-6 border-2 gap-2 hover:bg-gray-50">
                            <Icons.google className="h-5 w-5" />
                            Google
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center justify-center pb-10 pt-4">
                        <p className="text-sm text-muted-foreground text-center">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                Masuk disini
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    )
}
