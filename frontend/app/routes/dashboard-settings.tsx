import type { MetaFunction } from "react-router";
import { User, Mail, Lock, Bell, Trash2, Save, CreditCard, Shield, Check, Zap, Plus, Receipt, Clock, Download, Loader2, Megaphone, Settings } from "lucide-react";
import { Link } from "react-router";
import { useContext, useState, useEffect, useMemo } from "react";
import AuthContext from "~/contexts/auth.context";
import { EmailUsageService, type EmailUsage } from "~/services/email-usage.service";
import { PLAN_LIMITS, type PlanType } from "~/constants/plan-limits";
import { UpgradePopup } from "~/components/shared/upgrade-popup";
import { BillingHistoryModal } from "~/components/settings/billing-history-modal";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings | Portyo" },
    { name: "description", content: "Manage your account settings and preferences." },
  ];
};

export default function DashboardSettings() {
  const { user } = useContext(AuthContext);
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
      label: "Bios",
      description: `${planLimits.bios} bio${planLimits.bios === 1 ? "" : "s"}`,
      enabled: planLimits.bios > 0,
    },
    {
      key: "qrcodes",
      label: "QR codes per bio",
      description: `${planLimits.qrcodesPerBio} QR codes available per bio`,
      enabled: planLimits.qrcodesPerBio > 0,
    },
    {
      key: "automations",
      label: "Automations per bio",
      description: `${planLimits.automationsPerBio} configurable automations per bio`,
      enabled: planLimits.automationsPerBio > 0,
    },
    {
      key: "templates",
      label: "Email templates per bio",
      description: `${planLimits.emailTemplatesPerBio} email templates per bio`,
      enabled: planLimits.emailTemplatesPerBio > 0,
    },
    {
      key: "email-collection",
      label: "Email capture",
      description: planLimits.emailCollection ? "Contact capture enabled" : "Not available on this plan",
      enabled: planLimits.emailCollection,
    },
    {
      key: "custom-domain",
      label: "Custom domain",
      description: planLimits.customDomain ? "Connect your own domain" : "Upgrade to use custom domains",
      enabled: planLimits.customDomain,
    },
    {
      key: "remove-branding",
      label: "Remove branding",
      description: planLimits.removeBranding ? "Pages without Portyo branding" : "Portyo branding visible",
      enabled: planLimits.removeBranding,
    },
    {
      key: "analytics",
      label: `${planLimits.analytics === "advanced" ? "Advanced analytics" : "Basic analytics"}`,
      description: planLimits.analytics === "advanced" ? "Google and Facebook analytics support" : "Core metrics included",
      enabled: true,
    },
    {
      key: "store-fee",
      label: "Store fee",
      description: planLimits.storeFee === 0 ? "0% fee on sales" : `${(planLimits.storeFee * 100).toFixed(1).replace(/\.0$/, "")}% fee on sales`,
      enabled: planLimits.storeFee === 0,
    },
    {
      key: "integrations",
      label: "Integrations",
      description: planLimits.integrations === "full" ? "Full integrations enabled" : "Limited integrations",
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

    const monthsLabel = months > 0 ? `${months} ${months === 1 ? 'month' : 'months'}` : '';
    const daysLabel = `${days} ${days === 1 ? 'day' : 'days'}`;
    const durationText = monthsLabel ? `${monthsLabel} and ${daysLabel}` : daysLabel;

    let remainingDays: number | null = null;
    if (end && !Number.isNaN(end.getTime())) {
      remainingDays = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
    }

    const startLabel = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const endLabel = end ? end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

    return { durationText, startLabel, endLabel, remainingDays };
  }, [billingHistory]);

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
          alert("Announcement updated!");
        }).catch(err => {
          console.error("Failed to update announcement", err);
          alert("Failed to update announcement");
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
          <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
          <p className="text-gray-500 font-medium text-lg">Manage your account and subscription.</p>
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
            General
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
            Billing
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
              Admin
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
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>Profile</h2>
                <p className="text-sm text-gray-500 font-bold">Update your basic account information.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Full Name</label>
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
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Email Address</label>
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
                  {isLoading ? "Saving..." : "Save Changes"}
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
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>Security</h2>
                <p className="text-sm text-gray-500 font-bold">Manage your password and authentication.</p>
              </div>
            </div>

            {user?.provider && user.provider !== 'password' ? (
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-black border-dashed">
                <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C6F035] border border-black"></span>
                  Your account uses <span className="font-black capitalize bg-black text-white px-2 py-0.5 rounded-md">{user.provider}</span> login.
                </p>
                <p className="text-xs text-gray-400 mt-2 font-medium ml-4">Password change is not available for social login accounts.</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
                const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                if (newPassword !== confirmPassword) { alert('Passwords do not match'); return; }
                if (newPassword.length < 8) { alert('Password must be at least 8 characters'); return; }
                setIsLoading(true);
                try {
                  const { api } = await import('~/services/api');
                  await api.post('/user/change-password', { currentPassword, newPassword, confirmPassword });
                  alert('Password changed successfully!');
                  form.reset();
                } catch (err: any) { const message = err?.response?.data?.message || 'Failed to change password'; alert(message); } finally { setIsLoading(false); }
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Current Password</label>
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
                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                    />
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide mt-1">Min 8 chars, uppercase, lowercase, number</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Confirm New Password</label>
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
                    {isLoading ? "Updating..." : "Update Password"}
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
                <h2 className="text-2xl font-black text-red-600 tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>Danger Zone</h2>
                <p className="text-sm text-red-800 font-bold">Irreversible actions for your account.</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <p className="font-black text-[#1A1A1A] text-lg uppercase tracking-tight">Delete Account</p>
                <p className="text-xs text-gray-500 font-bold">Permanently remove your account and all data.</p>
              </div>
              <button className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 border-2 border-black">
                Delete Account
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
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-black text-[#1A1A1A] mb-2 uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Current Plan</h2>
                      <p className="text-gray-500 font-bold">You are currently on the <span className="bg-[#C6F035] text-black px-2 py-0.5 rounded border border-black uppercase font-black">{planLabel} Plan</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 ${billingHistory[0]?.status === 'canceled'
                        ? 'bg-red-100 text-red-600 border-black'
                        : 'bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}>
                        {billingHistory[0]?.status === 'canceled' ? 'Canceled' : `${planLabel} Tier`}
                      </span>
                      {billingHistory[0]?.status === 'canceled' && planDuration?.endLabel && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200">
                          Expires on {planDuration.endLabel}
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
                        {showAllFeatures ? "Show fewer features" : `Show all features (+${hiddenCount})`}
                      </button>
                    </div>
                  )}

                  {/* Usage Stats Grid - simplified */}
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-black space-y-4">
                    <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#C6F035] fill-current" /> Resource Usage
                    </h3>

                    {emailUsage && (
                      <div className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-5 py-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-black rounded-lg border-2 border-black flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="text-sm">
                            <p className="font-black text-[#1A1A1A] uppercase tracking-wide text-xs">Email usage</p>
                            <p className="text-xs text-gray-500 font-bold">Monthly automation emails</p>
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
                          <p className="font-black text-[#1A1A1A] uppercase tracking-wide text-xs">Bio pages</p>
                          <p className="text-xs text-gray-500 font-bold">Active bios online</p>
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
                          <p className="font-black text-[#1A1A1A] uppercase tracking-wide text-xs">Automations</p>
                          <p className="text-xs text-gray-500 font-bold">Total active automations</p>
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
                      {resolvedPlan === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
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
                      <h2 className="text-lg font-black text-[#1A1A1A] uppercase tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>Plan duration</h2>
                      <p className="text-xs text-gray-500 font-bold mt-1">Status Overview</p>
                    </div>
                  </div>

                  {planDuration ? (
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-black border-dashed">
                      <p className="text-2xl font-black text-[#1A1A1A]">{planDuration.durationText}</p>
                      <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">Started on {planDuration.startLabel}</p>
                      {planDuration.endLabel && (
                        <div className="mt-3 pt-3 border-t-2 border-black/5">
                          <p className="text-xs font-bold text-black flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${billingHistory[0]?.status === 'canceled' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            {billingHistory[0]?.status === 'canceled' ? 'Ends' : 'Renews'} in {planDuration.remainingDays ?? 0} days
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold ml-3.5">(until {planDuration.endLabel})</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 font-bold italic">No history available.</p>
                  )}
                </section>

                <section className="bg-white rounded-[32px] border-2 border-black p-6 flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg border-2 border-black flex items-center justify-center text-black">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#1A1A1A] uppercase tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>Invoices</h2>
                      <p className="text-xs text-gray-500 font-bold mt-1">Recent Transactions</p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {billingHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <Receipt className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-gray-400 font-bold text-sm">No billing history available.</p>
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
                    View All Invoices
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
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>Global Announcement</h2>
                <p className="text-sm text-gray-500 font-bold">Manage the announcement bar on the homepage.</p>
              </div>
            </div>

            <form onSubmit={handleAdminSave} className="space-y-8">
              {/* Preview */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Live Preview</label>
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
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Announcement Text</label>
                  <input
                    type="text"
                    value={adminAnnouncement.text || ""}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, text: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                    placeholder="Get 7 days standard plan for free"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Link URL</label>
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
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Badge Type</label>
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
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Font Size</label>
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
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Background Color</label>
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
                  <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider ml-1">Text Color</label>
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
                  {isAdminLoading ? "Updating..." : "Update Announcement"}
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

