import { QrCode, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from "react-i18next";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

export default function AnalyticsSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const stats = [
    { 
      value: "2.8k", 
      label: t("home.analytics.cards.subscribers", "Subscribers"), 
      icon: Users,
      bg: "bg-surface-card", 
      text: "text-foreground",
      border: "border border-border",
      delay: 0 
    },
    { 
      value: "8.2k", 
      label: t("home.analytics.cards.qrScans", "QR Scans"), 
      icon: QrCode,
      bg: "bg-surface-elevated", 
      text: "text-foreground",
      border: "border border-border",
      delay: 0.1 
    },
    { 
      value: "$2,362", 
      label: t("home.analytics.cards.sales", "Sales"), 
      icon: DollarSign,
      bg: "bg-primary", 
      text: "text-background",
      delay: 0.2 
    },
    { 
      value: "12.5%", 
      label: t("home.analytics.cards.conversionRate", "Conversion Rate"), 
      icon: TrendingUp,
      bg: "bg-secondary", 
      text: "text-foreground",
      badge: t("home.analytics.cards.conversionBadge", "+24%"),
      delay: 0.3 
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 px-6 bg-background overflow-hidden"
    >
      <motion.div 
        className="max-w-7xl mx-auto"
        style={{ opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Cards Grid */}
          <motion.div 
            className="relative"
            style={{ y }}
          >
            {/* Decorative background blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-3xl rounded-full -z-10" />

            <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-[480px] mx-auto lg:mx-0">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: stat.delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className={`${stat.bg} ${stat.text} ${stat.border || ''} p-6 rounded-3xl aspect-square flex flex-col justify-between shadow-xl relative overflow-hidden group`}
                >
                  {/* Background decoration */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-surface-card/10 rounded-full blur-2xl group-hover:bg-surface-card/20 transition-colors" />
                  
                  {/* Badge */}
                  {stat.badge && (
                    <div className="absolute top-4 right-4 text-xs font-bold bg-surface-card/40 px-2 py-1 rounded-md backdrop-blur-sm">
                      {stat.badge}
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg === 'bg-primary' ? 'bg-background/20' : 'bg-muted'} flex items-center justify-center relative z-10`}>
                    <stat.icon className={`w-6 h-6 ${stat.bg === 'bg-primary' ? 'text-background' : 'text-foreground'}`} />
                  </div>
                  
                  {/* Value */}
                  <div className="relative z-10">
                    <div className="text-4xl md:text-5xl font-bold tracking-tight">
                      {stat.value}
                    </div>
                    <div className={`text-sm font-medium mt-1 ${stat.bg === 'bg-primary' ? 'text-background/80' : 'text-muted-foreground'}`}>
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Text Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-border text-foreground text-sm font-semibold mb-6">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t("home.analytics.label", "Analytics")}
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}
            >
              {t("home.analytics.title", "Turn every interaction into opportunity")}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              {t("home.analytics.subtitle", "Gain deep insights into your audience behavior. From QR scans to sales conversion, track what matters most and optimize your digital presence for real growth.")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-4 mt-4 justify-center lg:justify-start"
            >
              {[
                { key: "views", label: t("home.analytics.stats.views", "Real-time views") },
                { key: "clicks", label: t("home.analytics.stats.clicks", "Click tracking") },
                { key: "geo", label: t("home.analytics.stats.geo", "Geographic data") },
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-sm font-medium text-foreground bg-surface-card px-4 py-2 rounded-full shadow-sm border border-border">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {item.label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
