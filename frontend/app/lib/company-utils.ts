import { useParams } from "react-router";

/**
 * Checks if the current hostname is a company subdomain
 */
export function isCompanySubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname.startsWith("company.");
}

/**
 * Checks hostname on server side from request
 */
export function isCompanySubdomainServer(request: Request): boolean {
  const url = new URL(request.url);
  return url.hostname.startsWith("company.");
}

/**
 * Hook that returns company URLs with the current lang prefix.
 * On company subdomain: paths are relative (e.g., /en/login)
 * On main domain: paths include /company (e.g., /en/company/login)
 */
export function useCompanyUrl() {
  const params = useParams();
  const lang = params.lang || "en";
  const onSubdomain = isCompanySubdomain();
  // Always use /company/ prefix — routes are defined under /:lang/company/*
  const prefix = `/${lang}/company`;

  return {
    lang,
    isSubdomain: onSubdomain,
    login: `${prefix}/login`,
    register: `${prefix}/register`,
    dashboard: `${prefix}/dashboard`,
    createOffer: `${prefix}/dashboard/create`,
    profile: `${prefix}/dashboard/profile`,
    /** Build a custom company path */
    path: (subpath: string) => `${prefix}/${subpath.replace(/^\//, "")}`,
  };
}

/**
 * Returns the company base URL for the given hostname
 */
export function getCompanyBaseUrl(hostname: string): string {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    const port = typeof window !== "undefined" ? window.location.port : "5173";
    return `http://company.localhost:${port}`;
  }
  if (hostname.endsWith("portyo.me")) {
    return "https://company.portyo.me";
  }
  return `https://company.${hostname}`;
}
