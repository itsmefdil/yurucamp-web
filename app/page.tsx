import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Footer } from "@/components/layout/Footer"
import Link from "next/link"
import { ArrowRight, MapPin, Calendar, Activity, Tent, MessageSquare, Flame, Camera } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { getRandomImages } from "@/lib/cloudinary"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const randomImages = await getRandomImages(5, 'camp_areas')

  // Create an array of 5 images, using random ones if available, or fallback
  const heroImages = Array(5).fill('/yc-bg.png').map((defaultImg, i) => randomImages[i] || defaultImg)

  const { data: activities } = await supabase
    .from("activities")
    .select(`
        *,
        profiles:user_id (
            full_name,
            avatar_url
        )
    `)
  const { data: campAreas } = await supabase
    .from("camp_areas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen flex flex-col">

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
                className={`shrink-0 w-48 h-64 md:w-64 md:h-80 ${item.color} rounded-2xl shadow-lg transform ${item.rotate} hover:scale-105 hover:z-10 transition-all duration-300 border-4 border-white overflow-hidden`}
              >
                <div
                  className="w-full h-full opacity-50 mix-blend-multiply bg-cover bg-center"
                  style={{ backgroundImage: `url('${heroImages[i]}')` }}
                />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities?.map((activity: any) => (
              <Link key={activity.id} href={`/aktifitas/${activity.id}`} className="block group">
                <Card className="overflow-hidden bg-white group-hover:-translate-y-2 transition-all duration-300 h-full flex flex-col border-2 border-transparent hover:border-orange-200 shadow-lg hover:shadow-2xl rounded-3xl">
                  <div className="relative aspect-video bg-orange-50 overflow-hidden m-2 rounded-2xl">
                    <Image
                      src={activity.image_url || "/aktifitas.jpg"}
                      alt={activity.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[150px] inline-block align-bottom">{activity.location || "Lokasi tidak tersedia"}</span>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors leading-tight">{activity.title}</CardTitle>
                  </CardHeader>
                  <CardFooter className="p-5 pt-0 mt-auto">
                    <div className="flex items-center gap-3 w-full bg-orange-50/50 p-2 rounded-2xl">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        <AvatarImage src={activity.profiles?.avatar_url} />
                        <AvatarFallback className="text-xs bg-orange-200 text-orange-700 font-bold">{activity.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-gray-600 truncate flex-1">
                        {activity.profiles?.full_name || "Pengguna"}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
            {(!activities || activities.length === 0) && (
              <div className="col-span-full text-center py-12 text-gray-500 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-200">
                <Tent className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                <p className="font-medium">Belum ada aktifitas terbaru.</p>
              </div>
            )}
          </div>
        </section>

        {/* Camp Area Preview */}
        <section className="py-12 md:py-32 px-4 bg-orange-50/30">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight text-center md:text-left">
                Rekomendasi <span className="text-orange-500">Camp Area</span>
              </h2>
              <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-100 text-orange-600 font-bold rounded-full px-6 w-full md:w-auto" asChild>
                <Link href="/camp-area" className="flex items-center justify-center gap-2">
                  Lihat Semua <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campAreas?.map((campArea: any) => (
                <Link key={campArea.id} href={`/camp-area/${campArea.id}`} className="block group">
                  <Card className="bg-white overflow-hidden group-hover:-translate-y-2 transition-all duration-300 border-2 border-gray-100 hover:border-orange-300 shadow-xl hover:shadow-2xl h-full flex flex-col rounded-[2rem]">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden m-2 rounded-[1.5rem]">
                      <Image
                        src={campArea.image_url || "/camp-placeholder.jpg"}
                        alt={campArea.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black text-orange-500 shadow-sm border border-orange-100">
                        {campArea.price ? `Rp ${campArea.price.toLocaleString('id-ID')}` : "Gratis"}
                      </div>
                    </div>
                    <CardHeader className="px-6 pt-4 pb-2">
                      <CardTitle className="text-2xl font-black text-gray-800 group-hover:text-orange-500 transition-colors">{campArea.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 flex-1">
                      <CardDescription className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4 bg-gray-50 w-fit px-3 py-1 rounded-full">
                        <MapPin className="h-3.5 w-3.5 text-orange-400" /> {campArea.location || "Lokasi tidak tersedia"}
                      </CardDescription>
                      <p className="text-gray-600 line-clamp-2 leading-relaxed text-sm">
                        {campArea.description || "Tidak ada deskripsi tersedia."}
                      </p>
                    </CardContent>
                    <CardFooter className="px-6 pb-6 pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
                      <div className="flex flex-wrap gap-2">
                        {campArea.facilities && campArea.facilities.slice(0, 3).map((facility: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 border border-orange-100 px-2 py-1 rounded-lg text-orange-600">{facility}</span>
                        ))}
                        {campArea.facilities && campArea.facilities.length > 3 && (
                          <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-lg text-gray-500">+{campArea.facilities.length - 3}</span>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
              {(!campAreas || campAreas.length === 0) && (
                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                  <div className="inline-block p-4 rounded-full bg-orange-50 mb-4">
                    <Tent className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="font-bold text-lg text-gray-700">Belum ada rekomendasi</p>
                  <p className="text-sm text-gray-400">Coba cek lagi nanti ya!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Acara Preview */}
        <section className="py-12 md:py-32 container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 tracking-tight text-center md:text-left">Acara Mendatang</h2>
            <Button variant="ghost" className="text-base md:text-lg hover:bg-orange-50 rounded-full px-6 w-full md:w-auto" asChild>
              <Link href="/event" className="flex items-center justify-center gap-2">
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
