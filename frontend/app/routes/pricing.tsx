import type { MetaFunction } from "react-router";
import PricingSection from "~/components/marketing/pricing-section";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.pricing.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.pricing.description", { lng: lang }) },
    ];
};

export default function Pricing() {
    return (
        <div className="min-h-screen pt-0 -mt-28 md:-mt-32">
            <PricingSection />
        </div>
    );
}
