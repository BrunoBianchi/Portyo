import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, TrendingUp, Users, ShoppingBag, Globe } from "lucide-react";
import { Link } from "react-router";

// Stats data para os cards
const statsData = [
  { 
    icon: TrendingUp, 
    value: "43.500", 
    label: "Cliques rastreados",
    gradient: "from-amber-100 to-yellow-50",
    iconBg: "bg-amber-200",
    iconColor: "text-amber-700"
  },
  { 
    icon: Users, 
    value: "643", 
    label: "Usuários ativos",
    gradient: "from-rose-100 to-pink-50",
    iconBg: "bg-rose-200",
    iconColor: "text-rose-700"
  },
  { 
    icon: ShoppingBag, 
    value: "2.362", 
    label: "Produtos vendidos",
    gradient: "from-violet-100 to-purple-50",
    iconBg: "bg-violet-200",
    iconColor: "text-violet-700"
  },
  { 
    icon: Globe, 
    value: "960", 
    label: "Visitas diárias",
    gradient: "from-cyan-100 to-sky-50",
    iconBg: "bg-cyan-200",
    iconColor: "text-cyan-700"
  },
];

// Avatares para o social proof
const avatars = [
  { bg: "bg-gradient-to-br from-pink-400 to-rose-500", initial: "AM" },
  { bg: "bg-gradient-to-br from-violet-400 to-purple-600", initial: "LS" },
  { bg: "bg-gradient-to-br from-cyan-400 to-blue-500", initial: "RK" },
  { bg: "bg-gradient-to-br from-amber-300 to-orange-500", initial: "JD" },
];

// Animações
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const fadeIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardFloatVariants = {
  initial: (i: number) => ({
    opacity: 0,
    y: 40,
    scale: 0.95,
  }),
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.6 + i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function HeroSection() {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  return (
    <section 
      className="relative w-full min-h-screen bg-white overflow-hidden"
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40"
          style={{ 
            background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ 
            background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ 
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-200px)]">
          
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            
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
              itemProp="description"
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
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${avatar.bg} flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md`}
                  >
                    {avatar.initial}
                  </div>
                ))}
              </div>
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">50.000+</span> creators
              </span>
            </motion.div>
          </div>

          {/* Right Column - Stats Cards */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate={isLoaded ? "animate" : "initial"}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {statsData.map((stat, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardFloatVariants}
                  className={`group relative p-5 rounded-3xl bg-gradient-to-br ${stat.gradient} border border-white/50 shadow-lg shadow-slate-200/50 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/80 hover:scale-[1.02] transition-all duration-300 ${i === 1 || i === 2 ? 'translate-y-6' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  
                  {/* Value */}
                  <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-1 text-sm font-medium text-slate-600">
                    {stat.label}
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isLoaded ? { opacity: 0.6, scale: 1 } : {}}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-lime-300 to-green-400 rounded-full blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isLoaded ? { opacity: 0.4, scale: 1 } : {}}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full blur-2xl"
            />
          </motion.div>
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
      </div>

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
  );
}
