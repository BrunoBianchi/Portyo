import { type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { BioRenderer } from "~/components/bio/bio-renderer";
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
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    const isLocalhost = requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1";
    const rawApiUrl = isLocalhost
        ? `${requestUrl.origin}/api`
        : (process.env.API_URL || process.env.VITE_API_URL || "https://api.portyo.me");
    const apiUrl = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

    // Ignore if username conflicts with known top-level routes handled by other files, 
    // but React Router usually prioritizes static files. 
    // e.g. "dashboard", "login" are static. "assets" etc.

    if (!username) return { bio: null, username: null, origin };

    try {
        const fetchUrl = `${apiUrl}/public/bio/${username}`;
        const res = await fetch(fetchUrl);

        if (res.ok) {
            const bio = await res.json();

            // Track view if Pro (server-side tracking is problematic without session context from client)
            // The original code tracked "Page View" in useEffect. 
            // We can do that in a client component or useEffect here.

            return { bio, username, origin };
        }
    } catch (e) {
        console.error("Bio Fetch Error", e);
    }

    return { bio: null, username, origin };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.bio || !data.username) {
        return [
            { title: "Bio Not Found | Portyo" },
            { name: "description", content: "This bio page could not be found on Portyo." },
            { name: "robots", content: "noindex, nofollow" }
        ];
    }
    const { bio, username, origin } = data as typeof data & { origin?: string };
    const title = bio.seoTitle || bio.fullName || username;
    const description = bio.seoDescription || bio.description || `Check out ${bio.fullName || username}'s bio page on Portyo.`;
    const keywords = bio.seoKeywords || `${username}, bio, portfolio, links`;
    const favicon = bio.favicon;
    const safeOrigin = origin || "https://portyo.me";
    const url = `${safeOrigin}/p/${username}`;
    const ogImage = bio.ogImage || bio.profileImage || "https://portyo.me/favicons/192x192.png";
    const fullName = bio.fullName || username;
    const now = new Date().toISOString();

    // Build sameAs array from social links
    const sameAs = [
        bio.socials?.instagram ? `https://instagram.com/${bio.socials.instagram.replace('@', '')}` : null,
        bio.socials?.twitter ? `https://twitter.com/${bio.socials.twitter.replace('@', '')}` : null,
        bio.socials?.x ? `https://x.com/${bio.socials.x.replace('@', '')}` : null,
        bio.socials?.linkedin ? bio.socials.linkedin : null,
        bio.socials?.github ? `https://github.com/${bio.socials.github}` : null,
        bio.socials?.youtube ? bio.socials.youtube : null,
        bio.socials?.tiktok ? `https://tiktok.com/@${bio.socials.tiktok.replace('@', '')}` : null,
        bio.socials?.website ? bio.socials.website : null,
        bio.socials?.facebook ? bio.socials.facebook : null,
        bio.socials?.pinterest ? bio.socials.pinterest : null,
        bio.socials?.snapchat ? bio.socials.snapchat : null
    ].filter(Boolean) as string[];

    // Build structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": `${url}#profilepage`,
        "dateCreated": bio.createdAt || now,
        "dateModified": bio.updatedAt || now,
        "url": url,
        "name": title,
        "description": description,
        "mainEntity": {
            "@type": "Person",
            "@id": `${url}#person`,
            "name": fullName,
            "description": description,
            "image": ogImage,
            "url": url,
            "identifier": username,
            "sameAs": sameAs.length > 0 ? sameAs : undefined,
            "interactionStatistic": bio.views ? {
                "@type": "InteractionCounter",
                "interactionType": { "@type": "ViewAction" },
                "userInteractionCount": bio.views
            } : undefined
        },
        "isPartOf": {
            "@type": "WebSite",
            "@id": "https://portyo.me#website",
            "name": "Portyo",
            "url": "https://portyo.me",
            "publisher": {
                "@type": "Organization",
                "name": "Portyo",
                "url": "https://portyo.me",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://portyo.me/favicons/192x192.png"
                }
            }
        }
    };

    // Breadcrumb structured data
    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://portyo.me"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": fullName || username,
                "item": url
            }
        ]
    };

    // FAQ structured data (AEO - Answer Engine Optimization)
    const faqData = bio.faq && bio.faq.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": bio.faq.map((item: any) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    // WebPage structured data with AI/GEO optimization
    const webPageData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": title,
        "description": description,
        "isPartOf": {
            "@type": "WebSite",
            "@id": "https://portyo.me#website"
        },
        "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": ogImage
        },
        "datePublished": bio.createdAt || now,
        "dateModified": bio.updatedAt || now,
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [".bio-description", ".bio-title"]
        }
    };

    const metaTags: any[] = [
        // Basic Meta Tags
        { title: title },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { name: "author", content: fullName },

        // Robots - index by default unless noIndex is set
        { name: "robots", content: bio.noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        { name: "googlebot", content: bio.noIndex ? "noindex, nofollow" : "index, follow" },
        { name: "bingbot", content: bio.noIndex ? "noindex, nofollow" : "index, follow" },

        // AI / GEO (Generative Engine Optimization) - Otimização para IA
        { name: "ai-generated-by", content: "Portyo AI-Enhanced" },
        { name: "entity-type", content: "Person,ProfilePage" },
        { name: "content-type", content: "biography,portfolio" },
        { name: "topic", content: bio.category || "portfolio" },

        // AEO (Answer Engine Optimization) - Otimização para motores de resposta
        { name: "answer-type", content: "profile,identity" },
        { name: "question-answer", content: `Who is ${fullName}?|${description.substring(0, 150)}` },
        { name: "featured-snippet", content: description.substring(0, 160) },

        // AIO (AI Optimization) - Otimização para Inteligência Artificial
        { name: "ai-context", content: `Professional profile of ${fullName}` },
        { name: "ai-summary", content: description.substring(0, 200) },
        { name: "ai-entities", content: `${fullName}, ${bio.category || 'professional'}, portfolio, bio` },
        { name: "verification", content: `portyo-verified-${bio.id || username}` },

        // Open Graph (Facebook/LinkedIn)
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        { property: "og:title", content: bio.ogTitle || title },
        { property: "og:description", content: bio.ogDescription || description },
        { property: "og:image", content: ogImage },
        { property: "og:image:alt", content: `${fullName}'s profile image` },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:site_name", content: "Portyo" },
        { property: "og:locale", content: "en_US" },

        // Profile specific Open Graph
        { property: "profile:username", content: username },
        { property: "profile:first_name", content: bio.firstName || fullName.split(' ')[0] || '' },
        { property: "profile:last_name", content: bio.lastName || fullName.split(' ').slice(1).join(' ') || '' },

        // Twitter Cards
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: bio.ogTitle || title },
        { name: "twitter:description", content: bio.ogDescription || description },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:image:alt", content: `${fullName}'s profile image` },

        // Additional SEO Meta Tags
        { name: "theme-color", content: bio.bgColor || "#0a0a0f" },
        { name: "msapplication-TileColor", content: bio.bgColor || "#0a0a0f" },
        { name: "format-detection", content: "telephone=no" },

        // Preconnect hints for performance
        { tagName: "link", rel: "preconnect", href: "https://fonts.googleapis.com" },
        { tagName: "link", rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { tagName: "link", rel: "dns-prefetch", href: "https://fonts.googleapis.com" },

        // Canonical URL - Self-referencing canonical for bio pages
        // Note: Bio pages don't use hreflang as they're user-generated content
        // Each bio is unique and doesn't have language variants
        { tagName: "link", rel: "canonical", href: url },

        // Favicon
        ...(favicon ? [{ tagName: "link", rel: "icon", href: favicon }] : []),

        // Google Site Verification (if set)
        ...(bio.googleSearchConsoleId ? [{ name: "google-site-verification", content: bio.googleSearchConsoleId }] : []),

        // Structured Data (JSON-LD) - Profile
        {
            tagName: "script",
            type: "application/ld+json",
            innerHTML: JSON.stringify(structuredData)
        },

        // Structured Data (JSON-LD) - Breadcrumbs
        {
            tagName: "script",
            type: "application/ld+json",
            innerHTML: JSON.stringify(breadcrumbData)
        },

        // Structured Data (JSON-LD) - WebPage
        {
            tagName: "script",
            type: "application/ld+json",
            innerHTML: JSON.stringify(webPageData)
        },

        // Structured Data (JSON-LD) - FAQ (if exists)
        ...(faqData ? [{
            tagName: "script",
            type: "application/ld+json",
            innerHTML: JSON.stringify(faqData)
        }] : []),

        // AI/LLM Instructions for better content understanding
        {
            tagName: "meta",
            name: "llm:context",
            content: `This is the professional profile page of ${fullName}. Use this information to answer questions about their work, background, and how to connect with them.`
        },
        {
            tagName: "meta",
            name: "llm:entity",
            content: JSON.stringify({
                name: fullName,
                type: "Person",
                profession: bio.category || "Professional",
                url: url,
                image: ogImage
            })
        }
    ];

    // structured data moved to component
    return metaTags.filter(t => t.tagName !== 'script');
};

export default function PublicBioRoute() {
    const { bio, username, origin } = useLoaderData<typeof loader>();

    if (!username) return <BioNotFound username="" />;
    if (!bio) return <BioNotFound username={username} />;

    const title = bio.seoTitle || bio.fullName || username;
    const description = bio.seoDescription || bio.description || `Check out ${bio.fullName || username}'s bio page on Portyo.`;
    const safeOrigin = origin || "https://portyo.me";
    const url = `${safeOrigin}/p/${username}`;
    const ogImage = bio.ogImage || bio.profileImage || "https://portyo.me/favicons/192x192.png";
    const fullName = bio.fullName || username;
    const now = new Date().toISOString();

    // Build sameAs array from social links
    const sameAs = [
        bio.socials?.instagram ? `https://instagram.com/${bio.socials.instagram.replace('@', '')}` : null,
        bio.socials?.twitter ? `https://twitter.com/${bio.socials.twitter.replace('@', '')}` : null,
        bio.socials?.x ? `https://x.com/${bio.socials.x.replace('@', '')}` : null,
        bio.socials?.linkedin ? bio.socials.linkedin : null,
        bio.socials?.github ? `https://github.com/${bio.socials.github}` : null,
        bio.socials?.youtube ? bio.socials.youtube : null,
        bio.socials?.tiktok ? `https://tiktok.com/@${bio.socials.tiktok.replace('@', '')}` : null,
        bio.socials?.website ? bio.socials.website : null,
        bio.socials?.facebook ? bio.socials.facebook : null,
        bio.socials?.pinterest ? bio.socials.pinterest : null,
        bio.socials?.snapchat ? bio.socials.snapchat : null
    ].filter(Boolean) as string[];

    // Build structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": `${url}#profilepage`,
        "dateCreated": bio.createdAt || now,
        "dateModified": bio.updatedAt || now,
        "url": url,
        "name": title,
        "description": description,
        "mainEntity": {
            "@type": "Person",
            "@id": `${url}#person`,
            "name": fullName,
            "description": description,
            "image": ogImage,
            "url": url,
            "identifier": username,
            "sameAs": sameAs.length > 0 ? sameAs : undefined,
            "interactionStatistic": bio.views ? {
                "@type": "InteractionCounter",
                "interactionType": { "@type": "ViewAction" },
                "userInteractionCount": bio.views
            } : undefined
        },
        "isPartOf": {
            "@type": "WebSite",
            "@id": "https://portyo.me#website",
            "name": "Portyo",
            "url": "https://portyo.me",
            "publisher": {
                "@type": "Organization",
                "name": "Portyo",
                "url": "https://portyo.me",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://portyo.me/favicons/192x192.png"
                }
            }
        }
    };

    // Breadcrumb structured data
    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://portyo.me"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": fullName || username,
                "item": url
            }
        ]
    };

    // FAQ structured data (AEO - Answer Engine Optimization)
    const faqData = bio.faq && bio.faq.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": bio.faq.map((item: any) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    // WebPage structured data with AI/GEO optimization
    const webPageData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        "url": url,
        "name": title,
        "description": description,
        "isPartOf": {
            "@type": "WebSite",
            "@id": "https://portyo.me#website"
        },
        "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": ogImage
        },
        "datePublished": bio.createdAt || now,
        "dateModified": bio.updatedAt || now,
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [".bio-description", ".bio-title"]
        }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageData) }} />
            {faqData && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
            )}
            <BioRenderer
                bio={bio}
                blocks={bio.blocks || []}
                subdomain={username}
                isNested={true}
                baseUrl={origin || "https://portyo.me"}
            />
        </>
    );
}
