import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Play, Star, Info, ChevronRight, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Watch() {
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    const backgrounds = [
        {
            id: "season-1",
            title: "Yuru Camp Season 1",
            description: "Rin menikmati berkemah sendirian di tepi danau Gunung Fuji. Nadeshiko bersepeda untuk melihat Gunung Fuji tetapi tertidur di pinggir jalan. Kedua gadis ini bertemu, dan perjalanan berkemah mereka pun dimulai.",
            image: "https://img.youtube.com/vi/toRv2b-iCs8/maxresdefault.jpg"
        },
        {
            id: "season-2",
            title: "Yuru Camp Season 2",
            description: "Klub Aktivitas Luar Ruangan kembali! Bergabunglah dengan Nadeshiko, Rin, dan teman-teman saat mereka menjelajahi tempat perkemahan baru, memasak makanan lezat, dan menikmati alam bebas di musim dingin.",
            image: "https://i.ytimg.com/vi/jycSbANT_qw/hqdefault.jpg"
        },
        {
            id: "season-3",
            title: "Yuru Camp Season 3",
            description: "Nadeshiko, Rin, dan yang lainnya kembali untuk petualangan berkemah lainnya! Seiring berjalannya tahun ajaran, tempat perkemahan baru dan makanan lezat menanti mereka.",
            image: "https://img.youtube.com/vi/SGs03IvU7SQ/maxresdefault.jpg"
        }
    ];

    const categories = [
        {
            title: "Anime Series",
            items: [
                {
                    id: "season-1",
                    title: "Yuru Camp Season 1",
                    image: "https://img.youtube.com/vi/toRv2b-iCs8/maxresdefault.jpg",
                    year: "2018",
                    episodes: "12 Eps",
                    rating: "4.9"
                },
                {
                    id: "season-2",
                    title: "Yuru Camp Season 2",
                    image: "https://i.ytimg.com/vi/jycSbANT_qw/hqdefault.jpg",
                    year: "2021",
                    episodes: "13 Eps",
                    rating: "5.0"
                },
                {
                    id: "season-3",
                    title: "Yuru Camp Season 3",
                    image: "https://img.youtube.com/vi/SGs03IvU7SQ/maxresdefault.jpg",
                    year: "2024",
                    episodes: "12 Eps",
                    rating: "4.9"
                }
            ]
        }
    ];

    const currentBg = backgrounds[currentBgIndex];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 pb-24">
                {/* Hero Section */}
                <div className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden bg-gray-900">
                    <div className="absolute inset-0">
                        <img
                            src={currentBg.image}
                            alt={currentBg.title}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent" />
                    </div>

                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-24 md:pt-32 pb-20">
                        <div className="max-w-2xl space-y-4 md:space-y-6">
                            <div className="flex items-center gap-2 text-orange-500 font-black tracking-widest uppercase text-xs md:text-sm bg-orange-100 w-fit px-3 py-1 rounded-full shadow-sm">
                                <Star className="h-4 w-4 fill-current" />
                                #1 Camping Anime
                            </div>
                            <h1 className="text-3xl md:text-7xl font-black leading-tight text-gray-800 drop-shadow-sm">
                                {currentBg.title}
                            </h1>
                            <p className="text-sm md:text-xl text-gray-700 line-clamp-3 leading-relaxed max-w-xl font-medium">
                                {currentBg.description}
                            </p>
                            <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4">
                                <Button size="lg" className="rounded-full px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg font-bold shadow-lg hover:scale-105 transition-transform gap-2 bg-orange-500 hover:bg-orange-600" asChild>
                                    <a href={`#${currentBg.id}`}>
                                        <Play className="h-4 w-4 md:h-6 md:w-6 fill-white" />
                                        Mulai Nonton
                                    </a>
                                </Button>
                                <Button size="lg" variant="outline" className="rounded-full px-6 md:px-8 py-4 md:py-6 text-sm md:text-lg font-bold border-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:scale-105 transition-transform gap-2 text-gray-700">
                                    <Info className="h-4 w-4 md:h-6 md:w-6" />
                                    Selengkapnya
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Rows */}
                <div className="container mx-auto px-4 -mt-10 md:-mt-20 relative z-10 space-y-12 md:space-y-16">
                    {categories.map((category, idx) => (
                        <div key={idx} className="space-y-4 md:space-y-6" id={category.items[0].id}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <List className="h-4 w-4 md:h-6 md:w-6" />
                                </div>
                                <h2 className="text-xl md:text-3xl font-black text-gray-800 flex items-center gap-2 group cursor-pointer">
                                    {category.title}
                                    <ChevronRight className="h-5 w-5 md:h-6 md:w-6 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" />
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {category.items.map((item) => (
                                    <Link to={`/w/${item.id}`} key={item.id} className="group flex flex-col gap-3">
                                        <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 md:border-4 border-white ring-1 ring-gray-100">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />

                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                                                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="h-6 w-6 fill-current ml-1" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="font-bold text-gray-800 text-base md:text-lg leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">{item.title}</h3>
                                            <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1 text-yellow-500">
                                                    <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" /> {item.rating}
                                                </span>
                                                <span>•</span>
                                                <span>{item.year}</span>
                                                <span>•</span>
                                                <span>{item.episodes}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Source Disclaimer */}
                <div className="container mx-auto px-4 mt-12 md:mt-16">
                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 text-center">
                        <p className="text-sm text-gray-600">
                            Konten anime ini tersedia secara legal dan gratis melalui channel YouTube <a href="https://www.youtube.com/@AniOneAsia" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-bold hover:underline">Ani-One Asia</a>.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
