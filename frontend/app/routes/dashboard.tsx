import AuthorizationGuard from "~/contexts/guard.context";
import { Sidebar } from "~/components/dashboard/sidebar";
import type { Route } from "../+types/root";
import { useState } from "react";
import { BioProvider } from "~/contexts/bio.context";
import { BlogProvider } from "~/contexts/blog.context";
import { Outlet } from "react-router";
import { MenuIcon } from "~/components/shared/icons";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard | Portyo" },
        { name: "description", content: "Manage your links and profile" },
    ];
}

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <AuthorizationGuard>
            <BioProvider>
                <BlogProvider>
                    <div className="min-h-screen bg-surface-alt flex font-sans text-text-main">
                        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                        <main className="flex-1 md:ml-64 transition-all duration-300 min-w-0">
                            {/* Mobile Header */}
                            <div className="md:hidden bg-surface/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between sticky top-0 z-40">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
                                        P
                                    </div>
                                    <span className="font-bold text-xl tracking-tight text-text-main">Portyo</span>
                                </div>
                                <button
                                    className="p-2.5 bg-surface-alt rounded-xl text-text-main hover:bg-primary/20 transition-colors"
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <MenuIcon />
                                </button>
                            </div>

                            <Outlet />
                        </main>
                    </div>
                </BlogProvider>
            </BioProvider>
        </AuthorizationGuard>
    )
}
