import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"
import { ArrowRight, MapPin, Calendar, Activity, Tent, MessageSquare, Flame, Camera } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-4 md:pt-8 pb-24 md:pb-0">
        {/* Hero Section */}
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 px-4 overflow-hidden">
          <div className="container mx-auto text-center relative z-10">
            <span className="text-sm md:text-base font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4 block">
              Komunitas Camping
            </span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-gray-800 mb-2">
              Yuru<span className="text-primary">Camp</span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-700 mb-6">
              Indonesia
            </h2>
            <div className="flex justify-center gap-3 text-muted-foreground font-medium text-sm md:text-lg mb-16">
              <span>#camping</span>
              <span>#alam</span>
              <span>#santai</span>
            </div>
          </div>

          {/* Image Strip */}
          <div className="flex justify-center gap-4 md:gap-8 overflow-x-auto pb-12 px-4 no-scrollbar mask-linear-fade">
            {[
              { color: "bg-orange-100", rotate: "-rotate-3" },
              { color: "bg-blue-100", rotate: "rotate-2" },
              { color: "bg-green-100", rotate: "-rotate-2" },
              { color: "bg-yellow-100", rotate: "rotate-3" },
              { color: "bg-pink-100", rotate: "-rotate-1" },
            ].map((item, i) => (
              <div
                key={i}
                className={`shrink-0 w-48 h-64 md:w-64 md:h-80 ${item.color} rounded-2xl shadow-lg transform ${item.rotate} hover:scale-105 hover:z-10 transition-all duration-300 border-4 border-white`}
              >
                <div className="w-full h-full opacity-50 mix-blend-multiply bg-[url('/yc-bg.png')] bg-cover bg-center rounded-xl" />
              </div>
            ))}
          </div>
        </section>

        {/* Gambaran Umum */}
        {/* Agenda Kami / Gambaran Umum */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-2">
                Agenda Kami
              </h2>
              <h2 className="text-3xl md:text-5xl font-black text-primary">
                Paling Seru
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {/* Row 1: 2 items */}
              <div className="md:col-span-3 p-8 rounded-3xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group">
                <Activity className="h-10 w-10 text-orange-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Berbagi Aktifitas</h3>
                <p className="text-gray-500 leading-relaxed">
                  Bagikan momen seru saat camping, hiking, atau kegiatan outdoor lainnya. Inspirasi teman-temanmu dengan cerita petualangan yang tak terlupakan.
                </p>
              </div>
              <div className="md:col-span-3 p-8 rounded-3xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
                <MapPin className="h-10 w-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Temukan Lokasi</h3>
                <p className="text-gray-500 leading-relaxed">
                  Jelajahi peta interaktif kami untuk menemukan hidden gem, camp area terbaik, dan spot foto instagramable di seluruh Indonesia.
                </p>
              </div>

              {/* Row 2: 3 items */}
              <div className="md:col-span-2 p-8 rounded-3xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 group">
                <Calendar className="h-10 w-10 text-green-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Ikuti Acara</h3>
                <p className="text-gray-500 leading-relaxed">
                  Jangan lewatkan gathering komunitas, workshop survival, dan acara bersih gunung.
                </p>
              </div>
              <div className="md:col-span-2 p-8 rounded-3xl border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 group">
                <Tent className="h-10 w-10 text-yellow-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Camping Gear</h3>
                <p className="text-gray-500 leading-relaxed">
                  Diskusi dan review peralatan camping terbaik untuk pengalaman outdoor yang aman.
                </p>
              </div>
              <div className="md:col-span-2 p-8 rounded-3xl border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 group">
                <Flame className="h-10 w-10 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Tips Survival</h3>
                <p className="text-gray-500 leading-relaxed">
                  Pelajari teknik dasar survival, cara membuat api, dan pertolongan pertama.
                </p>
              </div>

              {/* Row 3: 2 items */}
              <div className="md:col-span-3 p-8 rounded-3xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
                <Camera className="h-10 w-10 text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Galeri Foto</h3>
                <p className="text-gray-500 leading-relaxed">
                  Abadikan keindahan alam dan bagikan karya fotografimu di galeri komunitas kami. Lihat dunia melalui lensa para petualang.
                </p>
              </div>
              <div className="md:col-span-3 p-8 rounded-3xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 group">
                <MessageSquare className="h-10 w-10 text-teal-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Diskusi Seru</h3>
                <p className="text-gray-500 leading-relaxed">
                  Bergabunglah dalam forum diskusi, tanya jawab seputar hobi, dan cari teman perjalanan baru untuk petualangan berikutnya.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Aktifitas Preview */}
        <section className="py-12 md:py-32 container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 tracking-tight text-center md:text-left">Aktifitas Terbaru</h2>
            <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-50 rounded-full px-6 w-full md:w-auto" asChild>
              <Link href="/aktifitas" className="flex items-center justify-center gap-2">
                Lihat Semua <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Link key={i} href={`/aktifitas/${i}`} className="block group">
                <Card className="overflow-hidden bg-white group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="aspect-video bg-orange-100 animate-pulse" />
                  <CardHeader>
                    <CardTitle className="line-clamp-1 text-xl group-hover:text-primary transition-colors">Hiking ke Gunung A</CardTitle>
                    <CardDescription className="text-base">Oleh User {i}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Camp Area Preview */}
        <section className="py-12 md:py-32 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 tracking-tight text-center md:text-left">Rekomendasi Camp Area</h2>
              <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-50 rounded-full px-6 w-full md:w-auto" asChild>
                <Link href="/camp-area" className="flex items-center justify-center gap-2">
                  Lihat Semua <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white">
                  <div className="aspect-[4/3] bg-blue-100 animate-pulse rounded-t-3xl" />
                  <CardHeader>
                    <CardTitle className="text-2xl">Camp Area {i}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="flex items-center gap-1 text-base mb-4">
                      <MapPin className="h-4 w-4" /> Lokasi {i}
                    </CardDescription>
                    <p className="text-base text-muted-foreground line-clamp-2">
                      Deskripsi singkat mengenai camp area ini. Fasilitas lengkap dan pemandangan indah.
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="w-full sm:w-auto">
                      <div className="flex -space-x-2 overflow-hidden">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200" />
                        ))}
                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-gray-500">+42</div>
                      </div>
                    </div>
                    <Button className="w-full sm:w-auto rounded-full shadow-md" asChild>
                      <Link href={`/acara/${i}`}>Daftar Sekarang</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Acara Preview */}
        <section className="py-12 md:py-32 container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 tracking-tight text-center md:text-left">Acara Mendatang</h2>
            <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-50 rounded-full px-6 w-full md:w-auto" asChild>
              <Link href="/acara" className="flex items-center justify-center gap-2">
                Lihat Semua <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2].map((i) => (
              <Card key={i} className="flex flex-col md:flex-row overflow-hidden bg-white">
                <div className="w-full md:w-1/3 aspect-video md:aspect-auto bg-gray-100 animate-pulse" />
                <div className="flex-1 p-2">
                  <CardHeader>
                    <CardTitle className="text-2xl">Gathering Komunitas {i}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-base">
                      <Calendar className="h-4 w-4" /> 20 Nov 2024
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-muted-foreground line-clamp-2">
                      Bergabunglah dengan kami untuk acara gathering tahunan.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="text-base px-6">Daftar</Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
