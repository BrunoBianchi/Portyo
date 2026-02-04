"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

export default function AnimatedFAQ() {
  const { t } = useTranslation();

  // Get FAQ items from translations
  const faqs: FAQItem[] = t("home.faq.items", { returnObjects: true }) as FAQItem[];

  return (
    <section className="py-32 bg-[#1A1A1A] text-white">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="inline-block font-display font-bold text-[#D2E823] tracking-widest uppercase mb-4">
            Dúvidas?
          </span>
          <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.9] tracking-tighter text-white uppercase">
            Perguntas<br />Frequentes
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItemComponent key={index} item={faq} index={index} />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 pt-10 border-t border-white/10 text-center sm:text-left">
          <p className="font-body text-xl text-gray-400 mb-6">
            Ainda tem dúvidas? Fale com nosso suporte.
          </p>
          <a
            href="mailto:support@portyo.me"
            className="inline-block bg-[#D2E823] text-[#1A1A1A] font-display font-bold text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform"
          >
            Falar com Suporte
          </a>
        </div>
      </div>
    </section>
  );
}

function FAQItemComponent({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        "border-2 border-white/10 transition-all duration-300",
        isOpen ? "bg-[#2A2A2A] border-[#D2E823]" : "bg-transparent hover:border-white/30"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 px-6 sm:px-8 flex items-center justify-between text-left group"
      >
        <span
          className={cn(
            "font-display font-bold text-xl sm:text-2xl transition-colors pr-8",
            isOpen ? "text-white" : "text-white/80 group-hover:text-white"
          )}
        >
          {item.question}
        </span>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 flex items-center justify-center transition-all duration-300",
          isOpen ? "bg-[#D2E823] text-[#1A1A1A] rotate-90" : "bg-white/10 text-white"
        )}>
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-8 px-6 sm:px-8 font-body text-lg text-gray-300 leading-relaxed max-w-3xl">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

