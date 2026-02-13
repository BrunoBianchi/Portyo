import { lazy, Suspense } from "react";
import { SEOSchema } from "~/components/marketing/seo-schema";
import { useTranslation } from "react-i18next";

// New Bold Components
import LinktreeHeroBold from "~/components/marketing/linktree-hero-bold";
import FeatureSection from "~/components/marketing/feature-section";
import FeaturedTestimonial from "~/components/marketing/featured-testimonial";

// Icons for features
import { BarChart3, ShoppingBag } from "lucide-react";

// Lazy loaded legacy sections (if we want to keep them for now, or remove? The prompt says "Refactoring", implies replacement)
// We will replace mostly, but keep FAQ maybe? Prompt didn't mention FAQ. I'll keep FAQ as a footer element.
import AnimatedFAQ from "~/components/marketing/animated-faq";

export default function LandingPage() {
  const { t } = useTranslation("home");

  return (
    <>
      <SEOSchema type="software" />

      <main className="flex flex-col w-full overflow-x-hidden">
        {/* SECTION 1: HERO (Acid Green) */}
        <LinktreeHeroBold />

        {/* SECTION 2: SOCIAL PROOF (Off White) */}
        <section className="w-full py-16 bg-[#F3F3F1] border-b-2 border-black/5">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="font-bold text-[#1A1A1A] opacity-60 uppercase tracking-widest text-sm mb-8">
              {t("home.landingBold.socialProof")}
            </p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholder Logos */}
              {['Google', 'Spotify', 'Asana', 'Zoom', 'Slack'].map((logo) => (
                <div key={logo} className="font-display font-black text-2xl text-[#1A1A1A]">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: FEATURE A (Electric Blue) */}
        <FeatureSection
          backgroundColor="#0047FF" // Electric Blue
          textColor="#FFFFFF"
          title={t("home.landingBold.featureA.title")}
          description={t("home.landingBold.featureA.description")}
          align="left"
          mediaContent={
            <div className="relative w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm p-12">
              <BarChart3 className="w-32 h-32 text-white" />
              <div className="absolute inset-0 border-2 border-white/20 m-4 rounded-none"></div>
            </div>
          }
        />

        {/* SECTION 4: FEATURE B (Shock Pink) */}
        <FeatureSection
          backgroundColor="#E94E77" // Shock Pink
          textColor="#FFFFFF"
          title={t("home.landingBold.featureB.title")}
          description={t("home.landingBold.featureB.description")}
          align="right"
          mediaContent={
            <div className="relative w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm p-12">
              <ShoppingBag className="w-32 h-32 text-white" />
              <div className="absolute inset-0 border-2 border-white/20 m-4 rounded-none"></div>
            </div>
          }
        />

        {/* SECTION 5: FEATURED TESTIMONIAL (Off White) */}
        <FeaturedTestimonial />

        {/* FAQ - Keeping as useful content at the bottom, can be restyled later if needed */}
        <div className="bg-[#1A1A1A] text-white">
          <AnimatedFAQ />
        </div>
      </main>
    </>
  );
}

