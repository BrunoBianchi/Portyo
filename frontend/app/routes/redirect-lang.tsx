import { redirect, useLocation, useNavigate } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useEffect } from "react";

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
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return "en";
  }

  for (const key of GEO_HEADER_KEYS) {
    const value = request.headers.get(key);
    if (!value) continue;
    const code = value.trim().toUpperCase();
    if (!code || code === "XX" || code === "UN") continue;
    return code === "BR" ? "pt" : "en";
  }

  const header = request.headers.get("accept-language");
  if (!header) return "en";
  const primary = header.split(",")[0]?.split("-")[0]?.toLowerCase();
  return SUPPORTED.includes(primary as SupportedLang) ? (primary as SupportedLang) : "en";
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostname = url.hostname;
  const isCompany = hostname.startsWith("company.");

  if (/^\/(en|pt)(\/|$)/.test(pathname)) {
    return null;
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    if (/^\/(en|pt)(\/|$)/.test(pathname)) return;

    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isCompany = hostname.startsWith("company.");
    const preferred = hostname === "localhost" || hostname.endsWith(".localhost") ? "en" : "en";

    // On company subdomain, redirect root to company login
    if (isCompany && (pathname === "/" || pathname === "")) {
      navigate(`/${preferred}/company/login${location.search}${location.hash}`, { replace: true });
      return;
    }

    const nextPath = pathname === "/" ? `/${preferred}` : `/${preferred}${pathname}`;
    navigate(`${nextPath}${location.search}${location.hash}`, { replace: true });
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
}
