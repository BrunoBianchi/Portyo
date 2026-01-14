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
      const apiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me/api';
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
${noIndex ? 'Disallow: /' : 'Allow: /'}

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
Allow: /
Allow: /p/
Allow: /blog/
Allow: /blog/post/
Disallow: /dashboard/
Disallow: /api/
Disallow: /bookings/manage

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
