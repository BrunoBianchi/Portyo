import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

interface FloatingLabel {
  key: string;
  color: "lime" | "purple" | "cyan" | "blue" | "pink" | "orange";
  position: { top: string; left: string };
  zIndex: number;
  parallaxSpeed: number;
}

const labels: FloatingLabel[] = [
  // Behind text
  { key: "engineers", color: "blue", position: { top: "35%", left: "5%" }, zIndex: 1, parallaxSpeed: 0.3 },
  { key: "academics", color: "purple", position: { top: "25%", left: "20%" }, zIndex: 1, parallaxSpeed: 0.5 },
  { key: "doctors", color: "blue", position: { top: "65%", left: "25%" }, zIndex: 1, parallaxSpeed: 0.4 },
  { key: "interns", color: "cyan", position: { top: "60%", left: "70%" }, zIndex: 1, parallaxSpeed: 0.35 },
  { key: "professionals", color: "pink", position: { top: "35%", left: "75%" }, zIndex: 1, parallaxSpeed: 0.45 },
  { key: "architects", color: "lime", position: { top: "50%", left: "15%" }, zIndex: 3, parallaxSpeed: 0.6 },
  
  // In front of text
  { key: "musicians", color: "purple", position: { top: "10%", left: "12%" }, zIndex: 3, parallaxSpeed: 0.6 },
  { key: "creators", color: "cyan", position: { top: "8%", left: "45%" }, zIndex: 3, parallaxSpeed: 0.7 },
  { key: "lawyers", color: "lime", position: { top: "12%", left: "78%" }, zIndex: 3, parallaxSpeed: 0.55 },
  { key: "bankers", color: "orange", position: { top: "30%", left: "35%" }, zIndex: 3, parallaxSpeed: 0.65 },
  { key: "founders", color: "lime", position: { top: "68%", left: "50%" }, zIndex: 3, parallaxSpeed: 0.5 },
  { key: "teachers", color: "cyan", position: { top: "78%", left: "58%" }, zIndex: 3, parallaxSpeed: 0.4 },
  { key: "students", color: "purple", position: { top: "70%", left: "85%" }, zIndex: 3, parallaxSpeed: 0.6 },
  { key: "sideHustlers", color: "pink", position: { top: "72%", left: "3%" }, zIndex: 3, parallaxSpeed: 0.55 },
  { key: "designers", color: "purple", position: { top: "48%", left: "88%" }, zIndex: 3, parallaxSpeed: 0.45 },
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
              className={`absolute px-4 py-2 rounded-full font-bold text-sm md:text-base whitespace-nowrap hidden md:flex ${colorClasses[label.color]} shadow-lg hover:scale-110 transition-transform cursor-default`}
              style={{
                top: label.position.top,
                left: label.position.left,
                zIndex: 1,
              }}
              whileHover={{ scale: 1.1 }}
            >
              {t(`builtForEveryone.labels.${label.key}`, label.key)}
            </motion.div>
          ))}
        </div>

        {/* Main Text */}
        <div className="relative flex flex-col items-center justify-center py-20 md:py-32" style={{ zIndex: 2 }}>
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center font-black uppercase tracking-tight text-white leading-[1] select-none"
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
              className="rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/80"
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
              className={`absolute px-4 py-2 rounded-full font-bold text-sm md:text-base whitespace-nowrap hidden md:flex ${colorClasses[label.color]} shadow-xl hover:scale-110 transition-transform cursor-default`}
              style={{
                top: label.position.top,
                left: label.position.left,
                zIndex: 3,
              }}
              whileHover={{ scale: 1.1 }}
            >
              {t(`builtForEveryone.labels.${label.key}`, label.key)}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
