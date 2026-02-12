import type { MetaFunction } from "react-router";
import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    DollarSign, Search, ExternalLink, Trash2, Loader2, TrendingUp, MousePointerClick,
    Link as LinkIcon, ShoppingBag, Utensils, Cpu, Shirt, Heart, GraduationCap, Gamepad2,
    Plane, Trophy, MoreHorizontal, X, Check, Eye, Filter, ChevronRight, Sparkles,
    BarChart3
} from "lucide-react";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import * as SponsoredApi from "~/services/sponsored-api";
import type { SponsoredOffer, SponsoredAdoption, EarningsSummary } from "~/services/sponsored-api";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.sponsored.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.sponsored.description", { lng: lang }) },
    ];
};

const PLAN_LIMITS: Record<string, number> = {
    free: 1,
    standard: 3,
    pro: 10,
};

export default function DashboardSponsored() {
    const { bio } = useContext(BioContext);
    const { user } = useContext(AuthContext);
    const { t } = useTranslation("dashboard");

    const CATEGORIES = useMemo(() => [
        { id: "all", label: t("sponsored.categories.all"), icon: MoreHorizontal },
        { id: "food", label: t("sponsored.categories.food"), icon: Utensils },
        { id: "tech", label: t("sponsored.categories.tech"), icon: Cpu },
        { id: "fashion", label: t("sponsored.categories.fashion"), icon: Shirt },
        { id: "health", label: t("sponsored.categories.health"), icon: Heart },
        { id: "finance", label: t("sponsored.categories.finance"), icon: DollarSign },
        { id: "education", label: t("sponsored.categories.education"), icon: GraduationCap },
        { id: "entertainment", label: t("sponsored.categories.entertainment"), icon: Gamepad2 },
        { id: "travel", label: t("sponsored.categories.travel"), icon: Plane },
        { id: "sports", label: t("sponsored.categories.sports"), icon: Trophy },
        { id: "other", label: t("sponsored.categories.other"), icon: ShoppingBag },
    ], [t]);

    const [activeTab, setActiveTab] = useState<"marketplace" | "my-links">("marketplace");
    const [offers, setOffers] = useState<SponsoredOffer[]>([]);
    const [totalOffers, setTotalOffers] = useState(0);
    const [myLinks, setMyLinks] = useState<SponsoredAdoption[]>([]);
    const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingLinks, setLoadingLinks] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [page, setPage] = useState(1);
    const [adoptingId, setAdoptingId] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const plan = user?.plan || "free";
    const maxLinks = PLAN_LIMITS[plan] ?? 1;

    // Fetch marketplace
    const loadMarketplace = useCallback(async () => {
        setLoading(true);
        try {
            const result = await SponsoredApi.fetchMarketplace({
                category: category !== "all" ? category : undefined,
                search: search || undefined,
                page,
            });
            setOffers(result.offers);
            setTotalOffers(result.total);
        } catch (err: any) {
            setError(err.response?.data?.error || t("sponsored.messages.errorLoad"));
        } finally {
            setLoading(false);
        }
    }, [category, search, page]);

    // Fetch my links & earnings
    const loadMyLinks = useCallback(async () => {
        if (!bio?.id) return;
        setLoadingLinks(true);
        try {
            const [links, earn] = await Promise.all([
                SponsoredApi.fetchMyLinks(bio.id),
                SponsoredApi.fetchEarnings(),
            ]);
            setMyLinks(links);
            setEarnings(earn);
        } catch (err: any) {
            console.error("Error loading links:", err);
        } finally {
            setLoadingLinks(false);
        }
    }, [bio?.id]);

    useEffect(() => {
        loadMarketplace();
    }, [loadMarketplace]);

    useEffect(() => {
        loadMyLinks();
    }, [loadMyLinks]);

    // Adopt an offer
    const handleAdopt = async (offerId: string) => {
        if (!bio?.id) return;
        setAdoptingId(offerId);
        setError(null);
        try {
            await SponsoredApi.adoptOffer(offerId, bio.id);
            setSuccess(t("sponsored.messages.adopted"));
            await loadMyLinks();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || t("sponsored.messages.errorAdopt"));
        } finally {
            setAdoptingId(null);
        }
    };

    // Remove adoption
    const handleRemove = async (adoptionId: string) => {
        if (!confirm(t("sponsored.messages.confirmRemove"))) return;
        setRemovingId(adoptionId);
        try {
            await SponsoredApi.removeAdoption(adoptionId);
            setMyLinks(prev => prev.filter(l => l.id !== adoptionId));
            setSuccess(t("sponsored.messages.removed"));
            await loadMyLinks();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || t("sponsored.messages.errorRemove"));
        } finally {
            setRemovingId(null);
        }
    };

    const isAlreadyAdopted = (offerId: string) => myLinks.some(l => l.offerId === offerId);
    const canAdoptMore = myLinks.length < maxLinks;

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6F035] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-wider mb-3">
                        <DollarSign className="w-3.5 h-3.5" />
                        {t("sponsored.tabs.marketplace")}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                        {t("sponsored.title")}
                    </h1>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base font-medium">
                        {t("sponsored.subtitle")}
                    </p>
                </div>

                {/* Earnings Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white border-3 border-black rounded-[16px] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {t("sponsored.earnings.totalBalance")}
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
                            ${earnings?.totalEarnings?.toFixed(2) || "0.00"}
                        </p>
                    </div>
                    <div className="bg-white border-3 border-black rounded-[16px] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {t("sponsored.earnings.thisMonth")}
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-[#7ab800]">
                            ${earnings?.monthlyEarnings?.toFixed(2) || "0.00"}
                        </p>
                    </div>
                    <div className="bg-white border-3 border-black rounded-[16px] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                            <MousePointerClick className="w-3.5 h-3.5" />
                            {t("sponsored.earnings.totalClicks")}
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
                            {earnings?.totalClicks || 0}
                        </p>
                    </div>
                    <div className="bg-white border-3 border-black rounded-[16px] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                            <LinkIcon className="w-3.5 h-3.5" />
                            {t("sponsored.earnings.activeLinks")}
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
                            {earnings?.activeLinks || 0}
                            <span className="text-sm font-normal text-gray-400">/{maxLinks}</span>
                        </p>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-xl text-red-700 text-sm font-bold flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(220,38,38,0.3)]">
                        {error}
                        <X className="w-4 h-4 cursor-pointer" onClick={() => setError(null)} />
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-[#C6F035]/20 border-2 border-[#C6F035] rounded-xl text-[#1A1A1A] text-sm font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                        <Check className="w-4 h-4" />
                        {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-[14px] mb-6 border-2 border-black">
                    <button
                        onClick={() => setActiveTab("marketplace")}
                        className={`flex-1 py-2.5 px-4 rounded-[10px] font-black text-sm uppercase tracking-wide transition-all ${
                            activeTab === "marketplace"
                                ? "bg-[#C6F035] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                : "text-gray-500 border-2 border-transparent hover:text-black"
                        }`}
                    >
                        <ShoppingBag className="w-4 h-4 inline mr-2" />
                        {t("sponsored.tabs.marketplace")}
                    </button>
                    <button
                        onClick={() => setActiveTab("my-links")}
                        className={`flex-1 py-2.5 px-4 rounded-[10px] font-black text-sm uppercase tracking-wide transition-all ${
                            activeTab === "my-links"
                                ? "bg-[#C6F035] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                : "text-gray-500 border-2 border-transparent hover:text-black"
                        }`}
                    >
                        <LinkIcon className="w-4 h-4 inline mr-2" />
                        {t("sponsored.tabs.myLinks")}
                        {myLinks.length > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-black text-[#C6F035] rounded-md text-xs font-black">
                                {myLinks.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Marketplace Tab */}
                {activeTab === "marketplace" && (
                    <div>
                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-5">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t("sponsored.marketplace.searchPlaceholder")}
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-0 outline-none transition-all placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Category filters */}
                        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setCategory(cat.id); setPage(1); }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 ${
                                            category === cat.id
                                                ? "bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                : "bg-white text-gray-600 border-gray-300 hover:border-black"
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Offers Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
                            </div>
                        ) : offers.length === 0 ? (
                            <div className="text-center py-20">
                                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">{t("sponsored.marketplace.emptyTitle")}</p>
                                <p className="text-gray-400 text-sm mt-1">{t("sponsored.marketplace.emptySubtitle")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {offers.map(offer => {
                                    const adopted = isAlreadyAdopted(offer.id);
                                    const adopting = adoptingId === offer.id;
                                    const catObj = CATEGORIES.find(c => c.id === offer.category);

                                    return (
                                        <div
                                            key={offer.id}
                                            className="bg-white border-3 border-black rounded-[16px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group"
                                        >
                                            {/* Card Header with company info */}
                                            <div
                                                className="p-4 pb-3 flex items-start gap-3"
                                                style={{ borderBottom: "1px solid #f3f4f6" }}
                                            >
                                                {offer.imageUrl ? (
                                                    <img
                                                        src={offer.imageUrl}
                                                        alt={offer.title}
                                                        className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-lg"
                                                        style={{ backgroundColor: offer.backgroundColor || "#10b981" }}
                                                    >
                                                        {offer.title.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                                                        {offer.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {offer.company?.companyName || t("sponsored.marketplace.company")}
                                                    </p>
                                                </div>
                                                {catObj && (
                                                    <span className="px-2 py-0.5 bg-[#C6F035]/30 text-black border border-black/10 rounded-md text-[10px] font-black whitespace-nowrap uppercase">
                                                        {catObj.label}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="px-4 py-3">
                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                    {offer.description}
                                                </p>
                                            </div>

                                            {/* CPC & Action */}
                                            <div className="px-4 pb-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-medium">{t("sponsored.marketplace.earnPerClick")}</p>
                                                    <p className="text-lg font-black text-[#1A1A1A]">
                                                        ${Number(offer.cpcRate).toFixed(2)}
                                                    </p>
                                                </div>
                                                {adopted ? (
                                                    <span className="px-3 py-1.5 bg-[#C6F035]/20 text-black border-2 border-[#C6F035] rounded-xl text-xs font-black flex items-center gap-1">
                                                        <Check className="w-3.5 h-3.5" />
                                                        {t("sponsored.marketplace.added")}
                                                    </span>
                                                ) : !canAdoptMore ? (
                                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-400 border-2 border-gray-200 rounded-xl text-xs font-bold">
                                                        {t("sponsored.marketplace.limitReached")}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAdopt(offer.id)}
                                                        disabled={adopting}
                                                        className="px-4 py-2 bg-[#C6F035] hover:bg-[#d2e823] text-black border-2 border-black rounded-xl text-xs font-black transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                                                    >
                                                        {adopting ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <LinkIcon className="w-3.5 h-3.5" />
                                                                {t("sponsored.marketplace.add")}
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalOffers > 20 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-sm font-black bg-white border-2 border-black rounded-lg disabled:opacity-40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all uppercase"
                                >
                                    {t("sponsored.marketplace.previous")}
                                </button>
                                <span className="px-3 py-1.5 text-sm text-gray-500 font-bold">
                                    {t("sponsored.marketplace.pageOf", { page, total: Math.ceil(totalOffers / 20) })}
                                </span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page * 20 >= totalOffers}
                                    className="px-3 py-1.5 text-sm font-black bg-white border-2 border-black rounded-lg disabled:opacity-40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all uppercase"
                                >
                                    {t("sponsored.marketplace.next")}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* My Links Tab */}
                {activeTab === "my-links" && (
                    <div>
                        {loadingLinks ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
                            </div>
                        ) : myLinks.length === 0 ? (
                            <div className="text-center py-20">
                                <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">{t("sponsored.myLinks.emptyTitle")}</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {t("sponsored.myLinks.emptySubtitle")}
                                </p>
                                <button
                                    onClick={() => setActiveTab("marketplace")}
                                    className="mt-4 px-4 py-2 bg-[#C6F035] text-black border-2 border-black rounded-xl text-sm font-black hover:bg-[#d2e823] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 uppercase tracking-wide"
                                >
                                    {t("sponsored.myLinks.exploreMarketplace")}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myLinks.map(link => (
                                    <div
                                        key={link.id}
                                        className="bg-white border-3 border-black rounded-[16px] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Logo */}
                                            {link.offer?.imageUrl ? (
                                                <img
                                                    src={link.offer.imageUrl}
                                                    alt={link.offer.title}
                                                    className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 flex-shrink-0"
                                                />
                                            ) : (
                                                <div
                                                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-xl"
                                                    style={{ backgroundColor: link.offer?.backgroundColor || "#10b981" }}
                                                >
                                                    {link.offer?.title?.charAt(0) || "S"}
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm">
                                                    {link.offer?.title || t("sponsored.marketplace.company")}
                                                </h3>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {link.offer?.company?.companyName || t("sponsored.marketplace.company")}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MousePointerClick className="w-3 h-3" />
                                                        {link.totalClicks} clicks
                                                    </span>
                                                    <span className="text-xs text-[#1A1A1A] font-black flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3" />
                                                        ${Number(link.totalEarnings).toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        CPC: ${Number(link.offer?.cpcRate || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <a
                                                    href={link.offer?.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Ver link"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                                </a>
                                                <button
                                                    onClick={() => handleRemove(link.id)}
                                                    disabled={removingId === link.id}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                                    title="Remover"
                                                >
                                                    {removingId === link.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Link de tracking */}
                                        <div className="mt-3 pt-3 border-t-2 border-black/10">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t("sponsored.myLinks.trackingLink")}</p>
                                            <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1.5 rounded-lg block truncate border border-gray-200 font-mono font-bold">
                                                {typeof window !== "undefined"
                                                    ? `${window.location.origin}/api/public/sponsored/click/${link.trackingCode}`
                                                    : `/api/public/sponsored/click/${link.trackingCode}`}
                                            </code>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
