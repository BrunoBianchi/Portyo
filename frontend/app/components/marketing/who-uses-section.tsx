import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Marquee items with text and optional icon indicator
const row1Items = [
    { type: "text", content: "MUSIC" },
    { type: "icon", content: "spotify", label: "Spotify" },
    { type: "text", content: "VIDEOS" },
    { type: "icon", content: "youtube", label: "YouTube" },
    { type: "text", content: "PRODUCTS" },
    { type: "icon", content: "shopify", label: "Shopify" },
    { type: "text", content: "COURSES" },
];

const row2Items = [
    { type: "text", content: "PODCASTS" },
    { type: "icon", content: "tiktok", label: "TikTok" },
    { type: "text", content: "PORTFOLIOS" },
    { type: "icon", content: "dribbble", label: "Dribbble" },
    { type: "text", content: "EVENTS" },
    { type: "icon", content: "instagram", label: "Instagram" },
    { type: "text", content: "BOOKINGS" },
];

const row3Items = [
    { type: "text", content: "PAYMENTS" },
    { type: "icon", content: "twitter", label: "Twitter" },
    { type: "text", content: "SOCIAL LINKS" },
    { type: "icon", content: "linkedin", label: "LinkedIn" },
    { type: "text", content: "MERCH" },
    { type: "icon", content: "twitch", label: "Twitch" },
    { type: "text", content: "& MORE" },
];

// Simple SVG icons for the marquee
const icons: Record<string, React.ReactNode> = {
    instagram: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    ),
    twitch: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
        </svg>
    ),
    spotify: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
    ),
    tiktok: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
    ),
    dribbble: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.428 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" />
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    ),
    twitter: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    shopify: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 md:w-20 md:h-20">
            <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104zm-2.235-17.71c-.151-.096-.328-.143-.504-.143-1.311 0-2.79 1.636-3.229 4.09l2.413-.744s-.526-2.16 1.32-3.203zm.456-.247c.034.082.034.19.034.318v.123l-3.621 1.115c.694-2.685 2.012-3.98 3.295-3.98.137 0 .261.014.361.045-.045.068-.069.141-.069.249zm1.04-1.413c.09.068.159.187.159.374a3.556 3.556 0 01-.06.619l-4.554 1.4c.829-3.197 2.558-4.769 4.006-4.769.305 0 .585.096.791.26-.15.151-.264.345-.342.456z" />
        </svg>
    ),
};

interface MarqueeRowProps {
    items: typeof row1Items;
    direction?: "left" | "right";
    speed?: number;
}

function MarqueeRow({ items, direction = "left", speed = 40 }: MarqueeRowProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Duplicate items for seamless loop
    const duplicatedItems = [...items, ...items, ...items];

    return (
        <div
            ref={containerRef}
            className="relative flex overflow-hidden whitespace-nowrap"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className={`flex items-center gap-4 md:gap-8 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
                    }`}
                style={{
                    animationDuration: `${speed}s`,
                    animationPlayState: isPaused ? "paused" : "running",
                }}
            >
                {duplicatedItems.map((item, idx) => (
                    <div key={`${item.content}-${idx}`} className="flex-shrink-0 flex items-center">
                        {item.type === "text" ? (
                            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black italic text-[#6B94FB] tracking-tight leading-none select-none">
                                {item.content}
                            </span>
                        ) : (
                            <span className="text-gray-900" title={item.label}>
                                {icons[item.content]}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function WhoUsesSection() {
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-full py-16 md:py-24 bg-[#FDFDF3] overflow-hidden"
        >
            {/* Edge fade gradients */}
            <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#FDFDF3] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#FDFDF3] to-transparent z-10 pointer-events-none" />

            {/* Section Header */}
            <div
                className={`text-center mb-10 md:mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <span className="text-sm md:text-base font-medium text-gray-600 tracking-widest uppercase">
                    {t("home.allInOne.label", "Everything in One Link")}
                </span>
            </div>

            {/* Marquee Rows */}
            <div
                className={`space-y-2 md:space-y-4 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100" : "opacity-0"
                    }`}
            >
                <MarqueeRow items={row1Items} direction="left" speed={50} />
                <MarqueeRow items={row2Items} direction="right" speed={45} />
                <MarqueeRow items={row3Items} direction="left" speed={55} />
            </div>

            {/* Custom animation styles */}
            <style>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes marquee-right {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-marquee-left {
          animation: marquee-left linear infinite;
        }

        .animate-marquee-right {
          animation: marquee-right linear infinite;
        }
      `}</style>
        </section>
    );
}
