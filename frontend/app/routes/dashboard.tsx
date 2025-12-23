import AuthorizationGuard from "~/contexts/guard.context";
import { Sidebar } from "~/components/sidebar";
import type { Route } from "../+types/root";
import { useContext, useState } from "react";
import BioContext, { BioProvider } from "~/contexts/bio.context";
import { Outlet } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | Portyo" },
    { name: "description", content: "Manage your links and profile" },
  ];
}

export default function Dashboard() { 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const {bio,bios,createBio,getBio,getBios} = useContext(BioContext)
    console.log(bio)
    return (
        <AuthorizationGuard>
            <BioProvider>
            <div className="min-h-screen bg-surface-alt flex">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                
                <main className="flex-1 md:ml-64 transition-all duration-300">
                    {/* Mobile Header */}
                    <div className="md:hidden bg-surface border-b border-border p-4 flex items-center justify-between sticky top-0 z-40">
                        <div className="font-bold text-xl">Portyo</div>
                        <button 
                            className="p-2 text-text-muted hover:text-text-main"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        </button>
                    </div>

                    <Outlet />
                </main>
            </div>
              </BioProvider>
        </AuthorizationGuard>
    )
}