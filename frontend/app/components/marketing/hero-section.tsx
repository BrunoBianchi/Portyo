import { useEffect, useRef, useState } from "react";
import ClaimUsernameInput from "./claim-username-input";
import { useTranslation } from "react-i18next";

// Cards with scattered positions and smooth animations
const floatingCards = [
  // Left side cards - will animate from left to right
  { src: "/hero-card-collab.png", alt: "Brand collaboration", side: "left", x: "2%", y: "15%", speed: 0.4, rotate: -15, scale: 0.88, delay: 0, floatSpeed: 3.5 },
  { src: "/hero-card-product.png", alt: "Digital product", side: "left", x: "8%", y: "48%", speed: 0.55, rotate: 12, scale: 0.82, delay: 150, floatSpeed: 4.2 },
  { src: "/hero-card-sales.png", alt: "Sales metrics", side: "left", x: "0%", y: "72%", speed: 0.35, rotate: -8, scale: 0.78, delay: 300, floatSpeed: 3.8 },
  { src: "/hero-card-store.png", alt: "Your store", side: "left", x: "14%", y: "32%", speed: 0.5, rotate: 16, scale: 0.74, delay: 200, floatSpeed: 4.5 },
  // Right side cards - will animate from right to left  
  { src: "/hero-card-earnings.png", alt: "Earnings", side: "right", x: "0%", y: "12%", speed: 0.45, rotate: 14, scale: 0.88, delay: 100, floatSpeed: 4.0 },
  { src: "/hero-card-message.png", alt: "Message", side: "right", x: "10%", y: "52%", speed: 0.5, rotate: -10, scale: 0.82, delay: 250, floatSpeed: 3.6 },
  { src: "/hero-card-followers.png", alt: "Followers", side: "right", x: "-2%", y: "36%", speed: 0.4, rotate: 8, scale: 0.78, delay: 150, floatSpeed: 4.3 },
  { src: "/hero-card-clicks.png", alt: "Link clicks", side: "right", x: "6%", y: "68%", speed: 0.6, rotate: -14, scale: 0.85, delay: 350, floatSpeed: 3.9 },
  { src: "/hero-card-calendar.png", alt: "Calendar", side: "right", x: "16%", y: "24%", speed: 0.45, rotate: 10, scale: 0.7, delay: 400, floatSpeed: 4.1 },
];

export default function HeroSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [time, setTime] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Idle floating animation
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setTime(Date.now() / 1000);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Scroll parallax - limited range
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Limit scroll progress to stay within hero section
      const scrollProgress = Math.max(0, Math.min(0.5, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      setScrollY(scrollProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[800px] bg-[#f9f4e8] flex flex-col items-center justify-center py-20 overflow-hidden"
    >
      {/* Decorative subtle gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
            transform: `translateY(${scrollY * 60}px) rotate(${scrollY * 20}deg)`,
          }}
        />
        <div
          className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.25) 0%, transparent 70%)',
            transform: `translateY(${scrollY * 80}px)`,
          }}
        />
        <div
          className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            transform: `translateY(${scrollY * -40}px)`,
          }}
        />
      </div>

      {/* Floating Cards Container - clips to section bounds */}
      <div className="absolute inset-0 overflow-hidden" suppressHydrationWarning>
        {/* Left Side Cards - Animate from left */}
        {hydrated && floatingCards.filter(c => c.side === 'left').map((card, i) => {
          // Capped parallax effect to prevent overflow
          const xParallax = Math.min(scrollY * (80 + card.speed * 100), 80);
          const yParallax = Math.min(scrollY * card.speed * 60, 40);
          const rotateParallax = scrollY * 8;

          // Subtle idle floating animation
          const floatX = Math.sin(time * card.floatSpeed + i) * 3;
          const floatY = Math.cos(time * card.floatSpeed * 0.7 + i * 2) * 4;
          const floatRotate = Math.sin(time * card.floatSpeed * 0.5 + i * 3) * 1.5;

          return (
            <div
              key={card.src}
              className="absolute transition-all ease-out hidden lg:block"
              style={{
                left: card.x,
                top: card.y,
                transform: `
                  translateX(${isVisible ? xParallax + floatX : -500}px) 
                  translateY(${yParallax + floatY}px) 
                  rotate(${card.rotate + rotateParallax + floatRotate}deg) 
                  scale(${isVisible ? card.scale : 0.3})
                `,
                opacity: isVisible ? 1 : 0,
                transitionDuration: isVisible ? '100ms' : '1000ms',
                transitionDelay: isVisible ? '0ms' : `${card.delay}ms`,
                zIndex: 10 + i,
              }}
            >
              <img
                src={card.src}
                alt={card.alt}
                className="w-28 xl:w-36 h-auto rounded-2xl shadow-2xl shadow-gray-400/40 hover:shadow-gray-400/70 hover:scale-125 hover:rotate-0 transition-all duration-500 cursor-pointer"
              />
            </div>
          );
        })}

        {/* Right Side Cards - Animate from right */}
        {hydrated && floatingCards.filter(c => c.side === 'right').map((card, i) => {
          // Capped parallax effect to prevent overflow
          const xParallax = Math.max(scrollY * -(80 + card.speed * 100), -80);
          const yParallax = Math.min(scrollY * card.speed * 60, 40);
          const rotateParallax = scrollY * -8;

          // Subtle idle floating animation
          const floatX = Math.sin(time * card.floatSpeed + i + 5) * 3;
          const floatY = Math.cos(time * card.floatSpeed * 0.7 + i * 2 + 5) * 4;
          const floatRotate = Math.sin(time * card.floatSpeed * 0.5 + i * 3 + 5) * 1.5;

          return (
            <div
              key={card.src}
              className="absolute transition-all ease-out hidden lg:block"
              style={{
                right: card.x,
                top: card.y,
                transform: `
                  translateX(${isVisible ? xParallax + floatX : 500}px) 
                  translateY(${yParallax + floatY}px) 
                  rotate(${card.rotate + rotateParallax + floatRotate}deg) 
                  scale(${isVisible ? card.scale : 0.3})
                `,
                opacity: isVisible ? 1 : 0,
                transitionDuration: isVisible ? '100ms' : '1000ms',
                transitionDelay: isVisible ? '0ms' : `${card.delay}ms`,
                zIndex: 10 + i,
              }}
            >
              <img
                src={card.src}
                alt={card.alt}
                className="w-28 xl:w-36 h-auto rounded-2xl shadow-2xl shadow-gray-400/40 hover:shadow-gray-400/70 hover:scale-125 hover:rotate-0 transition-all duration-500 cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-30 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto">
        {/* Main Headline */}
        <div
          className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
            <span className="inline-block animate-fade-word" style={{ animationDelay: '0ms' }}>
              {t("home.hero.convert.word1", "Convert")}
            </span>{" "}
            <span className="inline-block animate-fade-word" style={{ animationDelay: '60ms' }}>
              {t("home.hero.convert.word2", "your")}
            </span>{" "}
            <span className="inline-block animate-fade-word" style={{ animationDelay: '120ms' }}>
              {t("home.hero.convert.word3", "followers")}
            </span>
            <br className="hidden sm:block" />
            <span className="inline-block animate-fade-word" style={{ animationDelay: '180ms' }}>
              {t("home.hero.convert.word4", "into")}
            </span>{" "}
            <span className="inline-block animate-fade-word relative" style={{ animationDelay: '240ms' }}>
              {t("home.hero.convert.word5", "customers")}
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-amber-300/70 -z-10 rounded-sm" />
            </span>{" "}
            <span className="inline-block animate-fade-word" style={{ animationDelay: '300ms' }}>
              {t("home.hero.convert.word6", "with")}
            </span>
            <br className="hidden sm:block" />
            <span className="inline-block animate-fade-word" style={{ animationDelay: '360ms' }}>
              {t("home.hero.convert.word7", "one")}
            </span>{" "}
            <span className="inline-block animate-fade-word" style={{ animationDelay: '420ms' }}>
              {t("home.hero.convert.word8", "link")}
            </span>
          </h1>
        </div>

        {/* Username Claim Input */}
        <div
          className={`mt-10 w-full max-w-xl transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          <ClaimUsernameInput variant="minimal" />
        </div>

        {/* Product Hunt Badge */}
        <div
          className={`mt-6 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <a
            href="https://www.producthunt.com/products/portyo-me-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-portyo-me-2"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform duration-300 drop-shadow-lg hover:drop-shadow-xl inline-block"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1063792&theme=neutral&t=1768577104057"
              alt="Portyo.me | Product Hunt"
              style={{ width: '180px', height: '40px' }}
              width="180"
              height="40"
            />
          </a>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-word {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-word {
          animation: fade-word 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
