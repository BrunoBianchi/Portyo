import type { Route } from "./+types/home";
import { lazy, Suspense } from "react";

import HeroSection from "~/components/hero-section";
const CarouselSection = lazy(() => import("~/components/carousel-section"));
const AnalyticsSection = lazy(() => import("~/components/analytics-section"));
const FeaturedSection = lazy(() => import("~/components/featured-section"));
const FeaturesSection = lazy(() => import("~/components/features-section"));
const PricingSection = lazy(() => import("~/components/pricing-section"));
const ClaimUsernameBar = lazy(() => import("~/components/claim-username-bar"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
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
      </div>
      <Suspense fallback={null}>
        <ClaimUsernameBar />
      </Suspense>
    </main>
  );
}

