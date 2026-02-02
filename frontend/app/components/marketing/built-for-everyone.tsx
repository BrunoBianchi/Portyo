import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

interface FloatingLabel {
  key: string;
  color: "lime" | "purple" | "cyan" | "blue" | "pink" | "orange";
  position: { top: string; left: string };
  zIndex: number;
  parallaxSpeed: number;
  floatOffsetX: number;
  floatOffsetY: number;
}

const labels: FloatingLabel[] = [
  // Behind text
  { key: "engineers", color: "blue", position: { top: "35%", left: "5%" }, zIndex: 1, parallaxSpeed: 0.3, floatOffsetX: 8, floatOffsetY: -10 },
  { key: "academics", color: "purple", position: { top: "25%", left: "20%" }, zIndex: 1, parallaxSpeed: 0.5, floatOffsetX: -6, floatOffsetY: 12 },
  { key: "doctors", color: "blue", position: { top: "65%", left: "25%" }, zIndex: 1, parallaxSpeed: 0.4, floatOffsetX: 10, floatOffsetY: 8 },
  { key: "interns", color: "cyan", position: { top: "60%", left: "70%" }, zIndex: 1, parallaxSpeed: 0.35, floatOffsetX: -8, floatOffsetY: -12 },
  { key: "professionals", color: "pink", position: { top: "35%", left: "75%" }, zIndex: 1, parallaxSpeed: 0.45, floatOffsetX: 5, floatOffsetY: 10 },
  { key: "architects", color: "lime", position: { top: "50%", left: "15%" }, zIndex: 3, parallaxSpeed: 0.6, floatOffsetX: -10, floatOffsetY: 15 },
  
  // In front of text
  { key: "musicians", color: "purple", position: { top: "10%", left: "12%" }, zIndex: 3, parallaxSpeed: 0.6, floatOffsetX: -10, floatOffsetY: 15 },
  { key: "creators", color: "cyan", position: { top: "8%", left: "45%" }, zIndex: 3, parallaxSpeed: 0.7, floatOffsetX: 12, floatOffsetY: -8 },
  { key: "lawyers", color: "lime", position: { top: "12%", left: "78%" }, zIndex: 3, parallaxSpeed: 0.55, floatOffsetX: -15, floatOffsetY: 10 },
  { key: "bankers", color: "orange", position: { top: "30%", left: "35%" }, zIndex: 3, parallaxSpeed: 0.65, floatOffsetX: 8, floatOffsetY: -12 },
  { key: "founders", color: "lime", position: { top: "68%", left: "50%" }, zIndex: 3, parallaxSpeed: 0.5, floatOffsetX: -10, floatOffsetY: 8 },
  { key: "teachers", color: "cyan", position: { top: "78%", left: "58%" }, zIndex: 3, parallaxSpeed: 0.4, floatOffsetX: 6, floatOffsetY: -15 },
  { key: "students", color: "purple", position: { top: "70%", left: "85%" }, zIndex: 3, parallaxSpeed: 0.6, floatOffsetX: -12, floatOffsetY: 10 },
  { key: "sideHustlers", color: "pink", position: { top: "72%", left: "3%" }, zIndex: 3, parallaxSpeed: 0.55, floatOffsetX: 10, floatOffsetY: -8 },
  { key: "designers", color: "purple", position: { top: "48%", left: "88%" }, zIndex: 3, parallaxSpeed: 0.45, floatOffsetX: -8, floatOffsetY: 12 },
];

const colorClasses: Record<FloatingLabel["color"], string> = {
  lime: "bg-primary text-gray-900",
  purple: "bg-[#a78bfa] text-gray-900",
  cyan: "bg-[#67e8f9] text-gray-900",
  blue: "bg-[#60a5fa] text-gray-900",
  pink: "bg-[#f472b6] text-gray-900",
  orange: "bg-[#fb923c] text-gray-900",
};

export default function BuiltForEveryoneSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-surface-muted overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-muted to-transparent pointer-events-none" />
      
      <motion.div 
        className="relative mx-auto max-w-7xl px-4"
        style={{ y }}
      >
        {/* Floating Labels - Behind Text */}
        <div className="absolute inset-0 pointer-events-none">
          {labels.filter(l => l.zIndex === 1).map((label) => (
            <motion.div
              key={label.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: Math.random() * 0.5, duration: 0.6 }}
              className={`absolute px-4 py-2 rounded-full font-semibold text-sm md:text-base whitespace-nowrap hidden md:flex ${colorClasses[label.color]} shadow-lg`}
              style={{
                top: label.position.top,
                left: label.position.left,
                zIndex: 1,
              }}
            >
              <motion.span
                animate={{
                  x: [0, label.floatOffsetX, 0],
                  y: [0, label.floatOffsetY, 0],
                }}
                transition={{
                  duration: 4 + label.parallaxSpeed * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {t(`builtForEveryone.labels.${label.key}`, label.key)}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Main Text */}
        <div className="relative flex flex-col items-center justify-center py-20 md:py-32" style={{ zIndex: 2 }}>
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center font-bold uppercase tracking-tight text-foreground leading-[1] select-none"
            style={{
              fontSize: "clamp(2.5rem, 10vw, 8rem)",
              fontFamily: "var(--font-display)",
              textShadow: "0 0 80px rgba(187, 255, 0, 0.15)",
            }}
          >
            <span className="block">{t("builtForEveryone.title", "Built For")}</span>
            <span className="block text-primary">{t("builtForEveryone.subtitle", "Everyone")}</span>
          </motion.h2>
        </div>

        {/* Mobile Chips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2 md:hidden"
        >
          {["creators", "musicians", "engineers", "designers", "founders", "lawyers"].map((key) => (
            <span
              key={key}
              className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground"
            >
              {t(`builtForEveryone.labels.${key}`, key)}
            </span>
          ))}
        </motion.div>

        {/* Floating Labels - In Front of Text */}
        <div className="absolute inset-0 pointer-events-none">
          {labels.filter(l => l.zIndex === 3).map((label) => (
            <motion.div
              key={label.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: Math.random() * 0.5 + 0.2, duration: 0.6 }}
              className={`absolute px-4 py-2 rounded-full font-semibold text-sm md:text-base whitespace-nowrap hidden md:flex ${colorClasses[label.color]} shadow-xl`}
              style={{
                top: label.position.top,
                left: label.position.left,
                zIndex: 3,
              }}
            >
              <motion.span
                animate={{
                  x: [0, label.floatOffsetX, 0],
                  y: [0, label.floatOffsetY, 0],
                }}
                transition={{
                  duration: 4 + label.parallaxSpeed * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {t(`builtForEveryone.labels.${label.key}`, label.key)}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
