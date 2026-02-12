
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router";
import {
    Package, Plus, Loader2, Pause, Play, ExternalLink,
    DollarSign, MousePointerClick
} from "lucide-react";
import CompanyAuthContext from "~/contexts/company-auth.context";
import { useTranslation } from "react-i18next";
import { useCompanyUrl } from "~/lib/company-utils";

export function CompanyOffersList() {
    const { offers, fetchOffers, togglePause, loading } = useContext(CompanyAuthContext);
    const { t } = useTranslation("company");
    const companyUrl = useCompanyUrl();
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleToggle = async (offerId: string, currentStatus: string) => {
        setToggling(offerId);
        try {
            await togglePause(offerId);
        } finally {
            setToggling(null);
        }
    };

    return (
        <div className="p-6 md:p-10 bg-[#F3F3F1] min-h-screen space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("company.dashboard.myOffers")}</h1>
                    <p className="text-lg font-medium text-[#1A1A1A]/60">{t("company.dashboard.manageOffers")}</p>
                </div>
                <Link
                    to={companyUrl.createOffer}
                    className="px-6 py-3 bg-[#D2E823] border-2 border-black text-black rounded-full text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    {t("company.dashboard.newOffer")}
                </Link>
            </div>

            {/* Stats Overview */}
            {offers.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">{t("company.dashboard.totalOffers")}</p>
                        <p className="text-4xl font-black text-[#1A1A1A]">{offers.length}</p>
                    </div>
                    <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">{t("company.dashboard.active")}</p>
                        <p className="text-4xl font-black text-[#1A1A1A]">
                            {offers.filter(o => o.status === "active").length}
                        </p>
                    </div>
                    <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">{t("company.dashboard.totalClicks")}</p>
                        <p className="text-4xl font-black text-[#1A1A1A]">
                            {offers.reduce((s, o) => s + (o.totalClicks || 0), 0)}
                        </p>
                    </div>
                    <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">{t("company.dashboard.totalInvested")}</p>
                        <p className="text-4xl font-black text-[#1A1A1A]">
                            ${offers.reduce((s, o) => s + Number(o.totalSpent || 0), 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            )}

            {/* Offers List */}
            {loading && offers.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                </div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-2xl">
                    <div className="w-16 h-16 bg-[#F3F3F1] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-8 h-8 text-black" />
                    </div>
                    <p className="text-xl font-bold text-[#1A1A1A] mb-2">{t("company.dashboard.noOffers")}</p>
                    <p className="text-[#1A1A1A]/60 font-medium max-w-xs mx-auto mb-6">{t("company.dashboard.noOffersSubtitle")}</p>
                    <Link
                        to={companyUrl.createOffer}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#D2E823] border-2 border-black text-black rounded-full text-sm font-black uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        {t("company.dashboard.createOffer")}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {offers.map(offer => (
                        <div
                            key={offer.id}
                            className="bg-white border-2 border-black rounded-2xl p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                {offer.imageUrl ? (
                                    <img
                                        src={offer.imageUrl}
                                        alt={offer.title}
                                        className="w-20 h-20 rounded-xl object-cover border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    />
                                ) : (
                                    <div
                                        className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        style={{ backgroundColor: offer.backgroundColor || "#000000" }}
                                    >
                                        {offer.title.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-xl text-[#1A1A1A]">{offer.title}</h3>
                                        <span className={`px-2.5 py-0.5 rounded border-2 border-black text-[10px] font-black uppercase tracking-wider ${offer.status === "active"
                                            ? "bg-[#D2E823] text-black"
                                            : offer.status === "paused"
                                                ? "bg-yellow-100 text-black"
                                                : "bg-red-100 text-black"
                                            }`}>
                                            {offer.status === "active" ? t("company.dashboard.statusActive") : offer.status === "paused" ? t("company.dashboard.statusPaused") : offer.status === "exhausted" ? t("company.dashboard.statusExhausted") : offer.status}
                                        </span>
                                    </div>
                                    <p className="text-[#1A1A1A]/60 font-medium mb-3 line-clamp-1">{offer.description}</p>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase tracking-wide">
                                            <DollarSign className="w-4 h-4" />
                                            {t("company.dashboard.cpc")}: ${Number(offer.cpcRate).toFixed(2)}
                                        </span>
                                        <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 uppercase tracking-wide">
                                            <MousePointerClick className="w-4 h-4" />
                                            {offer.totalClicks || 0} {t("company.dashboard.clicks")}
                                        </span>
                                        {offer.totalBudget && (
                                            <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                                                {t("company.dashboard.budget")}: ${Number(offer.totalSpent || 0).toFixed(2)} / ${Number(offer.totalBudget).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggle(offer.id, offer.status)}
                                        disabled={toggling === offer.id}
                                        className={`p-3 rounded-lg border-2 border-black transition-all ${offer.status === "active"
                                            ? "bg-yellow-100 hover:bg-yellow-200 text-black"
                                            : "bg-[#D2E823] hover:opacity-90 text-black"
                                            } hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none`}
                                        title={offer.status === "active" ? t("company.dashboard.pause") : t("company.dashboard.activate")}
                                    >
                                        {toggling === offer.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : offer.status === "active" ? (
                                            <Pause className="w-5 h-5 fill-current" />
                                        ) : (
                                            <Play className="w-5 h-5 fill-current" />
                                        )}
                                    </button>
                                    <a
                                        href={offer.linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white hover:bg-gray-50 border-2 border-black rounded-lg transition-all text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
