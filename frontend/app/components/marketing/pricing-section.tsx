"use client";

import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight, Star } from "lucide-react";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";
import { useTranslation } from "react-i18next";
import { FadeInUp } from "./animation-components";

const plansConfig = [
  {
    id: "free" as const,
    icon: Sparkles,
    popular: false,
    price: { monthly: 0, annually: 0 },
    features: ["onePage", "oneForm", "noBranding", "noDomain", "basicAnalytics", "storeFee3"] as const,
    moreFeatures: ["limitedIntegrations"] as const,
  },
  {
    id: "standard" as const,
    icon: Zap,
    popular: false,
    price: { monthly: 5.50, annually: 4.12 },
    features: ["twoBios", "threeForms", "branding", "domain", "email", "storeFee1", "emails150"] as const,
    moreFeatures: ["automation2", "templates2", "seo", "analytics", "customizations"] as const,
  },
  {
    id: "pro" as const,
    icon: Crown,
    popular: true,
    price: { monthly: 15, annually: 11.25 },
    features: ["everything", "fiveBios", "fourForms", "scheduler", "automation4", "templates4", "storeFee0", "emails500", "customizationsPro"] as const,
    moreFeatures: [] as const,
  }
];

function PricingCard({ plan, billingCycle, onSelect, index }: {
  plan: typeof plansConfig[0];
  billingCycle: 'monthly' | 'annually';
  onSelect: () => void;
  index: number;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually;
  const isPro = plan.id === 'pro';

  return (
    <div className={`relative flex flex-col h-full bg-white border-4 border-[#1A1A1A] p-8 transition-transform duration-300 hover:-translate-y-2 ${isPro ? 'shadow-[12px_12px_0px_0px_#D2E823]' : 'shadow-[8px_8px_0px_0px_#1A1A1A]'}`}>
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#D2E823] text-[#1A1A1A] text-sm font-black uppercase tracking-widest py-2 px-6 border-4 border-[#1A1A1A] flex items-center gap-2 whitespace-nowrap z-10">
          <Star className="w-4 h-4 fill-[#1A1A1A]" />
          MOST POPULAR
        </div>
      )}

      {/* Header */}
      <div className="mb-8 border-b-4 border-[#1A1A1A] pb-8">
        <h3 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
          {t(`home.pricing.cards.${plan.id}.title`)}
        </h3>
        <p className="text-[#1A1A1A]/70 font-medium mt-2 min-h-[40px]">
          {t(`home.pricing.cards.${plan.id}.subtitle`)}
        </p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-black text-[#1A1A1A] tracking-tighter">
            ${price}
          </span>
          <span className="text-xl font-bold text-[#1A1A1A]/50">
            /mo
          </span>
        </div>
        {billingCycle === 'annually' && price > 0 && (
          <p className="text-sm font-bold text-[#0047FF] mt-2 uppercase tracking-wide">
            {t(`home.pricing.cards.${plan.id}.billedYearly`)}
          </p>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        className={`w-full py-4 text-lg font-black uppercase tracking-wider border-4 border-[#1A1A1A] mb-10 transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 ${isPro
            ? 'bg-[#1A1A1A] text-[#D2E823] shadow-[6px_6px_0px_0px_#D2E823]'
            : 'bg-white text-[#1A1A1A] hover:bg-[#F3F3F1] shadow-[6px_6px_0px_0px_#1A1A1A]'
          }`}
      >
        {t(`home.pricing.cards.${plan.id}.cta`)}
      </button>

      {/* Features */}
      <div className="space-y-4 flex-1">
        <p className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]/40 mb-4">Features</p>
        {plan.features.map((featureKey, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-1 p-0.5 border-2 border-[#1A1A1A] ${isPro ? 'bg-[#D2E823]' : 'bg-white'}`}>
              <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={4} />
            </div>
            <span className="text-sm font-bold text-[#1A1A1A] leading-tight">
              {t(`home.pricing.cards.${plan.id}.features.${featureKey}`)}
            </span>
          </div>
        ))}

        {/* More Features Toggle */}
        {plan.moreFeatures.length > 0 && (
          <div className="pt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-black underline decoration-2 underline-offset-4 hover:text-[#0047FF] transition-colors"
            >
              {expanded ? t("home.pricing.showLess", "Show less") : t("home.pricing.showMore", "Show more features")}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 pt-4 overflow-hidden"
                >
                  {plan.moreFeatures.map((featureKey, i) => (
                    <div key={`more-${i}`} className="flex items-start gap-3">
                      <div className="mt-1 p-0.5 border-2 border-[#1A1A1A] bg-white">
                        <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={4} />
                      </div>
                      <span className="text-sm font-medium text-[#1A1A1A]/80 leading-tight">
                        {t(`home.pricing.cards.${plan.id}.more.${featureKey}`)}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingSection() {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
  const { user } = useContext(AuthContext);
  const [cookies] = useCookies(['@App:token']);
  const navigate = useNavigate();

  const handleSelectPlan = async (plan: 'free' | 'standard' | 'pro') => {
    if (plan === 'free') {
      navigate(user ? '/dashboard' : '/sign-up');
      return;
    }

    if (!user) {
      navigate(`/sign-up?plan=${plan}`);
      return;
    }

    try {
      const token = cookies['@App:token'];
      if (!token) {
        navigate(`/sign-up?plan=${plan}`);
        return;
      }

      const response = await api.post('/stripe/create-checkout-session', {
        plan,
        interval: billingCycle
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert(t("home.pricing.checkoutFailed", "Failed to initiate checkout. Please try again."));
    }
  };

  return (
    <section className="w-full py-24 bg-[#F3F3F1] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-[#D2E823] text-[#1A1A1A] font-black text-sm uppercase tracking-widest mb-6 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
            {t("home.pricing.badge", "Simple Pricing")}
          </span>
          <h2 className="text-6xl md:text-8xl font-black text-[#1A1A1A] leading-[0.9] tracking-tighter mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047FF] to-[#0047FF]">PLAN</span>
          </h2>
          <p className="text-xl md:text-2xl font-medium text-[#1A1A1A]/60 max-w-2xl mx-auto leading-relaxed">
            {t("home.pricing.subtitle", "Start free. Upgrade for power. Cancel anytime.")}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-20">
          <div className="relative inline-flex bg-white border-4 border-[#1A1A1A] p-1.5 shadow-[8px_8px_0px_0px_#1A1A1A]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-8 py-3 text-sm font-black uppercase tracking-wider transition-all duration-300 ${billingCycle === 'monthly' ? 'text-white' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              {t("home.pricing.monthly", "Monthly")}
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`relative z-10 px-8 py-3 text-sm font-black uppercase tracking-wider transition-all duration-300 ${billingCycle === 'annually' ? 'text-white' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              {t("home.pricing.annually", "Annually")}
            </button>

            {/* Sliding Background */}
            <div
              className="absolute top-1.5 bottom-1.5 bg-[#1A1A1A] transition-all duration-300 ease-out"
              style={{
                left: billingCycle === 'monthly' ? '6px' : 'calc(50% + 3px)',
                width: 'calc(50% - 9px)'
              }}
            />

            {/* Save Badges */}
            <div className="absolute -right-24 top-1/2 -translate-y-1/2 hidden md:block">
              <span className="bg-[#D2E823] text-[#1A1A1A] text-xs font-black px-2 py-1 border-2 border-[#1A1A1A] -rotate-12 inline-block">
                SAVE 25%
              </span>
              <ArrowRight className="w-6 h-6 text-[#1A1A1A] inline-block ml-2 -rotate-12" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
          {plansConfig.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              onSelect={() => handleSelectPlan(plan.id as 'free' | 'standard' | 'pro')}
              index={index}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-24 pt-12 border-t-4 border-[#1A1A1A]/10 flex flex-wrap justify-center gap-12 text-[#1A1A1A]">
          {[
            { text: t("home.pricing.cancelAnytime", "Cancel anytime") },
            { text: t("home.pricing.trialReminder", "1-day reminder before billing") },
            { text: t("home.pricing.securePayment", "Secure payment") },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 font-bold text-lg">
              <div className="w-8 h-8 bg-[#D2E823] border-2 border-[#1A1A1A] flex items-center justify-center shadow-[3px_3px_0px_0px_#1A1A1A]">
                <Check className="w-5 h-5 text-[#1A1A1A]" strokeWidth={4} />
              </div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
