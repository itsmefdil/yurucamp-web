import { Router } from 'express';
import { db } from '../db';
import { activities, campAreas, events, regions, users, gearLists } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

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
    '/community',
    // Static seasons links if they are permanent
    '/w/season-1',
    '/w/season-2',
    '/w/season-3',
];

const BASE_URL = 'https://yurucamp.my.id'; // Adjust as needed or use env var

router.get('/', async (req, res) => {
    try {
        console.log('Generating dynamic sitemap...');

        // Parallel data fetching
        const [
            allActivities,
            allCampAreas,
            allEvents,
            allRegions,
            allUsers,
            publicGearLists
        ] = await Promise.all([
            db.select({ id: activities.id, updatedAt: activities.createdAt }).from(activities),
            db.select({ id: campAreas.id, updatedAt: campAreas.createdAt }).from(campAreas),
            db.select({ id: events.id, updatedAt: events.updatedAt }).from(events),
            db.select({ slug: regions.slug, updatedAt: regions.createdAt }).from(regions).where(eq(regions.status, 'active')),
            db.select({ id: users.id, updatedAt: users.updatedAt }).from(users),
            db.select({ id: gearLists.id, updatedAt: gearLists.updatedAt }).from(gearLists).where(eq(gearLists.isPublic, true)),
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

        // Activities (/a/:id)
        allActivities.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/a/${item.id}</loc>\n`;
            if (item.updatedAt) {
                xml += `    <lastmod>${new Date(item.updatedAt).toISOString()}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Camp Areas (/c/:id)
        allCampAreas.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/c/${item.id}</loc>\n`;
            if (item.updatedAt) {
                xml += `    <lastmod>${new Date(item.updatedAt).toISOString()}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Events (/e/:id)
        allEvents.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/e/${item.id}</loc>\n`;
            if (item.updatedAt) {
                xml += `    <lastmod>${new Date(item.updatedAt).toISOString()}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Regions (/r/:slug)
        allRegions.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/r/${item.slug}</loc>\n`;
            if (item.updatedAt) {
                xml += `    <lastmod>${new Date(item.updatedAt).toISOString()}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.9</priority>\n';
            xml += '  </url>\n';
        });

        // Users (/u/:id)
        allUsers.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/u/${item.id}</loc>\n`;
            if (item.updatedAt) {
                xml += `    <lastmod>${new Date(item.updatedAt).toISOString()}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        });

        // Gear Lists (/g/:id)
        publicGearLists.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/g/${item.id}</loc>\n`;
            if (item.updatedAt) {
                xml += `    <lastmod>${new Date(item.updatedAt).toISOString()}</lastmod>\n`;
            }
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
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
