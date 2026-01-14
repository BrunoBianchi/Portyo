import { type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { BioLayout } from "~/components/bio/bio-layout";
import { BioNotFound } from "~/components/public-bio/not-found";
import { BioLoading } from "~/components/public-bio/loading";

// Helper to decode HTML (copied from root.tsx)
const encodeHtmlToBase64 = (html: string) => {
    try {
        if (typeof Buffer !== "undefined") {
            return (globalThis as any).Buffer.from(html, "utf-8").toString("base64");
        }
    } catch { }

    try {
        if (typeof btoa !== "undefined") {
            return btoa(unescape(encodeURIComponent(html)));
        }
    } catch { }

    return html;
};

const serializeBioHtml = (bio: any) => {
    if (!bio || typeof bio !== "object") return bio;

    if (bio.html && typeof bio.html === "string") {
        // For rendering, we usually need the raw HTML, not base64.
        // However, the original root.tsx encoded it? 
        // Wait, root.tsx encoded it to "htmlBase64" and set "html" to null.
        // The context used `bio.html`?
        // Let's check BioRenderer. It takes `html`.
        // In SubDomainProvider, it passes `bio.html`.
        // The serialized bio had `html: null` and `htmlBase64`.
        // So the client must decode it?
        // Actually, looking at root.tsx: `return { bio: serializeBioHtml(...) }`
        // And BioLayout uses `bio`.
        // Let's look at `frontend/app/components/bio/bio-layout.tsx` if it exists, or how SubDomainContext used it.
        // SubDomainContext fetched via `api.get`, so it likely got raw HTML.
        // SSR loader in root.tsx serialized it.
        // If I am fetching in Loader (Server side), I might need to serialize it if passing via JSON to client to avoid hydration issues or XSS filters?
        // But commonly we pass data as is.
        // Let's just return the bio as is from the API for now.
        return bio;
    }
    return bio;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    const username = params.username;
    const apiUrl = process.env.API_URL || process.env.VITE_API_URL || 'https://api.portyo.me/api';

    // Ignore if username conflicts with known top-level routes handled by other files, 
    // but React Router usually prioritizes static files. 
    // e.g. "dashboard", "login" are static. "assets" etc.

    if (!username) return { bio: null, username: null };

    console.log("Fetching bio for:", username, "from base:", apiUrl);
    try {
        const fetchUrl = `${apiUrl}/public/bio/${username}`;
        console.log("Full Fetch URL:", fetchUrl);
        const res = await fetch(fetchUrl);
        console.log("Fetch response status:", res.status);

        if (res.ok) {
            const bio = await res.json();
            console.log("Bio found:", bio?.id);

            // Track view if Pro (server-side tracking is problematic without session context from client)
            // The original code tracked "Page View" in useEffect. 
            // We can do that in a client component or useEffect here.

            return { bio, username };
        } else {
            console.log("Fetch not ok:", await res.text());
        }
    } catch (e) {
        console.error("Bio Fetch Error", e);
    }

    return { bio: null, username };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.bio || !data.username) {
        return [{ title: "Bio Not Found" }];
    }
    const { bio, username } = data;
    const title = bio.seoTitle || username;
    const description = bio.seoDescription;
    const keywords = bio.seoKeywords;
    const favicon = bio.favicon;
    const url = bio.customDomain ? `https://${bio.customDomain}` : `https://portyo.me/p/${username}`;

    const metaTags: any[] = [
        { title: title },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { property: "og:url", content: url },
        { property: "og:title", content: bio.ogTitle || title },
        { property: "og:description", content: bio.ogDescription || description || "" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: bio.ogTitle || title },
        { name: "twitter:description", content: bio.ogDescription || description || "" },
    ];

    if (description) {
        metaTags.push({ name: "description", content: description });
    }
    if (keywords) {
        metaTags.push({ name: "keywords", content: keywords });
    }
    if (bio.ogImage) {
        metaTags.push({ property: "og:image", content: bio.ogImage });
        metaTags.push({ name: "twitter:image", content: bio.ogImage });
    }
    if (favicon) {
        metaTags.push({ tagName: "link", rel: "icon", href: favicon });
    }

    // Canonical
    metaTags.push({ tagName: "link", rel: "canonical", href: url });

    if (bio.noIndex) {
        metaTags.push({ name: "robots", content: "noindex, nofollow" });
    }

    if (bio.googleAnalyticsId) {
        metaTags.push({ name: "google-site-verification", content: bio.googleAnalyticsId });
    }

    return metaTags;
};

export default function PublicBioRoute() {
    const { bio, username } = useLoaderData<typeof loader>();

    if (!username) return <BioNotFound username="" />;
    if (!bio) return <BioNotFound username={username} />;

    return (
        <BioLayout bio={bio} subdomain={username} isNested={true} />
    );
}
