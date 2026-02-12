import { useContext, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import AuthContext from "~/contexts/auth.context";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "~/constants/languages";
import { Menu, X, ChevronDown, Globe, Target } from "lucide-react";
import { isCompanySubdomain } from "~/lib/company-utils";

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
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${lang.code === value
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

interface NavbarProps {
  isCompanyMode?: boolean;
}

export default function Navbar({ isCompanyMode = false }: NavbarProps) {
  const { user, logout } = useContext(AuthContext);
  const { i18n, t } = useTranslation();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Detect company mode from prop or URL
  const isCompany = isCompanyMode || isCompanySubdomain();

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

  // Company mode paths — always use /company/ prefix for correct route resolution
  const getCompanyPath = (subpath: string) => {
    const currentLang = i18n.resolvedLanguage || i18n.language || "en";
    return `/${currentLang}/company/${subpath}`;
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
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[#1A1A1A] py-0" : "bg-transparent py-4"
          }`}
      >
        <div className="w-full px-6 sm:px-12 lg:px-20">
          <div className="flex items-center justify-between h-20 w-full">
            {/* Logo */}
            <Link
              to={withLang('/')}
              className={`flex items-center gap-2 transition-colors ${isScrolled ? "text-white" : "text-[#1A1A1A]"
                }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isCompany ? (
                // Company Logo - same as standard with "| Companies" suffix
                <div className="flex items-center gap-0">
                  <span className="text-2xl md:text-3xl font-extrabold tracking-tighter leading-none">
                    Portyo
                  </span>
                  <span className={`ml-2 text-sm font-medium tracking-normal ${isScrolled ? "text-gray-400" : "text-gray-400"}`}>
                    |&nbsp; Companies
                  </span>
                </div>
              ) : (
                // Standard Logo
                <span className="text-2xl md:text-3xl font-extrabold tracking-tighter leading-none">
                  Portyo
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {!isCompany ? (
                // Standard Nav Items
                <>
                  {[
                    { label: t("nav.features", "Features"), href: "/#features" },
                    { label: t("nav.pricing", "Pricing"), href: "/pricing" },
                    { label: t("nav.themes", "Themes"), href: "/themes" },
                    { label: t("nav.blog", "Blog"), href: "/blog" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={withLang(item.href)}
                      className={`text-sm font-bold uppercase tracking-wider transition-colors ${isScrolled
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-700 hover:text-black"
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              ) : (
                // Company Nav Items
                <>
                  {[
                    { label: t("company.landing.nav.features", "Features"), href: "/#features" },
                    { label: t("company.landing.nav.howItWorks", "How it Works"), href: "/#how-it-works" },
                    { label: t("company.landing.nav.pricing", "Pricing"), href: "/#pricing" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={withLang(item.href)}
                      className={`text-sm font-bold uppercase tracking-wider transition-colors ${isScrolled
                          ? "text-gray-300 hover:text-[#D2E823]"
                          : "text-gray-700 hover:text-[#D2E823]"
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Select */}
              <LanguageSelect
                value={i18n.resolvedLanguage || i18n.language}
                onChange={(value) => {
                  i18n.changeLanguage(value);
                  navigate(buildLocalizedPath(value), { replace: true });
                }}
                buttonClassName={`text-sm font-bold flex items-center gap-2 transition-colors ${isScrolled
                    ? "text-white hover:text-[#D2E823]"
                    : isCompany ? "text-[#1A1A1A] hover:text-[#D2E823]" : "text-[#1A1A1A] hover:text-[#0047FF]"
                  }`}
              />

              {isCompany ? (
                // Company Mode Actions - Same style as standard
                <div className="flex items-center gap-4">
                  <Link
                    to={getCompanyPath("login")}
                    className={`text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-all ${isScrolled
                        ? "text-white hover:bg-white/10"
                        : "text-[#1A1A1A] hover:bg-black/5"
                      }`}
                  >
                    {t("nav.signIn", "Sign In")}
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={getCompanyPath("register")}
                      className={`px-8 py-3 text-sm font-black uppercase tracking-wider rounded-full transition-colors shadow-none border-2 ${isScrolled
                          ? "bg-[#D2E823] text-[#1A1A1A] border-[#D2E823] hover:bg-white hover:border-white"
                          : "bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-transparent hover:text-[#1A1A1A]"
                        }`}
                    >
                      {t("nav.register", "Register")}
                    </Link>
                  </motion.div>
                </div>
              ) : isHydrated && user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/dashboard"
                    className={`text-sm font-bold uppercase tracking-wide transition-colors ${isScrolled ? "text-white hover:text-[#D2E823]" : "text-[#1A1A1A] hover:text-[#0047FF]"
                      }`}
                  >
                    {t("nav.dashboard", "Dashboard")}
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="px-6 py-3 text-sm font-bold rounded-full bg-[#E94E77] text-white hover:bg-[#D43D63] transition-colors"
                  >
                    {t("nav.signOut", "Sign out")}
                  </motion.button>
                </div>
              ) : isHydrated ? (
                <div className="flex items-center gap-4">
                  <Link
                    to={withLang(`/login?redirect=${encodeURIComponent(currentPathWithSearch)}`)}
                    className={`text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-all ${isScrolled
                        ? "text-white hover:bg-white/10"
                        : "text-[#1A1A1A] hover:bg-black/5"
                      }`}
                  >
                    {t("nav.signIn")}
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={withLang('/sign-up')}
                      className={`px-8 py-3 text-sm font-black uppercase tracking-wider rounded-full transition-colors shadow-none border-2 ${isScrolled
                          ? "bg-[#D2E823] text-[#1A1A1A] border-[#D2E823] hover:bg-white hover:border-white"
                          : "bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-transparent hover:text-[#1A1A1A]"
                        }`}
                    >
                      {t("nav.startFree")}
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <div className="h-10 w-24 bg-black/10 rounded-full animate-pulse" />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 transition-colors ${isScrolled ? "text-white hover:bg-white/10" : "text-[#1A1A1A] hover:bg-black/5"
                }`}
            >
              {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </motion.header>
      {/* Spacer for fixed header - ONLY if scrolled or if we want to push content down. 
          Actually for Bold transparent header map, we DON'T want a spacer. The hero goes under.
      */}


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
                  {(isCompany ? [
                    { label: t("company.landing.nav.features", "Features"), href: "/#features" },
                    { label: t("company.landing.nav.howItWorks", "How it Works"), href: "/#how-it-works" },
                    { label: t("company.landing.nav.pricing", "Pricing"), href: "/#pricing" },
                  ] : [
                    { label: t("nav.features", "Features"), href: "/#features" },
                    { label: t("nav.pricing", "Pricing"), href: "/pricing" },
                    { label: t("nav.themes", "Themes"), href: "/themes" },
                    { label: t("nav.blog", "Blog"), href: "/blog" },
                  ]).map((item) => (
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
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${lang.code === (i18n.resolvedLanguage || i18n.language)
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
                <div className="space-y-3 mt-6 pt-6 border-t border-border">
                  {isCompany ? (
                    // Company Mode Mobile Actions
                    <>
                      <Link
                        to={getCompanyPath("login")}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-semibold text-foreground bg-muted rounded-xl hover:bg-muted-hover transition-colors"
                      >
                        {t("nav.signIn", "Sign In")}
                      </Link>
                      <Link
                        to={getCompanyPath("register")}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-bold text-background bg-primary rounded-xl hover:bg-primary-hover transition-colors"
                      >
                        {t("nav.register", "Register")}
                      </Link>
                    </>
                  ) : user ? (
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
