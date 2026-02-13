"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FeaturedTestimonial() {
    const { t } = useTranslation("home");

    return (
        <section className="w-full py-32 px-6 sm:px-12 lg:px-20 bg-[#F3F3F1] text-[#1A1A1A]">
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Avatar / Photo */}
                    <div className="flex-shrink-0 relative">
                        <div className="w-40 h-40 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-[#1A1A1A] bg-gray-300 relative z-10">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                                alt="Testimonial Author"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                        {/* Decorative BG blob */}
                        <div className="absolute top-0 -left-4 w-full h-full rounded-full bg-[#D2E823] -z-0 translate-x-2 translate-y-2"></div>
                    </div>

                    {/* Quote Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-[#D2E823] fill-current mb-8 mx-auto lg:mx-0" />

                        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight mb-8">
                            "{t("home.landingBold.testimonial.quote")}"
                        </h2>

                        <div className="flex flex-col lg:items-start items-center">
                            <span className="font-display font-black text-xl uppercase tracking-wider">MARIA SILVA</span>
                            <span className="font-body font-medium text-lg text-gray-500">{t("home.landingBold.testimonial.role")}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
