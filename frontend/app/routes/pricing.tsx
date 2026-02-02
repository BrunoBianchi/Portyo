import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Check } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.pricing.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.pricing.description", { lng: lang }) },
    ];
};

export default function Pricing() {
    const { t } = useTranslation();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

    const plans = [
        {
            name: "Free",
            description: "For getting started",
            price: "$0",
            features: [
                "Customizable link-in-bio",
                "Create 1 Form",
                "Basic Analytics",
                "Unlimited Links",
                "Social Icons",
                "Basic Themes",
                "3% Transaction Fees"
            ],
            cta: "Get Started",
            ctaLink: "/sign-up",
            style: "white",
            highlight: false
        },
        {
            name: "Standard",
            description: "For growing creators",
            price: billingCycle === 'annually' ? "$4.12" : "$5.50",
            period: "/mo",
            billed: billingCycle === 'annually' ? "Billed $49.50 yearly" : "Billed monthly",
            features: [
                "Up to 2 bios",
                "Create 3 Forms",
                "Everything in Free",
                "Remove Branding",
                "Custom Domain",
                "Priority Support",
                "Advanced Analytics",
                "Email Collection",
                "1% Transaction Fees",
                "150 emails/month"
            ],
            cta: "Start Trial",
            ctaLink: "/sign-up?plan=standard",
            style: "lime",
            highlight: true,
            badge: "MOST POPULAR"
        },
        {
            name: "Pro",
            description: "For serious business",
            price: billingCycle === 'annually' ? "$11.25" : "$15.00",
            period: "/mo",
            billed: billingCycle === 'annually' ? "Billed $135 yearly" : "Billed monthly",
            features: [
                "Everything in Standard",
                "Up to 5 bios",
                "Create 4 Forms",
                "Scheduler",
                "0% Transaction Fees",
                "API Access",
                "Dedicated Manager",
                "White Labeling",
                "Newsletter Tool",
                "500 emails/month"
            ],
            cta: "Go Pro",
            ctaLink: "/sign-up?plan=pro",
            style: "black",
            highlight: false
        }
    ];

    return (
        <div className="min-h-screen  py-20 px-4 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">{t("pricingPage.title")}</h1>
                    <p className="text-xl text-muted-foreground">{t("pricingPage.subtitle")}</p>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="bg-surface-card p-1.5 rounded-full shadow-sm inline-flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${billingCycle === 'monthly'
                                ? 'bg-transparent text-text-main'
                                : 'text-muted-foreground hover:text-text-main'
                                }`}
                        >
                            {t("home.pricing.billing.monthly")}
                        </button>
                        <button
                            onClick={() => setBillingCycle('annually')}
                            className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${billingCycle === 'annually'
                                ? 'bg-text-main text-white shadow-md'
                                : 'text-muted-foreground hover:text-text-main'
                                }`}
                        >
                            {t("home.pricing.billing.annually")}
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-[32px] p-8 md:p-10 transition-transform hover:-translate-y-1 duration-300 flex flex-col h-full ${plan.style === 'lime' ? 'bg-[#D7F000] text-black shadow-xl ring-0' :
                                plan.style === 'black' ? 'bg-black text-white shadow-xl' :
                                    'bg-surface-card text-foreground shadow-lg'
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.style === 'black' ? 'text-white' : 'text-foreground'}`}>{plan.name}</h3>
                                <p className={`text-sm mb-6 ${plan.style === 'black' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{plan.description}</p>

                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                                    {plan.period && <span className={`text-lg font-medium ${plan.style === 'black' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{plan.period}</span>}
                                </div>
                                {plan.billed && (
                                    <p className={`text-xs font-bold uppercase tracking-wide mt-3 inline-block px-3 py-1 rounded-full ${plan.style === 'black' ? 'bg-gray-800 text-gray-300' :
                                        plan.style === 'lime' ? 'bg-black/10 text-black' :
                                            'bg-muted text-muted-foreground'
                                        }`}>
                                        {plan.billed}
                                    </p>
                                )}
                            </div>

                            <div className="flex-1 space-y-4 mb-10">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className={`w-5 h-5 shrink-0 ${plan.style === 'lime' ? 'text-black' :
                                            plan.style === 'black' ? 'text-[#D7F000]' :
                                                'text-green-500'
                                            }`} />
                                        <span className={`text-sm font-medium ${plan.style === 'black' ? 'text-gray-300' : 'text-muted-foreground'
                                            }`}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to={plan.ctaLink}
                                className={`w-full py-4 px-6 rounded-2xl font-bold text-center transition-all transform active:scale-95 ${plan.style === 'lime' ? 'bg-black text-white hover:bg-gray-900' :
                                    plan.style === 'black' ? 'bg-surface-card text-black hover:bg-muted' :
                                        'bg-muted text-foreground hover:bg-muted'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
