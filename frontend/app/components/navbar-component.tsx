
import { useEffect, useId, useRef, useState, type JSX } from "react";
import { Link } from "react-router";

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

function ProductsDropdown() {
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

  const subMenuItems = [
    { title: "Overview", href: "#" },
    { title: "Modifiers", href: "#" },
    { title: "Columns", href: "#" },
    { title: "Layout", href: "#" },
  ];

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onPointerEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onPointerLeave={() => scheduleClose()}
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
          className={`h-4 w-4 text-text-muted transition-transform ${
            open ? "rotate-180" : "rotate-0"
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
                    <div className="text-sm text-text-muted">
                        <div className="h-20 rounded-lg bg-surface-muted/50 border border-border/50"></div>
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

export default function Navbar() {
  return (
         <header className="w-full p-6 flex justify-between items-start z-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-start">
            <Link to='/' className="text-3xl font-extrabold tracking-tight mb-4">Portyo</Link>
            <div className="w-32 h-px bg-text-main/20 mb-3"></div>
            <Link to="/signup" className="text-sm font-medium text-text-main hover:text-primary transition-colors flex items-center gap-2 group">
                Launch your page 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
        </div>

        <div className="pt-2">
            <ProductsDropdown />
        </div>
        
        <div className="flex items-center gap-6 pt-2">


            <Link  to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign in</Link>
            <Link to="/signup" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors">
                Start For Free
            </Link>
        </div>
      </header>
  );
}
