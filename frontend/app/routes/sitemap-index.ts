import type { LoaderFunctionArgs } from "react-router";

type PublicBio = {
  sufix?: string;
  updatedAt?: string;
};

const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  if (url.pathname === "/sitemap-index") {
    return new Response(null, {
      status: 301,
      headers: {
        Location: "/sitemap-index.xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const host = url.host;
  const origin = `${url.protocol}//${host}`;
  const hostname = host.split(":")[0];
  const isLocalhost = hostname === "localhost" || hostname.endsWith(".localhost");
  const isOnRenderDomain = hostname.endsWith(".onrender.com");
  const isPortyoRoot = hostname === "portyo.me" || hostname === "www.portyo.me";
  const siteBase = isPortyoRoot ? "https://portyo.me" : origin;

  const rawApiUrl = isLocalhost
    ? `${origin}/api`
    : (process.env.API_URL || process.env.VITE_API_URL || "https://api.portyo.me");
  const apiUrl = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

  const nowIso = new Date().toISOString();
  const entries: Array<{ loc: string; lastmod: string }> = [
    { loc: `${siteBase}/sitemap.xml`, lastmod: nowIso },
  ];

  if (!isOnRenderDomain) {
    try {
      const response = await fetch(`${apiUrl}/public/bios`);
      if (response.ok) {
        const bios = (await response.json()) as PublicBio[];
        const uniqueBySuffix = new Map<string, string>();

        for (const bio of bios) {
          const suffix = (bio?.sufix || "").trim();
          if (!suffix) continue;
          if (!uniqueBySuffix.has(suffix)) {
            uniqueBySuffix.set(suffix, bio.updatedAt || nowIso);
          }
        }

        for (const [suffix, updatedAt] of uniqueBySuffix.entries()) {
          entries.push({
            loc: `${siteBase}/p/${suffix}/sitemap.xml`,
            lastmod: updatedAt || nowIso,
          });
        }
      }
    } catch {
      // Keep base sitemap entry even if bios endpoint fails
    }
  }

  const xmlItems = entries
    .map((entry) => {
      return [
        "  <sitemap>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
        "  </sitemap>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlItems}\n</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
