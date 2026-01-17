import type { Route } from "./+types/home";
import { lazy, Suspense } from "react";
import LandingPage from "~/components/marketing/landing-page";
import BioLayout from "~/components/bio/bio-layout";
import { BioNotFound } from "~/components/public-bio/not-found";
import type { ay } from "node_modules/react-router/dist/development/router-5iOvts3c.mjs";
import i18n from "~/i18n";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const hostname = url.hostname;

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
        return { type: 'bio', bio, hostname };
      }
    } catch (e) {
      console.error("Failed to fetch bio for domain", hostname, e);
    }
    return { type: 'bio', bio: null, hostname }; // Bio not found
  }

  return { type: 'marketing' };
}

export function meta({ data, params }: Route.MetaArgs) {
  if (data?.type === 'bio' && data?.bio) {
    const bio = data.bio;
    // ... Copy meta logic from p.$username.tsx or use a shared helper?
    // For now, let's duplicate the critical parts or simpler: use defaults if missing
    return [
      { title: bio.seoTitle || bio.ogTitle || `${bio.subdomain} | Portyo` },
      { name: "description", content: bio.seoDescription || bio.ogDescription || "" },
      // ... add other critical meta
    ];
  }
  const lang = params?.lang === "pt" ? "pt" : "en";
  return [
    { title: i18n.t("meta.home.title", { lng: lang }) },
    { name: "description", content: i18n.t("meta.home.description", { lng: lang }) },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  if (loaderData.type === 'bio') {
    const { bio, hostname } = loaderData;
    if (!bio) return <BioNotFound username={hostname as any} />; // Or generic "Domain not claimed"

    // We pass isNested={false} because on custom domain root, 
    // the root layout is hidden, so BioLayout receives the main scroll container
    // BUT `root.tsx` renders `html` and `body`. 
    // If `BioLayout` is `isNested={false}`, it tries to render `html`/`body` tags?
    // Wait, `BioLayout` `isNested={false}` renders `html`/`body`.
    // `root.tsx` ALWAYS renders `html`/`body`.
    // So even on custom domain root, we are inside `root.tsx`. 
    // So we MUST pass `isNested={true}` to avoid hydration error!

    return <BioLayout bio={bio} subdomain={bio.sufix || ''} isNested={true} />;
  }

  return <LandingPage />;
}
