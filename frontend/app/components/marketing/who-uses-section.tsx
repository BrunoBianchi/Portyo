import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Music, Video, ShoppingBag, BookOpen, Podcast, Calendar, CreditCard, Link2, Package } from "lucide-react";

const featureIcons = [
  { icon: Music, key: "music", color: "bg-green-500/20 text-green-400" },
  { icon: Video, key: "videos", color: "bg-red-500/20 text-red-400" },
  { icon: ShoppingBag, key: "products", color: "bg-blue-500/20 text-blue-400" },
  { icon: BookOpen, key: "courses", color: "bg-purple-500/20 text-purple-400" },
  { icon: Podcast, key: "podcasts", color: "bg-orange-500/20 text-orange-400" },
  { icon: Calendar, key: "events", color: "bg-pink-500/20 text-pink-400" },
  { icon: CreditCard, key: "payments", color: "bg-cyan-500/20 text-cyan-400" },
  { icon: Link2, key: "links", color: "bg-indigo-500/20 text-indigo-400" },
  { icon: Package, key: "merch", color: "bg-yellow-500/20 text-yellow-400" },
];

export default function WhoUsesSection() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch - render static content until mounted
  if (!isMounted) {
    return (
      <section 
        className="w-full py-24 md:py-32 bg-background overflow-hidden relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-border shadow-lg text-sm font-semibold text-foreground mb-6">
              All-in-One Platform
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}>
              Share everything you create
            </h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              One link for all your content, products, and services
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="w-full py-24 md:py-32 bg-background overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-border shadow-lg text-sm font-semibold text-foreground mb-6">
            {t("home.whoUses.badge", "All-in-One Platform")}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}>
            {t("home.whoUses.title", "Share everything you create")}
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("home.whoUses.subtitle", "One link for all your content, products, and services")}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
          {featureIcons.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface-card border border-border shadow-lg hover:border-border-hover hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <span className="text-sm font-semibold text-foreground">{t(`home.whoUses.features.${feature.key}`, feature.key.charAt(0).toUpperCase() + feature.key.slice(1))}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">{t("home.whoUses.ctaText", "And much more...")}</p>
          <motion.a
            href="#features"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            {t("home.whoUses.ctaButton", "Explore all features")}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
