import type { MetaFunction } from "react-router";
import { User, Mail, Lock, Bell, Trash2, Save } from "lucide-react";
import { useContext, useState } from "react";
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile, security, and preferences.</p>
      </div>

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
    </div>
  );
}
