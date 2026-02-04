"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Star, Quote, Sparkles, TrendingUp, Heart, Zap } from "lucide-react";
import { Marquee, FadeInUp } from "./animation-components";

// Vibrant color palette
const colors = {
  lime: "#c8e600",
  pink: "#ec4899",
  purple: "#8b5cf6",
  blue: "#2563eb",
  cyan: "#06b6d4",
  orange: "#f97316",
};

const featuredLogos = [
  { name: "Stripe", icon: "S", color: colors.purple },
  { name: "Notion", icon: "N", color: colors.lime },
  { name: "Figma", icon: "F", color: colors.pink },
  { name: "Slack", icon: "S", color: colors.cyan },
  { name: "Vercel", icon: "V", color: colors.orange },
  { name: "Discord", icon: "D", color: colors.blue },
];

interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  avatar: string;
  avatarBg: string;
  content: string;
  rating: number;
  metric: string;
  metricLabel: string;
  accentColor: string;
}

function TestimonialCard({ testimonial, index }: { testimonial: TestimonialItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 } 
      }}
      className="group relative w-[400px] flex-shrink-0"
    >
      <div 
        className="relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 group-hover:shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))",
          border: `2px solid ${testimonial.accentColor}40`,
          boxShadow: `0 10px 40px ${testimonial.accentColor}25`,
        }}
      >
        {/* Animated blob background */}
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: testimonial.accentColor }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Quote Icon */}
        <motion.div 
          className="absolute -top-2 -right-2 opacity-10"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Quote className="h-24 w-24" style={{ color: testimonial.accentColor }} />
        </motion.div>

        {/* Rating with animation */}
        <div className="mb-4 flex gap-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Star className="h-5 w-5 fill-[#c8e600] text-[#c8e600]" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <p className="mb-6 text-amber-900/70 leading-relaxed text-base font-medium">
          "{testimonial.content}"
        </p>

        {/* Metric Badge */}
        <motion.div 
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2"
          style={{ 
            background: `${testimonial.accentColor}15`,
            border: `1px solid ${testimonial.accentColor}30`,
          }}
          whileHover={{ scale: 1.05 }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: testimonial.accentColor }} />
          <span className="text-lg font-black" style={{ color: testimonial.accentColor }}>{testimonial.metric}</span>
          <span className="text-xs font-semibold text-amber-800/60">{testimonial.metricLabel}</span>
        </motion.div>

        {/* Author */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <motion.div 
            className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm`}
            style={{ background: testimonial.avatarBg }}
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            {testimonial.avatar}
          </motion.div>
          <div>
            <p className="font-bold text-gray-900 text-base">{testimonial.name}</p>
            <p className="text-sm text-gray-500">{testimonial.role}</p>
          </div>
        </div>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
          initial={{ x: "-200%" }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Map translations to testimonial structure with visual configs
  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "SC",
      avatarBg: "linear-gradient(135deg, #FF6B9D, #9D4EDD)",
      content: "Portyo completely transformed how I monetize my content. The analytics are incredible!",
      rating: 5,
      metric: "3x",
      metricLabel: "Revenue increase",
      accentColor: colors.pink,
    },
    {
      id: 2,
      name: "Marcus Johnson",
      role: "Fitness Coach",
      avatar: "MJ",
      avatarBg: "linear-gradient(135deg, #4361EE, #00D9FF)",
      content: "The booking scheduler is a game-changer. My clients love how easy it is to book sessions.",
      rating: 5,
      metric: "50+",
      metricLabel: "Monthly bookings",
      accentColor: colors.cyan,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Digital Artist",
      avatar: "ER",
      avatarBg: "linear-gradient(135deg, #FF9F1C, #FF6B9D)",
      content: "Finally, a link-in-bio tool that actually helps me sell my art. Beautiful and functional!",
      rating: 5,
      metric: "$12k",
      metricLabel: "Sales in 3 months",
      accentColor: colors.orange,
    },
    {
      id: 4,
      name: "David Park",
      role: "Tech YouTuber",
      avatar: "DP",
      avatarBg: "linear-gradient(135deg, #2EC4B6, #D7F000)",
      content: "The analytics are incredible. I can finally see exactly what my audience wants.",
      rating: 5,
      metric: "85%",
      metricLabel: "Click-through rate",
      accentColor: colors.lime,
    },
    {
      id: 5,
      name: "Aisha Patel",
      role: "Business Consultant",
      avatar: "AP",
      avatarBg: "linear-gradient(135deg, #9D4EDD, #4361EE)",
      content: "Portyo makes me look professional. Clients are impressed every time they visit my bio.",
      rating: 5,
      metric: "10x",
      metricLabel: "Lead generation",
      accentColor: colors.purple,
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Musician",
      avatar: "JW",
      avatarBg: "linear-gradient(135deg, #D7F000, #FF9F1C)",
      content: "Love how I can showcase my music. The integration with streaming platforms is seamless!",
      rating: 5,
      metric: "2k+",
      metricLabel: "Newsletter subs",
      accentColor: colors.lime,
    },
  ];

  return (
    <section ref={ref} className="w-full py-24 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)' }}>
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 text-4xl"
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        💬
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-20 text-4xl"
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        ⭐
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <FadeInUp>
          <div className="text-center max-w-3xl mx-auto">
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm mb-6 border-2"
              style={{ 
                background: `${colors.lime}30`,
                borderColor: `${colors.lime}50`,
                color: '#365314',
              }}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  `0 0 0px ${colors.lime}30`,
                  `0 0 20px ${colors.lime}50`,
                  `0 0 0px ${colors.lime}30`,
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              {t("home.testimonials.badge", "Loved by 10,000+ creators")}
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-black text-amber-900 leading-[1.1] mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              What creators are{" "}
              <motion.span
                animate={{ color: [colors.pink, colors.cyan, colors.lime, colors.pink] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                saying
              </motion.span>
              🎤
            </motion.h2>
            
            <p className="text-xl text-gray-500">
              {t("home.testimonials.subtitle", "Join thousands of creators who've transformed their online presence with Portyo")}
            </p>
          </div>
        </FadeInUp>
      </div>

      {/* Marquee Testimonials Row 1 */}
      <div className="mb-6">
        <Marquee speed={40} pauseOnHover>
          {testimonials.slice(0, 3).map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} index={i} />
          ))}
        </Marquee>
      </div>

      {/* Marquee Testimonials Row 2 (Reverse) */}
      <div className="mb-16">
        <Marquee speed={40} direction="right" pauseOnHover>
          {testimonials.slice(3, 6).map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} index={i} />
          ))}
        </Marquee>
      </div>

      {/* Trust Badges */}
      <FadeInUp delay={0.3}>
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-sm text-amber-800/60 mb-8 uppercase tracking-wider font-bold">
            {t("home.testimonials.trustedBy", "Trusted by teams at")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {featuredLogos.map((logo, i) => (
              <motion.div 
                key={logo.name}
                className="flex items-center gap-2 text-xl font-bold cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
              >
                <motion.div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: `${logo.color}20`, color: logo.color }}
                  whileHover={{ 
                    background: logo.color,
                    color: "#fff",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {logo.icon}
                </motion.div>
                <span className="hidden sm:inline text-white/60">{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeInUp>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10k+", label: t("home.testimonials.stats.activeUsers", "Active Users"), color: colors.lime },
            { value: "$2M+", label: t("home.testimonials.stats.revenue", "Revenue Generated"), color: colors.pink },
            { value: "99.9%", label: t("home.testimonials.stats.uptime", "Uptime"), color: colors.cyan },
            { value: "4.9/5", label: t("home.testimonials.stats.rating", "Average Rating"), color: colors.purple },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="text-center p-6 rounded-2xl shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.75))`,
                border: `1px solid ${stat.color}35`,
                boxShadow: `0 10px 30px rgba(15, 23, 42, 0.12)`,
              }}
            >
              <div
                className="text-4xl md:text-5xl font-black mb-2"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
