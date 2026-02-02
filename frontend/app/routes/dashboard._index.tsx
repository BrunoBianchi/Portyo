import { useContext, useEffect, useState } from "react";
import BioContext from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import { BarChart3, MousePointer2, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, ExternalLink, PenTool, ShoppingBag, Mail, Eye, DollarSign, ShoppingCart, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
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
            case "VIEW": return <Eye className="w-5 h-5 text-muted-foreground" />;
            default: return <Sparkles className="w-5 h-5 text-yellow-500" />;
        }
    };

    const renderTrend = (change: number) => {
        const isPositive = change >= 0;
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-500/10 text-green-700' : 'bg-destructive/10 text-red-700'}`}>
                <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
                <span>{isPositive ? '+' : ''}{change}%</span>
                <span className={`${isPositive ? 'text-green-400/70' : 'text-destructive/70'} font-medium`}>{t("dashboard.overview.vsLastMonth")}</span>
            </div>
        );
    };

    return (
        <AuthorizationGuard>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
                <header
                    data-tour="dashboard-overview-header"
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                            <Sparkles className="w-3 h-3" />
                            {t("dashboard.overview.overview")}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.overview.title")}</h1>
                        <p className="text-muted-foreground">{t("dashboard.overview.subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {bio && (
                            <>
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={`https://portyo.me/p/${bio.sufix}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {t("dashboard.overview.viewPage")}
                                    </a>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link to="/dashboard/editor">
                                        <PenTool className="w-4 h-4 mr-2" />
                                        {t("dashboard.overview.openEditor")}
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                {/* Stats Grid */}
                <div
                    data-tour="dashboard-overview-stats"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <Card className="relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BarChart3 className="w-24 h-24 text-primary" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-sm text-muted-foreground">{t("dashboard.overview.totalViews")}</h3>
                            </div>
                            {loadingAnalytics ? (
                                <Skeleton className="h-10 w-24 mb-2" />
                            ) : (
                                <p className="text-4xl font-bold tracking-tight mb-2">{analytics?.views.total || bio?.views || 0}</p>
                            )}
                            {!loadingAnalytics && analytics && renderTrend(analytics.views.change)}
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MousePointer2 className="w-24 h-24 text-primary" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <MousePointer2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-sm text-muted-foreground">{t("dashboard.overview.totalClicks")}</h3>
                            </div>
                            {loadingAnalytics ? (
                                <Skeleton className="h-10 w-24 mb-2" />
                            ) : (
                                <p className="text-4xl font-bold tracking-tight mb-2">{analytics?.clicks.total || bio?.clicks || 0}</p>
                            )}
                            {!loadingAnalytics && analytics && renderTrend(analytics.clicks.change)}
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowUpRight className="w-24 h-24 text-primary" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-sm text-muted-foreground">{t("dashboard.overview.avgCtr")}</h3>
                            </div>
                            {loadingAnalytics ? (
                                <Skeleton className="h-10 w-24 mb-2" />
                            ) : (
                                <p className="text-4xl font-bold tracking-tight mb-2">{analytics?.ctr.average || 0}%</p>
                            )}
                            {!loadingAnalytics && analytics && renderTrend(analytics.ctr.change)}
                        </CardContent>
                    </Card>
                </div>

                {/* Sales & Revenue Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Sales Card */}
                    <Card className="h-full" data-tour="dashboard-overview-sales">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center shrink-0">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.overview.salesRevenue")}</h3>
                                        <p className="text-sm text-muted-foreground">{t("dashboard.overview.salesRevenueSubtitle")}</p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {loadingSales ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-6 w-40" />
                                </div>
                            ) : sales && sales.connected ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{t("dashboard.overview.totalSales")}</p>
                                            <p className="text-2xl font-bold">{sales.sales.current}</p>
                                            <div className="mt-1 flex items-center gap-1.5 text-sm">
                                                {sales.sales.change >= 0 ? (
                                                    <span className="text-green-400 font-semibold flex items-center gap-0.5">
                                                        <ArrowUpRight className="w-3 h-3" /> {sales.sales.change}%
                                                    </span>
                                                ) : (
                                                    <span className="text-destructive font-semibold flex items-center gap-0.5">
                                                        <ArrowDownRight className="w-3 h-3" /> {sales.sales.change}%
                                                    </span>
                                                )}
                                                <span className="text-muted-foreground text-xs">{t("dashboard.overview.vsLastMonth")}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{t("dashboard.overview.totalRevenue")}</p>
                                            <p className="text-2xl font-bold">
                                                {sales.revenue.currency} ${sales.revenue.current.toFixed(2)}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1.5 text-sm">
                                                {sales.revenue.change >= 0 ? (
                                                    <span className="text-green-400 font-semibold flex items-center gap-0.5">
                                                        <ArrowUpRight className="w-3 h-3" /> {sales.revenue.change}%
                                                    </span>
                                                ) : (
                                                    <span className="text-destructive font-semibold flex items-center gap-0.5">
                                                        <ArrowDownRight className="w-3 h-3" /> {sales.revenue.change}%
                                                    </span>
                                                )}
                                                <span className="text-muted-foreground text-xs">{t("dashboard.overview.vsLastMonth")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{t("dashboard.overview.avgOrderValue")}</p>
                                                <p className="text-xl font-bold">
                                                    {sales.revenue.currency} ${sales.averageOrderValue.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                                <ShoppingCart className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    {sales.dailyRevenue && sales.dailyRevenue.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm text-muted-foreground mb-3">{t("dashboard.overview.revenueTrend")}</p>
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
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
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
                                    <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-7 h-7 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">{t("dashboard.overview.connectStripeHint")}</p>
                                    <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                                        <Link to="/dashboard/integrations">
                                            {t("dashboard.overview.connectStripe")}
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Products & Transactions */}
                    <div className="space-y-6">
                        {bio && <WorldMap bioId={bio.id} mini={true} blocked={!isPro} />}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 h-full" data-tour="dashboard-overview-activity">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.overview.recentActivity")}</h2>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={filterType}
                                        onValueChange={(value) => {
                                            setFilterType(value);
                                            setPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-[140px] h-8 text-xs">
                                            <SelectValue placeholder={t("dashboard.overview.filters.all")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">{t("dashboard.overview.filters.all")}</SelectItem>
                                            <SelectItem value="PURCHASE">{t("dashboard.overview.filters.purchases")}</SelectItem>
                                            <SelectItem value="SUBSCRIBE">{t("dashboard.overview.filters.subscribers")}</SelectItem>
                                            <SelectItem value="CLICK">{t("dashboard.overview.filters.clicks")}</SelectItem>
                                            <SelectItem value="VIEW">{t("dashboard.overview.filters.views")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="text-xs text-muted-foreground font-medium px-2">{t("dashboard.overview.pageOf", { page, totalPages })}</div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                </div>
                            ) : activities.length > 0 ? (
                                <>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors border border-border/50">
                                                <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center shrink-0 border border-border">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground">
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
                                    <div className="flex items-center justify-between pt-6 border-t mt-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            {t("dashboard.overview.previous")}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                        >
                                            {t("dashboard.overview.next")}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-accent/20">
                                    <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm border">
                                        <BarChart3 className="w-7 h-7 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.overview.noActivityTitle")}</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto text-sm">{t("dashboard.overview.noActivityBody")}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="p-8 bg-zinc-950 text-white relative overflow-hidden border-zinc-900">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-card/10 text-white text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
                                <Sparkles className="w-3 h-3 text-primary" />
                                {t("dashboard.overview.proFeature")}
                            </div>
                            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.overview.upgradeTitle")}</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">{t("dashboard.overview.upgradeBody")}</p>
                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-bold">
                                {t("dashboard.overview.upgradeCta")}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthorizationGuard>
    );
}
