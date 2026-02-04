"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [
  {
    title: "As featured in...",
    items: [
      { name: "TechCrunch", logo: "TC" },
      { name: "Business Insider", logo: "BI" },
      { name: "Forbes", logo: "F" },
      { name: "Mashable", logo: "M" },
      { name: "Fortune", logo: "FT" },
    ]
  }
];

export default function FeaturedSection() {
  const { t } = useTranslation("home");

  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-12">
            {t("featured.title", "As featured in")}
          </h2>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {[
              { name: "TechCrunch", icon: "TC" },
              { name: "Business Insider", icon: "In" },
              { name: "Forbes", icon: "F" },
              { name: "Mashable", icon: "M" },
              { name: "Fortune", icon: "FT" },
            ].map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="px-8 py-4 bg-surface-card rounded-full border border-border hover:border-primary/30 transition-colors cursor-pointer"
              >
                <span className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  {brand.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16"
        >
          <motion.a
            href="/sign-up"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#e9b4e9] text-foreground font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            {t("hero.ctaSecondary", "Explore all plans")}
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
