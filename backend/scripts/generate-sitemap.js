const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/portyo',
});

const BASE_URL = 'https://portyo.me';

async function generateSitemap() {
  try {
    await client.connect();
    console.log('🔌 Connected to DB');

    // Fetch public bios. Adjust query as needed.
    // Assuming 'bio_entity' table exists and has 'sufix' and 'updatedAt' columns.
    // If table name is different (TypeORM defaults to snake_case usually), check entity.
    // BioEntity -> bio_entity usually.
    const res = await client.query('SELECT sufix, "updatedAt" FROM bio_entity');
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    res.rows.forEach(row => {
      const url = `https://${row.sufix}.portyo.me`;
      const lastMod = row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString();

      sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += '</urlset>';

    const outputPath = path.join(__dirname, '../../frontend/public/sitemap-static.xml');
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, sitemap);
    
    console.log(`✅ Sitemap generated with ${res.rows.length} URLs at ${outputPath}`);
  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
  } finally {
    await client.end();
  }
}

generateSitemap();
