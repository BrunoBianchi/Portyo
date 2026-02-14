import type { MetaFunction } from "react-router";
import { AuthorizationGuard } from "~/contexts/guard.context";
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, Loader2, Radio } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import BioContext from "~/contexts/bio.context";
import { getInstagramAnalytics, type InstagramAnalyticsResponse } from "~/services/instagram-tools.service";
import { toast } from "react-hot-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "Instagram analytics | Portyo" },
    { name: "description", content: "Instagram analytics hub for future releases." },
  ];
};

export default function DashboardInstagramAnalytics() {
  const { bio } = useContext(BioContext);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<InstagramAnalyticsResponse | null>(null);

  const loadAnalytics = async () => {
    if (!bio?.id) return;

    setLoading(true);
    try {
      const response = await getInstagramAnalytics(bio.id);
      setAnalytics(response);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load Instagram analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bio?.id) {
      loadAnalytics();
    }
  }, [bio?.id]);

  const cards = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [
      {
        label: "Executions (30d)",
        value: analytics.performance30d.totalExecutions,
      },
      {
        label: "Completion rate",
        value: `${analytics.performance30d.completionRate}%`,
      },
      {
        label: "Auto-reply rules",
        value: `${analytics.autoReply.activeRules}/${analytics.autoReply.totalRules}`,
      },
      {
        label: "Instagram connected",
        value: analytics.integration.connected ? "Yes" : "No",
      },
    ];
  }, [analytics]);

  const formatTrigger = (trigger: string) =>
    trigger
      .replace(/_/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());

  return (
    <AuthorizationGuard>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <header className="bg-white rounded-[20px] border-4 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Instagram analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium mt-2">
            Real-time overview of auto-reply automation performance and webhook activity.
          </p>
        </header>

        {loading ? (
          <section className="bg-white rounded-[20px] border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            <Loader2 className="w-6 h-6 mx-auto animate-spin" />
            <p className="mt-2 text-sm text-gray-600">Loading analytics...</p>
          </section>
        ) : !analytics ? (
          <section className="bg-white rounded-[20px] border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            <AlertTriangle className="w-6 h-6 mx-auto" />
            <p className="mt-2 text-sm text-gray-600">No analytics data available yet.</p>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((card) => (
                <article key={card.label} className="bg-white rounded-2xl border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500">{card.label}</p>
                  <p className="text-2xl font-black mt-2 text-[#1A1A1A]">{card.value}</p>
                </article>
              ))}
            </section>

            <section className="bg-white rounded-[20px] border-4 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h2 className="text-xl font-black">Execution status (30d)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border-2 border-black p-3 bg-[#F8FFF0]">
                  <p className="text-xs font-bold uppercase text-gray-500">Completed</p>
                  <p className="text-2xl font-black text-[#1A1A1A]">{analytics.performance30d.completed}</p>
                </div>
                <div className="rounded-xl border-2 border-black p-3 bg-[#FFF8F8]">
                  <p className="text-xs font-bold uppercase text-gray-500">Failed</p>
                  <p className="text-2xl font-black text-[#1A1A1A]">{analytics.performance30d.failed}</p>
                </div>
                <div className="rounded-xl border-2 border-black p-3 bg-[#F8FAFF]">
                  <p className="text-xs font-bold uppercase text-gray-500">Running</p>
                  <p className="text-2xl font-black text-[#1A1A1A]">{analytics.performance30d.running}</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[20px] border-4 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h2 className="text-xl font-black">Top triggers</h2>
              {analytics.performance30d.topTriggers.length === 0 ? (
                <p className="text-sm text-gray-500">No trigger data in the last 30 days.</p>
              ) : (
                <div className="space-y-2">
                  {analytics.performance30d.topTriggers.map((item) => (
                    <div key={item.trigger} className="flex items-center justify-between rounded-xl border-2 border-black px-3 py-2 bg-gray-50">
                      <span className="text-sm font-bold text-[#1A1A1A]">{formatTrigger(item.trigger)}</span>
                      <span className="text-sm font-black">{item.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-[20px] border-4 border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h2 className="text-xl font-black">Connection & webhook</h2>
              <div className="space-y-2 text-sm">
                <p className="inline-flex items-center gap-2 font-bold">
                  {analytics.integration.connected ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  Account: {analytics.integration.accountName || "Not connected"}
                </p>
                <p className="inline-flex items-center gap-2 text-gray-600">
                  <Clock3 className="w-4 h-4" />
                  Last execution: {analytics.performance30d.lastExecutionAt ? new Date(analytics.performance30d.lastExecutionAt).toLocaleString() : "No executions yet"}
                </p>
                <p className="inline-flex items-center gap-2 text-gray-600">
                  <Radio className="w-4 h-4" />
                  Last webhook: {analytics.webhook.lastEvent?.receivedAt ? new Date(analytics.webhook.lastEvent.receivedAt).toLocaleString() : "No webhook event yet"}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </AuthorizationGuard>
  );
}
