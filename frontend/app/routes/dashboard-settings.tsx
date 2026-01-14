import type { MetaFunction } from "react-router";
import { User, Mail, Lock, Bell, Trash2, Save, CreditCard, Shield, Check, Zap, Plus, Receipt, Clock, Download } from "lucide-react";
import { Link } from "react-router";
import { useContext, useState, useEffect, useMemo } from "react";
import AuthContext from "~/contexts/auth.context";
import { EmailUsageService, type EmailUsage } from "~/services/email-usage.service";
import { PLAN_LIMITS, type PlanType } from "~/constants/plan-limits";
import { UpgradePopup } from "~/components/shared/upgrade-popup";

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
    if (activeTab === 'billing') {
      import("~/services/api").then(({ BillingService }) => {
        BillingService.getHistory().then(res => {
          setBillingHistory(res.data);
        }).catch(err => {
          console.error("Failed to load billing history", err);
        });
      });

      // Load email usage
      EmailUsageService.getEmailUsage().then(usage => {
        setEmailUsage(usage);
      }).catch(err => {
        console.error("Failed to load email usage", err);
      });
    } else if (activeTab === 'admin' && isAdmin) {
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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and subscription.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'general'
            ? 'text-black'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          General
          {activeTab === 'general' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'billing'
            ? 'text-black'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Billing
          {activeTab === 'billing' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></div>
          )}
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'admin'
              ? 'text-black'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Admin
            {activeTab === 'admin' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></div>
            )}
          </button>
        )}
      </div>

      {activeTab === 'general' ? (
        <div className="space-y-8">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-500">Update your basic account information.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      defaultValue={user?.fullname || ""}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70"
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
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Manage your password and authentication.</p>
              </div>
            </div>

            {user?.provider && user.provider !== 'password' ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={8}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min 8 characters, uppercase, lowercase, number</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={8}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70"
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

          {/* Notifications Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500">Choose what updates you want to receive.</p>
              </div>
            </div>

            <div className="space-y-4">
              {['Email me about new features', 'Email me about account activity', 'Email me weekly analytics reports'].map((item, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-50 rounded-2xl border border-red-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
                <p className="text-sm text-red-700">Irreversible actions for your account.</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-red-100">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-xs text-gray-500">Permanently remove your account and all data.</p>
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
              <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Shield className="w-64 h-64 rotate-12" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Plan</h2>
                      <p className="text-gray-500">You are currently on the <span className="font-bold text-gray-900 capitalize">{planLabel} Plan</span></p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-900 text-xs font-bold uppercase tracking-wider border border-gray-200">
                      {planLabel} Tier
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                    {visibleFeatureItems.map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-start gap-3 text-sm font-medium ${item.enabled ? 'text-gray-900' : 'text-gray-400 opacity-70'}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.enabled
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                            }`}
                        >
                          {item.enabled ? <Check className="w-3 h-3" /> : <div className="w-2 h-0.5 bg-current rounded-full" />}
                        </div>
                        <div className="space-y-0.5">
                          <span className="leading-tight block">{item.label}</span>
                          <p className="text-xs font-normal text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasHiddenFeatures && (
                    <div className="mt-4 mb-6">
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        onClick={() => setShowAllFeatures((prev) => !prev)}
                      >
                        {showAllFeatures ? "Show fewer features" : `Show all features (+${hiddenCount})`}
                      </button>
                    </div>
                  )}

                  {/* Usage Stats Grid - simplified */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Resource Usage</h3>

                    {emailUsage && (
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-sm">
                            <p className="font-bold text-gray-900">Email usage</p>
                            <p className="text-xs text-gray-500">Monthly automation emails</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{emailUsage.sent} / {emailUsage.limit}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-sm">
                          <p className="font-bold text-gray-900">Bio pages</p>
                          <p className="text-xs text-gray-500">Active bios online</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{user?.usage?.bios || 0} / {planLimits.bios}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-sm">
                          <p className="font-bold text-gray-900">Automations</p>
                          <p className="text-xs text-gray-500">Total active automations</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{user?.usage?.automations || 0}</span>
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
                      className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-black bg-yellow-400 hover:bg-yellow-500 transition-colors w-full md:w-auto"
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
                <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Plan duration</h2>
                      <p className="text-sm text-gray-500">Current plan: {planLabel}</p>
                    </div>
                  </div>

                  {planDuration ? (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{planDuration.durationText}</p>
                      <p className="text-sm text-gray-500 mt-1">Started on {planDuration.startLabel}</p>
                      {planDuration.endLabel && (
                        <p className="text-sm text-gray-500">Ends in {planDuration.remainingDays ?? 0} days (until {planDuration.endLabel})</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No history available to calculate plan duration.</p>
                  )}
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Billing History</h2>
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                    {billingHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <p className="text-gray-500 text-sm">No billing history available.</p>
                      </div>
                    ) : (
                      billingHistory.map((bill) => (
                        <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                              <Check className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(bill.startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{bill.plan} Plan</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">${bill.price.toFixed(2)}</p>
                            <button className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline flex items-center gap-1 justify-end mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              View
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button className="w-full mt-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    View All Invoices
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'admin' ? (
        <div className="space-y-8">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Global Announcement</h2>
                <p className="text-sm text-gray-500">Manage the announcement bar on the homepage.</p>
              </div>
            </div>

            <form onSubmit={handleAdminSave} className="space-y-6">
              {/* Preview */}
              <div className="rounded-xl overflow-hidden border border-gray-200">
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
                  <span className="text-sm font-medium opacity-80 hover:opacity-100 cursor-pointer whitespace-nowrap">Get Started →</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text</label>
                  <input
                    type="text"
                    value={adminAnnouncement.text || ""}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, text: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    placeholder="Get 7 days standard plan for free"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={adminAnnouncement.link || ""}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, link: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                    placeholder="/sign-up"
                  />
                </div>

                {/* Badge Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Type</label>
                  <select
                    value={adminAnnouncement.badge || 'new'}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, badge: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <select
                    value={adminAnnouncement.fontSize || '14'}
                    onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, fontSize: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all bg-white"
                  >
                    <option value="12">Small (12px)</option>
                    <option value="14">Medium (14px)</option>
                    <option value="16">Large (16px)</option>
                  </select>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={adminAnnouncement.bgColor || '#000000'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, bgColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={adminAnnouncement.bgColor || '#000000'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, bgColor: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={adminAnnouncement.textColor || '#ffffff'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, textColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={adminAnnouncement.textColor || '#ffffff'}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, textColor: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminAnnouncement({ ...adminAnnouncement, textAlign: 'left' })}
                      className={`flex-1 px-4 py-2 rounded-xl border font-medium transition-all ${adminAnnouncement.textAlign === 'left'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminAnnouncement({ ...adminAnnouncement, textAlign: 'center' })}
                      className={`flex-1 px-4 py-2 rounded-xl border font-medium transition-all ${adminAnnouncement.textAlign === 'center'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      Center
                    </button>
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminAnnouncement.isVisible}
                      onChange={(e) => setAdminAnnouncement({ ...adminAnnouncement, isVisible: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm font-medium text-gray-700">Announcement Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isAdminLoading ? "Saving..." : (
                    <>
                      <Save className="w-4 h-4" /> Save Announcement
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}


      <UpgradePopup
        isOpen={isUpgradePopupOpen}
        onClose={() => setIsUpgradePopupOpen(false)}
      />
    </div>
  );
}
