import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Star, Quote } from "lucide-react";
import { Marquee, FadeInUp } from "./animation-components";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "SC",
    avatarBg: "bg-gradient-to-br from-purple-400 to-pink-500",
    content: "Portyo completely transformed how I monetize my content. The automation features alone saved me hours every week!",
    rating: 5,
    metric: "3x",
    metricLabel: "Revenue increase"
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Fitness Coach",
    avatar: "MJ",
    avatarBg: "bg-gradient-to-br from-blue-400 to-cyan-500",
    content: "The booking scheduler is a game-changer. My clients love how easy it is to book sessions, and I love the automated reminders.",
    rating: 5,
    metric: "50+",
    metricLabel: "Monthly bookings"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Digital Artist",
    avatar: "ER",
    avatarBg: "bg-gradient-to-br from-orange-400 to-red-500",
    content: "Finally, a link-in-bio tool that actually helps me sell my art. The product showcase feature is beautiful and converts so well!",
    rating: 5,
    metric: "$12k",
    metricLabel: "Sales in 3 months"
  },
  {
    id: 4,
    name: "David Park",
    role: "Tech YouTuber",
    avatar: "DP",
    avatarBg: "bg-gradient-to-br from-green-400 to-emerald-500",
    content: "The analytics are incredible. I can finally see exactly what my audience engages with and optimize accordingly.",
    rating: 5,
    metric: "85%",
    metricLabel: "Click-through rate"
  },
  {
    id: 5,
    name: "Aisha Patel",
    role: "Business Consultant",
    avatar: "AP",
    avatarBg: "bg-gradient-to-br from-indigo-400 to-purple-500",
    content: "Portyo makes me look professional. The custom domain and clean design have helped me land bigger clients.",
    rating: 5,
    metric: "10x",
    metricLabel: "Lead generation"
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Musician",
    avatar: "JW",
    avatarBg: "bg-gradient-to-br from-yellow-400 to-orange-500",
    content: "Love how I can showcase my music, sell merch, and book gigs all in one place. My fans love the experience!",
    rating: 5,
    metric: "2k+",
    metricLabel: "Newsletter subs"
  }
];

const featuredLogos = [
  { name: "Stripe", icon: "S" },
  { name: "Notion", icon: "N" },
  { name: "Figma", icon: "F" },
  { name: "Slack", icon: "S" },
  { name: "Vercel", icon: "V" },
  { name: "Discord", icon: "D" }
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative w-[380px] flex-shrink-0"
    >
      <div className="relative overflow-hidden rounded-3xl bg-surface-card p-6 shadow-xl shadow-black/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/5 border border-border">
        {/* Quote Icon */}
        <div className="absolute -top-2 -right-2 opacity-5">
          <Quote className="h-24 w-24 text-primary" />
        </div>

        {/* Rating */}
        <div className="mb-4 flex gap-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
        </div>

        {/* Content */}
        <p className="mb-6 text-muted-foreground leading-relaxed text-sm">
          "{testimonial.content}"
        </p>

        {/* Metric Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
          <span className="text-lg font-bold text-primary">{testimonial.metric}</span>
          <span className="text-xs font-medium text-muted-foreground">{testimonial.metricLabel}</span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className={`h-10 w-10 rounded-full ${testimonial.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
            {testimonial.avatar}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="w-full py-24 overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <FadeInUp>
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
              <Star className="h-4 w-4 fill-primary" />
              {t("testimonials.badge", "Loved by 10,000+ creators")}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              {t("testimonials.title", "What creators are saying")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("testimonials.subtitle", "Join thousands of creators who've transformed their online presence with Portyo")}
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
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider font-semibold">
            {t("testimonials.trustedBy", "Trusted by teams at")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 hover:opacity-100 transition-all duration-500">
            {featuredLogos.map((logo) => (
              <div 
                key={logo.name}
                className="flex items-center gap-2 text-xl font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm text-foreground">
                  {logo.icon}
                </div>
                <span className="hidden sm:inline">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeInUp>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10k+", label: t("stats.activeUsers", "Active Users") },
            { value: "$2M+", label: t("stats.revenue", "Revenue Generated") },
            { value: "99.9%", label: t("stats.uptime", "Uptime") },
            { value: "4.9/5", label: t("stats.rating", "Average Rating") }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
