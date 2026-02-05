import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
    const host = url.host;
    const origin = url.origin;
  const hostname = host.split(':')[0];
  
    const isOnRenderDomain = hostname.endsWith('.onrender.com');
    const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');
    const isPortyoRoot = hostname === 'portyo.me' || hostname === 'www.portyo.me';
    const isSaasSubdomain = hostname.endsWith('.portyo.me') && !isPortyoRoot;
    const subdomain = isSaasSubdomain ? hostname.replace(/\.portyo\.me$/, '') : null;
    const isSaasReservedSubdomain = subdomain ? ['api', 'www'].includes(subdomain) : false;
    const isCustomDomain = !isPortyoRoot && !isSaasSubdomain && !isOnRenderDomain && !isLocalhost;

  // Determine if this is a bio request
  const { username } = params as { username?: string };
  
  // Custom Domain Logic (simplified)
  let customDomainBioIdentifier: string | null = null;
  if (isCustomDomain) {
      customDomainBioIdentifier = hostname;
  }

  const bioIdentifier = username || customDomainBioIdentifier || (!isSaasReservedSubdomain ? subdomain : null);

  if (bioIdentifier) {
      // It's a bio!
      // Fetch public bio to check noIndex
      const rawApiUrl = isLocalhost
          ? `${origin}/api`
          : (process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me');
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
          ? `${origin}/p/${username}/sitemap.xml`
          : `${origin}/sitemap.xml`;

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
