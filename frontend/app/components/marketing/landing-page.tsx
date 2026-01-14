import { lazy, Suspense } from "react";
import HeroSection from "~/components/marketing/hero-section";

const CarouselSection = lazy(() => import("~/components/bio/carousel-section"));
const AnalyticsSection = lazy(() => import("~/components/dashboard/analytics-section"));
const FeaturedSection = lazy(() => import("~/components/marketing/featured-section"));
const FeaturesSection = lazy(() => import("~/components/marketing/features-section"));
const PricingSection = lazy(() => import("~/components/marketing/pricing-section"));
const BlogSection = lazy(() => import("~/components/bio/blog-section"));
const ClaimUsernameBar = lazy(() => import("~/components/marketing/claim-username-bar"));

export default function LandingPage() {
    return (
        <main className="flex items-center justify-center pt-16 pb-16 bg-surface-alt min-h-screen">
            <div className="flex-1 flex flex-col items-center gap-10 min-h-0 w-full">
                <HeroSection />
                <Suspense fallback={<div className="h-96" />}>
                    <CarouselSection />
                </Suspense>
                <Suspense fallback={<div className="h-96" />}>
                    <AnalyticsSection />
                </Suspense>
                <Suspense fallback={<div className="h-96" />}>
                    <FeaturedSection />
                </Suspense>
                <Suspense fallback={<div className="h-96" />}>
                    <FeaturesSection />
                </Suspense>
                <Suspense fallback={<div className="h-96" />}>
                    <PricingSection />
                </Suspense>
                <Suspense fallback={<div className="h-96" />}>
                    <BlogSection />
                </Suspense>
            </div>
            <Suspense fallback={null}>
                <ClaimUsernameBar />
            </Suspense>
        </main>
    );
}
