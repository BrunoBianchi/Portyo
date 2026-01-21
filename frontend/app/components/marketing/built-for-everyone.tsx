import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

interface FloatingLabel {
  key: string;
  color: "lime" | "purple" | "cyan" | "blue";
  position: { top: string; left: string };
  zIndex: number; // 1 = behind text, 3 = in front
  parallaxSpeed: number; // Multiplier for parallax effect (higher = faster movement)
  floatOffsetX: number; // Base floating animation offset X
  floatOffsetY: number; // Base floating animation offset Y
}

// Labels positioned to create depth effect - some behind, some in front
const labels: FloatingLabel[] = [
  // BEHIND the text (z-index: 1) - these will be partially obscured by the text
  { key: "engineers", color: "blue", position: { top: "38%", left: "2%" }, zIndex: 1, parallaxSpeed: 0.3, floatOffsetX: 8, floatOffsetY: -10 },
  { key: "academics", color: "purple", position: { top: "32%", left: "22%" }, zIndex: 1, parallaxSpeed: 0.5, floatOffsetX: -6, floatOffsetY: 12 },
  { key: "doctors", color: "blue", position: { top: "62%", left: "28%" }, zIndex: 1, parallaxSpeed: 0.4, floatOffsetX: 10, floatOffsetY: 8 },
  { key: "interns", color: "cyan", position: { top: "58%", left: "68%" }, zIndex: 1, parallaxSpeed: 0.35, floatOffsetX: -8, floatOffsetY: -12 },
  { key: "professionals", color: "cyan", position: { top: "38%", left: "72%" }, zIndex: 1, parallaxSpeed: 0.45, floatOffsetX: 5, floatOffsetY: 10 },
  { key: "architects", color: "lime", position: { top: "50%", left: "20%" }, zIndex: 3, parallaxSpeed: 0.6, floatOffsetX: -10, floatOffsetY: 15 },

  // IN FRONT of the text (z-index: 3) - these float over the text
  { key: "musicians", color: "purple", position: { top: "12%", left: "10%" }, zIndex: 3, parallaxSpeed: 0.6, floatOffsetX: -10, floatOffsetY: 15 },
  { key: "creators", color: "cyan", position: { top: "8%", left: "42%" }, zIndex: 3, parallaxSpeed: 0.7, floatOffsetX: 12, floatOffsetY: -8 },
  { key: "lawyers", color: "lime", position: { top: "10%", left: "78%" }, zIndex: 3, parallaxSpeed: 0.55, floatOffsetX: -15, floatOffsetY: 10 },
  { key: "bankers", color: "lime", position: { top: "30%", left: "32%" }, zIndex: 3, parallaxSpeed: 0.65, floatOffsetX: 8, floatOffsetY: -12 },
  { key: "founders", color: "lime", position: { top: "65%", left: "48%" }, zIndex: 3, parallaxSpeed: 0.5, floatOffsetX: -10, floatOffsetY: 8 },
  { key: "teachers", color: "cyan", position: { top: "75%", left: "56%" }, zIndex: 3, parallaxSpeed: 0.4, floatOffsetX: 6, floatOffsetY: -15 },
  { key: "students", color: "purple", position: { top: "68%", left: "82%" }, zIndex: 3, parallaxSpeed: 0.6, floatOffsetX: -12, floatOffsetY: 10 },
  { key: "sideHustlers", color: "cyan", position: { top: "70%", left: "4%" }, zIndex: 3, parallaxSpeed: 0.55, floatOffsetX: 10, floatOffsetY: -8 },
  { key: "designers", color: "purple", position: { top: "48%", left: "88%" }, zIndex: 3, parallaxSpeed: 0.45, floatOffsetX: -8, floatOffsetY: 12 },
];

const colorClasses: Record<FloatingLabel["color"], string> = {
  lime: "bg-[#c8f542] text-gray-900",
  purple: "bg-[#a78bfa] text-gray-900",
  cyan: "bg-[#67e8f9] text-gray-900",
  blue: "bg-[#60a5fa] text-gray-900",
};

export default function BuiltForEveryoneSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [floatTime, setFloatTime] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let startTime = Date.now();

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how much of the section is visible
      // -1 when section is below viewport, 0 when centered, +1 when above
      const progress = (windowHeight / 2 - rect.top - rect.height / 2) / (windowHeight + rect.height);
      setScrollProgress(Math.max(-1, Math.min(1, progress * 2)));
    };

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setFloatTime(elapsed);
      handleScroll();
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getParallaxTransform = (label: FloatingLabel) => {
    // Parallax movement based on scroll
    const parallaxY = scrollProgress * 80 * label.parallaxSpeed;
    const parallaxX = scrollProgress * 30 * label.parallaxSpeed * (label.position.left.includes("8") ? -1 : 1);

    // Floating animation based on time
    const floatX = Math.sin(floatTime * 0.8 + label.parallaxSpeed * 10) * label.floatOffsetX;
    const floatY = Math.cos(floatTime * 0.6 + label.parallaxSpeed * 8) * label.floatOffsetY;

    return `translate(${parallaxX + floatX}px, ${parallaxY + floatY}px)`;
  };

  const mobileLabelKeys = [
    "creators",
    "musicians",
    "engineers",
    "designers",
    "teachers",
    "students",
    "lawyers",
    "doctors",
    "architects",
    "professionals",
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0B0E14] pt-16 pb-16 md:pt-20 md:pb-32 lg:pt-24 lg:pb-40 -mt-10"
    >
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Floating Labels - Behind Text */}
        {labels.filter(l => l.zIndex === 1).map((label) => (
          <div
            key={label.key}
            className={`
              absolute px-4 py-2 rounded-full font-semibold text-sm md:text-base whitespace-nowrap hidden md:flex
              ${colorClasses[label.color]}
              transition-transform duration-100 ease-out
            `}
            style={{
              top: label.position.top,
              left: label.position.left,
              zIndex: 1,
              transform: getParallaxTransform(label),
            }}
          >
            {t(`builtForEveryone.labels.${label.key}`)}
          </div>
        ))}

        {/* Main Text Container - z-index 2 */}
        <div className="relative flex flex-col items-center justify-center" style={{ zIndex: 2 }}>
          <h2
            className="text-center font-black uppercase tracking-tighter text-[#F9FFE6] leading-[0.85] select-none"
            style={{
              fontSize: "clamp(3rem, 15vw, 14rem)",
              fontFamily: "'Inter', 'Poppins', sans-serif",
              fontStretch: "condensed",
              textShadow: "0 0 60px rgba(0,0,0,0.5)",
            }}
          >
            {t("builtForEveryone.title")}
            <br />
            {t("builtForEveryone.subtitle")}
          </h2>
        </div>

        {/* Mobile chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:hidden">
          {mobileLabelKeys.map((key) => (
            <span
              key={key}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#F9FFE6]"
            >
              {t(`builtForEveryone.labels.${key}`)}
            </span>
          ))}
        </div>

        {/* Floating Labels - In Front of Text */}
        {labels.filter(l => l.zIndex === 3).map((label) => (
          <div
            key={label.key}
            className={`
              absolute px-4 py-2 rounded-full font-semibold text-sm md:text-base whitespace-nowrap hidden md:flex
              ${colorClasses[label.color]}
              transition-transform duration-100 ease-out
              shadow-lg
            `}
            style={{
              top: label.position.top,
              left: label.position.left,
              zIndex: 3,
              transform: getParallaxTransform(label),
            }}
          >
            {t(`builtForEveryone.labels.${label.key}`)}
          </div>
        ))}
      </div>
    </section>
  );
}
