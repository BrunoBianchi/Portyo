import { useContext } from "react";
import BioContext from "~/contexts/bio.context";
import { BarChart3, MousePointer2, TrendingUp, ArrowUpRight, Sparkles, ExternalLink, PenTool } from "lucide-react";

export default function DashboardHome() {
    const { bio } = useContext(BioContext);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3 h-3" />
                        Overview
                    </div>
                    <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">Dashboard</h1>
                    <p className="text-lg text-text-muted">Welcome back! Here's what's happening with your profile.</p>
                </div>
                <div className="flex items-center gap-3">
                    {bio && (
                        <>
                            <a 
                                href={`https://${bio.sufix}.portyo.me`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Page
                            </a>
                            <a 
                                href={`/dashboard/editor`} 
                                className="btn btn-primary btn-sm"
                            >
                                <PenTool className="w-4 h-4" />
                                Open Editor
                            </a>
                        </>
                    )}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 className="w-24 h-24 text-primary-foreground" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="label mb-0">Total Views</h3>
                        </div>
                        <p className="text-4xl font-extrabold text-text-main mb-2">{bio?.views || 0}</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold">
                            <TrendingUp className="w-3 h-3" />
                            <span>+12%</span>
                            <span className="text-green-600/70 font-medium">vs last month</span>
                        </div>
                    </div>
                </div>

                <div className="card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MousePointer2 className="w-24 h-24 text-primary-foreground" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <MousePointer2 className="w-6 h-6" />
                            </div>
                            <h3 className="label mb-0">Total Clicks</h3>
                        </div>
                        <p className="text-4xl font-extrabold text-text-main mb-2">{bio?.clicks || 0}</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold">
                            <TrendingUp className="w-3 h-3" />
                            <span>+5%</span>
                            <span className="text-green-600/70 font-medium">vs last month</span>
                        </div>
                    </div>
                </div>

                <div className="card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowUpRight className="w-24 h-24 text-primary-foreground" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                            <h3 className="label mb-0">Avg. CTR</h3>
                        </div>
                        <p className="text-4xl font-extrabold text-text-main mb-2">4.2%</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold">
                            <TrendingUp className="w-3 h-3 rotate-180" />
                            <span>-1%</span>
                            <span className="text-red-600/70 font-medium">vs last month</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-text-main">Recent Activity</h2>
                        <button className="btn btn-ghost btn-sm">View All</button>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-2xl bg-surface-alt/50">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <BarChart3 className="w-8 h-8 text-text-muted" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-1">No activity yet</h3>
                        <p className="text-text-muted max-w-xs mx-auto">Share your page to start tracking views and clicks from your audience.</p>
                    </div>
                </div>

                <div className="card p-8 bg-black text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
                            <Sparkles className="w-3 h-3 text-primary" />
                            Pro Feature
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Upgrade to Pro</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">Get detailed analytics, custom domains, and remove Portyo branding from your page.</p>
                        <button className="w-full btn bg-primary text-primary-foreground hover:bg-primary-hover border-none">
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
