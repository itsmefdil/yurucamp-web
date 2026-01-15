import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLE_MAP: Record<string, string> = {
    '/': 'Home',
    '/login': 'Masuk',
    '/register': 'Daftar',
    '/about': 'Tentang',
    '/activities': 'Kegiatan',
    '/camp-areas': 'Area Camping',
    '/events': 'Event',
    '/watch': 'Nonton',
    '/dashboard': 'Dashboard',
    '/gear-lists': 'Gear List',
};

const BASE_TITLE = 'Yurucamp Indonesia';

export function TitleUpdater() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        const titlePart = TITLE_MAP[path];

        if (titlePart) {
            document.title = `${titlePart} | ${BASE_TITLE}`;
        }
        // For dynamic routes (not in map), we rely on the page component 
        // using useDocumentTitle to set the specific title.
        // We don't reset here to avoid flickering or overwriting the dynamic title 
        // if this effect runs after the component mount.
        // However, if we go from /activities (mapped) to /unknown (unmapped), 
        // the title remains "Kegiatan". 
        // Ideally, dynamic pages (like /a/:id) SHOULD implement title setting.
    }, [location]);

    return null;
}
