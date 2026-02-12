import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import CompanyAuthContext from "~/contexts/company-auth.context";
import { useCompanyUrl } from "~/lib/company-utils";
import { CompanyNavbar } from "./company-navbar";
import { CompanyFooter } from "./company-footer";

export function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useContext(CompanyAuthContext);
    const navigate = useNavigate();
    const companyUrl = useCompanyUrl();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(companyUrl.login);
        }
    }, [loading, isAuthenticated, navigate, companyUrl.login]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F3F1] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-black border-t-[#D2E823] rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#F3F3F1] font-sans text-[#1A1A1A]">
            <CompanyNavbar mode="dashboard" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[calc(100vh-200px)]">
                {children}
            </main>

            <CompanyFooter />
        </div>
    );
}
