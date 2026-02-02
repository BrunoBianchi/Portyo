import { lazy, Suspense } from "react";
import HeroSection from "~/components/marketing/hero-section";
import TestimonialsSection from "~/components/marketing/testimonials-section";
import FAQSection from "~/components/marketing/faq-section";
import { SEOSchema } from "~/components/marketing/seo-schema";

const CarouselSection = lazy(() => import("~/components/bio/carousel-section"));
const BuiltForEveryoneSection = lazy(() => import("~/components/marketing/built-for-everyone"));
const AnalyticsSection = lazy(() => import("~/components/dashboard/analytics-section"));
const WhoUsesSection = lazy(() => import("~/components/marketing/who-uses-section"));
const FeaturesSection = lazy(() => import("~/components/marketing/features-section"));
const PricingSection = lazy(() => import("~/components/marketing/pricing-section"));
const BlogSection = lazy(() => import("~/components/bio/blog-section"));
const ClaimUsernameBar = lazy(() => import("~/components/marketing/claim-username-bar"));

// Simple loading placeholder that matches section background
function SectionPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="animate-pulse w-full h-full min-h-[400px] bg-muted/20" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* SEO Schema Markup */}
      <SEOSchema type="software" />
      
      <main className="flex flex-col w-full bg-background">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Carousel / Social Proof - seamless transition */}
        <Suspense fallback={<SectionPlaceholder className="bg-background" />}>
          <CarouselSection />
        </Suspense>
        
        {/* Built For Everyone */}
        <Suspense fallback={<SectionPlaceholder className="bg-surface-muted" />}>
          <BuiltForEveryoneSection />
        </Suspense>
        
        {/* Analytics Preview */}
        <Suspense fallback={<SectionPlaceholder className="bg-background" />}>
          <AnalyticsSection />
        </Suspense>
        
        {/* Who Uses */}
        <Suspense fallback={<SectionPlaceholder className="bg-background" />}>
          <WhoUsesSection />
        </Suspense>
        
        {/* Features Section */}
        <Suspense fallback={<SectionPlaceholder className="bg-surface-muted" />}>
          <FeaturesSection />
        </Suspense>
        
        {/* Testimonials */}
        <TestimonialsSection />
        
        {/* Pricing Section */}
        <Suspense fallback={<SectionPlaceholder className="bg-background" />}>
          <PricingSection />
        </Suspense>
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* Blog Section */}
        <Suspense fallback={<SectionPlaceholder className="bg-surface-muted" />}>
          <BlogSection />
        </Suspense>
      </main>
      
      {/* Sticky CTA Bar */}
      <Suspense fallback={null}>
        <ClaimUsernameBar />
      </Suspense>
    </>
  );
}
