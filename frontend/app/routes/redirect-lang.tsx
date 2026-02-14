import { redirect, useLoaderData, useLocation, useNavigate } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useEffect } from "react";
import LandingPage from "~/components/marketing/landing-page";
import i18n from "~/i18n";

const SUPPORTED = ["en", "pt"] as const;

type SupportedLang = (typeof SUPPORTED)[number];

const GEO_HEADER_KEYS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-geo-country",
  "x-country-code",
  "x-country",
] as const;

function getPreferredLang(request: Request): SupportedLang {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";

  if (userAgent.includes("facebookexternalhit") || userAgent.includes("facebot")) {
    return "pt";
  }

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return "pt";
  }

  for (const key of GEO_HEADER_KEYS) {
    const value = request.headers.get(key);
    if (!value) continue;
    const code = value.trim().toUpperCase();
    if (!code || code === "XX" || code === "UN") continue;
    return code === "BR" ? "pt" : "en";
  }

  const header = request.headers.get("accept-language");
  if (!header) return "pt";
  const primary = header.split(",")[0]?.split("-")[0]?.toLowerCase();
  return SUPPORTED.includes(primary as SupportedLang) ? (primary as SupportedLang) : "pt";
}

function isMetaCrawler(request: Request): boolean {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
  return (
    userAgent.includes("facebookexternalhit") ||
    userAgent.includes("facebot") ||
    userAgent.includes("googlebot") ||
    userAgent.includes("google-inspectiontool") ||
    userAgent.includes("adsbot-google") ||
    userAgent.includes("googleother") ||
    userAgent.includes("storebot-google") ||
    userAgent.includes("apis-google") ||
    userAgent.includes("mediapartners-google")
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;
  const isOnRenderDomain = hostname.endsWith('.onrender.com');
  const isPortyoDomain = hostname.endsWith('portyo.me');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');
  const isCompany = hostname.startsWith("company.");
  const isCustomDomain = !isPortyoDomain && !isOnRenderDomain && !isLocalhost && !isCompany;

  if (isCustomDomain) {
    throw redirect(`/${url.search}${url.hash}`);
  }

  if (/^\/(en|pt)(\/|$)/.test(pathname)) {
    return null;
  }

  if (isMetaCrawler(request)) {
    return { renderFallback: true as const, lang: getPreferredLang(request) };
  }

  const preferred = getPreferredLang(request);

  // On company subdomain, redirect root to company login
  if (isCompany && (pathname === "/" || pathname === "")) {
    throw redirect(`/${preferred}/company/login${url.search}${url.hash}`);
  }

  const nextPath = pathname === "/" ? `/${preferred}` : `/${preferred}${pathname}`;
  throw redirect(`${nextPath}${url.search}${url.hash}`);
}

export default function RedirectLang() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!data || typeof data !== "object" || !("renderFallback" in data) || !data.renderFallback) return;
    if (i18n.language !== data.lang) {
      i18n.changeLanguage(data.lang);
    }
  }, [data]);

  useEffect(() => {
    if (data && typeof data === "object" && "renderFallback" in data && data.renderFallback) {
      return;
    }

    const pathname = location.pathname;
    if (/^\/(en|pt)(\/|$)/.test(pathname)) return;

    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isOnRenderDomain = hostname.endsWith('.onrender.com');
    const isPortyoDomain = hostname.endsWith('portyo.me');
    const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');
    const isCompany = hostname.startsWith("company.");
    const isCustomDomain = !isPortyoDomain && !isOnRenderDomain && !isLocalhost && !isCompany;

    if (isCustomDomain) {
      navigate(`/`, { replace: true });
      return;
    }
    const preferred = (() => {
      if (hostname === "localhost" || hostname.endsWith(".localhost")) {
        return "pt" as const;
      }

      const browserLang = typeof navigator !== "undefined"
        ? navigator.language?.split("-")[0]?.toLowerCase()
        : "";

      return browserLang === "pt" ? "pt" : "en";
    })();

    // On company subdomain, redirect root to company login
    if (isCompany && (pathname === "/" || pathname === "")) {
      navigate(`/${preferred}/company/login${location.search}${location.hash}`, { replace: true });
      return;
    }

    const nextPath = pathname === "/" ? `/${preferred}` : `/${preferred}${pathname}`;
    navigate(`${nextPath}${location.search}${location.hash}`, { replace: true });
  }, [data, location.hash, location.pathname, location.search, navigate]);

  if (data && typeof data === "object" && "renderFallback" in data && data.renderFallback) {
    return <LandingPage />;
  }

  return null;
}
