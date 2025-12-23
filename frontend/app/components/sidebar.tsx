import { Link, useLocation } from "react-router";
import { useContext, useState, useRef, useEffect } from "react";
import AuthContext from "~/contexts/auth.context";
import BioContext from "~/contexts/bio.context";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    handleChangeBio?:()=>void;
}

export function Sidebar({ isOpen = false, onClose,handleChangeBio }: SidebarProps) {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const { bio, bios, createBio, selectBio } = useContext(BioContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
        try {
            await createBio(newUsername);
            setIsCreateModalOpen(false);
            setNewUsername("");
        } catch (error) {
            console.error("Failed to create bio", error);
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
        { name: "Dashboard", path: "/dashboard", icon: <HomeIcon /> },
        { name: "Links", path: "/dashboard/links", icon: <LinkIcon /> },
        { name: "Appearance", path: "/dashboard/appearance", icon: <PaletteIcon /> },
        { name: "Analytics", path: "/dashboard/analytics", icon: <ChartIcon /> },
        { name: "Settings", path: "/dashboard/settings", icon: <SettingsIcon /> },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-[45] md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}
            
            {/* Create Bio Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="bg-white w-full max-w-[580px] rounded-[2rem] p-8 relative z-10 shadow-2xl animate-float">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-extrabold text-black mb-2 tracking-tight">Claim your link</h2>
                                <p className="text-gray-500 text-lg">Choose a unique username for your page.</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="relative flex items-center bg-[#F9F8F4] rounded-2xl h-20 px-6 border border-transparent focus-within:border-black/5 transition-all">
                                <div className="flex-1 flex items-center justify-end h-full">
                                    <input 
                                        type="text" 
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(normalizeUsername(e.target.value))}
                                        placeholder="username" 
                                        className="w-full bg-transparent border-none outline-none text-3xl font-bold text-black placeholder:text-gray-300 h-full text-right pr-1 tracking-tight"
                                        autoFocus
                                        spellCheck={false}
                                    />
                                </div>
                                <div className="flex items-center h-full pl-1">
                                    <span className="text-3xl font-bold text-black/80 select-none tracking-tight">.portyo.me</span>
                                </div>
                            </div>
                            
                            <button 
                                disabled={!isUsernameValid}
                                onClick={handleCreateBio}
                                className="w-full bg-[#DFFF7E] hover:bg-[#D2F270] text-[#5F6D28] font-bold text-xl py-5 rounded-2xl shadow-lg shadow-[#DFFF7E]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                            >
                                <span>Create Page</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <aside className={`
                w-64 h-screen flex flex-col fixed left-0 top-0 z-50
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0 bg-surface-alt" : "-translate-x-full"}
                md:translate-x-0 md:bg-transparent
            `}>
                {/* Logo Area */}
                <div className="p-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm">
                            P
                        </div>
                        <span className="font-bold text-xl tracking-tight text-text-main">Portyo</span>
                    </Link>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden text-text-muted hover:text-text-main">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 space-y-3 overflow-y-auto">
                <div className="mb-6" ref={dropdownRef}>
                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full bg-surface hover:bg-white text-text-main p-3 rounded-xl transition-all flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer border ${isDropdownOpen ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border/50'}`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                                    <GlobeIcon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col items-start overflow-hidden min-w-0 flex-1">
                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Active Page</span>
                                    <span className="text-sm font-bold truncate w-full text-left leading-tight">
                                        {bio?.sufix || "No page"}
                                    </span>
                                </div>
                            </div>
                            <ChevronDownIcon className={`text-text-muted transition-transform duration-200 w-4 h-4 shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border border-border/50 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-1.5">
                                    <button 
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setIsCreateModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-alt text-left transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-surface-alt group-hover:bg-white border border-border/50 flex items-center justify-center text-text-main transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                        </div>
                                        <span className="font-medium text-sm">Create new page</span>
                                    </button>
                                    
                                    {bios.length > 0 && (
                                        <>
                                            <div className="h-px bg-border/50 my-1.5 mx-2" />
                                            {bios.map((b) => (
                                                <button 
                                                    key={b.id}
                                                    onClick={() => {
                                                        selectBio(b);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${bio?.id === b.id ? 'bg-primary/5 text-primary-hover' : 'hover:bg-surface-alt text-text-main'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bio?.id === b.id ? 'bg-primary/20 text-primary-hover' : 'bg-surface-alt text-text-muted'}`}>
                                                        <GlobeIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-bold text-sm truncate">{b.sufix}</span>
                                                        {bio?.id === b.id && <span className="text-[10px] opacity-80">Active</span>}
                                                    </div>
                                                    {bio?.id === b.id && (
                                                        <div className="ml-auto shrink-0 pl-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 group ${
                            isActive(item.path)
                                ? "text-text-main font-semibold bg-white/60"
                                : "text-text-muted hover:text-text-main hover:bg-white/30"
                        }`}
                    >
                        <span className={`${isActive(item.path) ? "text-text-main" : "text-text-muted group-hover:text-text-main"} transition-colors`}>
                            {item.icon}
                        </span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-6 mt-auto">
                <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 border border-white/50 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-hover font-bold text-lg shrink-0">
                        {user?.fullname?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-text-main">{user?.fullname || "User"}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            logout();
                        }}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Log out"
                    >
                        <LogoutIcon />
                    </button>
                </div>
            </div>
        </aside>
        </>
    );
}

// Icons
function HomeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    );
}

function LinkIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
    );
}

function PaletteIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.093 0-.679.63-1.289 1.293-1.289a1.94 1.94 0 0 0 1.938-1.938 1.9 1.9 0 0 0-1.938-1.938c-.902 0-1.687-.746-1.687-1.687 0-.438.18-.836.438-1.125.29-.29.437-.653.437-1.094 0-.679-.63-1.289-1.293-1.289-.664 0-1.293.61-1.293 1.289 0 .441.148.804.438 1.094.257.289.437.687.437 1.125 0 .941-.785 1.687-1.687 1.687a1.94 1.94 0 0 0-1.938 1.938c0 1.07.867 1.938 1.938 1.938 1.07 0 1.937-.868 1.937-1.938 0-1.07-.867-1.938-1.937-1.938Z"/>
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
    );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="m6 9 6 6 6-6"/>
        </svg>
    );
}
