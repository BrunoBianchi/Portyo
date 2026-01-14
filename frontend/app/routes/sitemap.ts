
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const host = url.host;
  const hostname = host.split(':')[0];
  const isOnRenderDomain = hostname.endsWith('.onrender.com');
  const isPortyoDomain = hostname.endsWith('portyo.me');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');

  // Define XML builder helper
  const toUrl = (loc: string, lastmod?: string, changefreq: string = 'weekly', priority: number = 0.8) => {
      return `
  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
  };

  let urls: string[] = [];

    // Determine if this is a bio request
  const { username } = params as { username?: string };
  
  // Custom Domain Logic (simplified)
  let customDomainBioIdentifier: string | null = null;
  if (!isPortyoDomain && !isOnRenderDomain && !isLocalhost) {
      customDomainBioIdentifier = host;
  }

  const bioIdentifier = username || customDomainBioIdentifier;

  if (bioIdentifier) {
      // User Specific Sitemap
     const apiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me/api';
     const baseUrl = username ? `https://portyo.me/p/${username}` : `https://${host}`;

     // Always add root
      urls.push(toUrl(baseUrl, undefined, 'weekly', 1.0));

     // Fetch bio details to check for blog/shop tabs enabled (pseudo-check for now, or just assume standard sub-pages)
     // For now, we add common sub-pages if they are generally available
     urls.push(toUrl(`${baseUrl}/shop`, undefined, 'weekly', 0.8));
     urls.push(toUrl(`${baseUrl}/blog`, undefined, 'weekly', 0.8));

     // TODO: Fetch public blog posts for this user and add them recursively
  } else {
      // Global Sitemap
      urls.push(toUrl('https://portyo.me/', undefined, 'daily', 1.0));
      urls.push(toUrl('https://portyo.me/login', undefined, 'monthly', 0.5));
      urls.push(toUrl('https://portyo.me/sign-up', undefined, 'monthly', 0.8));

      // Dynamic User Bios
      try {
          const apiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me/api';
          const res = await fetch(`${apiUrl}/public/bios`);
          if (res.ok) {
              const bios: { sufix: string, updatedAt: string }[] = await res.json();
              bios.forEach(bio => {
                  if (bio.sufix) {
                      urls.push(toUrl(`https://portyo.me/p/${bio.sufix}`, bio.updatedAt, 'weekly', 0.6));
                  }
              });
          }
      } catch (e) {
          console.error("Failed to fetch bios for sitemap", e);
      }
  }


  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      "encoding": "UTF-8",
      "Cache-Control": "public, max-age=3600"
    },
  });
}
