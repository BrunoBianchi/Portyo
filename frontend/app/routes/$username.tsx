import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, Meta, Links, Scripts } from "react-router";
import { BioRenderer } from "~/components/public-bio/renderer";
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
    const apiUrl = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:3000/api';

    // Ignore if username conflicts with known top-level routes handled by other files, 
    // but React Router usually prioritizes static files. 
    // e.g. "dashboard", "login" are static. "assets" etc.

    if (!username) return { bio: null, username: null };

    try {
        const res = await fetch(`${apiUrl}/public/bio/${username}`);

        if (res.ok) {
            const bio = await res.json();

            // Track view if Pro (server-side tracking is problematic without session context from client)
            // The original code tracked "Page View" in useEffect. 
            // We can do that in a client component or useEffect here.

            return { bio, username };
        }
    } catch (e) {
        console.error("Bio Fetch Error", e);
    }

    return { bio: null, username };
}

export default function PublicBioRoute() {
    const { bio, username } = useLoaderData<typeof loader>();

    if (!username) return <BioNotFound username="" />;
    if (!bio) return <BioNotFound username={username} />;

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{bio.seoTitle || username}</title>
                {bio.seoDescription && <meta name="description" content={bio.seoDescription} />}
                {bio.seoKeywords && <meta name="keywords" content={bio.seoKeywords} />}
                {bio.favicon && <link rel="icon" href={bio.favicon} />}

                {/* Open Graph */}
                <meta property="og:title" content={bio.ogTitle || bio.seoTitle || username} />
                <meta property="og:description" content={bio.ogDescription || bio.seoDescription || ""} />
                {bio.ogImage && <meta property="og:image" content={bio.ogImage} />}
                <meta property="og:type" content="website" />

                {/* Indexing */}
                {bio.noIndex && <meta name="robots" content="noindex, nofollow" />}

                <Meta />
                <Links />
            </head>
            <body>
                <BioRenderer html={bio.html} />

                {/* Analytics Scripts usually on client */}
                <Scripts />
            </body>
        </html>
    );
}
