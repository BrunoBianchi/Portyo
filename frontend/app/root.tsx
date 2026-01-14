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
import { lazy, Suspense } from "react";
import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./contexts/auth.context";
import { CookiesProvider } from 'react-cookie';

const Navbar = lazy(() => import("~/components/marketing/navbar-component"));
const Footer = lazy(() => import("~/components/marketing/footer-section"));

export const meta: Route.MetaFunction = () => [
  { title: "Portyo - Link in Bio" },
  { name: "description", content: "Convert your followers into customers with one link. Generate powerful revenue-generating Bio's with our all-in-one platform." },
];

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

  return { isCustomDomain };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const loaderData = useLoaderData<typeof loader>();
  const isCustomDomain = loaderData?.isCustomDomain;

  const isLoginPage = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const isBioPage = pathname.startsWith("/p/");

  // Hide layout if dashboard, bio page, OR custom domain
  const shouldShowLayout = !isDashboard && !isBioPage && !isCustomDomain;

  return (
    <CookiesProvider>
      <AuthProvider>
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="preload" as="image" href="/Street%20Life%20-%20Head.svg" media="(min-width: 768px)" />
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
  return <Outlet />;
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
