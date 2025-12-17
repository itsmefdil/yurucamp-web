export function Footer() {
    return (
        <footer className="hidden md:block bg-white border-t border-gray-100 pb-24 md:pb-0">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">YuruCamp</h3>
                        <p className="text-sm text-muted-foreground">
                            Platform untuk berbagi pengalaman camping dan aktifitas outdoor.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Menu</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/" className="hover:text-primary">Beranda</a></li>
                            <li><a href="/activity" className="hover:text-primary">Activity</a></li>
                            <li><a href="/camp-area" className="hover:text-primary">Camp Area</a></li>
                            <li><a href="/event" className="hover:text-primary">Acara</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Kontak</h3>
                        <p className="text-sm text-muted-foreground">
                            Hubungi kami jika ada pertanyaan atau saran.
                        </p>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} YuruCamp. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
