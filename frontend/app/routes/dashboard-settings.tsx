import type { MetaFunction } from "react-router";
import { User, Mail, Lock, Bell, Trash2, Save, CreditCard, Shield, Check, Zap, Plus, Receipt, Clock, Download, Loader2, Megaphone } from "lucide-react";
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

  // ... (keep existing feature items) ...

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
      key: "seo",
      label: "SEO settings",
      description: planLimits.seoSettings ? "Meta tags and indexing controls" : "Feature not available on this plan",
      enabled: planLimits.seoSettings,
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
    // Always load billing history to show status
    import("~/services/api").then(({ BillingService }) => {
      // Just fetch the first page (limit 5) for the preview
      BillingService.getHistory(1, 5).then(res => {
        // Handle both new paginated response { data: [], ... } and old array response []
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

    // Load email usage
    EmailUsageService.getEmailUsage().then(usage => {
      setEmailUsage(usage);
    }).catch(err => {
      console.error("Failed to load email usage", err);
    });
  }, []); // Run once on mount

  useEffect(() => {
    if (activeTab === 'admin' && isAdmin) {
      // Fetch Admin Settings
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
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminLoading(true);
    try {
      // Use the api service instead of manual fetch
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
        <p className="text-white/70 mt-1">Manage your account and subscription.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'general'
            ? 'text-white'
            : 'text-white/60 hover:text-white/80'
            }`}
        >
          General
          {activeTab === 'general' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'billing'
            ? 'text-white'
            : 'text-white/60 hover:text-white/80'
            }`}
        >
          Billing
          {activeTab === 'billing' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full"></div>
          )}
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'admin'
              ? 'text-white'
              : 'text-white/60 hover:text-white/80'
              }`}
          >
            Admin
            {activeTab === 'admin' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full"></div>
            )}
          </button>
        )}
      </div>

      {activeTab === 'general' ? (
        <div className="space-y-8">
          <section className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Profile</h2>
                <p className="text-sm text-white/70">Update your basic account information.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      defaultValue={user?.fullname || ""}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-white text-[#0a0a0f] rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Security Section */}
          <section className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Security</h2>
                <p className="text-sm text-white/70">Manage your password and authentication.</p>
              </div>
            </div>

            {user?.provider && user.provider !== 'password' ? (
              <div className="bg-muted rounded-xl p-4 border border-border">
                <p className="text-sm text-white/70">
                  Your account uses <span className="font-semibold capitalize">{user.provider}</span> login.
                  Password change is not available for social login accounts.
                </p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
                const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

                if (newPassword !== confirmPassword) {
                  alert('Passwords do not match');
                  return;
                }

                if (newPassword.length < 8) {
                  alert('Password must be at least 8 characters');
                  return;
                }

                setIsLoading(true);
                try {
                  const { api } = await import('~/services/api');
                  await api.post('/user/change-password', {
                    currentPassword,
                    newPassword,
                    confirmPassword
                  });
                  alert('Password changed successfully!');
                  form.reset();
                } catch (err: any) {
                  const message = err?.response?.data?.message || 'Failed to change password';
                  alert(message);
                } finally {
                  setIsLoading(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    />
                    <p className="text-xs text-white/50 mt-1">Min 8 characters, uppercase, lowercase, number</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-white text-[#0a0a0f] rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? 'Updating...' : (
                      <>
                        <Lock className="w-4 h-4" /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>



          {/* Danger Zone */}
          <section className="bg-destructive/10 rounded-2xl border border-red-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 text-destructive rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-900" style={{ fontFamily: 'var(--font-display)' }}>Danger Zone</h2>
                <p className="text-sm text-red-700">Irreversible actions for your account.</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-card p-4 rounded-xl border border-red-100">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-xs text-white/50">Permanently remove your account and all data.</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </section>
        </div>
      ) : activeTab === 'billing' ? (
        <div className="space-y-8">
          {/* Billing Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Plan */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-surface-card rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Shield className="w-64 h-64 rotate-12" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>Current Plan</h2>
                      <p className="text-white/70">You are currently on the <span className="font-bold text-white capitalize">{planLabel} Plan</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${billingHistory[0]?.status === 'canceled'
                        ? 'bg-destructive/10 text-destructive border-red-100'
                        : 'bg-muted text-foreground border-border'
                        }`}>
                        {billingHistory[0]?.status === 'canceled' ? 'Canceled' : `${planLabel} Tier`}
                      </span>
                      {billingHistory[0]?.status === 'canceled' && planDuration?.endLabel && (
                        <span className="text-[10px] font-medium text-red-500">
                          Expires on {planDuration.endLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                    {visibleFeatureItems.map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-start gap-3 text-sm font-medium ${item.enabled ? 'text-white' : 'text-white/50 opacity-70'}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.enabled
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-muted text-muted-foreground'
                            }`}
                        >
                          {item.enabled ? <Check className="w-3 h-3" /> : <div className="w-2 h-0.5 bg-current rounded-full" />}
                        </div>
                        <div className="space-y-0.5">
                          <span className="leading-tight block">{item.label}</span>
                          <p className="text-xs font-normal text-white/50">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasHiddenFeatures && (
                    <div className="mt-4 mb-6">
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-400 hover:text-blue-700 hover:underline transition-colors"
                        onClick={() => setShowAllFeatures((prev) => !prev)}
                      >
                        {showAllFeatures ? "Show fewer features" : `Show all features (+${hiddenCount})`}
                      </button>
                    </div>
                  )}

                  {/* Usage Stats Grid - simplified */}
                  <div className="bg-muted rounded-xl p-6 border border-border space-y-4">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Resource Usage</h3>

                    {emailUsage && (
                      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-card px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-sm">
                            <p className="font-bold text-foreground">Email usage</p>
                            <p className="text-xs text-white/50">Monthly automation emails</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{emailUsage.sent} / {emailUsage.limit}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-card px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-sm">
                          <p className="font-bold text-foreground">Bio pages</p>
                          <p className="text-xs text-white/50">Active bios online</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{user?.usage?.bios || 0} / {planLimits.bios}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-card px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-sm">
                          <p className="font-bold text-foreground">Automations</p>
                          <p className="text-xs text-white/50">Total active automations</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{user?.usage?.automations || 0}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => {
                        if (resolvedPlan === 'free') {
                          // Navigate to pricing or open popup? 
                          // Existing behavior was Link to /pricing. Let's keep it consistent or use popup.
                          // If I use button for both, I can redirect for free.
                          window.location.href = "/pricing";
                        } else {
                          setIsUpgradePopupOpen(true);
                        }
                      }}
                      className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-[#0a0a0f] bg-white hover:bg-white/90 transition-colors w-full md:w-auto"
                    >
                      {resolvedPlan === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Billing History */}
            <div className="lg:col-span-1">
              <div className="space-y-4 self-start">
                <section className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Plan duration</h2>
                      <p className="text-sm text-white/70">Current plan: {planLabel}</p>
                    </div>
                  </div>

                  {planDuration ? (
                    <>
                      <p className="text-2xl font-semibold text-foreground">{planDuration.durationText}</p>
                      <p className="text-sm text-muted-foreground mt-1">Started on {planDuration.startLabel}</p>
                      {planDuration.endLabel && (
                        <p className="text-sm text-white/70">
                          {billingHistory[0]?.status === 'canceled' ? 'Ends' : 'Renews'} in {planDuration.remainingDays ?? 0} days (until {planDuration.endLabel})
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-white/70">No history available to calculate plan duration.</p>
                  )}
                </section>

                <section className="bg-surface-card rounded-2xl border border-border p-6 flex flex-col shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-lg text-white/70">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Billing History</h2>
                  </div>

                  <div className="space-y-1 flex-1 pr-2">
                    {billingHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-white/30 mb-3">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <p className="text-white/70 text-sm">No billing history available.</p>
                      </div>
                    ) : (
                      billingHistory.map((bill) => (
                        <div key={bill.id} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-muted transition-colors group cursor-pointer border border-transparent hover:border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/30">
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {new Date(bill.startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-xs text-white/50 capitalize">
                                {bill.plan} Plan
                                {bill.status === 'canceled' && <span className="text-red-500 ml-1">(Canceled)</span>}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">${bill.price.toFixed(2)}</p>
                            <button className="text-[10px] font-bold text-blue-400 uppercase tracking-wider hover:underline flex items-center gap-1 justify-end mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              View
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="w-full mt-6 py-2.5 bg-surface-card border border-border text-white/70 rounded-xl text-sm font-medium hover:bg-muted transition-colors shadow-sm"
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
        <div className="space-y-8">
          <section className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 text-destructive rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Global Announcement</h2>
                <p className="text-sm text-white/70">Manage the announcement bar on the homepage.</p>
              </div>
            </div>

            <form onSubmit={handleAdminSave} className="space-y-6">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden border border-border">
                <div
                  style={{
                    backgroundColor: adminAnnouncement.bgColor || '#000000',
                    color: adminAnnouncement.textColor || '#ffffff',
                    fontSize: `${adminAnnouncement.fontSize || '14'}px`,
                    textAlign: adminAnnouncement.textAlign || 'left'
                  }}
                  className="px-4 py-2 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1" style={{ justifyContent: adminAnnouncement.textAlign === 'center' ? 'center' : 'flex-start' }}>
                    {adminAnnouncement.badge !== 'none' && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${adminAnnouncement.badge === 'hot' ? 'bg-orange-500 text-white' :
                        adminAnnouncement.badge === 'sale' ? 'bg-green-500/100 text-white' :
                          adminAnnouncement.badge === 'update' ? 'bg-blue-500/100 text-white' :
                            'bg-destructive/100 text-white'
                        }`}>
                        {adminAnnouncement.badge === 'new' ? 'NEW' :
                          adminAnnouncement.badge === 'hot' ? 'HOT' :
                            adminAnnouncement.badge === 'sale' ? 'SALE' : 'UPDATE'}
                      </span>
                    )}
                    <span>{adminAnnouncement.text || 'Announcement text preview'}</span>
                  </div>
                  <span className="text-sm font-medium opacity-80 hover:opacity-100 cursor-pointer whitespace-nowrap">Get Started →</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-1">Announcement Text</label>
                  <input
                    type="text"
                    value={adminAnnouncement.text || ""}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, text: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    placeholder="Get 7 days standard plan for free"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={adminAnnouncement.link || ""}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, link: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    placeholder="/sign-up"
                  />
                </div>

                {/* Badge Type */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Badge Type</label>
                  <select
                    value={adminAnnouncement.badge || 'new'}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, badge: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all bg-surface-card"
                  >
                    <option value="new">NEW (Red)</option>
                    <option value="hot">HOT (Orange)</option>
                    <option value="sale">SALE (Green)</option>
                    <option value="update">UPDATE (Blue)</option>
                    <option value="none">No Badge</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Font Size</label>
                  <select
                    value={adminAnnouncement.fontSize || '14'}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, fontSize: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all bg-surface-card"
                  >
                    <option value="12">Small (12px)</option>
                    <option value="14">Medium (14px)</option>
                    <option value="16">Large (16px)</option>
                  </select>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={adminAnnouncement.bgColor || '#000000'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, bgColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={adminAnnouncement.bgColor || '#000000'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, bgColor: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={adminAnnouncement.textColor || '#ffffff'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, textColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={adminAnnouncement.textColor || '#ffffff'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, textColor: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Text Alignment</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminAnnouncement({ ...adminAnnouncement, textAlign: 'left' })}
                      className={`flex-1 px-4 py-2 rounded-xl border font-medium transition-all ${adminAnnouncement.textAlign === 'left'
                        ? 'bg-black text-white border-black'
                        : 'bg-surface-card text-white/70 border-border hover:border-white/30'
                        }`}
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminAnnouncement({ ...adminAnnouncement, textAlign: 'center' })}
                      className={`flex-1 px-4 py-2 rounded-xl border font-medium transition-all ${adminAnnouncement.textAlign === 'center'
                        ? 'bg-black text-white border-black'
                        : 'bg-surface-card text-white/70 border-border hover:border-white/30'
                        }`}
                    >
                      Center
                    </button>
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-muted transition-colors">
                    <input
                      type="checkbox"
                      checked={adminAnnouncement.isVisible}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, isVisible: e.target.checked })}
                      className="w-5 h-5 rounded border-white/30 text-black focus:ring-black"
                    />
                    <span className="text-sm font-medium text-white/70">Announcement Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="px-6 py-2 bg-white text-[#0a0a0f] rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isAdminLoading ? "Saving..." : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Broadcast Notification Section */}
          <BroadcastSection />
        </div>
      ) : null}


      <UpgradePopup
        isOpen={isUpgradePopupOpen}
        onClose={() => setIsUpgradePopupOpen(false)}
      />
    </div>
  );
}

function BroadcastSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation("dashboard");
  const [data, setData] = useState({
    title: "",
    message: "",
    icon: "Megaphone",
    link: ""
  });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(t("admin.broadcast.subtitle"))) return; // Using subtitle as confirmation for now or add a specific confirmation key

    setLoading(true);
    setSuccess(false);

    try {
      const { api } = await import('~/services/api');
      await api.post("/admin/notifications/broadcast", data);
      setSuccess(true);
      setData({ title: "", message: "", icon: "Megaphone", link: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to broadcast", error);
      alert(t("admin.broadcast.error") || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{t("admin.broadcast.title")}</h2>
          <p className="text-sm text-white/70">{t("admin.broadcast.subtitle")}</p>
        </div>
        <div className="ml-auto bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {t("admin.broadcast.caution")}
        </div>
      </div>

      <form onSubmit={handleBroadcast} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">{t("admin.broadcast.form.title")}</label>
            <input
              required
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder={t("admin.broadcast.form.placeholder.title")}
              className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">{t("admin.broadcast.form.icon")}</label>
            <input
              type="text"
              value={data.icon}
              onChange={(e) => setData({ ...data, icon: e.target.value })}
              placeholder={t("admin.broadcast.form.placeholder.icon")}
              className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white/70 mb-1">{t("admin.broadcast.form.message")}</label>
            <textarea
              required
              rows={3}
              value={data.message}
              onChange={(e) => setData({ ...data, message: e.target.value })}
              placeholder={t("admin.broadcast.form.placeholder.message")}
              className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white/70 mb-1">{t("admin.broadcast.form.link")}</label>
            <input
              type="text"
              value={data.link}
              onChange={(e) => setData({ ...data, link: e.target.value })}
              placeholder={t("admin.broadcast.form.placeholder.link")}
              className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {success && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
              <Check className="w-4 h-4" />
              {t("admin.broadcast.sent")}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-white text-[#0a0a0f] rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("admin.broadcast.sending")}
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" /> {t("admin.broadcast.submit")}
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
