import { Link, useLocation } from "react-router";
import { useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import AuthContext from "~/contexts/auth.context";
import BioContext from "~/contexts/bio.context";
import {
    LayoutDashboard,
    PenTool,
    Settings,
    LogOut,
    Globe,
    ChevronDown,
    Plus,
    Check,
    ExternalLink,
    X,
    Sparkles,
    BarChart3,
    Users,
    Zap,
    Puzzle,
    CreditCard,
    ShoppingBag,
    FileText,
    UserCog,
    QrCode,
    Bell,
    Calendar,
    LayoutTemplate
} from "lucide-react";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    handleChangeBio?: () => void;
}

export function Sidebar({ isOpen = false, onClose, handleChangeBio }: SidebarProps) {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const { bio, bios, createBio, selectBio } = useContext(BioContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname === path;

    function normalizeUsername(value: string) {
        return value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/^-+/, "")
            .replace(/-+/g, "-");
    }

    const isUsernameValid = newUsername.length >= 3 && !newUsername.endsWith("-");

    const handleCreateBio = async () => {
        if (!isUsernameValid) return;
        setCreateError(null);
        try {
            await createBio(newUsername);
            setIsCreateModalOpen(false);
            setNewUsername("");
        } catch (error: any) {
            console.error("Failed to create bio", error);
            setCreateError(error.response?.data?.message || "Failed to create page. Username might be taken.");
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
        { name: "Editor", path: "/dashboard/editor", icon: PenTool },
        { name: "Leads", path: "/dashboard/leads", icon: Users, isPro: true },
        { name: "Products", path: "/dashboard/products", icon: ShoppingBag },
        { name: "Blog", path: "/dashboard/blog", icon: FileText },
        { name: "QR Code", path: "/dashboard/qrcode", icon: QrCode },
        { name: "Scheduler", path: "/dashboard/scheduler", icon: Calendar },
        { name: "Email Templates", path: "/dashboard/templates", icon: LayoutTemplate, isPro: true },
        { name: "Integrations", path: "/dashboard/integrations", icon: Puzzle },
        { name: "Automation", path: "/dashboard/automation", icon: Zap, isPro: true },
        { name: "SEO Settings", path: "/dashboard/seo", icon: Settings, isPro: true },
        { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3, isPro: true },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-[45] md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Create Bio Modal */}
            {isCreateModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="bg-white w-full max-w-[480px] rounded-xl p-6 relative z-10 shadow-2xl">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                                    <Sparkles className="w-3 h-3" />
                                    New Page
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Claim your link</h2>
                                <p className="text-gray-500 mt-1 text-sm">Choose a unique username for your new page.</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-black" aria-label="Close modal">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {createError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {createError}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="relative group">
                                <div className="flex items-center bg-white rounded-full h-16 px-6 border border-gray-200 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300 hover:shadow-md">
                                    <Globe className="w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors shrink-0 mr-4" />

                                    <div className="flex-1 flex items-center h-full relative">
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => {
                                                setNewUsername(normalizeUsername(e.target.value));
                                                setCreateError(null);
                                            }}
                                            placeholder="yourname"
                                            className="flex-1 bg-transparent border-none outline-none text-xl md:text-2xl font-bold text-gray-900 placeholder:text-gray-300 h-full text-right pr-0.5 tracking-tight w-full min-w-0"
                                            autoFocus
                                            spellCheck={false}
                                        />
                                        <span className="text-xl md:text-2xl font-bold text-gray-400 select-none tracking-tight shrink-0">.portyo.me</span>
                                    </div>

                                    <div className={`ml-4 transition-all duration-300 ${isUsernameValid || createError ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                        {createError ? (
                                            <div className="bg-red-500 rounded-full p-1 text-white shadow-sm">
                                                <X className="w-4 h-4" strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <div className="bg-green-500 rounded-full p-1 text-white shadow-sm">
                                                <Check className="w-4 h-4" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={!isUsernameValid}
                                onClick={handleCreateBio}
                                className="btn btn-primary w-full justify-center gap-2"
                            >
                                <span>Create Page</span>
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>, document.body
            )}

            <aside className={`
                w-64 h-screen flex flex-col fixed left-0 top-0 z-50 bg-white
                transition-transform duration-300 ease-out border-r border-gray-100
                ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
                md:translate-x-0 md:shadow-none
            `}>
                {/* Logo Area */}
                <div className="p-4 pb-2 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                            P
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Portyo</span>
                    </Link>
                    <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close sidebar">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Workspace Switcher */}
                <div className="px-4 mb-2 mt-2" ref={dropdownRef}>
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full bg-gray-50 hover:bg-gray-100 text-gray-900 p-3 rounded-xl transition-all flex items-center justify-between border ${isDropdownOpen ? 'border-primary ring-2 ring-primary/10' : 'border-gray-200 hover:border-gray-300'}`}
                            aria-label="Switch workspace"
                            aria-expanded={isDropdownOpen}
                        >
                            <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col items-start overflow-hidden min-w-0 flex-1">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Current Page</span>
                                    <span className="text-sm font-bold truncate w-full text-left text-gray-900">
                                        {bio?.sufix || "Select Page"}
                                    </span>
                                </div>
                            </div>
                            <div className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400">
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 ring-1 ring-black/5 p-2">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Your Pages
                                </div>
                                <div className="max-h-[240px] overflow-y-auto space-y-1 custom-scrollbar">
                                    {bios.length > 0 && bios.map((b) => (
                                        <button
                                            key={b.id}
                                            onClick={() => {
                                                selectBio(b);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${bio?.id === b.id ? 'bg-primary/10 text-gray-900 font-bold' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 font-medium'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bio?.id === b.id ? 'bg-white text-primary shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm truncate flex-1">{b.sufix}</span>
                                            {bio?.id === b.id && (
                                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm shadow-primary/30">
                                                    <Check className="w-3 h-3 text-white shrink-0" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="h-px bg-gray-100 my-2 mx-2" />

                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group text-gray-500 hover:text-gray-900"
                                    aria-label="Create new page"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 group-hover:text-gray-700">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm">Create new page</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Menu
                    </div>
                    {bio ? (
                        navItems.filter((item: any) => {
                            if (!item.minPlan) return true;
                            if (user?.plan === 'free') return false;
                            if (item.minPlan === 'pro' && user?.plan !== 'pro') return false;
                            return true;
                        }).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 group relative ${isActive(item.path)
                                    ? "bg-primary/15 text-gray-900 font-bold"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"} transition-colors`} />
                                <span className="flex-1 text-sm">{item.name}</span>
                                {/* @ts-ignore */}
                                {item.isPro && (
                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${isActive(item.path) ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-900 text-white'}`}>
                                        Pro
                                    </span>
                                )}
                            </Link>
                        ))
                    ) : (
                        <div className="px-3 py-4 text-center">
                            <p className="text-sm text-gray-500 mb-3">Select or create a page to access the menu.</p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="btn btn-primary w-full justify-center text-xs"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Create Page
                            </button>
                        </div>
                    )}
                </nav>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 bg-white flex flex-col">
                    {bio && (
                        <div className="p-3 pb-0">
                            <a
                                href={`https://${bio.sufix}.portyo.me`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full p-2 rounded-lg bg-gray-50 border border-transparent hover:border-primary/30 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-sm border border-gray-100">
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Page</span>
                                        <span className="text-xs font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                                            {bio.sufix}.portyo.me
                                        </span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    )}

                    <Link
                        to="/dashboard/settings"
                        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm border-2 border-white ring-1 ring-gray-100">
                            {user?.fullname?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold truncate text-gray-900">{user?.fullname || "User"}</p>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider border border-gray-200">
                                    Free
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                logout();
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="Log out"
                            aria-label="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </aside>
        </>
    );
}
