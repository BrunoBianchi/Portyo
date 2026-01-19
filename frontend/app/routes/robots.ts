import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const host = url.host;
  const hostname = host.split(':')[0];
  
  const isOnRenderDomain = hostname.endsWith('.onrender.com');
  const isPortyoDomain = hostname.endsWith('portyo.me');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');

  // Determine if this is a bio request
  const { username } = params as { username?: string };
  
  // Custom Domain Logic (simplified)
  let customDomainBioIdentifier: string | null = null;
  if (!isPortyoDomain && !isOnRenderDomain && !isLocalhost) {
      customDomainBioIdentifier = host;
  }

  const bioIdentifier = username || customDomainBioIdentifier;

  if (bioIdentifier) {
      // It's a bio!
      // Fetch public bio to check noIndex
      const rawApiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me';
      const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
      let bioData = null;

      try {
          const fetchUrl = username 
              ? `${apiUrl}/public/bio/${username}`
              : `${apiUrl}/public/bio/domain/${customDomainBioIdentifier}`;
          
          const res = await fetch(fetchUrl);
          if (res.ok) {
              bioData = await res.json();
          }
      } catch (e) {
          console.error("Failed to fetch bio for robots.txt logic", e);
      }

      const noIndex = bioData?.noIndex;
      const sitemapUrl = username 
          ? `https://portyo.me/p/${username}/sitemap.xml`
          : `https://${host}/sitemap.xml`;

      const bioContent = `User-agent: *
# Bio Configuration
${noIndex ? 'Disallow: /' : 'Allow: /'}

# Sitemap Reference
Sitemap: ${sitemapUrl}`;

      return new Response(bioContent, {
          status: 200,
          headers: {
              "Content-Type": "text/plain",
              "Cache-Control": "public, max-age=3600",
          },
      });
  }

  // Main site robots.txt
  const content = `User-agent: *
# Public Content
Allow: /
Allow: /p/
Allow: /blog/

# Dashboard & Private Areas
Disallow: /dashboard/
Disallow: /api/

# Authentication Routes
Disallow: /login
Disallow: /sign-up
Disallow: /verify-email
Disallow: /forgot-password
Disallow: /reset-password

# Management Routes
Disallow: /bookings/manage

# Sitemap Reference
Sitemap: https://portyo.me/sitemap.xml`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      // Cache for 1 hour to avoid hitting the DB too often, but allow updates reasonably fast
      "Cache-Control": "public, max-age=3600", 
    },
  });
}
