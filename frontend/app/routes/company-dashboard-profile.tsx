import { useState, useContext, useEffect } from "react";
import { Building2, Globe, FileText, Loader2, Check, Mail } from "lucide-react";
import CompanyAuthContext from "~/contexts/company-auth.context";
import { CompanyDashboardLayout } from "~/components/company/company-dashboard-layout";
import { useTranslation } from "react-i18next";

function ProfileContent() {
    const { company, updateProfile, fetchProfile, loading } = useContext(CompanyAuthContext);
    const { t } = useTranslation("company");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        companyName: "",
        website: "",
        description: "",
        industry: "",
        logo: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (company) {
            setForm({
                companyName: company.companyName || "",
                website: company.website || "",
                description: company.description || "",
                industry: company.industry || "",
                logo: company.logo || "",
            });
        }
    }, [company]);

    const updateField = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            await updateProfile(form);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || t("profile.error"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <CompanyDashboardLayout>
            <div className="p-6 md:p-10 bg-[#F3F3F1] min-h-screen">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-black text-[#1A1A1A] mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("profile.title")}</h1>
                    <p className="text-lg font-medium text-[#1A1A1A]/60 mb-8">{t("profile.subtitle")}</p>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border-2 border-black rounded-xl text-red-700 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 p-4 bg-[#D2E823] border-2 border-black rounded-xl text-black text-sm font-bold flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Check className="w-5 h-5 stroke-[3px]" />
                            {t("profile.success")}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white border-2 border-black rounded-2xl p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {/* Email (readonly) */}
                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("profile.email")}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[2.5px]" />
                                    <input
                                        type="email"
                                        value={company?.email || ""}
                                        disabled
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("profile.companyName")}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black stroke-[2.5px]" />
                                    <input
                                        type="text"
                                        value={form.companyName}
                                        onChange={e => updateField("companyName", e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("profile.website")}</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black stroke-[2.5px]" />
                                    <input
                                        type="url"
                                        value={form.website}
                                        onChange={e => updateField("website", e.target.value)}
                                        placeholder={t("profile.websitePlaceholder")}
                                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("profile.logoUrl")}</label>
                                <input
                                    type="url"
                                    value={form.logo}
                                    onChange={e => updateField("logo", e.target.value)}
                                    placeholder={t("profile.logoPlaceholder")}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("profile.industry")}</label>
                                <input
                                    type="text"
                                    value={form.industry}
                                    onChange={e => updateField("industry", e.target.value)}
                                    placeholder={t("profile.industryPlaceholder")}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("profile.description")}</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => updateField("description", e.target.value)}
                                    rows={4}
                                    placeholder={t("profile.descriptionPlaceholder")}
                                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-4 bg-[#D2E823] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-black rounded-xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 stroke-[3px]" /> {t("profile.save")}</>}
                        </button>
                    </form>
                </div>
            </div>
        </CompanyDashboardLayout>
    );
}

export default function CompanyDashboardProfile() {
    return (
        <ProfileContent />
    );
}