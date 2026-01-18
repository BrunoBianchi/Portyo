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
    const { t } = useTranslation();
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
            case "PURCHASE": return <ShoppingBag className="w-5 h-5 text-green-500" />;
            case "SUBSCRIBE": return <Mail className="w-5 h-5 text-blue-500" />;
            case "CLICK": return <MousePointer2 className="w-5 h-5 text-purple-500" />;
            case "VIEW": return <Eye className="w-5 h-5 text-gray-500" />;
            default: return <Sparkles className="w-5 h-5 text-yellow-500" />;
        }
    };

    const renderTrend = (change: number) => {
        const isPositive = change >= 0;
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
                <span>{isPositive ? '+' : ''}{change}%</span>
                <span className={`${isPositive ? 'text-green-600/70' : 'text-red-600/70'} font-medium`}>{t("dashboard.overview.vsLastMonth")}</span>
            </div>
        );
    };

    return (
        <AuthorizationGuard>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                <header
                    data-tour="dashboard-overview-header"
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                            <Sparkles className="w-3 h-3" />
                            {t("dashboard.overview.overview")}
                        </div>
                        <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">{t("dashboard.overview.title")}</h1>
                        <p className="text-lg text-text-muted">{t("dashboard.overview.subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {bio && (
                            <>
                                <a
                                    href={`https://portyo.me/p/${bio.sufix}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-secondary btn-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    {t("dashboard.overview.viewPage")}
                                </a>
                                <a
                                    href={`/dashboard/editor`}
                                    className="btn btn-primary btn-sm"
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
                    <div className="card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BarChart3 className="w-24 h-24 text-primary-foreground" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="label mb-0">{t("dashboard.overview.totalViews")}</h3>
                            </div>
                            {loadingAnalytics ? (
                                <div className="h-10 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                            ) : (
                                <p className="text-4xl font-extrabold text-text-main mb-2">{analytics?.views.total || bio?.views || 0}</p>
                            )}
                            {!loadingAnalytics && analytics && renderTrend(analytics.views.change)}
                        </div>
                    </div>

                    <div className="card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MousePointer2 className="w-24 h-24 text-primary-foreground" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                    <MousePointer2 className="w-6 h-6" />
                                </div>
                                <h3 className="label mb-0">{t("dashboard.overview.totalClicks")}</h3>
                            </div>
                            {loadingAnalytics ? (
                                <div className="h-10 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                            ) : (
                                <p className="text-4xl font-extrabold text-text-main mb-2">{analytics?.clicks.total || bio?.clicks || 0}</p>
                            )}
                            {!loadingAnalytics && analytics && renderTrend(analytics.clicks.change)}
                        </div>
                    </div>

                    <div className="card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowUpRight className="w-24 h-24 text-primary-foreground" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                    <ArrowUpRight className="w-6 h-6" />
                                </div>
                                <h3 className="label mb-0">{t("dashboard.overview.avgCtr")}</h3>
                            </div>
                            {loadingAnalytics ? (
                                <div className="h-10 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                            ) : (
                                <p className="text-4xl font-extrabold text-text-main mb-2">{analytics?.ctr.average || 0}%</p>
                            )}
                            {!loadingAnalytics && analytics && renderTrend(analytics.ctr.change)}
                        </div>
                    </div>
                </div>

                {/* Sales & Revenue Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Sales Card */}
                    <div className="card p-6" data-tour="dashboard-overview-sales">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-main text-lg">{t("dashboard.overview.salesRevenue")}</h3>
                                    <p className="text-sm text-text-muted mt-0.5">{t("dashboard.overview.salesRevenueSubtitle")}</p>
                                </div>
                            </div>
                        </div>

                        {loadingSales ? (
                            <div className="space-y-3">
                                <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
                                <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
                            </div>
                        ) : sales && sales.connected ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-text-muted mb-1">{t("dashboard.overview.totalSales")}</p>
                                        <p className="text-2xl font-bold text-text-main">{sales.sales.current}</p>
                                        <div className="mt-1 flex items-center gap-1.5 text-sm">
                                            {sales.sales.change >= 0 ? (
                                                <>
                                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                                    <span className="text-green-600 font-semibold">+{sales.sales.change}%</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                                                    <span className="text-red-600 font-semibold">{sales.sales.change}%</span>
                                                </>
                                            )}
                                            <span className="text-text-muted">{t("dashboard.overview.vsLastMonth")}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-muted mb-1">{t("dashboard.overview.totalRevenue")}</p>
                                        <p className="text-2xl font-bold text-text-main">
                                            {sales.revenue.currency} ${sales.revenue.current.toFixed(2)}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1.5 text-sm">
                                            {sales.revenue.change >= 0 ? (
                                                <>
                                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                                    <span className="text-green-600 font-semibold">+{sales.revenue.change}%</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                                                    <span className="text-red-600 font-semibold">{sales.revenue.change}%</span>
                                                </>
                                            )}
                                            <span className="text-text-muted">{t("dashboard.overview.vsLastMonth")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Avg Order Value */}
                                <div className="pt-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-text-muted mb-1">{t("dashboard.overview.avgOrderValue")}</p>
                                            <p className="text-xl font-bold text-text-main">
                                                {sales.revenue.currency} ${sales.averageOrderValue.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                            <ShoppingCart className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue Sparkline */}
                                {sales.dailyRevenue && sales.dailyRevenue.length > 0 && (
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-sm text-text-muted mb-3">{t("dashboard.overview.revenueTrend")}</p>
                                        <div className="h-16 flex items-end gap-[2px]">
                                            {sales.dailyRevenue.map((day) => {
                                                const maxAmount = Math.max(...sales.dailyRevenue.map(d => d.amount), 1);
                                                const height = (day.amount / maxAmount) * 100;
                                                return (
                                                    <div
                                                        key={day.date}
                                                        className="flex-1 bg-green-200 hover:bg-green-400 rounded-t transition-colors cursor-pointer group relative"
                                                        style={{ height: `${Math.max(height, 4)}%` }}
                                                        title={`${day.date}: $${day.amount.toFixed(2)}`}
                                                    >
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                                            ${day.amount.toFixed(2)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8 text-text-muted" />
                                </div>
                                <p className="text-sm text-text-muted mb-4">{t("dashboard.overview.connectStripeHint")}</p>
                                <Link
                                    to="/dashboard/integrations"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
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
                    <div className="lg:col-span-2 card p-8 h-fit" data-tour="dashboard-overview-activity">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-text-main">{t("dashboard.overview.recentActivity")}</h2>
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setPage(1); // Reset page on filter change
                                    }}
                                    className="bg-surface-alt border border-border rounded-lg px-3 py-1.5 text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="ALL">{t("dashboard.overview.filters.all")}</option>
                                    <option value="PURCHASE">{t("dashboard.overview.filters.purchases")}</option>
                                    <option value="SUBSCRIBE">{t("dashboard.overview.filters.subscribers")}</option>
                                    <option value="CLICK">{t("dashboard.overview.filters.clicks")}</option>
                                    <option value="VIEW">{t("dashboard.overview.filters.views")}</option>
                                </select>
                                <div className="text-xs text-text-muted font-medium px-2">{t("dashboard.overview.pageOf", { page, totalPages })}</div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : activities.length > 0 ? (
                            <>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-alt/30 hover:bg-surface-alt/50 transition-colors border border-border/50">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-text-main truncate">{activity.description}</p>
                                                <p className="text-xs text-text-muted">
                                                    {new Date(activity.createdAt).toLocaleDateString()} {t("dashboard.overview.at")} {new Date(activity.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            {activity.type === "PURCHASE" && (
                                                <div className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold">
                                                    {t("dashboard.overview.sale")}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-4">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="text-sm font-medium text-text-muted hover:text-text-main disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {t("dashboard.overview.previous")}
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="text-sm font-medium text-text-muted hover:text-text-main disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {t("dashboard.overview.next")}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-2xl bg-surface-alt/50">
                                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <BarChart3 className="w-8 h-8 text-text-muted" />
                                </div>
                                <h3 className="text-lg font-bold text-text-main mb-1">{t("dashboard.overview.noActivityTitle")}</h3>
                                <p className="text-text-muted max-w-xs mx-auto">{t("dashboard.overview.noActivityBody")}</p>
                            </div>
                        )}
                    </div>

                    <div className="card p-8 bg-black text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
                                <Sparkles className="w-3 h-3 text-primary" />
                                {t("dashboard.overview.proFeature")}
                            </div>
                            <h2 className="text-2xl font-bold mb-3">{t("dashboard.overview.upgradeTitle")}</h2>
                            <p className="text-gray-400 mb-8 leading-relaxed">{t("dashboard.overview.upgradeBody")}</p>
                            <button className="w-full btn bg-primary text-primary-foreground hover:bg-primary-hover border-none">
                                {t("dashboard.overview.upgradeCta")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthorizationGuard>
    );
}
