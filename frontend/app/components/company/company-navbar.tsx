import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Target, Package, Plus, User, LogOut } from "lucide-react";
import { useCompanyUrl } from "~/lib/company-utils";
import { useContext } from "react";
import CompanyAuthContext from "~/contexts/company-auth.context";

interface CompanyNavbarProps {
    mode?: "public" | "dashboard";
}

export function CompanyNavbar({ mode = "public" }: CompanyNavbarProps) {
    const { t } = useTranslation("company");
    const companyUrl = useCompanyUrl();
    const location = useLocation();

    // We only try to use context if we are likely in a context-provider (which dashboard always is)
    // But hooks must be called unconditionally. 
    // We can assume CompanyAuthContext provides default values if not wrapped? 
    // Or we should only access it if mode === 'dashboard'?
    // React rules say hooks must be unconditional.
    // Let's rely on the fact that if mode="dashboard", we are usually inside the provider.
    const authContext = useContext(CompanyAuthContext);
    const logout = authContext?.logout || (() => { });

    const navItems = [
        { label: t("company.nav.offers"), path: companyUrl.dashboard, icon: Package },
        { label: t("company.nav.createOffer"), path: companyUrl.createOffer, icon: Plus },
        { label: t("company.nav.profile"), path: companyUrl.profile, icon: User },
    ];

    const isActive = (path: string) => {
        if (path === companyUrl.dashboard) {
            return location.pathname === companyUrl.dashboard || location.pathname.endsWith("/company/dashboard");
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="w-full border-b-2 border-black bg-white px-6 py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to={mode === "dashboard" ? companyUrl.dashboard : "/"} className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-[#D2E823] border-2 border-black rounded-lg flex items-center justify-center transform group-hover:rotate-3 transition-transform">
                        <Target className="w-6 h-6 text-black stroke-[2.5px]" />
                    </div>
                    <span className="font-black text-xl tracking-tight text-[#1A1A1A]">PORTYO SPONSORS</span>
                </Link>

                <div className="flex items-center gap-4">
                    {mode === "public" ? (
                        <>
                            <Link
                                to={companyUrl.login}
                                className="text-sm font-bold text-[#1A1A1A] hover:text-[#D2E823] transition-colors uppercase tracking-wide"
                            >
                                {t("login.submit")}
                            </Link>
                            <Link
                                to={companyUrl.register}
                                className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg border-2 border-transparent hover:bg-[#D2E823] hover:text-black hover:border-black font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                            >
                                {t("login.register")}
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="hidden md:flex items-center gap-2">
                                {navItems.map(item => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${active
                                                    ? "bg-[#D2E823] border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${active ? "stroke-[3px]" : ""}`} />
                                            <span className="hidden lg:inline uppercase tracking-wide">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="h-6 w-0.5 bg-gray-200 mx-2 hidden md:block" />
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden lg:inline uppercase tracking-wide">{t("company.nav.logout")}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
