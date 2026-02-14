"use client";

import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LinktreeHeroBold() {
    const { t } = useTranslation("home");

    return (
        <section className="bg-[#D2E823] text-[#022C22] w-full min-h-[90vh] grid lg:grid-cols-2 overflow-hidden relative">
            {/* Left Column: Content */}
            <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 lg:py-0 lg:pt-16 pb-20 lg:pb-32 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <span className="inline-block py-2 px-4 rounded-full border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold text-sm mb-6 bg-white/20 backdrop-blur-sm">
                        {t("landingBold.hero.badge")}
                    </span>

                    <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.9] tracking-tighter mb-8 text-[#1A1A1A]">
                        {t("landingBold.hero.line1")} <br />
                        <span className="text-transparent stroke-text" style={{ WebkitTextStroke: "2px #1A1A1A" }}>{t("landingBold.hero.line2")}</span> <br />
                        {t("landingBold.hero.line3")}
                    </h1>

                    <p className="font-body font-medium text-lg sm:text-xl lg:text-2xl text-[#1A1A1A] opacity-90 mb-10 max-w-lg leading-relaxed">
                        {t("landingBold.hero.subtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/sign-up"
                            className="inline-flex items-center justify-center bg-[#1A1A1A] text-white rounded-full px-10 py-5 font-display font-bold text-lg hover:scale-105 transition-transform duration-300 active:scale-95"
                        >
                            {t("landingBold.hero.ctaPrimary")}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>

                        <Link
                            to="/pricing"
                            className="inline-flex items-center justify-center bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-full px-10 py-5 font-display font-bold text-lg hover:bg-[#1A1A1A] hover:text-white transition-colors duration-300"
                        >
                            {t("landingBold.hero.ctaSecondary")}
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Right Column: Image Placeholder */}
            <div className="relative h-[50vh] lg:h-auto w-full flex items-end justify-center lg:justify-end overflow-hidden">
                {/* Abstract Shapes/Background accents */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-[#E94E77] rounded-full blur-[100px] opacity-60 mix-blend-multiply pointer-events-none"></div>
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#0047FF] rounded-full blur-[120px] opacity-50 mix-blend-multiply pointer-events-none"></div>

                {/* Person Image Placeholder */}
                <motion.div
                    className="relative z-10 w-full max-w-[80%] lg:max-w-[90%] h-[90%] bg-contain bg-no-repeat bg-bottom"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                        maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                    }}
                >
                    {/* Note: This is an Unsplash image of a business woman to serve as a high-quality placeholder. 
                In a real scenario, this would be a cut-out PNG of a person. */}
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-6 sm:left-12 lg:left-20 animate-bounce">
                <ArrowRight className="w-8 h-8 rotate-90 text-[#1A1A1A]" />
            </div>
        </section>
    );
}
