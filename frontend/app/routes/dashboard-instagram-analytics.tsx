import type { MetaFunction } from "react-router";
import { AuthorizationGuard } from "~/contexts/guard.context";
import { BarChart3, Sparkles } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Instagram analytics | Portyo" },
    { name: "description", content: "Instagram analytics hub for future releases." },
  ];
};

export default function DashboardInstagramAnalytics() {
  return (
    <AuthorizationGuard>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <header className="bg-white rounded-[20px] border-4 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Instagram analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium mt-2">
            This page is reserved for upcoming analytics modules.
          </p>
        </header>

        <section className="bg-white rounded-[20px] border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="w-14 h-14 rounded-full border-2 border-black bg-[#C6F035] mx-auto flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-xl font-black">Coming soon</h2>
          <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
            We are preparing insights for auto-reply performance, conversion rates, and DM engagement.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Planned: Standard and Pro advanced dashboards
          </div>
        </section>
      </div>
    </AuthorizationGuard>
  );
}
