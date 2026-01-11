
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const host = url.host;
  const hostname = host.split(':')[0];
  const parts = hostname.split('.').filter(Boolean);

  let subdomain = "";
  const isOnRenderDomain = hostname.endsWith('.onrender.com');
  const isPortyoDomain = hostname.endsWith('portyo.me');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');

  // Determine subdomain
  if (isLocalhost) {
      if (parts.length > 1) subdomain = parts[0];
  } else if (isOnRenderDomain) {
      if (parts.length > 3) subdomain = parts[0];
  } else if (isPortyoDomain) {
      if (parts.length > 2) subdomain = parts[0];
  }

  if (subdomain === "www") subdomain = "";
  const baseUrl = `https://${subdomain ? subdomain + '.' : ''}portyo.me`;

  let urls: string[] = [];
  
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

  if (subdomain) {
    // User Profile Sitemap
    try {
        const apiUrl = process.env.API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${apiUrl}/public/bio/${subdomain}`);
        
        if (res.ok) {
            const bio = await res.json();
            
            if (bio.noIndex) {
                 return new Response("Not Found", { status: 404 });
            }

            // 1. Main Bio Page
            urls.push(toUrl(baseUrl, bio.updatedAt?.split('T')[0], 'daily', 1.0));

            // 2. Fetch Blog Posts
            try {
                const blogRes = await fetch(`${apiUrl}/public/blog/${bio.id}`);
                if (blogRes.ok) {
                    const posts = await blogRes.json();
                    if (Array.isArray(posts)) {
                        posts.forEach((post: any) => {
                            urls.push(toUrl(`${baseUrl}/blog/post/${post.id}`, post.updatedAt?.split('T')[0], 'monthly', 0.8));
                        });
                    }
                    if (posts.length > 0) {
                         // Main blog page
                         urls.push(toUrl(`${baseUrl}/blog`, undefined, 'weekly', 0.9));
                    }
                }
            } catch (err) {
                console.error("Error fetching blog posts for sitemap", err);
            }

            // 3. Fetch Products (if we have individual product pages or just shop tab)
            // Assuming we mostly link to shop tab, but if we had individual pages:
            try {
                const productsRes = await fetch(`${apiUrl}/public/products/${bio.id}`);
                if (productsRes.ok) {
                    const products = await productsRes.json();
                     if (products.length > 0) {
                         // Shop main page
                         urls.push(toUrl(`${baseUrl}/shop`, undefined, 'weekly', 0.9));
                         
                         // If products have individual URLs on our domain (not external)
                         // Based on html-generator, products had external URLs mostly, but if they are internal:
                         // ... logic here
                    }
                }
            } catch (err) {
                console.error("Error fetching products for sitemap", err);
            }
        }
    } catch (e) {
        console.error("Error fetching bio for sitemap", e);
    }
  } else {
    // Main Marketing Site Sitemap
    urls.push(toUrl('https://portyo.me/', undefined, 'daily', 1.0));
    urls.push(toUrl('https://portyo.me/login', undefined, 'monthly', 0.5));
    urls.push(toUrl('https://portyo.me/signup', undefined, 'monthly', 0.8));
    // Add other static pages here
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
