import { useContext, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import AuthContext from "~/contexts/auth.context";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "~/constants/languages";
import { Menu, X, ChevronDown, Globe, Sparkles } from "lucide-react";

function IconGlobe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LanguageSelect({ value, onChange, buttonClassName }: { 
  value: string; 
  onChange: (value: string) => void;
  buttonClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentLabel = LANGUAGES.find((l) => l.code === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${buttonClassName} flex items-center gap-2`}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-border bg-surface-card shadow-xl overflow-hidden z-50"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  lang.code === value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { i18n, t } = useTranslation();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const buildLocalizedPath = (lang: string) => {
    if (/^\/(en|pt)(\/|$)/.test(pathname)) {
      return pathname.replace(/^\/(en|pt)(?=\/|$)/, `/${lang}`);
    }
    return pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;
  };

  const withLang = (to: string) => {
    if (to.startsWith("http")) return to;
    if (/^\/(en|pt)(\/|$)/.test(to)) return to;
    const currentLang = i18n.resolvedLanguage || i18n.language || "en";
    return to === "/" ? `/${currentLang}` : `/${currentLang}${to}`;
  };

  useEffect(() => {
    setIsHydrated(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const currentPathWithSearch = `${pathname}${search || ""}`;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-border/50' 
            : 'bg-transparent'
        }`}
        style={{ top: '40px' }} // Espaço para announcement bar
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to={withLang('/')} className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <span className="text-background font-bold text-xl">P</span>
              </motion.div>
              <span className="text-xl font-bold tracking-tight text-foreground">Portyo</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: t("nav.features", "Features"), href: "/#features" },
                { label: t("nav.pricing", "Pricing"), href: "/pricing" },
                { label: t("nav.themes", "Themes"), href: "/themes" },
                { label: t("nav.blog", "Blog"), href: "/blog" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={withLang(item.href)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSelect
                value={i18n.resolvedLanguage || i18n.language}
                onChange={(value) => {
                  i18n.changeLanguage(value);
                  navigate(buildLocalizedPath(value), { replace: true });
                }}
                buttonClassName="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors"
              />
              
              {isHydrated && user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("nav.dashboard", "Dashboard")}
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    {t("nav.signOut", "Sign out")}
                  </motion.button>
                </div>
              ) : isHydrated ? (
                <div className="flex items-center gap-3">
                  <Link 
                    to={withLang(`/login?redirect=${encodeURIComponent(currentPathWithSearch)}`)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("nav.signIn")}
                  </Link>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link 
                      to={withLang('/sign-up')}
                      className="px-5 py-2.5 bg-primary text-background text-sm font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t("nav.startFree")}
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <div className="h-10 w-24 bg-muted rounded-xl animate-pulse" />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-surface-card shadow-2xl border-l border-border"
            >
              <div className="p-6 pt-20">
                <nav className="space-y-2">
                  {[
                    { label: t("nav.features", "Features"), href: "/#features" },
                    { label: t("nav.pricing", "Pricing"), href: "/pricing" },
                    { label: t("nav.themes", "Themes"), href: "/themes" },
                    { label: t("nav.blog", "Blog"), href: "/blog" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={withLang(item.href)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-lg font-semibold text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Language Selector */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="px-4 text-sm font-medium text-muted-foreground mb-3">{t("nav.language")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          navigate(buildLocalizedPath(lang.code), { replace: true });
                          setIsMobileMenuOpen(false);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          lang.code === (i18n.resolvedLanguage || i18n.language)
                            ? "bg-primary text-background"
                            : "bg-muted text-muted-foreground hover:bg-muted-hover"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auth Buttons */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  {user ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-semibold text-foreground bg-muted rounded-xl hover:bg-muted-hover transition-colors"
                      >
                        {t("nav.goToDashboard")}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full px-4 py-3 text-center font-semibold text-destructive bg-destructive/10 rounded-xl hover:bg-destructive/20 transition-colors"
                      >
                        {t("nav.signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={withLang(`/login?redirect=${encodeURIComponent(currentPathWithSearch)}`)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-semibold text-foreground bg-muted rounded-xl hover:bg-muted-hover transition-colors"
                      >
                        {t("nav.signIn")}
                      </Link>
                      <Link
                        to={withLang('/sign-up')}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-bold text-background bg-primary rounded-xl hover:bg-primary-hover transition-colors"
                      >
                        {t("nav.startFree")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
