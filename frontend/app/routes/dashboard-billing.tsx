import type { MetaFunction } from "react-router";
import { Check, CreditCard, Zap, Clock, Download, Plus, Shield, Receipt } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Billing | Portyo" },
    { name: "description", content: "Manage your subscription and billing history." },
  ];
};

export default function DashboardBilling() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                  <CreditCard className="w-3 h-3" />
                  Billing
              </div>
              <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">Subscription</h1>
              <p className="text-lg text-text-muted">Manage your plan, payment methods, and invoices.</p>
          </div>
      </header>

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
                    <p className="text-text-muted">You are currently on the <span className="font-bold text-text-main">Free Plan</span></p>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-surface-muted text-text-main text-xs font-bold uppercase tracking-wider border border-border">
                    Free Tier
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
                    <p className="text-xs text-text-muted text-right">750 / 1000 visits used</p>
                </div>
                </div>

                <button className="btn btn-primary w-full md:w-auto">
                    Upgrade Plan
                </button>
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
            
            <div className="space-y-1 flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-alt transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-muted group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main">Oct 24, 2025</p>
                      <p className="text-xs text-text-muted">Pro Plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-main">$9.00</p>
                    <button className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-1 justify-end mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      PDF <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 btn btn-secondary btn-sm">
                View All Invoices
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
