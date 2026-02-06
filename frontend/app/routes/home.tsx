import type { Route } from "./+types/home";
import { lazy, Suspense } from "react";
import LandingPage from "~/components/marketing/landing-page";
import { BioRenderer } from "~/components/bio/bio-renderer";
import { BioNotFound } from "~/components/public-bio/not-found";
import type { ay } from "node_modules/react-router/dist/development/router-5iOvts3c.mjs";
import i18n from "~/i18n";

const META_FALLBACK = {
  en: {
    title: "Portyo - Link in Bio",
    description:
      "Convert your followers into customers with one link. Generate powerful revenue-generating Bio's with our all-in-one platform.",
  },
  pt: {
    title: "Portyo - Link in Bio",
    description:
      "Converta seguidores em clientes com um link. Gere bios poderosas que geram receita com nossa plataforma tudo-em-um.",
  },
} as const;

const getMetaText = (lang: "en" | "pt", key: string, fallback: string) => {
  const tMeta = i18n.getFixedT(lang, "meta");
  const value = tMeta(key, { defaultValue: fallback }) as string;
  return value || fallback;
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const origin = url.origin;

  const isOnRenderDomain = hostname.endsWith('.onrender.com');
  const isPortyoDomain = hostname.endsWith('portyo.me');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');

  const isCustomDomain = !isPortyoDomain && !isOnRenderDomain && !isLocalhost;

  if (isCustomDomain) {
    const rawApiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me';
    const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
    try {
      const res = await fetch(`${apiUrl}/public/bio/domain/${hostname}`);
      if (res.ok) {
        const bio = await res.json();
        return { type: 'bio', bio, hostname, origin };
      }
    } catch (e) {
      console.error("Failed to fetch bio for domain", hostname, e);
    }
    return { type: 'bio', bio: null, hostname, origin }; // Bio not found
  }

  return { type: 'marketing' };
}

export function meta({ data, params }: Route.MetaArgs) {
  if (data?.type === 'bio' && data?.bio) {
    const bio = data.bio;
    // ... Copy meta logic from p.$username.tsx or use a shared helper?
    // For now, let's duplicate the critical parts or simpler: use defaults if missing
    const title = bio.seoTitle || bio.ogTitle || `${bio.subdomain} | Portyo`;
    const description = bio.seoDescription || bio.ogDescription || "";
    const ogImage = bio.ogImage || bio.profileImage || "https://portyo.me/favicons/192x192.png";
    const url = data.origin || (data.hostname ? `https://${data.hostname}` : undefined);
    return [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: bio.ogTitle || title },
      { property: "og:description", content: bio.ogDescription || description || "" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: bio.ogTitle || title },
      { name: "twitter:description", content: bio.ogDescription || description || "" },
      { name: "twitter:image", content: ogImage },
      ...(url ? [{ property: "og:url", content: url }] : []),
    ];
  }
  const lang = params?.lang === "pt" ? "pt" : "en";
  const fallback = META_FALLBACK[lang];
  const title = getMetaText(lang, "home.title", fallback.title);
  const description = getMetaText(lang, "home.description", fallback.description);
  const ogImage = "https://portyo.me/favicons/192x192.png";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  if (loaderData.type === 'bio') {
    const { bio, hostname } = loaderData;
    if (!bio) return <BioNotFound username={hostname as any} />; // Or generic "Domain not claimed"

    // We pass isNested={true} because on custom domain root,
    // root.tsx ALWAYS renders html/body tags, so we must render as nested content.

    return <BioRenderer bio={bio} blocks={bio.blocks || []} subdomain={bio.sufix || ''} isNested={true} baseUrl={loaderData.origin || `https://${hostname}`} />;
  }

  return <LandingPage />;
}
