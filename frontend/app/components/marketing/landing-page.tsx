import { lazy, Suspense } from "react";
import HeroSection from "~/components/marketing/hero-section";

const CarouselSection = lazy(() => import("~/components/bio/carousel-section"));
const BuiltForEveryoneSection = lazy(() => import("~/components/marketing/built-for-everyone"));
const AnalyticsSection = lazy(() => import("~/components/dashboard/analytics-section"));
const WhoUsesSection = lazy(() => import("~/components/marketing/who-uses-section"));
const FeaturesSection = lazy(() => import("~/components/marketing/features-section"));
const PricingSection = lazy(() => import("~/components/marketing/pricing-section"));
const BlogSection = lazy(() => import("~/components/bio/blog-section"));
const ClaimUsernameBar = lazy(() => import("~/components/marketing/claim-username-bar"));

export default function LandingPage() {
    return (
        <main className="flex items-center justify-center pt-0 pb-16 bg-white min-h-screen">
            <div className="flex-1 flex flex-col items-center gap-10 min-h-0 w-full">
                <HeroSection />
                <Suspense fallback={<div className="min-h-[420px] w-full" />}>
                    <CarouselSection />
                </Suspense>
                <Suspense fallback={<div className="min-h-[400px] w-full" />}>
                    <BuiltForEveryoneSection />
                </Suspense>
                <Suspense fallback={<div className="min-h-[520px] w-full" />}>
                    <AnalyticsSection />
                </Suspense>
                <Suspense fallback={<div className="min-h-[320px] w-full" />}>
                    <WhoUsesSection />
                </Suspense>
                <Suspense fallback={<div className="min-h-[720px] w-full" />}>
                    <FeaturesSection />
                </Suspense>
                <Suspense fallback={<div className="min-h-[760px] w-full" />}>
                    <PricingSection />
                </Suspense>
                <Suspense fallback={<div className="min-h-[520px] w-full" />}>
                    <BlogSection />
                </Suspense>
            </div>
            <Suspense fallback={null}>
                <ClaimUsernameBar />
            </Suspense>
        </main>
    );
}
