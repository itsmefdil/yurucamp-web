import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_SITEMAP_URL = process.env.VITE_API_URL
    ? `${process.env.VITE_API_URL.replace(/\/api\/?$/, '')}/sitemap.xml`
    : 'https://api.yurucamp.my.id/sitemap.xml';

async function generateStaticSitemap() {
    console.log('🔄 Generating static sitemap.xml for Vercel build...');
    try {
        const response = await fetch(BACKEND_SITEMAP_URL, {
            headers: {
                'User-Agent': 'VercelBuildSitemapGenerator/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sitemap from backend. Status: ${response.status}`);
        }

        const xmlContent = await response.text();

        if (!xmlContent.includes('<urlset') || !xmlContent.includes('</urlset>')) {
            throw new Error('Fetched content is not a valid sitemap XML');
        }

        const publicDir = path.resolve(__dirname, '../public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const sitemapPath = path.join(publicDir, 'sitemap.xml');
        fs.writeFileSync(sitemapPath, xmlContent, 'utf-8');

        console.log(`✅ Static sitemap.xml generated successfully at ${sitemapPath} (${xmlContent.length} bytes)!`);
    } catch (error) {
        console.error('❌ Error generating static sitemap:', error);
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.yurucamp.my.id</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.yurucamp.my.id/activities</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.yurucamp.my.id/camp-areas</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.yurucamp.my.id/events</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.yurucamp.my.id/community</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
        const publicDir = path.resolve(__dirname, '../public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), fallbackXml, 'utf-8');
        console.log('⚠️ Fallback static sitemap.xml created.');
    }
}

generateStaticSitemap();
