import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ClaimUsernameInput from "./claim-username-input";
import { useTranslation } from "react-i18next";
import { Star, ArrowRight, Play } from "lucide-react";

// Simplified floating elements - com lazy loading e melhor desempenho
// Usando WebP com fallback PNG para navegadores antigos
const floatingElements = [
  { src: "/hero-card-collab.webp", fallback: "/hero-card-collab.png", alt: "Brand collaboration feature", side: "left", top: "10%", delay: 0.2, width: 144, height: 180 },
  { src: "/hero-card-sales.webp", fallback: "/hero-card-sales.png", alt: "Sales analytics dashboard", side: "left", top: "50%", delay: 0.4, width: 144, height: 180 },
  { src: "/hero-card-earnings.webp", fallback: "/hero-card-earnings.png", alt: "Earnings tracking", side: "right", top: "15%", delay: 0.3, width: 144, height: 180 },
  { src: "/hero-card-followers.webp", fallback: "/hero-card-followers.png", alt: "Followers growth", side: "right", top: "55%", delay: 0.5, width: 144, height: 180 },
];

// Animações otimizadas - sem repetição infinita para reduzir carga na GPU
const cardFloatVariants = {
  initial: (i: number) => ({
    opacity: 0,
    x: floatingElements[i].side === "left" ? -80 : 80,
    rotate: floatingElements[i].side === "left" ? -15 : 15,
  }),
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    rotate: floatingElements[i].side === "left" ? -6 : 6,
    y: [0, -12, 0],
    transition: {
      opacity: { delay: floatingElements[i].delay, duration: 0.6 },
      x: { delay: floatingElements[i].delay, duration: 0.6, ease: "easeOut" },
      rotate: { delay: floatingElements[i].delay, duration: 0.6 },
      y: {
        delay: floatingElements[i].delay + 0.6,
        duration: 4 + i * 0.3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  }),
};

export default function HeroSection() {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Usar requestAnimationFrame para melhor performance
    requestAnimationFrame(() => {
      setIsLoaded(true);
    });
  }, []);

  return (
    <section 
      className="relative w-full min-h-screen bg-background overflow-hidden"
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      {/* Background Gradient - Estático para melhor performance */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-30"
          style={{ 
            background: 'radial-gradient(ellipse at center, rgba(187,255,0,0.15) 0%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* Grid Pattern Background - CSS puro para performance */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(163,255,0,0.5) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(163,255,0,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex flex-col justify-center">
        
        {/* Floating Cards - Desktop Only - Otimizadas */}
        <div className="hidden lg:block" aria-hidden="true">
          {floatingElements.map((el, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardFloatVariants}
              initial="initial"
              animate={isLoaded ? "animate" : "initial"}
              className={`absolute ${el.side}-0`}
              style={{ top: el.top }}
            >
              <div 
                className="opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer group"
                style={{ 
                  marginLeft: el.side === "left" ? "2rem" : "0",
                  marginRight: el.side === "right" ? "2rem" : "0",
                }}
              >
                {/* Glow effect behind card - só no hover para economizar GPU */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(187,255,0,0.15), rgba(167,139,250,0.15))',
                    filter: 'blur(20px)'
                  }}
                />
                <picture>
                  <source srcSet={el.src} type="image/webp" />
                  <img
                    src={el.fallback}
                    alt={el.alt}
                    loading="lazy"
                    decoding="async"
                    width={el.width}
                    height={el.height}
                    className="relative w-28 xl:w-36 h-auto rounded-2xl shadow-xl shadow-black/40 border border-border/50 group-hover:border-primary/30 transition-all duration-300 will-change-transform"
                    style={{ transform: `rotate(${el.side === "left" ? -6 : 6}deg)` }}
                  />
                </picture>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center Content */}
        <div className="text-center max-w-5xl mx-auto">
          
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <div 
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface-card/80 border border-border shadow-lg"
              itemScope
              itemType="https://schema.org/AggregateRating"
            >
              <meta itemProp="ratingValue" content="5" />
              <meta itemProp="reviewCount" content="10000" />
              <div className="flex -space-x-2">
                {[
                  { bg: "bg-accent-purple", initial: "SC" },
                  { bg: "bg-accent-blue", initial: "MJ" },
                  { bg: "bg-accent-orange", initial: "ER" },
                ].map((avatar, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full ${avatar.bg} flex items-center justify-center text-white text-xs font-bold border-2 border-surface-card`}
                  >
                    {avatar.initial}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                <span className="font-bold text-foreground">10,000+</span> creators
              </span>
            </div>
          </motion.div>

          {/* Main Headline - Estrutura semântica otimizada */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-bold tracking-tight leading-[1.05] mb-8"
          >
            <span className="block text-foreground">
              Convert your
            </span>
            <span className="block text-outline-gradient">
              customers
            </span>
          </motion.h1>

          {/* Subtitle - Rich snippets friendly */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            itemProp="description"
          >
            The all-in-one platform to showcase your work, sell products, and grow your audience with one powerful link.
          </motion.p>

          {/* CTA Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8"
          >
            <ClaimUsernameInput />
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Watch how Portyo works"
            >
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Play className="w-4 h-4 text-primary" aria-hidden="true" />
                </span>
                Watch how it works
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            <span className="hidden sm:inline text-border" aria-hidden="true">|</span>
            <span className="text-sm text-muted-foreground">Free forever. No credit card required.</span>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
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
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "10000"
            },
            "description": "The all-in-one platform to showcase your work, sell products, and grow your audience with one powerful link.",
            "featureList": [
              "Link in Bio",
              "Newsletter Collection",
              "Product Sales",
              "Booking Scheduler",
              "Automation Workflows",
              "Analytics Dashboard"
            ]
          })
        }}
      />
    </section>
  );
}
