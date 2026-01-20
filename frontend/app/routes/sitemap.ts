
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const host = url.host;
  const origin = `${url.protocol}//${host}`;
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
  const addUrl = (loc: string, lastmod?: string, changefreq: string = 'weekly', priority: number = 0.8) => {
      urls.push(toUrl(loc, lastmod, changefreq, priority));
  };

    // Determine if this is a bio request
  const { username } = params as { username?: string };
  
  // Custom Domain Logic (simplified)
  let customDomainBioIdentifier: string | null = null;
  if (!isPortyoDomain && !isOnRenderDomain && !isLocalhost) {
      customDomainBioIdentifier = host;
  }

  const bioIdentifier = username || customDomainBioIdentifier;
  const siteBase = isPortyoDomain ? `https://portyo.me` : origin;
  const localePaths = (paths: string[]) => [
      ...paths.map(p => `/en${p}`),
      ...paths.map(p => `/pt${p}`)
  ];
  const supportedLangs = ["en", "pt"];

    if (bioIdentifier) {
      // User Specific Sitemap
     const rawApiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me';
     const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
    const baseUrl = username ? `https://portyo.me/p/${username}` : `https://${host}`;
    const bioBasePath = username ? `/p/${username}` : "";

     // Always add root
      addUrl(baseUrl, undefined, 'weekly', 1.0);

      try {
        // 1. Fetch Bio Details to get ID
        const bioFetchUrl = username 
           ? `${apiUrl}/public/bio/${username}`
           : `${apiUrl}/public/bio/domain/${bioIdentifier}`;
         
        const bioRes = await fetch(bioFetchUrl);
        if(bioRes.ok) {
          const bioData = await bioRes.json();
          const bioId = bioData.id;
          
          if (bioId) {
             // 2. Fetch Blog Posts & Products (Parallel)
             const [postsRes, productsRes] = await Promise.all([
                fetch(`${apiUrl}/public/blog/${bioId}`),
                fetch(`${apiUrl}/public/products/${bioId}`)
             ]);
 
             // Add standard tabs
             addUrl(`${baseUrl}/shop`, undefined, 'weekly', 0.8);
             addUrl(`${baseUrl}/blog`, undefined, 'weekly', 0.8);
             
             // Add Posts
             if(postsRes.ok) {
               const posts = await postsRes.json();
               if(Array.isArray(posts)) {
                  posts.forEach((post: any) => {
                     // Check if post is published? The public API should filter that.
                     // The API endpoint is likely filtering. 
                     const postUrl = `${baseUrl}/blog/post/${post.id}`;
                     addUrl(postUrl, post.updatedAt, 'monthly', 0.7);
                     supportedLangs.forEach((lang) => {
                       const localizedBase = username
                         ? `https://portyo.me/${lang}${bioBasePath}`
                         : `${origin}/${lang}`;
                       addUrl(`${localizedBase}/blog/post/${post.id}`, post.updatedAt, 'monthly', 0.7);
                     });
                  });
               }
             }

             // Note: Products typically load on /shop or as modal, so we just link /shop
          }
        }
      } catch(e) {
        console.error("Error generating user sitemap", e);
      }
    } else {
      // Global Sitemap
      const publicPaths = [
        '/',
        '/about',
        '/pricing',
        '/terms',
        '/privacy',
        '/blog',
        '/login',
        '/sign-up',
        '/verify-email',
        '/forgot-password',
        '/reset-password',
        '/claim-bio'
      ];

      addUrl(siteBase + '/', undefined, 'daily', 1.0);
      localePaths(publicPaths.filter(p => p !== '/')).forEach((path) => {
        addUrl(`${siteBase}${path}`, undefined, 'weekly', 0.8);
      });

        // Site Blog Posts
        try {
          const rawApiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me';
          const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
          const [resEn, resPt] = await Promise.all([
            fetch(`${apiUrl}/public/site-blog?lang=en`),
            fetch(`${apiUrl}/public/site-blog?lang=pt`),
          ]);

          if (resEn.ok) {
            const posts: { id: string | number; updatedAt?: string }[] = await resEn.json();
            posts.forEach((post) => {
              const lastmod = post.updatedAt;
              addUrl(`${siteBase}/en/blog/${post.id}`, lastmod, 'weekly', 0.7);
            });
          }

          if (resPt.ok) {
            const posts: { id: string | number; updatedAt?: string }[] = await resPt.json();
            posts.forEach((post) => {
              const lastmod = post.updatedAt;
              addUrl(`${siteBase}/pt/blog/${post.id}`, lastmod, 'weekly', 0.7);
            });
          }
        } catch (e) {
          console.error("Failed to fetch site posts for sitemap", e);
        }

        // Dynamic User Bios
      try {
          const rawApiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me';
          const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
          const res = await fetch(`${apiUrl}/public/bios`);
          if (res.ok) {
              const bios: { sufix: string, updatedAt: string }[] = await res.json();
              const validBios = bios.filter((bio) => bio.sufix);

              validBios.forEach(bio => {
                addUrl(`${siteBase}/p/${bio.sufix}`, bio.updatedAt, 'weekly', 0.6);
              });

              await Promise.all(
                validBios.map(async (bio) => {
                  try {
                    const bioRes = await fetch(`${apiUrl}/public/bio/${bio.sufix}`);
                    if (!bioRes.ok) return;
                    const bioData = await bioRes.json();
                    const bioId = bioData?.id;
                    if (!bioId) return;

                    const postsRes = await fetch(`${apiUrl}/public/blog/${bioId}`);
                    if (!postsRes.ok) return;
                    const posts = await postsRes.json();
                    if (!Array.isArray(posts)) return;

                    posts.forEach((post: any) => {
                      addUrl(`${siteBase}/p/${bio.sufix}/blog/post/${post.id}`, post.updatedAt, 'monthly', 0.7);
                      supportedLangs.forEach((lang) => {
                        addUrl(`${siteBase}/${lang}/p/${bio.sufix}/blog/post/${post.id}`, post.updatedAt, 'monthly', 0.7);
                      });
                    });
                  } catch (err) {
                    console.error("Failed to fetch bio posts for sitemap", err);
                  }
                })
              );
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
