import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Info, Users, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function About() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentCommunitySlide, setCurrentCommunitySlide] = useState(0);

    const communityImages = [
        '/images/ycjj.png',
        '/images/ycjj-ep1.png',
        '/images/ycjj-ep3.png',
        '/images/ycjj1.jpg',
        '/images/ycjtm.png',
        '/images/ycws.png',
        '/images/yjc-1.png',
        '/images/yjc-2.png',
        '/images/yjc-3.png',
        '/images/yjcc-ep2.png'
    ];

    // Fetch hero images for the slider
    const { data: heroImages = ['/yc-bg.png', '/yc-bg.png', '/yc-bg.png', '/yc-bg.png', '/yc-bg.png'] } = useQuery({
        queryKey: ['heroImages'],
        queryFn: async () => {
            try {
                const response = await api.get('/utils/hero-images?count=5');
                return response.data;
            } catch {
                return ['/yc-bg.png', '/yc-bg.png', '/yc-bg.png', '/yc-bg.png', '/yc-bg.png'];
            }
        },
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentCommunitySlide((prev) => (prev + 1) % communityImages.length);
        }, 6000); // Slightly different offset
        return () => clearInterval(timer);
    }, [communityImages.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

    const nextCommunitySlide = () => setCurrentCommunitySlide((prev) => (prev + 1) % communityImages.length);
    const prevCommunitySlide = () => setCurrentCommunitySlide((prev) => (prev - 1 + communityImages.length) % communityImages.length);

    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-dot-pattern flex items-center justify-center bg-orange-50/30">
                    <div className="relative container mx-auto px-4 flex flex-col justify-center items-center text-center z-10">
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Users className="w-4 h-4" />
                            <span className="tracking-wide uppercase">Komunitas Yuru Camp</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 tracking-tight text-gray-900">
                            Tentang Kami
                        </h1>
                        <p className="text-lg md:text-xl max-w-2xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 text-gray-600">
                            Mengenal lebih dekat dunia Yuru Camp dan komunitas penggemar di Indonesia.
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 py-16 md:py-24 space-y-24">
                    {/* About Yuru Camp */}
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center gap-3 text-orange-500 font-bold uppercase tracking-widest text-sm">
                                <Info className="w-5 h-5" />
                                Mengenai Anime
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight">
                                    Apa itu <span className="text-orange-500">Yuru Camp?</span>
                                </h2>
                                <p className="text-gray-600 leading-loose text-lg text-justify">
                                    Yuru Camp (Laid-Back Camp) adalah serial anime yang menceritakan kisah santai sekelompok gadis SMA yang menikmati kegiatan berkemah di sekitar Gunung Fuji. Dengan pemandangan alam yang indah, makanan lezat, dan suasana yang menenangkan, anime ini mengajak penonton untuk menikmati keindahan alam dan kehangatan persahabatan.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-xl mx-auto">
                            {/* Modern Carousel */}
                            <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl aspect-video border-4 border-white">
                                <div
                                    className="absolute inset-0 flex transition-transform duration-700 ease-out"
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                >
                                    {heroImages.map((img: string, index: number) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Slide ${index + 1}`}
                                            className="w-full h-full object-cover shrink-0"
                                        />
                                    ))}
                                </div>

                                {/* Controls */}
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {heroImages.map((_: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlide(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Community */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider">
                                <Users className="w-5 h-5" />
                                Komunitas Kami
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-800">Fanbase Indonesia</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Kami adalah komunitas penggemar Yuru Camp di Indonesia yang berdedikasi untuk berbagi informasi, mengadakan acara nonton bareng, dan tentu saja, kegiatan berkemah bersama! Tujuan kami adalah menyebarkan semangat "laid-back camping" dan menjalin persahabatan antar sesama penggemar.
                            </p>
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-sm text-orange-800 font-medium">
                                Website ini dikembangkan oleh komunitas YuruCamp Jogja-Jateng
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-xl mx-auto">
                            {/* Community Carousel */}
                            <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl aspect-video border-4 border-white">
                                <div
                                    className="absolute inset-0 flex transition-transform duration-700 ease-out"
                                    style={{ transform: `translateX(-${currentCommunitySlide * 100}%)` }}
                                >
                                    {communityImages.map((img: string, index: number) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Community Moment ${index + 1}`}
                                            className="w-full h-full object-cover shrink-0"
                                        />
                                    ))}
                                </div>

                                {/* Controls */}
                                <button
                                    onClick={prevCommunitySlide}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextCommunitySlide}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {communityImages.map((_: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentCommunitySlide(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${currentCommunitySlide === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center space-y-6 border border-primary/10">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 fill-current" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-800">Bergabunglah Bersama Kami!</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            Ingin merasakan keseruan berkemah ala Yuru Camp? Ikuti acara kami selanjutnya atau bergabung dengan diskusi di media sosial kami.
                        </p>
                        <div className="pt-4">
                            <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform" asChild>
                                <Link to="/events">Lihat Acara Mendatang</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
