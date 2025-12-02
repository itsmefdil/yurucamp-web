import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full" asChild>
                            <Link href="/pengaturan">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-black text-gray-800">Kebijakan Privasi</h1>
                    </div>

                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardContent className="p-8 space-y-6 text-gray-600 leading-relaxed">
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-800">1. Pendahuluan</h2>
                                <p>
                                    Selamat datang di YuruCamp Indonesia. Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-800">2. Informasi yang Kami Kumpulkan</h2>
                                <p>
                                    Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, melakukan pemesanan, atau menghubungi layanan pelanggan. Informasi ini dapat mencakup nama, alamat email, nomor telepon, dan detail pembayaran.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-800">3. Penggunaan Informasi</h2>
                                <p>
                                    Kami menggunakan informasi yang kami kumpulkan untuk:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
                                    <li>Memproses transaksi dan mengirimkan konfirmasi pemesanan.</li>
                                    <li>Mengirimkan notifikasi teknis, pembaruan, dan pesan dukungan.</li>
                                    <li>Menanggapi komentar dan pertanyaan Anda.</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-800">4. Keamanan Data</h2>
                                <p>
                                    Kami mengambil langkah-langkah keamanan yang wajar untuk melindungi informasi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Namun, tidak ada metode transmisi melalui internet atau penyimpanan elektronik yang 100% aman.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-800">5. Perubahan Kebijakan</h2>
                                <p>
                                    Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Jika kami melakukan perubahan, kami akan memberi tahu Anda dengan merevisi tanggal di bagian atas kebijakan ini.
                                </p>
                            </div>

                            <div className="pt-4 text-sm text-gray-400">
                                Terakhir diperbarui: 29 November 2024
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
