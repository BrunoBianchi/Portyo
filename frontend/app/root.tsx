import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useLoaderData,
} from "react-router";
import { lazy, Suspense, useEffect } from "react";
import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./contexts/auth.context";
import { CookiesProvider } from 'react-cookie';
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGUAGES } from "./i18n";

// Lazy load components para melhor performance
const Navbar = lazy(() => import("~/components/marketing/navbar-component"));
const Footer = lazy(() => import("~/components/marketing/footer-section"));
const AnnouncementBar = lazy(() => import("~/components/marketing/announcement-bar"));

// SEO Meta tags otimizados com AEO, GEO, AIO
export const meta: Route.MetaFunction = ({ params, location }) => {
  const lang = params?.lang === "pt" ? "pt" : "en";
  const url = location?.pathname || "/";

  const t = (key: string) => i18n.t(`meta.root.${key}`, { lng: lang });
  const title = t("title");
  const description = t("description");
  const keywords = t("keywords");

  return [
    // ==================== BASIC SEO ====================
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "author", content: "Portyo" },
    { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
    { name: "googlebot", content: "index, follow" },
    { name: "bingbot", content: "index, follow" },
    { name: "yandex", content: "index, follow" },
    { name: "slurp", content: "index, follow" },
    { name: "duckduckbot", content: "index, follow" },

    // Canonical
    { tagName: "link", rel: "canonical", href: url },

    // ==================== OPEN GRAPH / FACEBOOK ====================
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Portyo" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: "https://portyo.me/og-image.jpg" },
    { property: "og:image:secure_url", content: "https://portyo.me/og-image.jpg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: t("ogImageAlt") },
    { property: "og:image:type", content: "image/jpeg" },

    // ==================== TWITTER / X ====================
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@portyo" },
    { name: "twitter:creator", content: "@portyo" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://portyo.me/og-image.jpg" },
    { name: "twitter:image:alt", content: t("twitterImageAlt") },

    // ==================== GEO - GENERATIVE ENGINE OPTIMIZATION ====================
    // Otimização para IA entender e gerar conteúdo sobre nós
    { name: "ai-generated-by", content: "Portyo AI-Enhanced Platform" },
    { name: "content-ai-verified", content: "true" },
    { name: "entity-type", content: "SoftwareApplication,Organization,SaaS" },
    { name: "ai-context", content: t("aiContext") },
    { name: "ai-summary", content: t("aiSummary") },
    { name: "ai-entities", content: t("aiEntities") },
    { name: "knowledge-graph", content: t("knowledgeGraph") },
    { name: "llm:context", content: t("llmContext") },

    // ==================== AEO - ANSWER ENGINE OPTIMIZATION ====================
    // Otimização para respostas diretas (Featured Snippets)
    { name: "answer-type", content: "product,service" },
    { name: "question-answer", content: t("questionAnswer") },
    { name: "featured-snippet", content: t("featuredSnippet") },
    { name: "speakable", content: "[data-speakable]" },
    { name: "speech-synthesis", content: "enabled" },

    // ==================== AIO - AI OPTIMIZATION ====================
    // Otimização para crawlers e assistentes de IA
    { name: "ai-purpose", content: "creator-monetization, link-management, ecommerce" },
    { name: "ai-capabilities", content: "link-bio, ecommerce, bookings, analytics, email-marketing" },
    { name: "verification", content: "portyo-official-verified" },
    { name: "crawlers", content: "all" },

    // ==================== PWA & MOBILE ====================
    { name: "theme-color", content: "#ffffff" },
    { name: "msapplication-TileColor", content: "#bbff00" },
    { name: "msapplication-TileImage", content: "/favicons/192x192.png" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "apple-mobile-web-app-title", content: "Portyo" },
    { name: "application-name", content: "Portyo" },
    { name: "mobile-web-app-capable", content: "yes" },

    // ==================== PERFORMANCE ====================
    { tagName: "link", rel: "preconnect", href: "https://api.portyo.me" },
    { tagName: "link", rel: "preconnect", href: "https://fonts.googleapis.com" },
    { tagName: "link", rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { tagName: "link", rel: "dns-prefetch", href: "https://api.portyo.me" },

    // ==================== LANGUAGE & REGION ====================
    { name: "language", content: lang },
    { httpEquiv: "content-language", content: lang },

    // ==================== SAFARI & APPLE ====================
    { name: "format-detection", content: "telephone=no" },
    { name: "apple-touch-fullscreen", content: "yes" },

    // ==================== ENGAGEMENT OPTIMIZATION ====================
    // Meta tags para aumentar CTR em SERPs
    { name: "twitter:label1", content: t("twitterWrittenBy") },
    { name: "twitter:data1", content: t("twitterAuthor") },
    { name: "twitter:label2", content: t("twitterReadTime") },
    { name: "twitter:data2", content: t("twitterReadTimeValue") },

    // ==================== BUSINESS / RICH SNIPPETS ====================
    { name: "business:contact_data:locality", content: "São Paulo" },
    { name: "business:contact_data:country-name", content: "Brazil" },
    { name: "business:contact_data:website", content: "https://portyo.me" },

    // ==================== ARTICLE (if applicable) ====================
    { name: "article:publisher", content: "https://www.facebook.com/portyo" },
  ];
};

// Links otimizados
export const links: Route.LinksFunction = () => [
  // Google Fonts - Poppins
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" },

  // Nota: Favicon preload removido para evitar warnings
  // O favicon é carregado normalmente via link rel="icon"

  // Nota: Preload de fontes do Google Fonts removido pois as URLs internas podem mudar
  // As fontes são carregadas de forma otimizada via CSS com display=swap

  // Manifest e favicons
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicons/48x48.png" },
  { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicons/96x96.png" },
  { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicons/192x192.png" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/favicons/180x180.png" },
  { rel: "mask-icon", href: "/favicons/safari-pinned-tab.svg", color: "#bbff00" },

  // Note: Hreflang tags are dynamically generated in Layout component based on current route
];

// Headers de segurança e performance
export function headers() {
  const isDev = process.env.NODE_ENV !== "production";
  const connectSrc = isDev
    ? "'self' https://api.portyo.me http://localhost:3000 http://localhost:5173 http://localhost:5174 ws://localhost:5173 ws://localhost:5174 ws://localhost:3000"
    : "'self' https://api.portyo.me";
  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
    // Cache Control otimizado
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, max-age=31536000, immutable",
    "Vercel-CDN-Cache-Control": "public, max-age=31536000, immutable",
    // Content Security Policy - mais permissivo para desenvolvimento
    "Content-Security-Policy":
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://storage.googleapis.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' data: https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob: http://localhost:3000 http://localhost:5173 http://localhost:5174; " +
      `connect-src ${connectSrc}; ` +
      "frame-src 'self'; " +
      "worker-src 'self' blob:; " +
      "media-src 'self' https:;",
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const pathname = url.pathname;

  const isOnRenderDomain = hostname.endsWith('.onrender.com');
  const isPortyoDomain = hostname.endsWith('portyo.me');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');

  const isCompanySubdomain = hostname.startsWith('company.');
  const isCustomDomain = !isPortyoDomain && !isOnRenderDomain && !isLocalhost && !isCompanySubdomain;

  const langMatch = pathname.match(/^\/(en|pt)(?=\/|$)/);
  const initialLang = (langMatch?.[1] || null) as (typeof SUPPORTED_LANGUAGES)[number] | null;

  return { isCustomDomain, origin: url.origin, isLocalhost, initialLang, isCompanySubdomain };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const loaderData = useLoaderData<typeof loader>();
  const isCustomDomain = loaderData?.isCustomDomain;
  const origin = loaderData?.origin || (typeof window !== "undefined" ? window.location.origin : "");
  const isLocalhost = loaderData?.isLocalhost;
  const initialLang = loaderData?.initialLang || null;
  const isCompanySubdomain = loaderData?.isCompanySubdomain || (typeof window !== "undefined" && window.location.hostname.startsWith("company."));
  const { i18n } = useTranslation();

  const langMatch = pathname.match(/^\/(en|pt)(?=\/|$)/);
  const fallbackLang = isLocalhost ? "en" : "en";
  const activeLang = (langMatch?.[1] || initialLang || fallbackLang) as (typeof SUPPORTED_LANGUAGES)[number];
  const skipToContentLabel = i18n.t("meta.root.skipToContent", { lng: activeLang });

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (i18n.language !== activeLang) {
      i18n.changeLanguage(activeLang);
    }
    document.documentElement.lang = i18n.resolvedLanguage || i18n.language || "en";
  }, [activeLang, i18n.language, i18n.resolvedLanguage]);

  useEffect(() => {
    if (isCustomDomain) return;
    if (langMatch) return;
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const preferred = hostname === "localhost" || hostname.endsWith(".localhost") ? "en" : "en";
    // On company subdomain, redirect root to company login - REMOVED to allow Landing Page
    /* if (hostname.startsWith("company.")) {
      const companyPath = pathname === "/" ? `/${preferred}/company/login` : `/${preferred}${pathname}`;
      navigate(`${companyPath}${search}${hash}`, { replace: true });
      return;
    } */
    const nextPath = pathname === "/" ? `/${preferred}` : `/${preferred}${pathname}`;
    navigate(`${nextPath}${search}${hash}`, { replace: true });
  }, [hash, isCustomDomain, langMatch, navigate, pathname, search]);

  const pathnameNoLang = pathname.replace(/^\/(en|pt)(?=\/|$)/, "");
  const isLoginPage = pathnameNoLang === "/login";
  const isDashboard = pathnameNoLang.startsWith("/dashboard");
  const isBioPage = pathnameNoLang.startsWith("/p/");
  const isCompanyPage = pathnameNoLang.startsWith("/company");
  const isCompanySubdomainPath = isCompanySubdomain;

  const normalizedBase = pathnameNoLang === "" ? "/" : pathnameNoLang;
  const canonicalPath = normalizedBase === "/" ? `/${activeLang}` : `/${activeLang}${normalizedBase}`;
  const canRenderSeoLinks = !!langMatch && !isCustomDomain && !!origin;

  const ogLocaleMap: Record<(typeof SUPPORTED_LANGUAGES)[number], string> = {
    en: "en_US",
    pt: "pt_BR",
  };

  // Hide layout for: user dashboard, bio page, custom domain, or company auth/dashboard pages
  // Company login/register/dashboard have their own layouts
  const isCompanyAuthOrDashboard = isCompanyPage && (pathnameNoLang.includes("/login") || pathnameNoLang.includes("/register") || pathnameNoLang.includes("/dashboard"));
  const shouldShowLayout = !isDashboard && !isBioPage && !isCustomDomain && !isCompanyAuthOrDashboard;
  const shouldShowAnnouncement = shouldShowLayout;

  return (
    <CookiesProvider>
      <AuthProvider>
        <html lang={activeLang} dir="ltr">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

            {/* Preconnect hints - duplicado aqui para SSR */}
            <link rel="preconnect" href="https://api.portyo.me" />

            {/* SEO Links - Canonical and Hreflang */}
            {canRenderSeoLinks && (
              <>
                {/* Single canonical URL - prevents duplicate canonical issues */}
                <link rel="canonical" href={`${origin}${canonicalPath}`} />

                {/* Hreflang tags - helps search engines understand language variants */}
                {/* Self-referencing hreflang for current page */}
                <link
                  rel="alternate"
                  hrefLang={activeLang}
                  href={`${origin}${canonicalPath}`}
                />

                {/* Alternate language versions */}
                {SUPPORTED_LANGUAGES.filter((lang) => lang !== activeLang).map((lang) => {
                  const href = normalizedBase === "/" ? `/${lang}` : `/${lang}${normalizedBase}`;
                  return (
                    <link
                      key={`alt-${lang}`}
                      rel="alternate"
                      hrefLang={lang}
                      href={`${origin}${href}`}
                    />
                  );
                })}

                {/* x-default points to the default language version */}
                <link
                  rel="alternate"
                  hrefLang="x-default"
                  href={`${origin}${normalizedBase === "/" ? "/en" : `/en${normalizedBase}`}`}
                />

                {/* Open Graph locale */}
                <meta property="og:locale" content={ogLocaleMap[activeLang] || "en_US"} />
                {SUPPORTED_LANGUAGES.filter((lang) => lang !== activeLang).map((lang) => (
                  <meta
                    key={`og-locale-${lang}`}
                    property="og:locale:alternate"
                    content={ogLocaleMap[lang] || "en_US"}
                  />
                ))}
              </>
            )}

            {/* JSON-LD Structured Data Global */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "Organization",
                      "@id": "https://portyo.me/#organization",
                      name: "Portyo",
                      url: "https://portyo.me",
                      logo: {
                        "@type": "ImageObject",
                        url: "https://portyo.me/logo.png",
                        width: 512,
                        height: 512,
                      },
                      sameAs: [
                        "https://twitter.com/portyo",
                        "https://linkedin.com/company/portyo",
                        "https://instagram.com/portyo",
                      ],
                      description: i18n.t("meta.root.orgDescription", { lng: activeLang }),
                    },
                    {
                      "@type": "WebSite",
                      "@id": "https://portyo.me/#website",
                      url: "https://portyo.me",
                      name: "Portyo",
                      inLanguage: activeLang === "pt" ? "pt-BR" : "en-US",
                      publisher: {
                        "@id": "https://portyo.me/#organization",
                      },
                      potentialAction: {
                        "@type": "SearchAction",
                        target: {
                          "@type": "EntryPoint",
                          urlTemplate: "https://portyo.me/search?q={search_term_string}",
                        },
                        "query-input": "required name=search_term_string",
                      },
                    },
                  ],
                }),
              }}
            />

            <Meta />
            <Links />

          </head>
          <body>
            {/* Skip link para acessibilidade */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:px-4 focus:py-2 focus:bg-primary focus:text-background focus:rounded-lg"
            >
              {skipToContentLabel}
            </a>

            {/* Announcement Bar */}
            {/* Announcement bar disabled */}

            {shouldShowLayout && (
              <Suspense fallback={null}>
                <Navbar isCompanyMode={isCompanySubdomainPath} />
              </Suspense>
            )}
            <main
              id="main-content"
              role="main"
              className={shouldShowLayout ? "pt-28 md:pt-32" : undefined}
            >
              {children}
            </main>
            {shouldShowLayout && (
              <Suspense fallback={null}>
                <Footer isCompanyMode={isCompanySubdomainPath} />
              </Suspense>
            )}
            <ScrollRestoration />
            <Scripts />
          </body>
        </html>
      </AuthProvider>
    </CookiesProvider>
  );
}

export default function App() {
  return (
    <Suspense fallback={<HydrateFallback />}>
      <Outlet />
    </Suspense>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = i18n.t("meta.root.errorOops");
  let details = i18n.t("meta.root.errorUnexpected");
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? i18n.t("meta.root.error404") : i18n.t("meta.root.errorGeneric");
    details =
      error.status === 404
        ? i18n.t("meta.root.error404Detail")
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-24 p-4 container mx-auto">
      <h1 className="text-4xl font-bold text-foreground">{message}</h1>
      <p className="text-muted-foreground mt-4">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto bg-surface-card rounded-xl mt-4 text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
