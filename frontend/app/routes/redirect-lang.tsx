import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

const SUPPORTED = ["en", "pt"] as const;

type SupportedLang = (typeof SUPPORTED)[number];

function getPreferredLang(request: Request): SupportedLang {
  const header = request.headers.get("accept-language");
  if (!header) return "en";
  const primary = header.split(",")[0]?.split("-")[0]?.toLowerCase();
  return SUPPORTED.includes(primary as SupportedLang) ? (primary as SupportedLang) : "en";
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (/^\/(en|pt)(\/|$)/.test(pathname)) {
    return null;
  }

  const preferred = getPreferredLang(request);
  const nextPath = pathname === "/" ? `/${preferred}` : `/${preferred}${pathname}`;
  throw redirect(`${nextPath}${url.search}${url.hash}`);
}

export default function RedirectLang() {
  return null;
}
