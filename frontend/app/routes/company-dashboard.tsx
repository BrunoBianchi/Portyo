import type { MetaFunction } from "react-router";
import { CompanyDashboardLayout } from "~/components/company/company-dashboard-layout";
import { CompanyOffersList } from "~/components/company/company-offers-list";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.companyDashboard.title", { lng: lang }) },
    ];
};

export default function CompanyDashboard() {
    return (
        <CompanyDashboardLayout>
            <CompanyOffersList />
        </CompanyDashboardLayout>
    );
}
