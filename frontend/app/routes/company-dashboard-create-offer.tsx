import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import {
    ArrowLeft, Plus, Loader2, DollarSign, Link as LinkIcon, Image, FileText, Tag,
    Globe, Calendar, Palette
} from "lucide-react";
import CompanyAuthContext from "~/contexts/company-auth.context";
import { CompanyDashboardLayout } from "~/components/company/company-dashboard-layout";
import { useTranslation } from "react-i18next";
import { useCompanyUrl } from "~/lib/company-utils";

function CreateOfferContent() {
    const { createOffer } = useContext(CompanyAuthContext);
    const navigate = useNavigate();
    const { t } = useTranslation("company");
    const companyUrl = useCompanyUrl();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const CATEGORIES = [
        { id: "food", label: t("createOffer.categories.food") },
        { id: "tech", label: t("createOffer.categories.tech") },
        { id: "fashion", label: t("createOffer.categories.fashion") },
        { id: "health", label: t("createOffer.categories.health") },
        { id: "finance", label: t("createOffer.categories.finance") },
        { id: "education", label: t("createOffer.categories.education") },
        { id: "entertainment", label: t("createOffer.categories.entertainment") },
        { id: "travel", label: t("createOffer.categories.travel") },
        { id: "sports", label: t("createOffer.categories.sports") },
        { id: "other", label: t("createOffer.categories.other") },
    ];

    const BIO_TIERS = [
        { id: "any", label: t("createOffer.bioTiers.any"), description: t("createOffer.bioTiers.anyDesc") },
        { id: "starter", label: t("createOffer.bioTiers.starter"), description: t("createOffer.bioTiers.starterDesc") },
        { id: "growing", label: t("createOffer.bioTiers.growing"), description: t("createOffer.bioTiers.growingDesc") },
        { id: "established", label: t("createOffer.bioTiers.established"), description: t("createOffer.bioTiers.establishedDesc") },
    ];

    const LAYOUTS = [
        { id: "card", label: t("createOffer.layouts.card"), description: t("createOffer.layouts.cardDesc") },
        { id: "banner", label: t("createOffer.layouts.banner"), description: t("createOffer.layouts.bannerDesc") },
        { id: "compact", label: t("createOffer.layouts.compact"), description: t("createOffer.layouts.compactDesc") },
    ];

    const [form, setForm] = useState({
        title: "",
        description: "",
        linkUrl: "",
        imageUrl: "",
        category: "other",
        cpcRate: "0.05",
        dailyBudget: "",
        totalBudget: "",
        minBioTier: "any",
        backgroundColor: "#10b981",
        textColor: "#ffffff",
        layout: "card",
        targetCountries: "",
        startsAt: "",
        expiresAt: "",
    });

    const updateField = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.title || !form.description || !form.linkUrl) {
            setError(t("createOffer.required"));
            return;
        }

        const cpc = parseFloat(form.cpcRate);
        if (isNaN(cpc) || cpc < 0.01) {
            setError(t("createOffer.cpcMin"));
            return;
        }

        setLoading(true);
        try {
            await createOffer({
                title: form.title,
                description: form.description,
                linkUrl: form.linkUrl,
                imageUrl: form.imageUrl || undefined,
                category: form.category,
                cpcRate: cpc,
                dailyBudget: form.dailyBudget ? parseFloat(form.dailyBudget) : undefined,
                totalBudget: form.totalBudget ? parseFloat(form.totalBudget) : undefined,
                minBioTier: form.minBioTier as any,
                backgroundColor: form.backgroundColor,
                textColor: form.textColor,
                layout: form.layout as any,
                targetCountries: form.targetCountries ? form.targetCountries.split(",").map(s => s.trim()) : undefined,
                startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
            });
            navigate(companyUrl.dashboard);
        } catch (err: any) {
            setError(err.response?.data?.details?.[0]?.message || err.response?.data?.error || t("createOffer.createError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <CompanyDashboardLayout>
            <div className="p-6 md:p-10 bg-[#F3F3F1] min-h-screen">
                <button
                    onClick={() => navigate(companyUrl.dashboard)}
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-black mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 stroke-[3px]" />
                    {t("createOffer.back")}
                </button>

                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-black text-[#1A1A1A] mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("createOffer.title")}</h1>
                    <p className="text-lg font-medium text-[#1A1A1A]/60 mb-8">{t("createOffer.subtitle")}</p>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border-2 border-black rounded-xl text-red-700 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#D2E823] border-2 border-black rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-black stroke-[2.5px]" />
                                </div>
                                {t("createOffer.basicInfo")}
                            </h2>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.offerTitle")}</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => updateField("title", e.target.value)}
                                    required
                                    maxLength={100}
                                    placeholder={t("createOffer.offerTitlePlaceholder")}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.description")}</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => updateField("description", e.target.value)}
                                    required
                                    maxLength={500}
                                    rows={3}
                                    placeholder={t("createOffer.descriptionPlaceholder")}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.destinationUrl")}</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black stroke-[2.5px]" />
                                    <input
                                        type="url"
                                        value={form.linkUrl}
                                        onChange={e => updateField("linkUrl", e.target.value)}
                                        required
                                        placeholder={t("createOffer.destinationUrlPlaceholder")}
                                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.imageUrl")}</label>
                                <div className="relative">
                                    <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black stroke-[2.5px]" />
                                    <input
                                        type="url"
                                        value={form.imageUrl}
                                        onChange={e => updateField("imageUrl", e.target.value)}
                                        placeholder={t("createOffer.imageUrlPlaceholder")}
                                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.category")}</label>
                                <select
                                    value={form.category}
                                    onChange={e => updateField("category", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer appearance-none"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Pricing & Budget */}
                        <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#D2E823] border-2 border-black rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-black stroke-[2.5px]" />
                                </div>
                                {t("createOffer.pricingBudget")}
                            </h2>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.cpcLabel")}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-sm font-black">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={form.cpcRate}
                                        onChange={e => updateField("cpcRate", e.target.value)}
                                        required
                                        className="w-full pl-8 pr-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold mt-1.5 bg-gray-100 px-2 py-1 rounded w-fit">{t("createOffer.cpcHint")}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.dailyBudget")}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-sm font-black">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            value={form.dailyBudget}
                                            onChange={e => updateField("dailyBudget", e.target.value)}
                                            placeholder={t("createOffer.noLimit")}
                                            className="w-full pl-8 pr-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.totalBudget")}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-sm font-black">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            value={form.totalBudget}
                                            onChange={e => updateField("totalBudget", e.target.value)}
                                            placeholder={t("createOffer.noLimit")}
                                            className="w-full pl-8 pr-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Targeting */}
                        <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#D2E823] border-2 border-black rounded-lg flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-black stroke-[2.5px]" />
                                </div>
                                {t("createOffer.targeting")}
                            </h2>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.minBioTier")}</label>
                                <select
                                    value={form.minBioTier}
                                    onChange={e => updateField("minBioTier", e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer appearance-none"
                                >
                                    {BIO_TIERS.map(tier => (
                                        <option key={tier.id} value={tier.id}>{tier.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.targetCountries")}</label>
                                <input
                                    type="text"
                                    value={form.targetCountries}
                                    onChange={e => updateField("targetCountries", e.target.value)}
                                    placeholder={t("createOffer.targetCountriesPlaceholder")}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.startDate")}</label>
                                    <input
                                        type="date"
                                        value={form.startsAt}
                                        onChange={e => updateField("startsAt", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.expirationDate")}</label>
                                    <input
                                        type="date"
                                        value={form.expiresAt}
                                        onChange={e => updateField("expiresAt", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#D2E823] border-2 border-black rounded-lg flex items-center justify-center">
                                    <Palette className="w-4 h-4 text-black stroke-[2.5px]" />
                                </div>
                                {t("createOffer.appearance")}
                            </h2>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.layout")}</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {LAYOUTS.map(layout => (
                                        <button
                                            key={layout.id}
                                            type="button"
                                            onClick={() => updateField("layout", layout.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${form.layout === layout.id
                                                    ? "border-black bg-[#D2E823] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                                                    : "border-black hover:bg-gray-50"
                                                }`}
                                        >
                                            <p className="text-sm font-black text-[#1A1A1A]">{layout.label}</p>
                                            <p className="text-[10px] text-[#1A1A1A]/70 font-bold mt-1 leading-tight">{layout.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.bgColor")}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={form.backgroundColor}
                                            onChange={e => updateField("backgroundColor", e.target.value)}
                                            className="w-12 h-12 p-0 border-2 border-black rounded-lg cursor-pointer overflow-hidden"
                                        />
                                        <input
                                            type="text"
                                            value={form.backgroundColor}
                                            onChange={e => updateField("backgroundColor", e.target.value)}
                                            className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("createOffer.textColor")}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={form.textColor}
                                            onChange={e => updateField("textColor", e.target.value)}
                                            className="w-12 h-12 p-0 border-2 border-black rounded-lg cursor-pointer overflow-hidden"
                                        />
                                        <input
                                            type="text"
                                            value={form.textColor}
                                            onChange={e => updateField("textColor", e.target.value)}
                                            className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div>
                                <p className="text-xs font-bold text-[#1A1A1A]/50 mb-2 uppercase tracking-wide">{t("createOffer.preview")}</p>
                                <div
                                    className="p-4 rounded-xl border-2 border-black flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    style={{ backgroundColor: form.backgroundColor }}
                                >
                                    {form.imageUrl ? (
                                        <img src={form.imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border-2 border-black" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-black/20 flex items-center justify-center text-white font-black border-2 border-transparent">
                                            {form.title.charAt(0) || "?"}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate" style={{ color: form.textColor }}>
                                            {form.title || t("createOffer.offerTitle").replace(" *", "")}
                                        </p>
                                        <p className="text-xs opacity-80 font-medium truncate" style={{ color: form.textColor }}>
                                            {form.description || t("createOffer.descriptionPlaceholder")}
                                        </p>
                                    </div>
                                    <button className="px-3 py-1.5 bg-black text-[#D2E823] text-[10px] font-black uppercase tracking-wider rounded border-2 border-transparent">
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#D2E823] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-black rounded-xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 stroke-[3px]" />
                                    {t("createOffer.submit")}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </CompanyDashboardLayout>
    );
}

export default function CompanyDashboardCreateOffer() {
    return (
        <CreateOfferContent />
    );
}