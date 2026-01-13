import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Check } from "lucide-react";
import { Link } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Pricing | Portyo" },
        { name: "description", content: "Choose the perfect plan for your needs." },
    ];
};

export default function Pricing() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

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
            price: billingCycle === 'yearly' ? "$4.12" : "$5.50",
            period: "/mo",
            billed: billingCycle === 'yearly' ? "Billed $49.50 yearly" : "Billed monthly",
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
            price: billingCycle === 'yearly' ? "$11.25" : "$15.00",
            period: "/mo",
            billed: billingCycle === 'yearly' ? "Billed $135 yearly" : "Billed monthly",
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
        <div className="min-h-screen bg-[#fdfaf5] py-20 px-4 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Simple, transparent pricing</h1>
                    <p className="text-xl text-gray-600">No contracts, no surprise fees.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-[32px] p-8 md:p-10 transition-transform hover:-translate-y-1 duration-300 flex flex-col h-full ${plan.style === 'lime' ? 'bg-[#D7F000] text-black shadow-xl ring-0' :
                                plan.style === 'black' ? 'bg-black text-white shadow-xl' :
                                    'bg-white text-gray-900 shadow-lg'
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.style === 'black' ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                                <p className={`text-sm mb-6 ${plan.style === 'black' ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>

                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                                    {plan.period && <span className={`text-lg font-medium ${plan.style === 'black' ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>}
                                </div>
                                {plan.billed && (
                                    <p className={`text-xs font-bold uppercase tracking-wide mt-3 inline-block px-3 py-1 rounded-full ${plan.style === 'black' ? 'bg-gray-800 text-gray-300' :
                                        plan.style === 'lime' ? 'bg-black/10 text-black' :
                                            'bg-gray-100 text-gray-500'
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
                                        <span className={`text-sm font-medium ${plan.style === 'black' ? 'text-gray-300' : 'text-gray-700'
                                            }`}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to={plan.ctaLink}
                                className={`w-full py-4 px-6 rounded-2xl font-bold text-center transition-all transform active:scale-95 ${plan.style === 'lime' ? 'bg-black text-white hover:bg-gray-900' :
                                    plan.style === 'black' ? 'bg-white text-black hover:bg-gray-100' :
                                        'bg-gray-100 text-gray-900 hover:bg-gray-200'
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
