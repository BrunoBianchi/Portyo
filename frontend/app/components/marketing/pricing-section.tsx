import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Sparkles, Zap, Crown } from "lucide-react";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";
import { useTranslation } from "react-i18next";
import { FadeInUp, GlowCard } from "./animation-components";

const plansConfig = [
  {
    id: "free" as const,
    icon: Sparkles,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    buttonStyle: "bg-muted text-foreground hover:bg-muted-hover",
    popular: false,
    features: ["onePage", "oneForm", "noBranding", "noDomain", "basicAnalytics", "storeFee3"] as const,
    moreFeatures: ["limitedIntegrations"] as const,
  },
  {
    id: "standard" as const,
    icon: Zap,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    buttonStyle: "bg-primary text-background hover:bg-primary-hover shadow-lg shadow-primary/20",
    popular: true,
    features: ["twoBios", "threeForms", "branding", "domain", "email", "storeFee1", "emails150"] as const,
    moreFeatures: ["automation2", "templates2", "seo", "analytics", "customizations"] as const,
  },
  {
    id: "pro" as const,
    icon: Crown,
    iconBg: "bg-accent-purple/20",
    iconColor: "text-accent-purple",
    buttonStyle: "bg-gradient-to-r from-accent-purple to-accent-pink text-white hover:opacity-90",
    popular: false,
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
  const Icon = plan.icon;
  
  const price = billingCycle === 'monthly' 
    ? (plan.id === 'free' ? 0 : plan.id === 'standard' ? 5.50 : 15)
    : (plan.id === 'free' ? 0 : plan.id === 'standard' ? 4.12 : 11.25);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      whileHover={{ y: -8 }}
      className={`relative ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
    >
      {/* Popular Badge */}
      <AnimatePresence>
        {plan.popular && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-primary text-background text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {t(`home.pricing.cards.${plan.id}.badge`)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <GlowCard 
        glowColor={plan.id === 'pro' ? 'rgba(168, 85, 247, 0.2)' : plan.id === 'standard' ? 'rgba(187, 255, 0, 0.2)' : 'transparent'}
        className="h-full"
      >
        <div className={`h-full rounded-[2rem] p-8 flex flex-col ${
          plan.popular 
            ? 'bg-primary border-2 border-primary shadow-2xl shadow-primary/20' 
            : plan.id === 'pro'
            ? 'bg-surface-card border border-border'
            : 'bg-surface-card border border-border shadow-xl'
        }`}>
          
          {/* Icon & Name */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className={`w-12 h-12 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${plan.iconColor}`} />
              </div>
              <h3 className={`text-2xl font-bold ${
                plan.popular ? 'text-background' : 'text-foreground'
              }`}>
                {t(`home.pricing.cards.${plan.id}.title`)}
              </h3>
              <p className={`text-sm mt-1 ${
                plan.popular ? 'text-background/70' : 'text-muted-foreground'
              }`}>
                {t(`home.pricing.cards.${plan.id}.subtitle`)}
              </p>
            </div>
          </div>
          
          {/* Price */}
          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-bold ${
                plan.popular ? 'text-background' : 'text-foreground'
              }`}>
                ${price}
              </span>
              <span className={`text-lg ${
                plan.popular ? 'text-background/70' : 'text-muted-foreground'
              }`}>
                /mo
              </span>
            </div>
            {billingCycle === 'annually' && price > 0 && (
              <p className={`text-sm mt-2 ${
                plan.popular ? 'text-background/70' : 'text-muted-foreground'
              }`}>
                {t(`home.pricing.cards.${plan.id}.billedYearly`)}
              </p>
            )}
          </div>
          
          {/* Features */}
          <div className="flex-1 space-y-4 mb-8">
            {plan.features.map((featureKey, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  plan.popular ? 'bg-background/20' : 'bg-primary/20'
                }`}>
                  <Check className={`w-3 h-3 ${
                    plan.popular ? 'text-background' : 'text-primary'
                  }`} />
                </div>
                <span className={`text-sm ${
                  plan.popular ? 'text-background/90' : 'text-muted-foreground'
                }`}>
                  {t(`home.pricing.cards.${plan.id}.features.${featureKey}`)}
                </span>
              </motion.div>
            ))}
            
            {/* Expandable More Features */}
            <AnimatePresence>
              {expanded && plan.moreFeatures.map((featureKey, i) => (
                <motion.div
                  key={`more-${i}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    plan.popular ? 'bg-background/20' : 'bg-primary/20'
                  }`}>
                    <Check className={`w-3 h-3 ${
                      plan.popular ? 'text-background' : 'text-primary'
                    }`} />
                  </div>
                  <span className={`text-sm ${
                    plan.popular ? 'text-background/90' : 'text-muted-foreground'
                  }`}>
                    {t(`home.pricing.cards.${plan.id}.more.${featureKey}`)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Show More/Less */}
            {plan.moreFeatures.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  plan.popular ? 'text-background/70 hover:text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {expanded ? t("home.pricing.showLess", "Show less") : t("home.pricing.showMore", "Show more")}
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          
          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${plan.buttonStyle}`}
          >
            {t(`home.pricing.cards.${plan.id}.cta`)}
          </motion.button>
        </div>
      </GlowCard>
    </motion.div>
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
    <section className="w-full py-24 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <FadeInUp>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-border shadow-lg mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {t("home.pricing.badge", "Simple, transparent pricing")}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              {t("home.pricing.title", "Choose your plan")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.pricing.subtitle", "Start free, upgrade when you're ready. No hidden fees, cancel anytime.")}
            </p>
          </div>
        </FadeInUp>

        {/* Billing Toggle */}
        <FadeInUp delay={0.1}>
          <div className="flex justify-center mb-16">
            <div className="bg-surface-card p-1.5 rounded-full shadow-xl inline-flex items-center border border-border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t("home.pricing.monthly", "Monthly")}
              </button>
              <button
                onClick={() => setBillingCycle('annually')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  billingCycle === 'annually'
                    ? 'bg-primary text-background shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t("home.pricing.annually", "Annually")}
                <span className="text-xs bg-background/20 text-background px-2 py-0.5 rounded-full">
                  {t("home.pricing.save", "Save 25%")}
                </span>
              </button>
            </div>
          </div>
        </FadeInUp>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
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
        <FadeInUp delay={0.4}>
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>{t("home.pricing.cancelAnytime", "Cancel anytime")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>{t("home.pricing.noHiddenFees", "No hidden fees")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>{t("home.pricing.securePayment", "Secure payment")}</span>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
