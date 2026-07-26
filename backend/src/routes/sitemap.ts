import { Router } from 'express';
import { db } from '../db';
import { activities, campAreas, events, regions, users, gearLists } from '../db/schema';
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
    '/community',
    '/w/season-1',
    '/w/season-2',
    '/w/season-3',
];

const BASE_URL = process.env.FRONTEND_URL || 'https://www.yurucamp.my.id';

const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const formatDate = (date: Date | string | null): string | null => {
    if (!date) return null;
    try {
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
        return null;
    }
};

router.get('/', async (req, res) => {
    try {
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
            xml += `    <loc>${escapeXml(`${BASE_URL}${route}`)}</loc>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '  </url>\n';
        });

        // Helper to append URL entry
        const addUrl = (path: string, updatedAt?: Date | string | null, priority = '0.8', changefreq = 'weekly') => {
            xml += '  <url>\n';
            xml += `    <loc>${escapeXml(`${BASE_URL}${path}`)}</loc>\n`;
            const formattedDate = formatDate(updatedAt ?? null);
            if (formattedDate) {
                xml += `    <lastmod>${formattedDate}</lastmod>\n`;
            }
            xml += `    <changefreq>${changefreq}</changefreq>\n`;
            xml += `    <priority>${priority}</priority>\n`;
            xml += '  </url>\n';
        };

        allActivities.forEach(item => addUrl(`/a/${item.id}`, item.updatedAt, '0.8'));
        allCampAreas.forEach(item => addUrl(`/c/${item.id}`, item.updatedAt, '0.8'));
        allEvents.forEach(item => addUrl(`/e/${item.id}`, item.updatedAt, '0.8'));
        allRegions.forEach(item => addUrl(`/r/${item.slug}`, item.updatedAt, '0.9'));
        allUsers.forEach(item => addUrl(`/u/${item.id}`, item.updatedAt, '0.6'));
        publicGearLists.forEach(item => addUrl(`/g/${item.id}`, item.updatedAt, '0.7'));

        xml += '</urlset>';

        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
        res.status(200).send(xml);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).setHeader('Content-Type', 'text/plain').send('Error generating sitemap');
    }
});

export default router;

