import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { FadeInUp } from "./animation-components";
import { FAQSchema } from "./seo-schema";

const faqs = [
  {
    id: "what-is",
    question: "What is Portyo?",
    answer: "Portyo is an all-in-one platform that allows creators, entrepreneurs, and professionals to create a powerful link-in-bio page. It includes features like newsletter collection, product sales, booking scheduler, automation workflows, and much more."
  },
  {
    id: "free",
    question: "Is Portyo free to use?",
    answer: "Yes! Portyo offers a free plan that includes one bio page, one form, basic analytics, and more. You can upgrade to Standard or Pro plans for additional features like custom domains, automation, and zero transaction fees."
  },
  {
    id: "sell",
    question: "Can I sell products on Portyo?",
    answer: "Absolutely! Portyo integrates with Stripe to let you sell digital products and services directly from your bio page. You can set up products, collect payments, and manage everything from your dashboard."
  },
  {
    id: "coding",
    question: "Do I need coding skills?",
    answer: "Not at all! Portyo is designed to be user-friendly with a drag-and-drop editor. You can customize your page, add content, and set up features without any coding knowledge."
  },
  {
    id: "domain",
    question: "Can I use my own domain?",
    answer: "Yes, Standard and Pro plans allow you to connect your own custom domain (like yourname.com) to your Portyo page. This gives your brand a more professional appearance."
  },
  {
    id: "analytics",
    question: "What analytics does Portyo provide?",
    answer: "Portyo provides comprehensive analytics including page views, link clicks, click-through rates, geographic data, device breakdown, and more. Pro users get access to advanced analytics and conversion tracking."
  },
  {
    id: "automation",
    question: "How does automation work?",
    answer: "Portyo's automation feature lets you create workflows that trigger based on user actions. For example, you can automatically send welcome emails to new subscribers, tag leads based on their interests, or send follow-up sequences."
  },
  {
    id: "support",
    question: "What kind of support do you offer?",
    answer: "We offer email support for all users, with priority support for Standard and Pro plan subscribers. Pro users also get access to live chat support and dedicated account management."
  }
];

function FAQItem({ 
  faq, 
  isOpen, 
  onClick,
  index 
}: { 
  faq: typeof faqs[0]; 
  isOpen: boolean; 
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-border last:border-b-0"
    >
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-foreground pr-8 group-hover:text-primary transition-colors">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isOpen ? "bg-primary text-background" : "bg-muted text-muted-foreground group-hover:bg-muted-hover"
          }`}
        >
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              className="pb-6 text-muted-foreground leading-relaxed pr-16"
            >
              {faq.answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>("what-is");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const handleClick = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <>
      {/* Schema Markup for SEO */}
      <FAQSchema />
      
      <section ref={ref} className="w-full py-24 bg-surface-muted">
        <div className="max-w-4xl mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
                <MessageCircle className="h-4 w-4" />
                {t("faq.badge", "Got questions?")}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-[1.1] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                {t("faq.title", "Frequently asked questions")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("faq.subtitle", "Everything you need to know about Portyo. Can't find the answer you're looking for? Reach out to our support team.")}
              </p>
            </div>
          </FadeInUp>

          <div className="bg-surface-card rounded-3xl border border-border p-2">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onClick={() => handleClick(faq.id)}
                index={index}
              />
            ))}
          </div>

          {/* CTA */}
          <FadeInUp delay={0.3}>
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-4">{t("faq.stillHaveQuestions", "Still have questions?")}</p>
              <a 
                href="mailto:support@portyo.me"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                <MessageCircle className="h-4 w-4" />
                {t("faq.contactSupport", "Contact Support")}
              </a>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
