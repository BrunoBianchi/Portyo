import type { MetaFunction } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import { User, Mail, Lock, Bell, Trash2, Save, CreditCard, Shield, Check, Zap, Plus, Receipt, Clock, Download, Loader2, Megaphone, Settings } from "lucide-react";
import { Link } from "react-router";
import { useContext, useState, useEffect, useMemo } from "react";
import AuthContext from "~/contexts/auth.context";
import { EmailUsageService, type EmailUsage } from "~/services/email-usage.service";
import { PLAN_LIMITS, type PlanType } from "~/constants/plan-limits";
import { UpgradePopup } from "~/components/shared/upgrade-popup";
import { BillingHistoryModal } from "~/components/settings/billing-history-modal";

export const meta: MetaFunction = ({ params }) => {
  const lang = params?.lang === "pt" ? "pt" : "en";
  return [
    { title: i18n.t("settings.meta.title", { lng: lang }) },
    { name: "description", content: i18n.t("settings.meta.description", { lng: lang }) },
  ];
};

export default function DashboardSettings() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'admin'>('general');
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [emailUsage, setEmailUsage] = useState<EmailUsage | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isUpgradePopupOpen, setIsUpgradePopupOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Admin State
  const [adminAnnouncement, setAdminAnnouncement] = useState({
    text: "",
    link: "",
    badge: "new" as "new" | "hot" | "sale" | "update" | "none",
    isVisible: true,
    bgColor: "#000000",
    textColor: "#ffffff",
    fontSize: "14" as "12" | "14" | "16",
    textAlign: "left" as "left" | "center"
  });
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const isAdmin = user?.email === 'bruno2002.raiado@gmail.com';

  const resolvedPlan = ((user?.plan as PlanType) || "free") as PlanType;
  const planLabel = `${resolvedPlan.charAt(0).toUpperCase()}${resolvedPlan.slice(1)}`;
  const planLimits = PLAN_LIMITS[resolvedPlan] ?? PLAN_LIMITS.free;

  const planFeatureItems = [
    {
      key: "bios",
      label: t("settings.plan.bios"),
      description: planLimits.bios === 1 ? t("settings.plan.biosDesc", { count: planLimits.bios }) : t("settings.plan.biosDescPlural", { count: planLimits.bios }),
      enabled: planLimits.bios > 0,
    },
    {
      key: "qrcodes",
      label: t("settings.plan.qrcodes"),
      description: t("settings.plan.qrcodesDesc", { count: planLimits.qrcodesPerBio }),
      enabled: planLimits.qrcodesPerBio > 0,
    },
    {
      key: "automations",
      label: t("settings.plan.automations"),
      description: t("settings.plan.automationsDesc", { count: planLimits.automationsPerBio }),
      enabled: planLimits.automationsPerBio > 0,
    },
    {
      key: "templates",
      label: t("settings.plan.templates"),
      description: t("settings.plan.templatesDesc", { count: planLimits.emailTemplatesPerBio }),
      enabled: planLimits.emailTemplatesPerBio > 0,
    },
    {
      key: "email-collection",
      label: t("settings.plan.emailCollection"),
      description: planLimits.emailCollection ? t("settings.plan.emailCollectionEnabled") : t("settings.plan.emailCollectionDisabled"),
      enabled: planLimits.emailCollection,
    },
    {
      key: "custom-domain",
      label: t("settings.plan.customDomain"),
      description: planLimits.customDomain ? t("settings.plan.customDomainEnabled") : t("settings.plan.customDomainDisabled"),
      enabled: planLimits.customDomain,
    },
    {
      key: "remove-branding",
      label: t("settings.plan.removeBranding"),
      description: planLimits.removeBranding ? t("settings.plan.removeBrandingEnabled") : t("settings.plan.removeBrandingDisabled"),
      enabled: planLimits.removeBranding,
    },
    {
      key: "analytics",
      label: planLimits.analytics === "advanced" ? t("settings.plan.analyticsAdvanced") : t("settings.plan.analyticsBasic"),
      description: planLimits.analytics === "advanced" ? t("settings.plan.analyticsAdvancedDesc") : t("settings.plan.analyticsBasicDesc"),
      enabled: true,
    },
    {
      key: "store-fee",
      label: t("settings.plan.storeFee"),
      description: planLimits.storeFee === 0 ? t("settings.plan.storeFeeZero") : t("settings.plan.storeFeePercent", { percent: (planLimits.storeFee * 100).toFixed(1).replace(/\.0$/, "") }),
      enabled: planLimits.storeFee === 0,
    },
    {
      key: "integrations",
      label: t("settings.plan.integrations"),
      description: planLimits.integrations === "full" ? t("settings.plan.integrationsFull") : t("settings.plan.integrationsLimited"),
      enabled: planLimits.integrations === "full",
    },
  ];

  const featureLimit = 6;
  const hasHiddenFeatures = planFeatureItems.length > featureLimit;
  const visibleFeatureItems = showAllFeatures ? planFeatureItems : planFeatureItems.slice(0, featureLimit);
  const hiddenCount = hasHiddenFeatures ? planFeatureItems.length - featureLimit : 0;

  const planDuration = useMemo(() => {
    if (!billingHistory.length) return null;

    const sorted = [...billingHistory].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const current = sorted[0];
    const start = new Date(current.startDate);
    const end = current.endDate ? new Date(current.endDate) : null;
    if (Number.isNaN(start.getTime())) return null;

    const now = new Date();
    const totalDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;

    const monthsLabel = months > 0 ? `${months} ${months === 1 ? t('settings.plan.month') : t('settings.plan.months')}` : '';
    const daysLabel = `${days} ${days === 1 ? t('settings.plan.day') : t('settings.plan.days')}`;
    const durationText = monthsLabel ? `${monthsLabel} ${t('settings.plan.and')} ${daysLabel}` : daysLabel;

    let remainingDays: number | null = null;
    if (end && !Number.isNaN(end.getTime())) {
      remainingDays = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
    }

    const startLabel = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const endLabel = end ? end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

    return { durationText, startLabel, endLabel, remainingDays };
  }, [billingHistory, t]);

  useEffect(() => {
    import("~/services/api").then(({ BillingService }) => {
      BillingService.getHistory(1, 5).then(res => {
        const historyData = res.data && Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setBillingHistory(historyData);
      }).catch(err => {
        console.error("Failed to load billing history", err);
        setBillingHistory([]);
      });
    });

    EmailUsageService.getEmailUsage().then(usage => {
      setEmailUsage(usage);
    }).catch(err => {
      console.error("Failed to load email usage", err);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'admin' && isAdmin) {
      const fetchAdminSettings = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.portyo.me';
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
        try {
          const res = await fetch(`${baseUrl}/public/settings/announcement`);
          if (res.ok) {
            const data = await res.json();
            setAdminAnnouncement(data);
          }
        } catch (e) {
          console.error("Failed to fetch admin settings", e);
        }
      }
      fetchAdminSettings();
    }
  }, [activeTab, isAdmin]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminLoading(true);
    try {
      import("~/services/api").then(({ api }) => {
        api.post('/admin/announcement', adminAnnouncement).then(() => {
          alert(t("settings.admin.updated"));
        }).catch(err => {
          console.error("Failed to update announcement", err);
          alert(t("settings.admin.updateFailed"));
        }).finally(() => {
          setIsAdminLoading(false);
        });
      });
    } catch (e) {
      setIsAdminLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto font-['Manrope']">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#C6F035]">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("settings.title")}</h1>
          <p className="text-gray-500 font-medium text-lg">{t("settings.subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-all border-2 whitespace-nowrap ${activeTab === 'general'
            ? 'bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
            }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {t("settings.tabs.general")}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-all border-2 whitespace-nowrap ${activeTab === 'billing'
            ? 'bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
            }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            {t("settings.tabs.billing")}
          </div>
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-all border-2 whitespace-nowrap ${activeTab === 'admin'
              ? 'bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
              }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t("settings.tabs.admin")}
            </div>
          </button>
        )}
      </div>

      {activeTab === 'general' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white rounded-[32px] border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl border-2 border-black flex items-center justify-center text-black">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>{t("settings.profile.title")}</h2>
                <p className="text-sm text-gray-500 font-bold">{t("settings.profile.subtitle")}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.profile.fullName")}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                      type="text"
                      defaultValue={user?.fullname || ""}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-[#1A1A1A]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.profile.email")}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-[#1A1A1A]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t-2 border-black/5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-black uppercase text-sm hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isLoading ? t("settings.profile.saving") : t("settings.profile.save")}
                </button>
              </div>
            </form>
          </section>

          {/* Security Section */}
          <section className="bg-white rounded-[32px] border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-purple-100 rounded-xl border-2 border-black flex items-center justify-center text-black">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>{t("settings.security.title")}</h2>
                <p className="text-sm text-gray-500 font-bold">{t("settings.security.subtitle")}</p>
              </div>
            </div>

            {user?.provider && user.provider !== 'password' ? (
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-black border-dashed">
                <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C6F035] border border-black"></span>
                  {t("settings.security.socialLogin", { provider: user.provider })}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-medium ml-4">{t("settings.security.socialLoginHint")}</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
                const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                if (newPassword !== confirmPassword) { alert(t('settings.security.passwordMismatch')); return; }
                if (newPassword.length < 8) { alert(t('settings.security.passwordTooShort')); return; }
                setIsLoading(true);
                try {
                  const { api } = await import('~/services/api');
                  await api.post('/user/change-password', { currentPassword, newPassword, confirmPassword });
                  alert(t('settings.security.passwordChanged'));
                  form.reset();
                } catch (err: any) { const message = err?.response?.data?.message || t('settings.security.passwordChangeFailed'); alert(message); } finally { setIsLoading(false); }
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.security.currentPassword")}</label>
                  <input
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    required
                    className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.security.newPassword")}</label>
                    <input
                      type="password"
                      name="newPassword"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                    />
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide mt-1">{t("settings.security.passwordHint")}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.security.confirmPassword")}</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t-2 border-black/5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-white text-black rounded-full font-black uppercase text-sm border-2 border-black hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {isLoading ? t("settings.security.updating") : t("settings.security.updatePassword")}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Danger Zone */}
          <section className="bg-red-50 rounded-[32px] border-2 border-black p-8 shadow-[8px_8px_0px_0px_#EF4444]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl border-2 border-black flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-red-600 tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>{t("settings.danger.title")}</h2>
                <p className="text-sm text-red-800 font-bold">{t("settings.danger.subtitle")}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <p className="font-black text-[#1A1A1A] text-lg uppercase tracking-tight">{t("settings.danger.deleteAccount")}</p>
                <p className="text-xs text-gray-500 font-bold">{t("settings.danger.deleteHint")}</p>
              </div>
              <button className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 border-2 border-black">
                {t("settings.danger.deleteAccount")}
              </button>
            </div>
          </section>
        </div>
      ) : activeTab === 'billing' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Plan */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-[32px] border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-black">
                  <Shield className="w-64 h-64 rotate-12" />
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] mb-2 uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("settings.billing.currentPlan")}</h2>
                      <p className="text-gray-500 font-bold">{t("settings.billing.currentlyOn")} <span className="bg-[#C6F035] text-black px-2 py-0.5 rounded border border-black uppercase font-black">{planLabel} {t("settings.billing.planWord")}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 ${billingHistory[0]?.status === 'canceled'
                        ? 'bg-red-100 text-red-600 border-black'
                        : 'bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}>
                        {billingHistory[0]?.status === 'canceled' ? t("settings.billing.canceled") : `${planLabel} ${t("settings.billing.tier")}`}
                      </span>
                      {billingHistory[0]?.status === 'canceled' && planDuration?.endLabel && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200">
                          {t("settings.billing.expiresOn")} {planDuration.endLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                    {visibleFeatureItems.map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-start gap-3 text-sm font-bold ${item.enabled ? 'text-[#1A1A1A]' : 'text-gray-300 opacity-60'}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 ${item.enabled
                            ? 'bg-[#C6F035] text-black border-black'
                            : 'bg-gray-100 text-gray-300 border-gray-200'
                            }`}
                        >
                          {item.enabled ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-2 h-0.5 bg-gray-300 rounded-full" />}
                        </div>
                        <div className="space-y-0.5">
                          <span className="leading-tight block uppercase text-xs tracking-wide">{item.label}</span>
                          <p className="text-xs font-medium text-gray-500 normal-case">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasHiddenFeatures && (
                    <div className="mt-4 mb-8">
                      <button
                        type="button"
                        className="text-xs font-black uppercase tracking-wider text-gray-500 hover:text-black hover:underline transition-colors flex items-center gap-1"
                        onClick={() => setShowAllFeatures((prev) => !prev)}
                      >
                        {showAllFeatures ? t("settings.billing.showLess") : t("settings.billing.showMore") + ` (+${hiddenCount})`}
                      </button>
                    </div>
                  )}

                  {/* Usage Stats Grid - simplified */}
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-black space-y-4">
                    <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#C6F035] fill-current" /> {t("settings.billing.resourceUsage")}
                    </h3>

                    {emailUsage && (
                      <div className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-5 py-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-black rounded-lg border-2 border-black flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="text-sm">
                            <p className="font-black text-[#1A1A1A] uppercase tracking-wide text-xs">{t("settings.billing.emailUsage")}</p>
                            <p className="text-xs text-gray-500 font-bold">{t("settings.billing.emailUsageHint")}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-[#1A1A1A] bg-gray-100 px-3 py-1 rounded-lg border border-black">{emailUsage.sent} / {emailUsage.limit}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-5 py-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 text-black rounded-lg border-2 border-black flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="text-sm">
                            <p className="font-black text-[#1A1A1A] uppercase tracking-wide text-xs">{t("settings.billing.bioPages")}</p>
                            <p className="text-xs text-gray-500 font-bold">{t("settings.billing.bioPagesHint")}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#1A1A1A] bg-gray-100 px-3 py-1 rounded-lg border border-black">{user?.usage?.bios || 0} / {planLimits.bios}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-5 py-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 text-black rounded-lg border-2 border-black flex items-center justify-center">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="text-sm">
                            <p className="font-black text-[#1A1A1A] uppercase tracking-wide text-xs">{t("settings.billing.automations")}</p>
                            <p className="text-xs text-gray-500 font-bold">{t("settings.billing.automationsHint")}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#1A1A1A] bg-gray-100 px-3 py-1 rounded-lg border border-black">{user?.usage?.automations || 0}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => {
                        if (resolvedPlan === 'free') {
                          window.location.href = "/pricing";
                        } else {
                          setIsUpgradePopupOpen(true);
                        }
                      }}
                      className="inline-flex justify-center items-center px-8 py-4 border-2 border-black text-sm font-black rounded-xl text-white bg-[#1A1A1A] hover:bg-black transition-all w-full md:w-auto uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                      {resolvedPlan === 'free' ? t("settings.billing.upgrade") : t("settings.billing.manageSubscription")}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Billing History */}
            <div className="lg:col-span-1">
              <div className="space-y-6 self-start">
                <section className="bg-white rounded-[32px] border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg border-2 border-black flex items-center justify-center text-black">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#1A1A1A] uppercase tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>{t("settings.billing.planDuration")}</h2>
                      <p className="text-xs text-gray-500 font-bold mt-1">{t("settings.billing.statusOverview")}</p>
                    </div>
                  </div>

                  {planDuration ? (
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-black border-dashed">
                      <p className="text-2xl font-black text-[#1A1A1A]">{planDuration.durationText}</p>
                      <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{t("settings.billing.startedOn")} {planDuration.startLabel}</p>
                      {planDuration.endLabel && (
                        <div className="mt-3 pt-3 border-t-2 border-black/5">
                          <p className="text-xs font-bold text-black flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${billingHistory[0]?.status === 'canceled' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            {billingHistory[0]?.status === 'canceled' ? t("settings.billing.ends") : t("settings.billing.renews")} {t("settings.billing.inDays", { count: planDuration.remainingDays ?? 0 })}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold ml-3.5">{t("settings.billing.until", { date: planDuration.endLabel })}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 font-bold italic">{t("settings.billing.noHistory")}</p>
                  )}
                </section>

                <section className="bg-white rounded-[32px] border-2 border-black p-6 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg border-2 border-black flex items-center justify-center text-black">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#1A1A1A] uppercase tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>{t("settings.billing.invoices")}</h2>
                      <p className="text-xs text-gray-500 font-bold mt-1">{t("settings.billing.recentTransactions")}</p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {billingHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <Receipt className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-gray-400 font-bold text-sm">{t("settings.billing.noBillingHistory")}</p>
                      </div>
                    ) : (
                      billingHistory.map((bill) => (
                        <div key={bill.id} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border-2 border-transparent hover:border-black hover:shadow-sm group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#C6F035] flex items-center justify-center text-black border border-black font-black text-[10px]">
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-[#1A1A1A] uppercase">
                                {new Date(bill.startDate).toLocaleDateString("en-US", { year: '2-digit', month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                {bill.plan}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#1A1A1A]">${bill.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="w-full mt-6 py-3 bg-white border-2 border-black text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                  >
                    {t("settings.billing.viewAll")}
                  </button>
                </section>
              </div>
            </div>
          </div>

          <BillingHistoryModal
            isOpen={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
          />
        </div>
      ) : activeTab === 'admin' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white rounded-[32px] border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-100 text-black rounded-xl border-2 border-black flex items-center justify-center">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>{t("settings.admin.title")}</h2>
                <p className="text-sm text-gray-500 font-bold">{t("settings.admin.subtitle")}</p>
              </div>
            </div>

            <form onSubmit={handleAdminSave} className="space-y-8">
              {/* Preview */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.admin.livePreview")}</label>
                <div className="rounded-xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div
                    style={{
                      backgroundColor: adminAnnouncement.bgColor || '#000000',
                      color: adminAnnouncement.textColor || '#ffffff',
                      fontSize: `${adminAnnouncement.fontSize || '14'}px`,
                      textAlign: adminAnnouncement.textAlign || 'left'
                    }}
                    className="px-6 py-4 flex items-center justify-between gap-4 font-bold"
                  >
                    <div className="flex items-center gap-3 flex-1" style={{ justifyContent: adminAnnouncement.textAlign === 'center' ? 'center' : 'flex-start' }}>
                      {adminAnnouncement.badge !== 'none' && (
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider border border-white/20 ${adminAnnouncement.badge === 'hot' ? 'bg-orange-500 text-white' :
                          adminAnnouncement.badge === 'sale' ? 'bg-green-500 text-white' :
                            adminAnnouncement.badge === 'update' ? 'bg-blue-500 text-white' :
                              'bg-red-500 text-white'
                          }`}>
                          {adminAnnouncement.badge === 'new' ? 'NEW' :
                            adminAnnouncement.badge === 'hot' ? 'HOT' :
                              adminAnnouncement.badge === 'sale' ? 'SALE' : 'UPDATE'}
                        </span>
                      )}
                      <span>{adminAnnouncement.text || 'Announcement text preview'}</span>
                    </div>
                    <span className="text-sm font-medium opacity-80 whitespace-nowrap">Get Started →</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.admin.announcementText")}</label>
                  <input
                    type="text"
                    value={adminAnnouncement.text || ""}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, text: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                    placeholder="Get 7 days standard plan for free"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.admin.linkUrl")}</label>
                  <input
                    type="text"
                    value={adminAnnouncement.link || ""}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, link: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                    placeholder="/sign-up"
                  />
                </div>

                {/* Badge Type */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.admin.badgeType")}</label>
                  <div className="relative">
                    <select
                      value={adminAnnouncement.badge || 'new'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, badge: e.target.value as any })}
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="new">NEW (Red)</option>
                      <option value="hot">HOT (Orange)</option>
                      <option value="sale">SALE (Green)</option>
                      <option value="update">UPDATE (Blue)</option>
                      <option value="none">No Badge</option>
                    </select>
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.admin.fontSize")}</label>
                  <div className="relative">
                    <select
                      value={adminAnnouncement.fontSize || '14'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, fontSize: e.target.value as any })}
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="12">Small (12px)</option>
                      <option value="14">Medium (14px)</option>
                      <option value="16">Large (16px)</option>
                    </select>
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.admin.bgColor")}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={adminAnnouncement.bgColor || '#000000'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, bgColor: e.target.value })}
                      className="w-14 h-14 rounded-xl border-2 border-black cursor-pointer p-1 bg-white hover:scale-105 transition-transform"
                    />
                    <input
                      type="text"
                      value={adminAnnouncement.bgColor || '#000000'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, bgColor: e.target.value })}
                      className="flex-1 px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold uppercase"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">{t("settings.admin.textColor")}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={adminAnnouncement.textColor || '#ffffff'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, textColor: e.target.value })}
                      className="w-14 h-14 rounded-xl border-2 border-black cursor-pointer p-1 bg-white hover:scale-105 transition-transform"
                    />
                    <input
                      type="text"
                      value={adminAnnouncement.textColor || '#ffffff'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, textColor: e.target.value })}
                      className="flex-1 px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t-2 border-black/5">
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-black uppercase text-sm hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 disabled:opacity-50"
                >
                  {isAdminLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                  {isAdminLoading ? t("settings.admin.updating") : t("settings.admin.update")}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <UpgradePopup isOpen={isUpgradePopupOpen} onClose={() => setIsUpgradePopupOpen(false)} />
    </div>
  );
}

