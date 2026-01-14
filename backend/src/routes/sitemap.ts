import { Router } from 'express';
import { db } from '../db';
import { activities, campAreas, events } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const STATIC_ROUTES = [
    '',
    '/login',
    '/register',
    '/about',
    '/activities',
    '/camp-areas',
    '/events',
    '/watch',
    '/watch/season-1',
    '/watch/season-2',
    '/watch/season-3', // Static seasons
];

const BASE_URL = 'https://yurucamp.my.id'; // Adjust as needed or use env var

router.get('/', async (req, res) => {
    try {
        console.log('Generating dynamic sitemap...');

        // Parallel data fetching
        const [allActivities, allCampAreas, allEvents] = await Promise.all([
            db.select({ id: activities.id }).from(activities),
            db.select({ id: campAreas.id }).from(campAreas),
            db.select({ id: events.id }).from(events),
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static Routes
        STATIC_ROUTES.forEach(route => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}${route}</loc>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '  </url>\n';
        });

        // Activities
        allActivities.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/activities/${item.id}</loc>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Camp Areas
        allCampAreas.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/camp-areas/${item.id}</loc>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Events
        allEvents.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/events/${item.id}</loc>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

export default router;
