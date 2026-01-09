import React from 'react';
import { Link } from "react-router-dom"
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Mountain } from "lucide-react"

export function Footer() {
    return (
        <footer className="hidden md:block bg-black text-white pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-black text-white tracking-tight">
                                Yuru<span className="text-orange-500">Camp</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Platform komunitas camping terbesar di Indonesia. Temukan lokasi kemah terbaik, bagikan pengalamanmu, dan jalin persahabatan baru.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all text-gray-400">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all text-gray-400">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all text-gray-400">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Menu */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">Menu</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/" className="hover:text-orange-500 transition-colors flex items-center gap-2">Beranda</Link></li>
                            <li><Link to="/activity" className="hover:text-orange-500 transition-colors flex items-center gap-2">Activity</Link></li>
                            <li><Link to="/camp-area" className="hover:text-orange-500 transition-colors flex items-center gap-2">Camp Area</Link></li>
                            <li><Link to="/event" className="hover:text-orange-500 transition-colors flex items-center gap-2">Acara</Link></li>
                            <li><Link to="/watch" className="hover:text-orange-500 transition-colors flex items-center gap-2">Nonton</Link></li>
                        </ul>
                    </div>

                    {/* Tentang */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">Tentang Kami</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/tentang" className="hover:text-orange-500 transition-colors">Yuru Camp Fans</Link></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Komunitas</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Syarat & Ketentuan</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Kebijakan Privasi</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">Hubungi Kami</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>Jl. Kaliurang KM 20, Yogyakarta, Indonesia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>#</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>#</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} YuruCamp Indonesia. Made with <span className="text-red-500">♥</span> by Fans.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
