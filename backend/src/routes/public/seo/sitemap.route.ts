/**
 * Sitemap.xml Route
 * Generates dynamic sitemap for SEO
 */

import { Router } from "express";
import { AppDataSource } from "../../../database/datasource";
import { BioEntity } from "../../../database/entity/bio-entity";
import { SitePostEntity } from "../../../database/entity/site-post-entity";
import { env } from "../../../config/env";

const router = Router();
const bioRepository = AppDataSource.getRepository(BioEntity);
const postRepository = AppDataSource.getRepository(SitePostEntity);

// Static routes - always included
const STATIC_ROUTES = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/en", priority: "1.0", changefreq: "daily" },
    { url: "/pt", priority: "1.0", changefreq: "daily" },
    { url: "/en/login", priority: "0.3", changefreq: "monthly" },
    { url: "/pt/login", priority: "0.3", changefreq: "monthly" },
    { url: "/en/sign-up", priority: "0.3", changefreq: "monthly" },
    { url: "/pt/sign-up", priority: "0.3", changefreq: "monthly" },
    { url: "/en/pricing", priority: "0.8", changefreq: "weekly" },
    { url: "/pt/pricing", priority: "0.8", changefreq: "weekly" },
    { url: "/en/about", priority: "0.6", changefreq: "monthly" },
    { url: "/pt/about", priority: "0.6", changefreq: "monthly" },
    { url: "/en/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/pt/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/en/blog", priority: "0.7", changefreq: "daily" },
    { url: "/pt/blog", priority: "0.7", changefreq: "daily" },
    { url: "/en/privacy-policy", priority: "0.4", changefreq: "yearly" },
    { url: "/pt/privacy-policy", priority: "0.4", changefreq: "yearly" },
    { url: "/en/terms-of-service", priority: "0.4", changefreq: "yearly" },
    { url: "/pt/terms-of-service", priority: "0.4", changefreq: "yearly" },
];

/**
 * Generate sitemap XML
 */
const generateSitemap = async (): Promise<string> => {
    const baseUrl = env.FRONTEND_URL || "https://portyo.me";
    const now = new Date().toISOString();
    
    const urls: Array<{
        loc: string;
        lastmod?: string;
        changefreq: string;
        priority: string;
    }> = [];
    
    // Add static routes
    for (const route of STATIC_ROUTES) {
        urls.push({
            loc: `${baseUrl}${route.url}`,
            changefreq: route.changefreq,
            priority: route.priority,
        });
    }
    
    // Add public bio pages
    try {
        const publicBios = await bioRepository.find({
            where: { noIndex: false },
            select: ["sufix", "updatedAt", "customDomain"],
        });
        
        for (const bio of publicBios) {
            if (!bio.sufix) continue;
            
            // Add /p/username
            urls.push({
                loc: `${baseUrl}/p/${bio.sufix}`,
                lastmod: bio.updatedAt?.toISOString() || now,
                changefreq: "weekly",
                priority: "0.6",
            });
            
            // If bio has custom domain, also add it
            if (bio.customDomain) {
                urls.push({
                    loc: `https://${bio.customDomain}`,
                    lastmod: bio.updatedAt?.toISOString() || now,
                    changefreq: "weekly",
                    priority: "0.7",
                });
            }
        }
    } catch (error) {
        console.error("Error fetching bios for sitemap:", error);
    }
    
    // Add blog posts
    try {
        const publishedPosts = await postRepository.find({
            where: { status: "published" },
            select: ["id", "updatedAt"],
        });
        
        for (const post of publishedPosts) {
            const slug = post.id;
            urls.push({
                loc: `${baseUrl}/en/blog/${slug}`,
                lastmod: post.updatedAt?.toISOString() || now,
                changefreq: "monthly",
                priority: "0.5",
            });
            urls.push({
                loc: `${baseUrl}/pt/blog/${slug}`,
                lastmod: post.updatedAt?.toISOString() || now,
                changefreq: "monthly",
                priority: "0.5",
            });
        }
    } catch (error) {
        console.error("Error fetching posts for sitemap:", error);
    }
    
    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
    
    for (const url of urls) {
        xml += "  <url>\n";
        xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
        if (url.lastmod) {
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        }
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        xml += `    <priority>${url.priority}</priority>\n`;
        xml += "  </url>\n";
    }
    
    xml += "</urlset>";
    
    return xml;
};

/**
 * Escape XML special characters
 */
const escapeXml = (str: string): string => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};

/**
 * GET /sitemap.xml
 * Returns XML sitemap
 */
router.get("/", async (req, res) => {
    try {
        const sitemap = await generateSitemap();
        
        res.setHeader("Content-Type", "application/xml");
        res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
        res.send(sitemap);
    } catch (error) {
        console.error("Error generating sitemap:", error);
        res.status(500).send("Error generating sitemap");
    }
});

export default router;
