import { QrCode } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from "react-i18next";

export default function AnalyticsSection() {
  const { t } = useTranslation();

  useEffect(() => {
    const section = document.getElementById('analytics-section');
    const wrappers = Array.from(document.querySelectorAll('.parallax-wrapper')) as HTMLElement[];
    const bars = Array.from(document.querySelectorAll('.chart-bar')) as HTMLElement[];
    const counter = document.querySelector('.subscriber-count') as HTMLElement | null;
    const salesCounter = document.querySelector('.sales-count') as HTMLElement | null;
    const qrCounter = document.querySelector('.qr-count') as HTMLElement | null;
    const scanLine = document.querySelector('.scan-line') as HTMLElement | null;
    const conversionCounter = document.querySelector('.conversion-count') as HTMLElement | null;
    const conversionBadge = document.querySelector('.conversion-badge') as HTMLElement | null;
    const salesIcon = document.querySelector('.sales-icon') as HTMLElement | null;

    let ticking = false;

    const update = () => {
      if (!section) return;

      const scrolled = window.scrollY;
      const sectionTop = section.offsetTop;
      const viewportHeight = window.innerHeight;
      const startOffset = sectionTop - viewportHeight * 0.8;
      const relativeScroll = Math.max(0, scrolled - startOffset);

      if (window.innerWidth >= 1024) {
        const parallaxOffset = scrolled * -0.05;
        wrappers.forEach((wrapper) => {
          wrapper.style.transform = `translateY(${parallaxOffset}px)`;
        });
      } else {
        wrappers.forEach((wrapper) => {
          wrapper.style.transform = 'none';
        });
      }

      bars.forEach((bar, index) => {
        const growth = Math.min(Math.max(relativeScroll * 0.003 - (index * 0.15), 0), 1.2);
        bar.style.transform = `scaleY(${growth})`;
      });

      const progress = Math.min(Math.max(relativeScroll * 0.002, 0), 1);

      if (counter) {
        const targetValue = 2800;
        const currentValue = Math.floor(progress * targetValue);
        counter.textContent = currentValue.toLocaleString();
      }

      if (salesCounter) {
        const target = 2362;
        const current = Math.floor(progress * target);
        salesCounter.textContent = '$' + current.toLocaleString();
      }

      if (qrCounter) {
        const target = 8200;
        const current = Math.floor(progress * target);
        qrCounter.textContent = (current / 1000).toFixed(1) + 'k';
      }

      if (scanLine) {
        const cycle = (relativeScroll * 0.3) % 200;
        const position = cycle - 50;
        scanLine.style.transform = `translateY(${position}%)`;
        scanLine.style.opacity = cycle > 120 || cycle < -20 ? '0' : '1';
      }

      if (conversionCounter) {
        const target = 12.5;
        const current = (progress * target).toFixed(1);
        conversionCounter.textContent = current + '%';
      }

      if (conversionBadge) {
        const badgeProgress = Math.min(Math.max(relativeScroll * 0.004, 0), 1);
        conversionBadge.style.transform = `scale(${badgeProgress})`;
        conversionBadge.style.opacity = `${badgeProgress}`;
      }

      if (salesIcon) {
        salesIcon.style.transform = `rotate(${relativeScroll * 0.1}deg)`;
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    update();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="analytics-section" className="w-full pt-24 pb-0 px-6 bg-surface-alt overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side - Cards Grid */}
        <div className="relative">
            {/* Decorative background blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-3xl rounded-full -z-10"></div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-[500px] mx-auto lg:mx-0">
            
            {/* Card 1: Subscribers - Dark Theme */}
            <div className="bg-neutral-900 text-white p-6 rounded-3xl aspect-square flex flex-col justify-between shadow-xl hover:scale-[1.02] transition-transform duration-300 border border-white/5">
                <div className="h-full flex items-end pb-2">
                {/* Bar Chart SVG */}
                <svg viewBox="0 0 100 50" className="w-full h-16 fill-primary drop-shadow-md overflow-visible">
                    <rect x="5" y="35" width="12" height="15" rx="3" className="opacity-40 chart-bar origin-bottom" style={{ transformBox: 'fill-box', transition: 'transform 0.1s linear' }} />
                    <rect x="25" y="10" width="12" height="40" rx="3" className="opacity-60 chart-bar origin-bottom" style={{ transformBox: 'fill-box', transition: 'transform 0.1s linear' }} />
                    <rect x="45" y="30" width="12" height="20" rx="3" className="opacity-40 chart-bar origin-bottom" style={{ transformBox: 'fill-box', transition: 'transform 0.1s linear' }} />
                    <rect x="65" y="5" width="12" height="45" rx="3" className="opacity-80 chart-bar origin-bottom" style={{ transformBox: 'fill-box', transition: 'transform 0.1s linear' }} />
                    <rect x="85" y="0" width="12" height="50" rx="3" className="chart-bar origin-bottom" style={{ transformBox: 'fill-box', transition: 'transform 0.1s linear' }} />
                </svg>
                </div>
                <div>
                <div className="subscriber-count text-4xl font-bold tracking-tight">0</div>
                <div className="text-sm text-gray-200 font-medium mt-1">{t("home.analytics.cards.subscribers")}</div>
                </div>
            </div>

            {/* Card 2: QR Code - White Theme */}
            <div className="parallax-wrapper lg:mt-12 transition-transform duration-75 ease-out will-change-transform">
                <div className="bg-white text-neutral-900 p-6 rounded-3xl aspect-square flex flex-col justify-center items-center gap-3 shadow-xl hover:scale-[1.02] transition-transform duration-300 border border-border/50 relative overflow-hidden">
                    <div className="w-20 h-20 bg-neutral-900 rounded-xl p-2 flex items-center justify-center relative z-10 overflow-hidden">
                        <QrCode className="w-12 h-12 text-white relative z-10" />
                        {/* Scan Line Overlay */}
                        <div className="scan-line absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-transparent via-primary/80 to-transparent -translate-y-full z-20 blur-sm"></div>
                    </div>
                    
                    <div className="text-center mt-2 relative z-10">
                        <div className="qr-count text-4xl font-bold tracking-tighter">0</div>
                          <div className="text-sm font-bold mt-1 uppercase tracking-wide text-gray-700">{t("home.analytics.cards.qrScans")}</div>
                    </div>
                </div>
            </div>

            {/* Card 3: Sales - Primary Theme */}
            <div className="bg-primary text-primary-foreground p-6 rounded-3xl aspect-square flex flex-col justify-center items-center gap-4 shadow-xl hover:scale-[1.02] transition-transform duration-300">
                <div className="sales-icon w-14 h-14 rounded-full border-2 border-black/10 flex items-center justify-center text-3xl font-light bg-white/20 backdrop-blur-sm">
                    $
                </div>
                <div className="text-center">
                    <div className="sales-count text-4xl font-bold tracking-tight">$0</div>
                    <div className="text-sm font-medium mt-1 opacity-80">{t("home.analytics.cards.sales")}</div>
                </div>
            </div>

            {/* Card 4: Conversion - Secondary Theme */}
            <div className="parallax-wrapper lg:mt-12 transition-transform duration-75 ease-out will-change-transform">
                <div className="bg-secondary text-primary-foreground p-6 rounded-3xl aspect-square flex flex-col justify-between shadow-xl hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    
                    <div className="relative z-10 w-full flex justify-between items-start">
                        <span className="conversion-badge text-xs font-medium bg-white/40 px-2 py-1 rounded-md backdrop-blur-sm text-black/90 opacity-0 transition-all duration-500">{t("home.analytics.cards.conversionBadge")}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>

                    <div className="relative z-10 text-center mt-auto mb-4">
                        <div className="conversion-count text-5xl font-bold tracking-tighter">0%</div>
                          <div className="text-sm font-medium mt-1 opacity-80">{t("home.analytics.cards.conversionRate")}</div>
                    </div>
                </div>
            </div>

            </div>
        </div>

        {/* Right Side - Text Content */}
        <div className="flex flex-col gap-8 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
          <h2 className="text-5xl lg:text-7xl font-extrabold text-text-main tracking-tight leading-[1.1]">
            {t("home.analytics.title")}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {t("home.analytics.subtitle")}
          </p>
        </div>

      </div>
    </section>
  );
}
