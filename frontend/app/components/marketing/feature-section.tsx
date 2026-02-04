"use client";

import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface FeatureSectionProps {
    backgroundColor: string;
    textColor?: string;
    title: string;
    description: string;
    mediaContent?: React.ReactNode;
    align?: "left" | "right";
    className?: string;
}

export default function FeatureSection({
    backgroundColor,
    textColor = "#FFFFFF",
    title,
    description,
    mediaContent,
    align = "left",
    className,
}: FeatureSectionProps) {
    return (
        <section
            className={cn("w-full py-24 px-6 sm:px-12 lg:px-20 overflow-hidden", className)}
            style={{ backgroundColor, color: textColor }}
        >
            <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                {/* Text Content */}
                <motion.div
                    className={cn("flex flex-col", align === "right" && "lg:order-2")}
                    initial={{ opacity: 0, x: align === "left" ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: "-10%" }}
                >
                    <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl mb-6 tracking-tighter leading-[1.1]">
                        {title}
                    </h2>
                    <p
                        className="font-body font-medium text-lg sm:text-xl lg:text-2xl opacity-90 leading-relaxed max-w-xl"
                        style={{ color: textColor }}
                    >
                        {description}
                    </p>
                </motion.div>

                {/* Media Content */}
                <motion.div
                    className={cn(
                        "relative w-full aspect-square lg:aspect-video rounded-none border-4 border-black/10 bg-black/5 flex items-center justify-center overflow-hidden",
                        align === "right" && "lg:order-1"
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    {mediaContent ? (
                        mediaContent
                    ) : (
                        <div className="text-center p-8 opacity-50 font-display font-bold text-2xl">
                            [FEATURE VISUAL PLACEHOLDER]
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
