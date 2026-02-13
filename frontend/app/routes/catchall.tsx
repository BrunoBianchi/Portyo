import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function CatchAll() {
  const location = useLocation();
  const { t } = useTranslation("home");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isDashboard = location.pathname.startsWith("/dashboard");
  const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
  const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="text-center relative z-10 max-w-2xl mx-auto">
        {/* 404 Number with Animation */}
        <div className="relative mb-8">
          <h1 
            className="text-[180px] md:text-[220px] font-bold leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #666666 50%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(255,255,255,0.1)',
            }}
          >
            404
          </h1>
          
          {/* Floating Particles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/20"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            {t("home.catchall.title")}
          </h2>
          <p className="text-lg text-white/60 max-w-md mx-auto leading-relaxed">
            {t("home.catchall.description")}
          </p>
        </div>

        {/* Error Code Display */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-white/50 font-mono">
            Error: 404_NOT_FOUND
          </span>
          <span className="text-white/30">|</span>
          <span className="text-sm text-white/50 font-mono truncate max-w-[200px]">
            {location.pathname}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={withLang(isDashboard ? "/dashboard" : "/")}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0a0a0f] rounded-xl font-semibold text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isDashboard ? t("home.catchall.backDashboard") : t("home.catchall.backHome")}
          </Link>

          <Link
            to={withLang("/contact")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {t("home.catchall.contactSupport")}
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-white/40 mb-4">{t("home.catchall.popularLinks")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: t("home.catchall.pricing"), href: "/pricing" },
              { label: t("home.catchall.themes"), href: "/themes" },
              { label: "Blog", href: "/blog" },
            ].map((link) => (
              <Link
                key={link.href}
                to={withLang(link.href)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Brand */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#0a0a0f] font-bold text-lg">P</span>
        </div>
        <span className="text-white/40 text-sm">Portyo</span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
