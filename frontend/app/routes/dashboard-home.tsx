import { useContext } from "react";
import BioContext from "~/contexts/bio.context";

export default function DashboardHome() {
    const { bio } = useContext(BioContext);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-main mb-2">Dashboard</h1>
                <p className="text-text-muted">Welcome back! Here's what's happening with your profile.</p>
            </header>

            {/* Example Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                    <h3 className="text-text-muted text-sm font-medium mb-2">Total Views</h3>
                    <p className="text-3xl font-bold text-text-main">{bio?.views || 0}</p>
                    <div className="mt-4 text-sm text-green-600 flex items-center gap-1">
                        <span>+12%</span>
                        <span className="text-text-muted">from last month</span>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                    <h3 className="text-text-muted text-sm font-medium mb-2">Total Clicks</h3>
                    <p className="text-3xl font-bold text-text-main">{bio?.clicks || 0}</p>
                    <div className="mt-4 text-sm text-green-600 flex items-center gap-1">
                        <span>+5%</span>
                        <span className="text-text-muted">from last month</span>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                    <h3 className="text-text-muted text-sm font-medium mb-2">Avg. CTR</h3>
                    <p className="text-3xl font-bold text-text-main">4.2%</p>
                    <div className="mt-4 text-sm text-red-500 flex items-center gap-1">
                        <span>-1%</span>
                        <span className="text-text-muted">from last month</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="text-text-muted text-center py-8">
                    No recent activity to show.
                </div>
            </div>
        </div>
    );
}
