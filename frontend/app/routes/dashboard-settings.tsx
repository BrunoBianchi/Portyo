import type { MetaFunction } from "react-router";
import { User, Mail, Lock, Bell, Trash2, Save, CreditCard, Shield, Check, Zap, Plus, Receipt, Clock, Download } from "lucide-react";
import { Link } from "react-router";
import { useContext, useState, useEffect } from "react";
import AuthContext from "~/contexts/auth.context";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings | Portyo" },
    { name: "description", content: "Manage your account settings and preferences." },
  ];
};

export default function DashboardSettings() {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'billing'>('general');
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'billing') {
      import("~/services/api").then(({ BillingService }) => {
        BillingService.getHistory().then(res => {
          setBillingHistory(res.data);
        }).catch(err => {
          console.error("Failed to load billing history", err);
        });
      });
    }
  }, [activeTab]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

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
      </div>

      {activeTab === 'general' ? (
        <div className="space-y-6">
          {/* Profile Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your personal details.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.fullname || ""}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
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

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" className="px-6 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Update Password
                </button>
              </div>
            </form>
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
      ) : (
        <div className="space-y-8">
          {/* Billing Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Plan */}
            <div className="lg:col-span-2 space-y-8">
              <section className="card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Shield className="w-48 h-48" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-text-main mb-2">Current Plan</h2>
                      <p className="text-text-muted">You are currently on the <span className="font-bold text-text-main capitalize">{user?.plan || 'Free'} Plan</span></p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-surface-muted text-text-main text-xs font-bold uppercase tracking-wider border border-border">
                      {user?.plan || 'Free'} Tier
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Unlimited links</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Basic analytics</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Standard themes</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm font-medium text-text-muted opacity-50">
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Custom domains</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-text-muted opacity-50">
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Remove branding</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-alt rounded-xl p-6 border border-border mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/20 text-primary-foreground rounded-xl">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text-main">Upgrade to Pro</h3>
                        <p className="text-sm text-text-muted">Unlock all features for just $9/month</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
                        <span>Usage</span>
                        <span>75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full w-[75%] shadow-sm"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-text-muted">750 / 1000 visits used</p>
                      </div>
                    </div>
                  </div>

                  <Link to="/pricing" className="btn btn-primary w-full md:w-auto inline-block text-center">
                    Upgrade Plan
                  </Link>
                </div>
              </section>

              <section className="card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-main">Payment Methods</h2>
                  <button className="btn btn-secondary btn-sm">
                    <Plus className="w-4 h-4" /> Add Method
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-surface-alt/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 bg-white rounded border border-border flex items-center justify-center shadow-sm">
                        <CreditCard className="w-6 h-6 text-text-muted" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-text-main">•••• •••• •••• 4242</p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-muted text-text-muted uppercase tracking-wider border border-border">Default</span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">Expires 12/25</p>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                  </div>
                </div>
              </section>
            </div>

            {/* Billing History */}
            <div className="lg:col-span-1">
              <section className="card p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-surface-alt rounded-lg text-text-muted">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-text-main">Billing History</h2>
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                  {billingHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No billing history found.</div>
                  ) : (
                    billingHistory.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-alt transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-muted group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-main">
                              {new Date(bill.startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-text-muted capitalize">{bill.plan} Plan</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-text-main">${bill.price.toFixed(2)}</p>
                          <button className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-1 justify-end mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            PDF <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button className="w-full mt-6 btn btn-secondary btn-sm">
                  View All Invoices
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
