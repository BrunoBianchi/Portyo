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
  } else {
      // Custom domain logic could go here, but for robots.txt we might just default to allow
      // unless we want to fetch the bio for custom domains too.
      // For now, let's assume custom domains are handled like subdomains if we can resolve them.
  }

  if (subdomain === "www") subdomain = "";

  let content = "";

  if (subdomain) {
    // It's a user profile
    let noIndex = false;
    
    try {
        const apiUrl = process.env.API_URL || 'http://localhost:3000/api';
        // We need to fetch the bio to check the noIndex flag
        // We can use the same endpoint as the root loader
        const res = await fetch(`${apiUrl}/public/bio/${subdomain}`);
        if (res.ok) {
            const bio = await res.json();
            if (bio.noIndex) {
                noIndex = true;
            }
        }
    } catch (e) {
        console.error("Error fetching bio for robots.txt", e);
    }

    if (noIndex) {
        content = `# Robots.txt for ${subdomain}\nUser-agent: *\nDisallow: /`;
    } else {
        content = `# Robots.txt for ${subdomain}\nUser-agent: *\nAllow: /\nAllow: /blog/\nAllow: /blog/post/\n\nSitemap: https://${subdomain}.portyo.me/sitemap.xml`;
    }

  } else {
    // It's the main site
    content = `User-agent: *
Allow: /
Allow: /blog/
Allow: /blog/post/
Disallow: /dashboard/
Disallow: /api/
Disallow: /bookings/manage

Sitemap: https://portyo.me/sitemap.xml`;
  }

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      // Cache for 1 hour to avoid hitting the DB too often, but allow updates reasonably fast
      "Cache-Control": "public, max-age=3600", 
    },
  });
}
