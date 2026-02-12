import { Outlet, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { CompanyAuthProvider } from "~/contexts/company-auth.context";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const isCompanySubdomain = hostname.startsWith("company.");
  return { isCompanySubdomain };
}

export default function CompanyLayout() {
  return (
    <CompanyAuthProvider>
      <Outlet />
    </CompanyAuthProvider>
  );
}
