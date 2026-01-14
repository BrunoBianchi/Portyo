
import { useContext, useEffect, useId, useRef, useState, type JSX } from "react";
import { Link } from "react-router";
import AuthContext from "~/contexts/auth.context";

type DropdownSectionItem = {
  title: string;
  description?: string;
  href?: string;
};

function IconLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.57" />
    </svg>
  );
}

function IconShare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 8a3 3 0 1 0-2.83-4" />
      <path d="M6 14a3 3 0 1 0 2.83 4" />
      <path d="M16 8l-8 6" />
      <path d="M8 18l8-6" />
    </svg>
  );
}

function IconUsers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 11a4 4 0 1 0-8 0" />
      <path d="M12 15c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5Z" />
    </svg>
  );
}
function IconGlobe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function IconCoin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 19V5" />
      <path d="M8 19V9" />
      <path d="M12 19V12" />
      <path d="M16 19V7" />
      <path d="M20 19V4" />
    </svg>
  );
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

import { getPublicSitePosts, type SitePost } from "~/services/site-blog.service";
import { format } from "date-fns";

function ProductsDropdown() {
  const buttonId = useId();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [latestPosts, setLatestPosts] = useState<SitePost[]>([]);

  function closeIfFocusLeft(currentTarget: HTMLElement) {
    const active = document.activeElement;
    if (active && active instanceof Node && currentTarget.contains(active)) return;
    setOpen(false);
  }

  useEffect(() => {
    getPublicSitePosts().then(posts => {
      if (posts) setLatestPosts(posts.slice(0, 3));
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      if (e.target instanceof Node && !wrapper.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        queueMicrotask(() => buttonRef.current?.focus());
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function clearCloseTimer() {
    if (closeTimerRef.current == null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 120);
  }

  const subMenuItems = [
    { title: "Overview", href: "/" },
    { title: "Modifiers", href: "/" },
    { title: "Columns", href: "/" },
    { title: "Layout", href: "/" },
  ];

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          clearCloseTimer();
          setOpen(true);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          scheduleClose();
        }
      }}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => closeIfFocusLeft(e.currentTarget)}
    >
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-text-main transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-hover"
      >
        Blog
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : "rotate-0"
            }`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 pt-4">
          <div
            id={panelId}
            role="menu"
            aria-labelledby={buttonId}
            onPointerEnter={() => clearCloseTimer()}
            onPointerLeave={() => scheduleClose()}
            className="w-[800px] rounded-2xl border border-border bg-surface shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-6 p-6">
              {/* Column 1: Latest Posts */}
              <div>
                <div className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                  Latest Posts <span>🤩</span>
                </div>
                <div className="flex flex-col gap-3">
                  {latestPosts.length > 0 ? latestPosts.map(post => (
                    <Link key={post.id} to={`/site-blog/${post.id}`} className="group block">
                      <div className="text-sm font-medium text-text-main group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </div>
                    </Link>
                  )) : (
                    <div className="text-sm text-text-muted italic">No posts yet</div>
                  )}
                </div>
              </div>

              {/* Column 2: Sub Menu Title */}
              <div>
                <div className="text-sm font-semibold text-text-main mb-4">
                  Sub Menu Title
                </div>
                <ul className="space-y-3">
                  {subMenuItems.map((item) => (
                    <li key={item.title}>
                      <a href={item.href} className="text-sm text-text-muted hover:text-primary transition-colors">
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: What's new */}
              <div>
                <div className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                  What's new <span>🎉</span>
                </div>
                <div className="text-sm text-text-muted">
                  <div className="h-20 rounded-lg bg-surface-muted/50 border border-border/50"></div>
                </div>
              </div>

              {/* Column 4: Sub Menu Title */}
              <div>
                <div className="text-sm font-semibold text-text-main mb-4">
                  Sub Menu Title
                </div>
                <ul className="space-y-3">
                  {subMenuItems.map((item) => (
                    <li key={item.title}>
                      <a href={item.href} className="text-sm text-text-muted hover:text-primary transition-colors">
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-surface-muted/30 p-4 flex items-center justify-between">
              <div className="text-sm font-medium text-text-main">
                Stay up to date!
              </div>
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function IconLayoutDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconLogOut(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function UserDropdown({ user, logout }: { user: { fullname: string; email: string; plan?: 'free' | 'standard' | 'pro' }; logout: () => void }) {
  const buttonId = useId();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  function closeIfFocusLeft(currentTarget: HTMLElement) {
    const active = document.activeElement;
    if (active && active instanceof Node && currentTarget.contains(active)) return;
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      if (e.target instanceof Node && !wrapper.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        queueMicrotask(() => buttonRef.current?.focus());
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function clearCloseTimer() {
    if (closeTimerRef.current == null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 120);
  }

  const planColors = {
    free: "bg-gray-100 text-gray-700 border-gray-200",
    standard: "bg-blue-50 text-blue-700 border-blue-200",
    pro: "bg-primary/20 text-primary-dark border-primary/30"
  };

  const userPlan = user.plan || 'free';

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          clearCloseTimer();
          setOpen(true);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          scheduleClose();
        }
      }}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => closeIfFocusLeft(e.currentTarget)}
    >
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-text-main transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-hover"
      >
        <div className="w-9 h-9 rounded-full bg-[#E8F0B8] flex items-center justify-center text-[#A3B808] font-bold text-sm border border-[#D2E823]/30">
          {user.fullname?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <span className="hidden sm:inline font-semibold text-[#A3B808]">{user.fullname ?? "User"}</span>
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : "rotate-0"
            }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 pt-3 min-w-[260px]">
          <div
            id={panelId}
            role="menu"
            aria-labelledby={buttonId}
            onPointerEnter={() => clearCloseTimer()}
            onPointerLeave={() => scheduleClose()}
            className="rounded-2xl border border-border bg-surface shadow-xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-75"
          >
            <div className="px-5 py-4 border-b border-border/50">
              <p className="text-base font-bold text-text-main truncate">{user.fullname ?? "User"}</p>
              <p className="text-xs text-text-muted truncate mb-3 font-medium">{user.email}</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${planColors[userPlan]}`}>
                {userPlan} Plan
              </span>
            </div>

            <div className="py-2">
              <Link to="/dashboard" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-text-main hover:bg-surface-muted hover:text-primary transition-colors">
                <IconLayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/settings" className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-text-main hover:bg-surface-muted hover:text-primary transition-colors">
                <IconSettings className="w-4 h-4" />
                Settings
              </Link>
            </div>

            <div className="border-t border-border/50 py-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <IconLogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Menu, X } from "lucide-react";

// ... existing imports

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [announcement, setAnnouncement] = useState<{
    text: string;
    link: string;
    badge?: "new" | "hot" | "sale" | "update" | "none";
    isNew?: boolean; // Legacy support
    isVisible: boolean;
    bgColor?: string;
    textColor?: string;
    fontSize?: "12" | "14" | "16";
    textAlign?: "left" | "center";
  } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch announcement
    const fetchAnnouncement = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.portyo.me';
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
        const res = await fetch(`${baseUrl}/public/settings/announcement`);
        if (res.ok) {
          const data = await res.json();
          setAnnouncement(data);
        }
      } catch (e) {
        console.error("Failed to fetch announcement", e);
      }
    };
    fetchAnnouncement();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Determine badge to show (support both legacy isNew and new badge field)
  const badgeType = announcement?.badge ?? (announcement?.isNew ? 'new' : 'none');

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'hot': return 'bg-orange-500 text-white';
      case 'sale': return 'bg-green-500 text-white';
      case 'update': return 'bg-blue-500 text-white';
      case 'new': return 'bg-red-500 text-white';
      default: return '';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'hot': return 'HOT';
      case 'sale': return 'SALE';
      case 'update': return 'UPDATE';
      case 'new': return 'NEW';
      default: return '';
    }
  };

  return (
    <>
      {announcement && announcement.isVisible && (
        <div
          className="w-full py-2.5 px-4 z-50 transition-all duration-300 relative"
          style={{
            backgroundColor: announcement.bgColor || '#000000',
            color: announcement.textColor || '#ffffff',
            fontSize: `${announcement.fontSize || '14'}px`
          }}
        >
          <div
            className="max-w-7xl mx-auto flex items-center justify-between font-medium"
            style={{ justifyContent: announcement.textAlign === 'center' ? 'center' : 'space-between' }}
          >
            <div
              className="flex items-center gap-2 truncate pr-4"
              style={{ justifyContent: announcement.textAlign === 'center' ? 'center' : 'flex-start', flex: announcement.textAlign === 'center' ? 'none' : 1 }}
            >
              {badgeType !== 'none' && (
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${getBadgeStyle(badgeType)}`}>
                  {getBadgeLabel(badgeType)}
                </span>
              )}
              <span className="truncate">{announcement.text}</span>
            </div>
            {announcement.textAlign !== 'center' && (
              <Link to={announcement.link} className="flex items-center gap-1 hover:opacity-80 transition-colors whitespace-nowrap shrink-0">
                <span className="hidden sm:inline">Get Started</span> <span className="sm:hidden">View</span> <span style={{ color: announcement.textColor === '#ffffff' ? '#d0f224' : undefined }}>→</span>
              </Link>
            )}
          </div>
        </div>
      )}

      <header className="w-full p-4 md:p-6 z-40 max-w-7xl mx-auto relative">
        <div className="flex justify-between items-start">
          {/* Logo Section */}
          <div className="flex flex-col items-start z-50 relative">
            <Link to='/' className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 md:mb-4">Portyo</Link>
            <div className="hidden md:block w-32 h-px bg-text-main/20 mb-3"></div>
            <Link to="/sign-up" className="hidden md:flex text-sm font-medium text-text-main hover:text-primary transition-colors items-center gap-2 group">
              Launch your page
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block pt-2">
            <ProductsDropdown />
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-6 pt-2">
            {!user ? (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign in</Link>
                <Link to="/sign-up" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors">
                  Start For Free
                </Link>
              </>
            ) : (
              <UserDropdown user={user} logout={logout} />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden z-50 p-2 text-text-main hover:bg-surface-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-surface z-40 md:hidden pt-24 px-6 pb-6 flex flex-col gap-6 overflow-y-auto animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-4">
              <div className="text-sm font-bold text-text-muted uppercase tracking-wider">Menu</div>
              <Link
                to="/site-blog"
                className="text-2xl font-bold text-text-main hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/manifesto"
                className="text-2xl font-bold text-text-main hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Manifesto
              </Link>
              <Link
                to="/pricing"
                className="text-2xl font-bold text-text-main hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>

            <div className="h-px w-full bg-border"></div>

            <div className="flex flex-col gap-4">
              <Link
                to="/sign-up"
                className="text-lg font-medium text-text-main hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Launch your page →
              </Link>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="w-full py-4 text-center font-bold text-text-main border border-border rounded-xl hover:bg-surface-muted transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/sign-up"
                    className="w-full py-4 text-center font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Start For Free
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-4 bg-surface-muted rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark font-bold">
                      {user.fullname?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <div className="font-bold text-text-main">{user.fullname}</div>
                      <div className="text-xs text-text-muted">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="w-full py-4 text-center font-bold text-text-main border border-border rounded-xl hover:bg-surface-muted transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-4 text-center font-bold text-red-600 border border-red-100 bg-red-50/50 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
