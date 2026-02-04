import { useContext, useEffect, useState } from "react";
import BioContext from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import { BarChart3, MousePointer2, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, ExternalLink, PenTool, ShoppingBag, Mail, Eye, DollarSign, ShoppingCart, Package, Receipt, CreditCard } from "lucide-react";
import { api } from "~/services/api";
import { Link } from "react-router";
import { AnalyticsService, type SalesData, type AnalyticsData } from "~/services/analytics.service";
import WorldMap from "~/components/dashboard/world-map";
import { useAuth } from "~/contexts/auth.context";
import { useTranslation } from "react-i18next";

interface Activity {
    id: string;
    type: "PURCHASE" | "SUBSCRIBE" | "VIEW" | "CLICK" | "LEAD";
    description: string;
    createdAt: string;
    metadata?: any;
}

export default function DashboardHome() {
    const { bio } = useContext(BioContext);
    const { isPro } = useAuth();
    const { t } = useTranslation("dashboard");
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState("ALL");
    const [sales, setSales] = useState<SalesData | null>(null);
    const [loadingSales, setLoadingSales] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    useEffect(() => {
        if (bio?.id) {
            setLoading(true);
            setLoadingAnalytics(true);

            // Fetch recent activities
            api.get(`/activity?bioId=${bio.id}&limit=5&page=${page}&type=${filterType}`)
                .then(res => {
                    if (res.data.data) {
                        setActivities(res.data.data);
                        setTotalPages(res.data.meta.totalPages);
                    } else if (Array.isArray(res.data)) {
                        setActivities(res.data);
                    }
                })
                .catch(err => console.error("Failed to fetch activities", err))
                .finally(() => setLoading(false));

            // Load analytics overview
            AnalyticsService.getAnalytics(bio.id)
                .then(data => setAnalytics(data))
                .catch(err => console.error("Failed to fetch analytics", err))
                .finally(() => setLoadingAnalytics(false));

            // Load sales data
            setLoadingSales(true);
            AnalyticsService.getSales(bio.id)
                .then(data => setSales(data))
                .catch(err => console.error("Failed to fetch sales", err))
                .finally(() => setLoadingSales(false));
        }
    }, [bio?.id, page, filterType]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "PURCHASE": return <ShoppingBag className="w-5 h-5 text-black" />;
            case "SUBSCRIBE": return <Mail className="w-5 h-5 text-black" />;
            case "CLICK": return <MousePointer2 className="w-5 h-5 text-black" />;
            case "VIEW": return <Eye className="w-5 h-5 text-black" />;
            default: return <Sparkles className="w-5 h-5 text-black" />;
        }
    };

    const renderTrend = (change: number) => {
        const isPositive = change >= 0;
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border-2 border-black ${isPositive ? 'bg-[#D2E823] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-red-100 text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'} stroke-[3px]`} />
                <span>{isPositive ? '+' : ''}{change}%</span>
                <span className="font-medium text-black/60 hidden sm:inline">{t("dashboard.overview.vsLastMonth")}</span>
            </div>
        );
    };

    return (
        <AuthorizationGuard>
            <div className="min-h-screen bg-[#F3F3F1] p-6 md:p-10 space-y-8">
                <header
                    data-tour="dashboard-overview-header"
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2E823] border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <Sparkles className="w-3 h-3" />
                            {t("dashboard.overview.overview")}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                            {t("dashboard.overview.title")}
                        </h1>
                        <p className="text-lg font-medium text-[#1A1A1A]/60 max-w-xl">{t("dashboard.overview.subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {bio && (
                            <>
                                <a
                                    href={`https://portyo.me/p/${bio.sufix}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-5 py-2.5 rounded-full font-bold text-sm bg-white border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    {t("dashboard.overview.viewPage")}
                                </a>
                                <a
                                    href={`/dashboard/editor`}
                                    className="px-5 py-2.5 rounded-full font-bold text-sm bg-[#D2E823] border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                                >
                                    <PenTool className="w-4 h-4" />
                                    {t("dashboard.overview.openEditor")}
                                </a>
                            </>
                        )}
                    </div>
                </header>

                {/* Stats Grid */}
                <div
                    data-tour="dashboard-overview-stats"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#0047FF] border-2 border-black rounded-lg flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <BarChart3 className="w-5 h-5 stroke-[2.5px]" />
                            </div>
                            <h3 className="font-bold text-lg text-[#1A1A1A] uppercase tracking-wide">{t("dashboard.overview.totalViews")}</h3>
                        </div>
                        {loadingAnalytics ? (
                            <div className="h-14 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                        ) : (
                            <p className="text-5xl font-black text-[#1A1A1A] mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                {analytics?.views.total || bio?.views || 0}
                            </p>
                        )}
                        {!loadingAnalytics && analytics && analytics.views.total > 0 && renderTrend(analytics.views.change)}
                    </div>

                    <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#D2E823] border-2 border-black rounded-lg flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <MousePointer2 className="w-5 h-5 stroke-[2.5px]" />
                            </div>
                            <h3 className="font-bold text-lg text-[#1A1A1A] uppercase tracking-wide">{t("dashboard.overview.totalClicks")}</h3>
                        </div>
                        {loadingAnalytics ? (
                            <div className="h-14 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                        ) : (
                            <p className="text-5xl font-black text-[#1A1A1A] mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                {analytics?.clicks.total || bio?.clicks || 0}
                            </p>
                        )}
                        {!loadingAnalytics && analytics && analytics.clicks.total > 0 && renderTrend(analytics.clicks.change)}
                    </div>

                    <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-black border-2 border-black rounded-lg flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                                <ArrowUpRight className="w-5 h-5 stroke-[2.5px]" />
                            </div>
                            <h3 className="font-bold text-lg text-[#1A1A1A] uppercase tracking-wide">{t("dashboard.overview.avgCtr")}</h3>
                        </div>
                        {loadingAnalytics ? (
                            <div className="h-14 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                        ) : (
                            <p className="text-5xl font-black text-[#1A1A1A] mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                {analytics?.views.total > 0 ? `${analytics?.ctr.average || 0}%` : '-'}
                            </p>
                        )}
                        {!loadingAnalytics && analytics && analytics.views.total > 0 && renderTrend(analytics.ctr.change)}
                    </div>
                </div>

                {/* Sales & Revenue Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Sales Card */}
                    <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" data-tour="dashboard-overview-sales">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#E94E77] border-2 border-black rounded-xl flex items-center justify-center text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-3">
                                    <DollarSign className="w-7 h-7 stroke-[2.5px]" />
                                </div>
                                <div>
                                    <h3 className="font-black text-2xl text-[#1A1A1A] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.overview.salesRevenue")}</h3>
                                    <p className="text-sm font-medium text-[#1A1A1A]/60">{t("dashboard.overview.salesRevenueSubtitle")}</p>
                                </div>
                            </div>
                        </div>

                        {loadingSales ? (
                            <div className="space-y-4">
                                <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
                                <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
                            </div>
                        ) : sales && sales.connected ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">{t("dashboard.overview.totalSales")}</p>
                                        <p className="text-4xl font-black text-[#1A1A1A] mb-2">{sales.sales.current}</p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold">
                                            {sales.sales.change >= 0 ? (
                                                <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded border border-green-600">+{sales.sales.change}%</span>
                                            ) : (
                                                <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-600">{sales.sales.change}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">{t("dashboard.overview.totalRevenue")}</p>
                                        <p className="text-4xl font-black text-[#1A1A1A] mb-2">
                                            {sales.revenue.currency} ${sales.revenue.current.toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-bold">
                                            {sales.revenue.change >= 0 ? (
                                                <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded border border-green-600">+{sales.revenue.change}%</span>
                                            ) : (
                                                <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-600">{sales.revenue.change}%</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Avg Order Value */}
                                <div className="pt-6 border-t-2 border-dashed border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1">{t("dashboard.overview.avgOrderValue")}</p>
                                            <p className="text-2xl font-black text-[#1A1A1A]">
                                                {sales.revenue.currency} ${sales.averageOrderValue.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <ShoppingCart className="w-5 h-5 text-black" />
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue Trend */}
                                <div className="pt-6 border-t-2 border-dashed border-gray-200">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-4">{t("dashboard.overview.revenueTrend")}</p>
                                    {sales.dailyRevenue && sales.dailyRevenue.length > 0 && sales.dailyRevenue.some(d => d.amount > 0) ? (
                                        <div className="h-24 flex items-end gap-[4px]">
                                            {sales.dailyRevenue.map((day, index) => {
                                                const maxAmount = Math.max(...sales.dailyRevenue.map(d => d.amount), 1);
                                                const height = (day.amount / maxAmount) * 100;
                                                const hasValue = day.amount > 0;
                                                return (
                                                    <div
                                                        key={day.date}
                                                        className="flex-1 relative group"
                                                        style={{ height: '100%' }}
                                                    >
                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 flex items-end justify-center"
                                                            style={{ height: '100%' }}
                                                        >
                                                            <div
                                                                className={`w-full rounded-t-sm transition-all duration-300 ${hasValue
                                                                        ? 'bg-black hover:bg-[#D2E823] cursor-pointer'
                                                                        : 'bg-gray-200'
                                                                    }`}
                                                                style={{
                                                                    height: `${Math.max(height, hasValue ? 8 : 4)}%`,
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                                            <div>{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                                            <div className="text-[#D2E823]">${day.amount.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="h-20 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <TrendingUp className="w-5 h-5 opacity-50" />
                                                <span className="text-sm font-bold">{t("dashboard.overview.noRevenueData")}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CreditCard className="w-8 h-8 text-gray-400" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">{t("dashboard.overview.connectStripeHint")}</h4>
                                <Link
                                    to="/dashboard/integrations"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F172A] hover:opacity-90 text-white rounded-lg font-bold text-sm transition-colors mt-4 shadow-lg"
                                >
                                    {t("dashboard.overview.connectStripe")}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Top Products & Transactions */}
                    <div className="space-y-6">
                        {bio && <WorldMap bioId={bio.id} mini={true} blocked={!isPro} />}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border-2 border-black p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-fit" data-tour="dashboard-overview-activity">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.overview.recentActivity")}</h2>
                            <div className="flex items-center gap-3">
                                <select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setPage(1); // Reset page on filter change
                                    }}
                                    className="bg-white border-2 border-black rounded-lg px-4 py-2 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                                >
                                    <option value="ALL">{t("dashboard.overview.filters.all")}</option>
                                    <option value="PURCHASE">{t("dashboard.overview.filters.purchases")}</option>
                                    <option value="SUBSCRIBE">{t("dashboard.overview.filters.subscribers")}</option>
                                    <option value="CLICK">{t("dashboard.overview.filters.clicks")}</option>
                                    <option value="VIEW">{t("dashboard.overview.filters.views")}</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                            </div>
                        ) : activities.length > 0 ? (
                            <>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-5 p-5 rounded-xl bg-[#F8F9FA] border border-gray-200 hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all group">
                                            <div className="w-12 h-12 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[#1A1A1A] truncate text-base">{activity.description}</p>
                                                <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wide">
                                                    {new Date(activity.createdAt).toLocaleDateString()} • {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {activity.type === "PURCHASE" && (
                                                <div className="px-3 py-1 rounded bg-[#D2E823] border border-black text-black text-xs font-black uppercase tracking-wider border-b-2 border-r-2">
                                                    {t("dashboard.overview.sale")}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t font-bold mt-4">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="text-sm text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ← {t("dashboard.overview.previous")}
                                    </button>
                                    <div className="text-xs text-black/50 bg-black/5 px-3 py-1 rounded-full">
                                        {page} / {totalPages}
                                    </div>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="text-sm text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {t("dashboard.overview.next")} →
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-md">
                                    <BarChart3 className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{t("dashboard.overview.noActivityTitle")}</h3>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm">{t("dashboard.overview.noActivityBody")}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#D2E823] border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col justify-between">
                        {/* Decorative background elements */}
                        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white opacity-20 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black text-white text-[10px] font-black uppercase tracking-wider mb-6">
                                <Sparkles className="w-3 h-3 text-[#D2E823]" />
                                {t("dashboard.overview.proFeature")}
                            </div>
                            <h2 className="text-4xl font-black mb-4 text-black leading-[0.9]" style={{ fontFamily: 'var(--font-display)' }}>
                                {t("dashboard.overview.upgradeTitle").toUpperCase()}
                            </h2>
                            <p className="text-black/80 font-bold text-lg mb-8 leading-relaxed max-w-[90%]">
                                {t("dashboard.overview.upgradeBody")}
                            </p>
                        </div>
                        <button className="w-full py-4 text-center bg-white border-2 border-black text-black font-black uppercase tracking-widest text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl z-10">
                            {t("dashboard.overview.upgradeCta")}
                        </button>
                    </div>
                </div>
            </div>
        </AuthorizationGuard>
    );
}
