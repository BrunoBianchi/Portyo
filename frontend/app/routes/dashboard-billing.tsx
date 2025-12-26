import type { MetaFunction } from "react-router";
import { Check, CreditCard, Zap, Clock, Download } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Billing | Portyo" },
    { name: "description", content: "Manage your subscription and billing history." },
  ];
};

export default function DashboardBilling() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-500 mt-1">Manage your plan, payment methods, and invoices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Current Plan</h2>
                <p className="text-sm text-gray-500">You are currently on the <span className="font-semibold text-gray-900">Free Plan</span></p>
              </div>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                Free
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Unlimited links</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Basic analytics</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Standard themes</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upgrade to Pro</h3>
                  <p className="text-xs text-gray-500">Unlock all features for $9/month</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3 mb-1">
                <div className="bg-blue-500 h-2 rounded-full w-[75%]"></div>
              </div>
              <p className="text-xs text-gray-500 text-right">75% of free limits used</p>
            </div>

            <button className="w-full py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
              Upgrade Plan
            </button>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h2>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-xs text-gray-500">Expires 12/25</p>
                </div>
              </div>
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Edit</button>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> Add payment method
            </button>
          </section>
        </div>

        {/* Billing History */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Billing History</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Oct 24, 2025</p>
                      <p className="text-xs text-gray-500">Pro Plan - Monthly</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">$9.00</p>
                    <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-end mt-1">
                      PDF <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
