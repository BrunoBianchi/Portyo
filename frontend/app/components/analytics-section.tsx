import { QrCode } from 'lucide-react';
import React, { useEffect } from 'react';

export default function AnalyticsSection() {
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const section = document.getElementById('analytics-section');
      
      // Parallax for columns
      const wrappers = document.querySelectorAll('.parallax-wrapper');
      wrappers.forEach((wrapper) => {
        if (window.innerWidth >= 1024) {
          (wrapper as HTMLElement).style.transform = `translateY(${scrolled * -0.05}px)`;
        } else {
          (wrapper as HTMLElement).style.transform = 'none';
        }
      });

      if (section) {
        const sectionTop = section.offsetTop;
        const viewportHeight = window.innerHeight;
        const startOffset = sectionTop - viewportHeight * 0.8; // Start slightly before it enters
        
        // Calculate relative scroll progress for the section
        // We want a value that increases as we scroll down past the section start
        const relativeScroll = Math.max(0, scrolled - startOffset);
        
        // Animate Bars (Subscribers)
        const bars = document.querySelectorAll('.chart-bar');
        bars.forEach((bar, index) => {
            // Create a wave effect based on scroll
            // The factor 0.002 controls the speed of growth relative to scroll pixels
            // The index creates the delay/wave
            const growth = Math.min(Math.max(relativeScroll * 0.003 - (index * 0.15), 0), 1.2); // Allow slight overshoot to 1.2 for "pop"
            const finalScale = Math.min(growth, 1); // Clamp back to 1 for final state if needed, or keep overshoot
            (bar as HTMLElement).style.transform = `scaleY(${growth})`;
        });

        // Animate Counter
        const counter = document.querySelector('.subscriber-count');
        if (counter) {
            // Calculate progress from 0 to 1 based on scroll
            // Using a similar logic to the bars but smoother
            const progress = Math.min(Math.max(relativeScroll * 0.002, 0), 1);
            const targetValue = 2800;
            const currentValue = Math.floor(progress * targetValue);
            counter.textContent = currentValue.toLocaleString();
        }

        // Animate Sales Count
        const salesCounter = document.querySelector('.sales-count');
        if (salesCounter) {
            const progress = Math.min(Math.max(relativeScroll * 0.002, 0), 1);
            const target = 2362;
            const current = Math.floor(progress * target);
            salesCounter.textContent = '$' + current.toLocaleString();
        }

        // Animate QR Count
        const qrCounter = document.querySelector('.qr-count');
        if (qrCounter) {
            const progress = Math.min(Math.max(relativeScroll * 0.002, 0), 1);
            const target = 8200;
            const current = Math.floor(progress * target);
            qrCounter.textContent = (current / 1000).toFixed(1) + 'k';
        }

        // Animate Scan Line
        const scanLine = document.querySelector('.scan-line');
        if (scanLine) {
            // Move the scan line based on scroll
            // It will cycle through the QR code as you scroll
            const cycle = (relativeScroll * 0.3) % 200; // 0 to 200 range
            const position = cycle - 50; // -50% to 150%
            (scanLine as HTMLElement).style.transform = `translateY(${position}%)`;
            (scanLine as HTMLElement).style.opacity = cycle > 120 || cycle < -20 ? '0' : '1'; // Fade out at ends
        }

        // Animate Conversion Count
        const conversionCounter = document.querySelector('.conversion-count');
        if (conversionCounter) {
            const progress = Math.min(Math.max(relativeScroll * 0.002, 0), 1);
            const target = 12.5;
            const current = (progress * target).toFixed(1);
            conversionCounter.textContent = current + '%';
        }

        // Animate Conversion Badge
        const conversionBadge = document.querySelector('.conversion-badge');
        if (conversionBadge) {
             const progress = Math.min(Math.max(relativeScroll * 0.004, 0), 1);
             (conversionBadge as HTMLElement).style.transform = `scale(${progress})`;
             (conversionBadge as HTMLElement).style.opacity = `${progress}`;
        }

        // Animate Sales Icon (Rotate)
        const salesIcon = document.querySelector('.sales-icon');
        if (salesIcon) {
            // Rotate based on scroll
            (salesIcon as HTMLElement).style.transform = `rotate(${relativeScroll * 0.1}deg)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="analytics-section" className="w-full py-24 px-6 bg-surface-alt overflow-hidden">
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
                <div className="text-sm text-gray-400 font-medium mt-1">Subscribers</div>
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
                        <div className="text-sm font-bold mt-1 uppercase tracking-wide text-text-muted">QR Scans</div>
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
                    <div className="text-sm font-medium mt-1 opacity-80">Sales</div>
                </div>
            </div>

            {/* Card 4: Conversion - Secondary Theme */}
            <div className="parallax-wrapper lg:mt-12 transition-transform duration-75 ease-out will-change-transform">
                <div className="bg-secondary text-primary-foreground p-6 rounded-3xl aspect-square flex flex-col justify-between shadow-xl hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    
                    <div className="relative z-10 w-full flex justify-between items-start">
                        <span className="conversion-badge text-xs font-medium bg-white/40 px-2 py-1 rounded-md backdrop-blur-sm text-black/70 opacity-0 transition-all duration-500">+24%</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>

                    <div className="relative z-10 text-center mt-auto mb-4">
                        <div className="conversion-count text-5xl font-bold tracking-tighter">0%</div>
                        <div className="text-sm font-medium mt-1 opacity-80">Conversion Rate</div>
                    </div>
                </div>
            </div>

            </div>
        </div>

        {/* Right Side - Text Content */}
        <div className="flex flex-col gap-8 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
          <h2 className="text-5xl lg:text-7xl font-extrabold text-text-main tracking-tight leading-[1.1]">
            Turn every interaction into opportunity
          </h2>
          <p className="text-xl text-text-muted leading-relaxed">
            Gain deep insights into your audience behavior. From QR scans to sales conversion, track what matters most and optimize your digital presence for real growth.
          </p>
        </div>

      </div>
    </section>
  );
}
