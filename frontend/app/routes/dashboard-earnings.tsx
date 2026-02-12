import { useContext, useEffect, useMemo, useState } from "react";
import { DollarSign, Megaphone, Store, TrendingUp } from "lucide-react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";
import { AnalyticsService } from "~/services/analytics.service";
import { useTranslation } from "react-i18next";

interface SponsoredEarningsResponse {
  totalEarnings: number;
  monthlyEarnings: number;
}

interface SponsoredClickItem {
  createdAt: string;
  earnedAmount: number;
}

interface SponsoredHistoryResponse {
  clicks: SponsoredClickItem[];
}

interface MarketingSlot {
  totalRevenue?: number;
}

interface DailyPoint {
  date: string;
  products: number;
  sponsored: number;
  total: number;
}

type RangeKey = "7d" | "30d" | "90d" | "custom";

const formatCurrency = (value: number, currency: string, locale: string) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  } catch {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }
};

export default function DashboardEarnings() {
  const { bio } = useContext(BioContext);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [productsRevenue, setProductsRevenue] = useState(0);
  const [sponsoredRevenue, setSponsoredRevenue] = useState(0);
  const [marketingRevenue, setMarketingRevenue] = useState(0);
  const [dailyPoints, setDailyPoints] = useState<DailyPoint[]>([]);
  const [activeRange, setActiveRange] = useState<RangeKey>("30d");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const today = new Date();
  const defaultStart = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
  const [customStartDate, setCustomStartDate] = useState(defaultStart.toISOString().split("T")[0]);
  const [customEndDate, setCustomEndDate] = useState(today.toISOString().split("T")[0]);

  const getDaysForRange = (range: RangeKey) => {
    if (range === "7d") return 7;
    if (range === "90d") return 90;
    return 30;
  };

  const getRangeDates = () => {
    if (activeRange === "custom") {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);

      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= end) {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
    }

    const days = getDaysForRange(activeRange);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  };

  const buildDateKeys = (start: Date, end: Date) => {
    const keys: string[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      keys.push(cursor.toISOString().split("T")[0]);
      cursor.setDate(cursor.getDate() + 1);
    }

    return keys;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!bio?.id) {
        setProductsRevenue(0);
        setSponsoredRevenue(0);
        setMarketingRevenue(0);
        setCurrency("USD");
        setDailyPoints([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const rangeDates = getRangeDates();
      const salesFilters = activeRange === "custom"
        ? { startDate: customStartDate, endDate: customEndDate }
        : { days: getDaysForRange(activeRange) };

      const [salesResult, sponsoredResult, sponsoredHistoryResult, marketingResult] = await Promise.allSettled([
        AnalyticsService.getSales(bio.id, salesFilters),
        api.get<SponsoredEarningsResponse>("/sponsored/earnings"),
        api.get<SponsoredHistoryResponse>("/sponsored/earnings/history?page=1&limit=500"),
        api.get<MarketingSlot[]>("/marketing/slots"),
      ]);

      if (cancelled) return;

      const salesValue = salesResult.status === "fulfilled" ? salesResult.value : null;
      const sponsoredValue = sponsoredResult.status === "fulfilled" ? sponsoredResult.value.data : null;
      const sponsoredHistory = sponsoredHistoryResult.status === "fulfilled" ? sponsoredHistoryResult.value.data?.clicks || [] : [];
      const marketingValue = marketingResult.status === "fulfilled" ? marketingResult.value.data : [];

      const dateKeys = buildDateKeys(rangeDates.start, rangeDates.end);
      const sponsoredByDay = new Map<string, number>();

      sponsoredHistory.forEach((click) => {
        const createdAt = new Date(click.createdAt);
        if (Number.isNaN(createdAt.getTime())) return;
        if (createdAt < rangeDates.start || createdAt > rangeDates.end) return;

        const key = createdAt.toISOString().split("T")[0];
        sponsoredByDay.set(key, (sponsoredByDay.get(key) || 0) + Number(click.earnedAmount || 0));
      });

      const productsByDay = new Map<string, number>();
      (salesValue?.dailyRevenue || []).forEach((item) => {
        if (!item?.date) return;
        productsByDay.set(item.date, Number(item.amount || 0));
      });

      const mergedDailyPoints: DailyPoint[] = dateKeys.map((date) => {
        const products = Number(productsByDay.get(date) || 0);
        const sponsored = Number(sponsoredByDay.get(date) || 0);
        return {
          date,
          products,
          sponsored,
          total: products + sponsored,
        };
      });

      const filteredProductsRevenue = mergedDailyPoints.reduce((sum, point) => sum + point.products, 0);
      const filteredSponsoredRevenue = mergedDailyPoints.reduce((sum, point) => sum + point.sponsored, 0);

      setProductsRevenue(filteredProductsRevenue);
      setSponsoredRevenue(filteredSponsoredRevenue);
      setMarketingRevenue(
        Array.isArray(marketingValue)
          ? marketingValue.reduce((sum, slot) => sum + Number(slot?.totalRevenue || 0), 0)
          : 0
      );
      setCurrency(String(salesValue?.revenue?.currency || "USD").toUpperCase());
      setDailyPoints(mergedDailyPoints);
      setLoading(false);
    };

    fetchData().catch(() => {
      if (!cancelled) {
        setProductsRevenue(0);
        setSponsoredRevenue(0);
        setMarketingRevenue(0);
        setCurrency("USD");
        setDailyPoints([]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [bio?.id, activeRange, customStartDate, customEndDate]);

  const totalRevenue = useMemo(
    () => productsRevenue + sponsoredRevenue + marketingRevenue,
    [productsRevenue, sponsoredRevenue, marketingRevenue]
  );

  const chartMax = useMemo(() => {
    const max = Math.max(...dailyPoints.map((point) => point.total), 0);
    return max <= 0 ? 1 : max;
  }, [dailyPoints]);

  const chartWidth = 920;
  const chartHeight = 320;
  const paddingLeft = 48;
  const paddingRight = 18;
  const paddingTop = 20;
  const paddingBottom = 44;
  const drawableWidth = chartWidth - paddingLeft - paddingRight;
  const drawableHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (dailyPoints.length <= 1) return paddingLeft;
    return paddingLeft + (index / (dailyPoints.length - 1)) * drawableWidth;
  };

  const getY = (value: number) => {
    const ratio = Math.max(0, Math.min(1, value / chartMax));
    return paddingTop + (1 - ratio) * drawableHeight;
  };

  const linePath = useMemo(() => {
    if (!dailyPoints.length) return "";
    return dailyPoints
      .map((point, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point.total)}`)
      .join(" ");
  }, [dailyPoints, chartMax]);

  const areaPath = useMemo(() => {
    if (!dailyPoints.length || !linePath) return "";
    const firstX = getX(0);
    const lastX = getX(dailyPoints.length - 1);
    const bottomY = paddingTop + drawableHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [dailyPoints, linePath, chartMax]);

  const locale = (i18n.resolvedLanguage || i18n.language || "en").startsWith("pt")
    ? "pt-BR"
    : "en-US";

  const hoveredPoint = hoveredIndex !== null ? dailyPoints[hoveredIndex] : null;

  const quickRanges: Array<{ key: RangeKey; label: string }> = [
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
    { key: "90d", label: "90D" },
    { key: "custom", label: t("dashboard.earningsPage.range.custom") },
  ];

  const formatShortDate = (date: string) =>
    new Date(date).toLocaleDateString(locale, { month: "short", day: "numeric" });

  return (
    <AuthorizationGuard>
      <div className="min-h-screen bg-[#F3F3F1] p-6 md:p-10 space-y-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: "var(--font-display)" }}>
            {t("dashboard.earningsPage.title")}
          </h1>
          <p className="text-sm md:text-base text-[#1A1A1A]/60 font-medium mt-2">
            {t("dashboard.earningsPage.subtitle")}
          </p>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {quickRanges.map((rangeOption) => {
                const isActive = activeRange === rangeOption.key;
                return (
                  <button
                    key={rangeOption.key}
                    type="button"
                    onClick={() => setActiveRange(rangeOption.key)}
                    className={`px-4 py-2 rounded-full text-sm font-black border-2 border-black transition-all ${
                      isActive
                        ? "bg-[#C6F035] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white text-[#1A1A1A]/70 hover:text-black"
                    }`}
                  >
                    {rangeOption.label}
                  </button>
                );
              })}
            </div>

            {activeRange === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-10 px-3 rounded-lg border-2 border-black bg-white text-sm font-semibold"
                />
                <span className="text-xs font-bold text-[#1A1A1A]/60">{t("dashboard.earningsPage.range.to")}</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-10 px-3 rounded-lg border-2 border-black bg-white text-sm font-semibold"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
          <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-violet-700 font-bold text-3xl leading-none">{t("dashboard.earningsPage.title")}</span>
            <span className="text-3xl font-black text-gray-500 leading-none" style={{ fontFamily: "var(--font-display)" }}>
              {loading ? "--" : formatCurrency(totalRevenue, currency, locale)}
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>
                {t("dashboard.earningsPage.chart.title")}
              </h2>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/60 font-medium">
                {t("dashboard.earningsPage.chart.subtitle")}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
          ) : dailyPoints.length === 0 ? (
            <div className="h-72 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-sm font-semibold text-[#1A1A1A]/50">
              {t("dashboard.earningsPage.chart.empty")}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[760px] w-full h-[320px]">
                  <defs>
                    <linearGradient id="earnArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C6F035" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#C6F035" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>

                  {[0, 1, 2, 3, 4].map((line) => {
                    const y = paddingTop + (drawableHeight / 4) * line;
                    return (
                      <line
                        key={line}
                        x1={paddingLeft}
                        y1={y}
                        x2={paddingLeft + drawableWidth}
                        y2={y}
                        stroke="#E5E5E5"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {areaPath && <path d={areaPath} fill="url(#earnArea)" />}

                  {dailyPoints.map((point, index) => {
                    const x = getX(index);
                    const barWidth = Math.max(5, drawableWidth / Math.max(dailyPoints.length * 1.8, 1));
                    const productsHeight = (point.products / chartMax) * drawableHeight;
                    const sponsoredHeight = (point.sponsored / chartMax) * drawableHeight;
                    const baseY = paddingTop + drawableHeight;

                    return (
                      <g key={point.date}>
                        <rect
                          x={x - barWidth / 2}
                          y={baseY - productsHeight}
                          width={barWidth}
                          height={Math.max(0, productsHeight)}
                          fill="#1A1A1A"
                          opacity="0.7"
                          rx="2"
                        />
                        <rect
                          x={x - barWidth / 2}
                          y={baseY - productsHeight - sponsoredHeight}
                          width={barWidth}
                          height={Math.max(0, sponsoredHeight)}
                          fill="#C6F035"
                          rx="2"
                        />
                      </g>
                    );
                  })}

                  {linePath && <path d={linePath} fill="none" stroke="#111111" strokeWidth="2.5" />}

                  {hoveredPoint && hoveredIndex !== null && (
                    <g>
                      <line
                        x1={getX(hoveredIndex)}
                        y1={paddingTop}
                        x2={getX(hoveredIndex)}
                        y2={paddingTop + drawableHeight}
                        stroke="#1A1A1A"
                        strokeDasharray="4 4"
                        opacity="0.25"
                      />
                      <circle
                        cx={getX(hoveredIndex)}
                        cy={getY(hoveredPoint.total)}
                        r="5"
                        fill="#C6F035"
                        stroke="#111111"
                        strokeWidth="2"
                      />
                    </g>
                  )}

                  {dailyPoints.map((point, index) => {
                    const segment = Math.ceil(dailyPoints.length / 6);
                    const shouldRenderLabel = index === 0 || index === dailyPoints.length - 1 || index % Math.max(1, segment) === 0;
                    if (!shouldRenderLabel) return null;

                    return (
                      <text
                        key={`${point.date}-label`}
                        x={getX(index)}
                        y={chartHeight - 14}
                        textAnchor="middle"
                        fill="#6B7280"
                        fontSize="11"
                        fontWeight="700"
                      >
                        {formatShortDate(point.date)}
                      </text>
                    );
                  })}

                  {dailyPoints.map((point, index) => (
                    <rect
                      key={`${point.date}-hit`}
                      x={getX(index) - Math.max(8, drawableWidth / Math.max(dailyPoints.length * 2, 1))}
                      y={paddingTop}
                      width={Math.max(16, drawableWidth / Math.max(dailyPoints.length, 1))}
                      height={drawableHeight}
                      fill="transparent"
                      onMouseEnter={() => setHoveredIndex(index)}
                    />
                  ))}
                </svg>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black text-white">{t("dashboard.earningsPage.chart.legend.products")}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C6F035] text-black border border-black">{t("dashboard.earningsPage.chart.legend.sponsored")}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-[#1A1A1A] border border-gray-300">{t("dashboard.earningsPage.chart.legend.line")}</span>
              </div>

              {hoveredPoint && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="font-black text-[#1A1A1A]">{formatShortDate(hoveredPoint.date)}</span>
                  <span className="font-semibold text-[#1A1A1A]/80">{t("dashboard.earningsPage.details.products")}: {formatCurrency(hoveredPoint.products, currency, locale)}</span>
                  <span className="font-semibold text-[#1A1A1A]/80">{t("dashboard.earningsPage.details.sponsored")}: {formatCurrency(hoveredPoint.sponsored, currency, locale)}</span>
                  <span className="font-black text-[#1A1A1A]">{t("dashboard.earningsPage.details.total")}: {formatCurrency(hoveredPoint.total, currency, locale)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-2 text-[#1A1A1A]">
              <Store className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t("dashboard.earningsPage.cards.products")}</span>
            </div>
            <p className="text-2xl font-black text-[#1A1A1A]">{loading ? "--" : formatCurrency(productsRevenue, currency, locale)}</p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-2 text-[#1A1A1A]">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t("dashboard.earningsPage.cards.sponsored")}</span>
            </div>
            <p className="text-2xl font-black text-[#1A1A1A]">{loading ? "--" : formatCurrency(sponsoredRevenue, currency, locale)}</p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-2 text-[#1A1A1A]">
              <Megaphone className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t("dashboard.earningsPage.cards.marketing")}</span>
            </div>
            <p className="text-2xl font-black text-[#1A1A1A]">{loading ? "--" : formatCurrency(marketingRevenue, currency, locale)}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2 text-[#1A1A1A]">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{t("dashboard.earningsPage.cards.summary")}</span>
          </div>
          <p className="text-sm text-[#1A1A1A]/70">
            {t("dashboard.earningsPage.summaryText")}
          </p>
        </div>
      </div>
    </AuthorizationGuard>
  );
}
