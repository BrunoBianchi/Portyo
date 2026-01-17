import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useLoaderData,
} from "react-router";
import { lazy, Suspense, useEffect } from "react";
import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./contexts/auth.context";
import { CookiesProvider } from 'react-cookie';
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGUAGES } from "./i18n";

const Navbar = lazy(() => import("~/components/marketing/navbar-component"));
const Footer = lazy(() => import("~/components/marketing/footer-section"));

export const meta: Route.MetaFunction = ({ params }) => {
  const lang = params?.lang === "pt" ? "pt" : "en";
  return [
    { title: i18n.t("meta.root.title", { lng: lang }) },
    { name: "description", content: i18n.t("meta.root.description", { lng: lang }) },
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // Fonts are loaded non-blocking in the Layout component
  // {
  //   rel: "stylesheet",
  //   href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  // },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicons/48x48.png" },
  { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicons/96x96.png" },
  { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicons/192x192.png" },
];

export function headers() {
  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const hostname = url.hostname;

  const isOnRenderDomain = hostname.endsWith('.onrender.com');
  const isPortyoDomain = hostname.endsWith('portyo.me');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');

  const isCustomDomain = !isPortyoDomain && !isOnRenderDomain && !isLocalhost;

  return { isCustomDomain, origin: url.origin };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const loaderData = useLoaderData<typeof loader>();
  const isCustomDomain = loaderData?.isCustomDomain;
  const origin = loaderData?.origin || (typeof window !== "undefined" ? window.location.origin : "");
  const { i18n } = useTranslation();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = i18n.resolvedLanguage || i18n.language || "en";
  }, [i18n.language, i18n.resolvedLanguage]);

  const langMatch = pathname.match(/^\/(en|pt)(?=\/|$)/);
  const activeLang = (langMatch?.[1] || i18n.resolvedLanguage || i18n.language || "en") as (typeof SUPPORTED_LANGUAGES)[number];
  const pathnameNoLang = pathname.replace(/^\/(en|pt)(?=\/|$)/, "");
  const isLoginPage = pathnameNoLang === "/login";
  const isDashboard = pathnameNoLang.startsWith("/dashboard");
  const isBioPage = pathnameNoLang.startsWith("/p/");

  const normalizedBase = pathnameNoLang === "" ? "/" : pathnameNoLang;
  const canonicalPath = normalizedBase === "/" ? `/${activeLang}` : `/${activeLang}${normalizedBase}`;
  const canRenderSeoLinks = !!langMatch && !isCustomDomain && !!origin;

  const ogLocaleMap: Record<(typeof SUPPORTED_LANGUAGES)[number], string> = {
    en: "en_US",
    pt: "pt_BR",
  };

  // Hide layout if dashboard, bio page, OR custom domain
  const shouldShowLayout = !isDashboard && !isBioPage && !isCustomDomain;

  return (
    <CookiesProvider>
      <AuthProvider>
        <html lang={activeLang}>
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="preload" as="image" href="/Street%20Life%20-%20Head.svg" media="(min-width: 768px)" />
            {canRenderSeoLinks && (
              <>
                <link rel="canonical" href={`${origin}${canonicalPath}`} />
                {SUPPORTED_LANGUAGES.map((lang) => {
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
                <link
                  rel="alternate"
                  hrefLang="x-default"
                  href={`${origin}${normalizedBase === "/" ? "/en" : `/en${normalizedBase}`}`}
                />
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
            <Meta />
            <Links />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
              media="print"
              onLoad={(e) => { e.currentTarget.media = 'all' }}
            />
            <noscript>
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" />
            </noscript>
          </head>
          <body>
            {shouldShowLayout && (
              <Suspense fallback={null}>
                <Navbar />
              </Suspense>
            )}
            {children}
            {shouldShowLayout && (
              <Suspense fallback={null}>
                <Footer />
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
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-800"></div>
    </div>
  );
}
