import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Bell, Mail, Zap, Clock, Check, UserPlus, Sparkles, BarChart3, Users, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FadeInUp, Floating, GlowCard } from "./animation-components";

// Feature data structure - Updated for dark theme
const features = [
  {
    id: "newsletter",
    icon: Mail,
    iconBg: "bg-gradient-to-br from-orange-500/20 to-orange-600/20",
    iconColor: "text-orange-400",
    badge: { text: "New Subscribers", color: "bg-primary" },
    badgeIcon: Bell,
    layout: "left",
    bgColor: "bg-background",
  },
  {
    id: "automation",
    icon: Zap,
    iconBg: "bg-gradient-to-br from-primary/20 to-primary/40",
    iconColor: "text-primary",
    badge: { text: "Running", color: "bg-primary" },
    badgeIcon: Sparkles,
    layout: "right",
    bgColor: "bg-surface-muted",
    isDark: true,
  },
  {
    id: "scheduler",
    icon: Clock,
    iconBg: "bg-gradient-to-br from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-400",
    badge: { text: "Confirmed", color: "bg-primary" },
    badgeIcon: Check,
    layout: "left",
    bgColor: "bg-background",
  },
  {
    id: "partnerships",
    icon: Users,
    iconBg: "bg-gradient-to-br from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-400",
    badge: { text: "$1,200", color: "bg-primary" },
    layout: "right",
    bgColor: "bg-surface-muted",
    isDark: true,
  },
  {
    id: "blog",
    icon: Globe,
    iconBg: "bg-gradient-to-br from-amber-500/20 to-amber-600/20",
    iconColor: "text-amber-400",
    badge: { text: "Published", color: "bg-primary" },
    layout: "left",
    bgColor: "bg-background",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = feature.icon;
  
  const isEven = index % 2 === 0;
  
  return (
    <section 
      ref={ref}
      className={`w-full py-20 md:py-28 ${feature.bgColor} overflow-hidden relative`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -40 : 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-1 flex flex-col gap-6"
          >
            {/* Section Label */}
            <div className="inline-flex items-center gap-2">
              <div className={`p-2 rounded-xl ${feature.iconBg}`}>
                <Icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t(`home.features.${feature.id}.label`, `Feature ${index + 1}`)}
              </span>
            </div>
            
            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              {t(`home.features.${feature.id}.title`, feature.id.charAt(0).toUpperCase() + feature.id.slice(1))}
            </h2>
            
            {/* Description */}
            <p className="text-lg leading-relaxed max-w-lg text-muted-foreground">
              {t(`home.features.${feature.id}.body`, "")}
            </p>
            
            {/* CTA */}
            <motion.button
              whileHover={{ x: 5 }}
              className="w-fit mt-2 font-bold flex items-center gap-3 group text-lg text-foreground hover:text-primary transition-colors"
            >
              {t(`home.features.${feature.id}.cta`, "Learn more")} 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 40 : -40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-1 w-full relative"
          >
            <FeatureVisual feature={feature} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureVisual({ feature }: { feature: typeof features[0] }) {
  const { t } = useTranslation();
  
  switch (feature.id) {
    case "newsletter":
      return (
        <div className="relative">
          <GlowCard className="rounded-3xl">
            <div className="bg-surface-card rounded-3xl shadow-2xl shadow-black/50 border border-border p-8 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted to-muted-hover" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-muted rounded-full" />
                  <div className="h-3 w-16 bg-muted rounded-full" />
                </div>
              </div>
              
              {/* Content Lines */}
              <div className="space-y-3 mb-8">
                <div className="h-4 w-full bg-muted/50 rounded-full" />
                <div className="h-4 w-3/4 bg-muted/50 rounded-full" />
              </div>
              
              {/* Email Input Card */}
              <div className="bg-surface-muted p-5 rounded-2xl border border-border">
                <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
                  {t("home.features.newsletter.joinList", "Join the list")}
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-surface-card border border-border rounded-xl px-4 flex items-center text-muted-foreground text-sm">
                    {t("home.features.newsletter.emailPlaceholder", "your@email.com")}
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-background shadow-lg cursor-pointer"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </div>
              </div>
            </div>
          </GlowCard>
          
          {/* Floating Badge */}
          <Floating distance={8} duration={3}>
            <div className="absolute -right-4 top-8 bg-surface-card text-foreground px-5 py-3 rounded-2xl shadow-2xl z-20 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bell className="w-4 h-4 text-background" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("home.features.newsletter.notificationLabel", "Notification")}</p>
                  <p className="font-bold text-sm text-foreground">{t("home.features.newsletter.notificationValue", "New Subscriber!")}</p>
                </div>
              </div>
            </div>
          </Floating>
        </div>
      );
      
    case "automation":
      return (
        <div className="relative">
          <div className="bg-surface-card rounded-3xl shadow-2xl shadow-black/50 border border-border p-6 relative overflow-hidden">
            {/* Running Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-3 -right-3 z-10"
            >
              <div className="bg-primary text-background px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-4 h-4 fill-current" />
                </motion.div>
                <span className="font-bold text-xs uppercase tracking-wide">{t("home.features.automation.running", "Running")}</span>
              </div>
            </motion.div>
            
            {/* Flow Nodes */}
            <div className="relative py-8 flex flex-col items-center gap-6">
              {/* SVG Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#262626" />
                    <stop offset="100%" stopColor="#bbff00" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M 180 70 Q 180 110 180 130"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
                <motion.path
                  d="M 180 190 Q 180 230 180 250"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
                
                {/* Animated Particles */}
                <circle r="4" fill="#bbff00">
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path="M 180 70 Q 180 110 180 130"
                  />
                </circle>
                <circle r="4" fill="#a78bfa">
                  <animateMotion
                    dur="2s"
                    begin="1s"
                    repeatCount="indefinite"
                    path="M 180 190 Q 180 230 180 250"
                  />
                </circle>
              </svg>
              
              {/* Node 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 bg-surface-muted rounded-2xl p-4 shadow-lg border border-border flex items-center gap-4 w-56"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{t("home.features.automation.node1Title", "New Subscriber")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.features.automation.node1Trigger", "Trigger")}</p>
                </div>
              </motion.div>
              
              {/* Node 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative z-10 bg-surface-muted rounded-2xl p-4 shadow-lg border border-border flex items-center gap-4 w-56"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{t("home.features.automation.node2Title", "Send Email")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.features.automation.node2Subtitle", "Welcome Kit")}</p>
                </div>
              </motion.div>
              
              {/* Node 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative z-10 bg-surface-muted rounded-2xl p-4 shadow-xl border-2 border-primary flex items-center gap-4 w-56"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{t("home.features.automation.node3Title", "Add Tag")}</p>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {t("home.features.automation.node3Tag", "#pro-lead")}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      );
      
    case "scheduler":
      return (
        <div className="relative">
          <GlowCard className="rounded-3xl">
            <div className="bg-surface-card rounded-3xl shadow-2xl shadow-black/50 p-6 border border-border">
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg text-foreground">{t("home.features.scheduler.month", "September 2025")}</span>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-hover cursor-pointer transition-colors text-foreground">‹</div>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-hover cursor-pointer transition-colors text-foreground">›</div>
                </div>
              </div>
              
              {/* Days Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Mo","Tu","We","Th","Fr","Sa","Su"].map(day => (
                  <div key={day} className="text-xs font-bold text-muted-foreground text-center">{day}</div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm cursor-pointer transition-colors ${
                      i === 14 
                        ? 'bg-primary text-background font-bold shadow-lg' 
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                ))}
              </div>
              
              {/* Event Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 pt-6 border-t border-border flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{t("home.features.scheduler.eventTitle", "Discovery Call")}</p>
                  <p className="text-sm text-muted-foreground">{t("home.features.scheduler.eventTime", "10:00 AM - 10:30 AM")}</p>
                </div>
              </motion.div>
            </div>
          </GlowCard>
          
          {/* Confirmed Badge */}
          <Floating distance={6} duration={4}>
            <div className="absolute -left-4 top-1/2 bg-surface-card px-5 py-3 rounded-2xl shadow-xl z-20 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("home.features.scheduler.statusLabel", "Status")}</p>
                  <p className="font-bold text-sm text-foreground">{t("home.features.scheduler.statusValue", "Confirmed")}</p>
                </div>
              </div>
            </div>
          </Floating>
        </div>
      );
      
    case "partnerships":
      return (
        <div className="relative">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl shadow-2xl shadow-primary/20 p-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-background" />
            </div>
            
            {/* Content */}
            <h3 className="text-2xl font-bold text-background mb-2">
              {t("home.features.partnerships.cardTitle", "Collaboration Request")}
            </h3>
            <p className="text-background/70 mb-8">
              {t("home.features.partnerships.cardBody", "Nike wants to collaborate with you on their new campaign.")}
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-background text-foreground py-3 rounded-xl font-bold shadow-lg"
              >
                {t("home.features.partnerships.accept", "Accept")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white/30 text-background py-3 rounded-xl font-bold hover:bg-white/40 transition-colors"
              >
                {t("home.features.partnerships.decline", "Decline")}
              </motion.button>
            </div>
          </div>
          
          {/* Budget Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 10 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="absolute -right-6 top-1/2 bg-surface-card px-6 py-4 rounded-2xl shadow-2xl z-20 border border-border"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t("home.features.partnerships.budgetLabel", "Budget")}</p>
            <p className="text-3xl font-bold text-primary">$1,200</p>
          </motion.div>
        </div>
      );
      
    case "blog":
      return (
        <div className="relative">
          <GlowCard className="rounded-3xl" glowColor="rgba(187, 255, 0, 0.15)">
            <div className="bg-surface-card rounded-3xl shadow-2xl shadow-black/50 p-6 border border-border">
              {/* Image Placeholder */}
              <div className="w-full aspect-video bg-muted rounded-2xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className="w-20 h-20 text-muted-foreground/20" />
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-foreground">
                  {t("home.features.blog.tagLifestyle", "Lifestyle")}
                </span>
                <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-foreground">
                  {t("home.features.blog.tagReadTime", "5 min read")}
                </span>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-4 leading-tight">
                {t("home.features.blog.cardTitle", "10 Tips for Growing Your Audience in 2025")}
              </h3>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark" />
                <span className="text-sm font-medium text-muted-foreground">{t("home.features.blog.byYou", "By You")}</span>
              </div>
            </div>
          </GlowCard>
          
          {/* Published Badge */}
          <Floating distance={5} duration={3.5}>
            <div className="absolute -left-4 top-8 bg-surface-card px-4 py-2 rounded-xl shadow-xl z-20 border border-border">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
                <span className="font-bold text-sm text-foreground">{t("home.features.blog.published", "Published")}</span>
              </div>
            </div>
          </Floating>
        </div>
      );
      
    default:
      return null;
  }
}

export default function FeaturesSection() {
  return (
    <div className="w-full flex flex-col">
      {features.map((feature, index) => (
        <FeatureCard key={feature.id} feature={feature} index={index} />
      ))}
    </div>
  );
}
