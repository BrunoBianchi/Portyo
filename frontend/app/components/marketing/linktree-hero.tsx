"use client";

import { useEffect, useState, useRef } from "react";
import { motion, MotionConfig } from "framer-motion";
import { ArrowRight, BarChart3, Globe, ShoppingBag, Users, Sparkles } from "lucide-react";
import { Link } from "react-router";

// Color palette refinado - mais profissional
const colors = {
  lime: "#84cc16",
  limeLight: "#d9f99d",
  pink: "#ec4899",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  }
};

// Stats data
const statsData = [
  { 
    value: 43500, 
    label: "Cliques rastreados",
    icon: BarChart3,
    gradient: "from-amber-100 to-orange-50",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-400",
    accent: "#f59e0b",
    delay: 0.2
  },
  { 
    value: 643, 
    label: "Usuários ativos",
    icon: Users,
    gradient: "from-rose-100 to-pink-50",
    iconBg: "bg-gradient-to-br from-rose-400 to-pink-500",
    accent: "#ec4899",
    delay: 0.3
  },
  { 
    value: 2362, 
    label: "Produtos vendidos",
    icon: ShoppingBag,
    gradient: "from-violet-100 to-purple-50",
    iconBg: "bg-gradient-to-br from-violet-400 to-purple-600",
    accent: "#8b5cf6",
    delay: 0.4
  },
  { 
    value: 960, 
    label: "Visitas diárias",
    icon: Globe,
    gradient: "from-cyan-100 to-sky-50",
    iconBg: "bg-gradient-to-br from-cyan-400 to-sky-500",
    accent: "#06b6d4",
    delay: 0.5
  },
];

// Avatares para social proof
const avatars = [
  { bg: "bg-gradient-to-br from-pink-400 to-rose-500", initial: "AM" },
  { bg: "bg-gradient-to-br from-violet-400 to-purple-600", initial: "LS" },
  { bg: "bg-gradient-to-br from-cyan-400 to-blue-500", initial: "RK" },
  { bg: "bg-gradient-to-br from-amber-300 to-orange-500", initial: "JD" },
];

// Hook para animar contador
function useAnimatedCounter(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return { count, ref };
}

// Stat Card Component
function StatCard({ 
  value, 
  label, 
  icon: Icon, 
  delay,
  gradient,
  iconBg,
  accent,
}: { 
  value: number; 
  label: string; 
  icon: React.ElementType;
  delay: number;
  gradient: string;
  iconBg: string;
  accent: string;
}) {
  const { count, ref } = useAnimatedCounter(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ 
        y: -8, 
        scale: 1.03,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${gradient} border border-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-sm group`}
    >
      {/* Subtle gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${accent}10, transparent)` }}
      />
      
      <div className="relative z-10">
        {/* Icon */}
        <motion.div 
          className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4 shadow-lg`}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        
        {/* Value */}
        <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {count.toLocaleString('pt-BR')}
        </div>
        
        {/* Label */}
        <div className="mt-1 text-sm font-medium text-slate-600">
          {label}
        </div>
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
        initial={{ x: "-200%" }}
        whileHover={{ x: "200%" }}
        transition={{ duration: 0.8 }}
      />
    </motion.div>
  );
}

// Background Grid Pattern
function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// Gradient Orbs
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(132,204,22,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Main Hero Component
export default function LinktreeHero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.45, ease: "easeOut" }}>
      <section className="relative min-h-screen bg-white overflow-hidden -mt-6 md:-mt-8">
        {/* Background */}
        <GridPattern />
        <GradientOrbs />

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-160px)]">
            
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Agora com IA integrada
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  <span className="text-slate-900">A ferramenta de</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    link na bio
                  </span>
                  <br />
                  <span className="text-slate-900">rápida e fácil.</span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                O Portyo ajuda criadores e empresas a criar um único link que abriga todo o seu conteúdo, produtos e serviços.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4"
              >
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-900 bg-gradient-to-r from-lime-400 to-green-400 rounded-full shadow-lg shadow-lime-200 hover:shadow-xl hover:shadow-lime-300 hover:scale-105 transition-all duration-300"
                >
                  Começar grátis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                >
                  Explorar todos os planos
                </Link>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="mt-8 flex items-center justify-center lg:justify-start gap-3"
              >
                <div className="flex -space-x-2">
                  {avatars.map((avatar, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: -10 }}
                      animate={isLoaded ? { scale: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                      className={`w-9 h-9 rounded-full ${avatar.bg} flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md`}
                    >
                      {avatar.initial}
                    </motion.div>
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">50.000+</span> creators
                </span>
              </motion.div>
            </div>

            {/* Right Column - Stats Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {statsData.map((stat, i) => (
                  <StatCard
                    key={i}
                    value={stat.value}
                    label={stat.label}
                    icon={stat.icon}
                    delay={stat.delay}
                    gradient={stat.gradient}
                    iconBg={stat.iconBg}
                    accent={stat.accent}
                  />
                ))}
              </div>

              {/* Decorative Elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={isLoaded ? { opacity: 0.5, scale: 1 } : {}}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-lime-300 to-green-400 rounded-full blur-3xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={isLoaded ? { opacity: 0.4, scale: 1 } : {}}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full blur-3xl"
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Portyo",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BRL"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": "50000"
              },
              "description": "O Portyo ajuda criadores e empresas a criar um único link que abriga todo o seu conteúdo, produtos e serviços.",
              "featureList": [
                "Link na Bio",
                "Estatísticas Avançadas",
                "Venda de Produtos",
                "Agendamento",
                "Automação",
                "Analytics Dashboard"
              ]
            })
          }}
        />
      </section>
    </MotionConfig>
  );
}
