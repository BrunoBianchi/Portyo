import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, BarChart3, Target, Eye, MousePointerClick, Shield, Search, Users, TrendingUp, Zap, ChevronRight } from "lucide-react";
import { useCompanyUrl } from "~/lib/company-utils";
import { CompanyNavbar } from "./company-navbar";
import { CompanyFooter } from "./company-footer";
import { motion } from "framer-motion";

/**
 * Company Landing Page Content (without navbar/footer)
 * Use this when the standard layout (navbar/footer) is already provided by parent
 */
export function CompanyLandingContent() {
    const { t } = useTranslation("company");
    const companyUrl = useCompanyUrl();

    const steps = [
        {
            number: "01",
            icon: Search,
            titleKey: "landing.howItWorks.step1.title",
            titleFallback: "Choose a Creator",
            descKey: "landing.howItWorks.step1.description",
            descFallback: "Browse creators by niche, audience size, and engagement. Find the perfect match for your brand.",
        },
        {
            number: "02",
            icon: MousePointerClick,
            titleKey: "landing.howItWorks.step2.title",
            titleFallback: "Sponsor a Link",
            descKey: "landing.howItWorks.step2.description",
            descFallback: "Place your sponsored link directly on their bio. Set your budget, CPC, and targeting options.",
        },
        {
            number: "03",
            icon: TrendingUp,
            titleKey: "landing.howItWorks.step3.title",
            titleFallback: "Track Results",
            descKey: "landing.howItWorks.step3.description",
            descFallback: "Monitor clicks, conversions, and ROI in real-time. Optimize campaigns with actionable insights.",
        },
    ];

    const features = [
        {
            icon: Eye,
            titleKey: "landing.features.visibility.title",
            titleFallback: "Guaranteed Visibility",
            descKey: "landing.features.visibility.description",
            descFallback: "Your link sits directly on the creator's bio — seen by every visitor, every time.",
        },
        {
            icon: BarChart3,
            titleKey: "landing.features.analytics.title",
            titleFallback: "Real-Time Analytics",
            descKey: "landing.features.analytics.description",
            descFallback: "Track clicks, views, and conversions. Know exactly what's working and what's not.",
        },
        {
            icon: Target,
            titleKey: "landing.features.placement.title",
            titleFallback: "Direct Placement",
            descKey: "landing.features.placement.description",
            descFallback: "No algorithms, no feed noise. Your sponsored link goes where your audience already is.",
        },
        {
            icon: Shield,
            titleKey: "landing.features.safety.title",
            titleFallback: "Brand Safety",
            descKey: "landing.features.safety.description",
            descFallback: "Choose exactly which creators represent your brand. Full control over placement and targeting.",
        },
    ];

    return (
        <div className="bg-[#F3F3F1] font-sans text-[#1A1A1A]">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block bg-[#D2E823] border-2 border-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {t("landing.hero.badge", "For Brands & Agencies")}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tighter"
                        >
                            {t("landing.hero.title1", "REACH CREATORS")} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D2E823] to-emerald-600 tracking-tighter" style={{ WebkitTextStroke: "2px black" }}>
                                {t("landing.hero.title2", "DIRECTLY.")}
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl font-medium text-gray-600 max-w-lg leading-relaxed"
                        >
                            {t("landing.hero.subtitle", "Stop wasting budget on vague ads. Sponsor specific links on Portyo bios and get guaranteed visibility where it matters.")}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 pt-4"
                        >
                            <Link
                                to={companyUrl.register}
                                className="inline-flex items-center justify-center gap-2 bg-[#D2E823] border-2 border-black px-8 py-4 rounded-xl font-black text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide"
                            >
                                {t("landing.hero.cta", "Start Campaign")} <ArrowRight className="w-5 h-5 stroke-[3px]" />
                            </Link>
                            <Link
                                to={companyUrl.login}
                                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-black px-8 py-4 rounded-xl font-bold text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide"
                            >
                                {t("landing.hero.login", "Login")}
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 rounded-3xl border-2 border-black" />
                        <div className="relative bg-white border-2 border-black rounded-3xl p-8 shadow-sm">
                            <div className="space-y-6">
                                {/* Fake UI elements to simulate dashboard */}
                                <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
                                    <div className="space-y-1">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                    <div className="h-10 w-10 bg-[#F3F3F1] rounded-full border-2 border-gray-200" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-[#F3F3F1] rounded-xl border-2 border-gray-200">
                                        <BarChart3 className="w-6 h-6 mb-2 text-gray-400" />
                                        <div className="h-6 w-16 bg-gray-300 rounded mb-1" />
                                        <div className="h-3 w-12 bg-gray-200 rounded" />
                                    </div>
                                    <div className="p-4 bg-[#D2E823] rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Target className="w-6 h-6 mb-2 text-black" />
                                        <div className="h-6 w-16 bg-black/10 rounded mb-1" />
                                        <div className="h-3 w-12 bg-black/5 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 border-2 border-gray-100 rounded-xl">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                                            <div className="flex-1 space-y-1">
                                                <div className="h-3 w-full bg-gray-100 rounded" />
                                                <div className="h-2 w-2/3 bg-gray-50 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Marquee Strip */}
            <div className="border-y-2 border-black bg-white overflow-hidden">
                <div className="flex whitespace-nowrap py-4 animate-marquee">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center mx-8">
                            <span className="text-2xl font-black italic uppercase text-transparent tracking-tighter" style={{ WebkitTextStroke: "1px black" }}>
                                {t("landing.marquee.highConversion", "High Conversion")}
                            </span>
                            <div className="w-3 h-3 bg-[#D2E823] border-2 border-black rounded-full mx-8" />
                            <span className="text-2xl font-black italic uppercase tracking-tighter">
                                {t("landing.marquee.realAudiences", "Real Audiences")}
                            </span>
                            <div className="w-3 h-3 bg-[#D2E823] border-2 border-black rounded-full mx-8" />
                        </div>
                    ))}
                </div>
            </div>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-[#D2E823] border-2 border-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            {t("landing.howItWorks.badge", "Simple Process")}
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter">
                            {t("landing.howItWorks.title", "How it Works")}
                        </h2>
                        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                            {t("landing.howItWorks.subtitle", "Get your brand in front of the right audience in three simple steps.")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.15 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-2xl" />
                                    <div className="relative bg-white border-2 border-black rounded-2xl p-8 h-full hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="text-5xl font-black text-[#D2E823] tracking-tighter" style={{ WebkitTextStroke: "1.5px black" }}>
                                                {step.number}
                                            </span>
                                            <div className="w-12 h-12 bg-[#D2E823] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <Icon className="w-6 h-6 text-black stroke-[2.5px]" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                                            {t(step.titleKey, step.titleFallback)}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed">
                                            {t(step.descKey, step.descFallback)}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 lg:py-32 bg-[#F3F3F1]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-[#1A1A1A] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                            {t("landing.features.badge", "Why Portyo Sponsors")}
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter">
                            {t("landing.features.title", "Built for Results")}
                        </h2>
                        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                            {t("landing.features.subtitle", "Everything you need to run high-performing sponsor campaigns on creator bios.")}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-2xl" />
                                    <div className="relative bg-white border-2 border-black rounded-2xl p-8 h-full hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 bg-[#D2E823] border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-3 transition-transform">
                                                <Icon className="w-7 h-7 text-black stroke-[2.5px]" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                                                    {t(feature.titleKey, feature.titleFallback)}
                                                </h3>
                                                <p className="text-gray-500 leading-relaxed">
                                                    {t(feature.descKey, feature.descFallback)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="py-16 bg-white border-y-2 border-black/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="font-bold text-[#1A1A1A] opacity-60 uppercase tracking-widest text-sm mb-8">
                        {t("landing.socialProof.title", "Trusted by forward-thinking brands")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500">
                        {["TechCorp", "BrandX", "MediaPro", "AdVision", "GrowthCo"].map((brand) => (
                            <div key={brand} className="font-display font-black text-2xl text-[#1A1A1A]">
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing / Stats Section */}
            <section id="pricing" className="py-24 lg:py-32 bg-[#F3F3F1]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-block bg-[#D2E823] border-2 border-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                {t("landing.pricing.badge", "Transparent Pricing")}
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.1]">
                                {t("landing.pricing.title", "Pay Only for Results")}
                            </h2>
                            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                                {t("landing.pricing.subtitle", "No subscriptions, no minimums. Set your own CPC and daily budget. You only pay when someone actually clicks your sponsored link.")}
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: "$0.01", label: t("landing.pricing.minCpc", "Min CPC") },
                                    { value: "10K+", label: t("landing.pricing.creators", "Creators") },
                                    { value: "100%", label: t("landing.pricing.control", "Control") },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="text-2xl font-black text-[#D2E823]" style={{ WebkitTextStroke: "0.5px black" }}>
                                            {stat.value}
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-[#D2E823] translate-x-4 translate-y-4 rounded-3xl border-2 border-black" />
                            <div className="relative bg-[#1A1A1A] border-2 border-black rounded-3xl p-10 text-white">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">
                                        {t("landing.pricing.cardTitle", "How CPC Works")}
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { icon: Zap, text: t("landing.pricing.step1", "Set your cost-per-click (from $0.01)") },
                                            { icon: Users, text: t("landing.pricing.step2", "Choose creator tiers & audience targeting") },
                                            { icon: TrendingUp, text: t("landing.pricing.step3", "Monitor performance & adjust in real-time") },
                                        ].map((item, i) => {
                                            const StepIcon = item.icon;
                                            return (
                                                <div key={i} className="flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-[#D2E823] rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <StepIcon className="w-5 h-5 text-black stroke-[2.5px]" />
                                                    </div>
                                                    <p className="text-gray-300 leading-relaxed pt-2">{item.text}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Link
                                        to={companyUrl.register}
                                        className="inline-flex items-center gap-2 bg-[#D2E823] text-black border-2 border-[#D2E823] px-6 py-3 rounded-xl font-black uppercase tracking-wide hover:bg-white hover:border-white transition-colors mt-4"
                                    >
                                        {t("landing.pricing.cta", "Get Started")} <ChevronRight className="w-5 h-5 stroke-[3px]" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-[#1A1A1A] py-24 lg:py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1] mb-6">
                            {t("landing.cta.title", "Ready to Reach Your Audience?")}
                        </h2>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t("landing.cta.subtitle", "Join brands that are already growing with Portyo Sponsors. Start your first campaign in minutes.")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to={companyUrl.register}
                                className="inline-flex items-center justify-center gap-2 bg-[#D2E823] border-2 border-[#D2E823] text-black px-10 py-4 rounded-xl font-black text-lg shadow-[6px_6px_0px_0px_rgba(210,232,35,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(210,232,35,0.3)] transition-all uppercase tracking-wide"
                            >
                                {t("landing.cta.button", "Start Campaign")} <ArrowRight className="w-5 h-5 stroke-[3px]" />
                            </Link>
                            <Link
                                to={companyUrl.login}
                                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/20 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/5 hover:border-white/40 transition-all uppercase tracking-wide"
                            >
                                {t("landing.cta.login", "Sign In")}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

/**
 * Standalone Company Landing Page (with its own navbar/footer)
 * Use this when you need a self-contained company landing page
 */
export default function CompanyLandingPage() {
    return (
        <>
            <CompanyNavbar />
            <CompanyLandingContent />
            <CompanyFooter />
        </>
    );
}
