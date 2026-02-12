import { Outlet, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useEffect } from "react";
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

const COUNTRY_TO_LANG: Record<string, SupportedLang> = {
  BR: "pt",
  PT: "pt",
  AO: "pt",
  MZ: "pt",
  CV: "pt",
  GW: "pt",
  ST: "pt",
  TL: "pt",
  GQ: "pt",
};

function getGeoLang(request: Request): SupportedLang | null {
  for (const key of GEO_HEADER_KEYS) {
    const value = request.headers.get(key);
    if (!value) continue;
    const code = value.trim().toUpperCase();
    if (code && code !== "XX" && code !== "UN") {
      return COUNTRY_TO_LANG[code] ?? "en";
    }
  }
  return null;
}

function getPreferredLang(request: Request): SupportedLang {
  const geoLang = getGeoLang(request);
  if (geoLang) return geoLang;

  const header = request.headers.get("accept-language");
  if (!header) return "en";
  const primary = header.split(",")[0]?.split("-")[0]?.toLowerCase();
  return SUPPORTED.includes(primary as SupportedLang) ? (primary as SupportedLang) : "en";
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const langParam = params.lang?.toLowerCase();

  if (!langParam || !SUPPORTED.includes(langParam as SupportedLang)) {
    const preferred = getPreferredLang(request);
    const nextPath = url.pathname === "/" ? `/${preferred}` : `/${preferred}${url.pathname}`;
    throw redirect(`${nextPath}${url.search}${url.hash}`);
  }

  // On company subdomain, redirect bare /:lang to company login
  const hostname = url.hostname;
  if (hostname.startsWith("company.")) {
    const pathAfterLang = url.pathname.replace(/^\/(en|pt)\/?/, "");
    if (!pathAfterLang) {
      throw redirect(`/${langParam}/company/login${url.search}${url.hash}`);
    }
  }

  return { lang: langParam as SupportedLang };
}

export default function LangLayout() {
  const { lang } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, [lang]);

  return <Outlet />;
}
