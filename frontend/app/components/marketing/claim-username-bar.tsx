import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export default function ClaimUsernameBar() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);

    function onScroll() {
      setVisible(window.scrollY > 700);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function normalizeUsername(value: string) {
    return value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+/, "")
      .replace(/-+/g, "-");
  }

  const isValid = username.length >= 5 && !username.endsWith("-");

  if (!mounted || !visible) return null;

  return (
    <div className="fixed left-1/2 bottom-6 z-50 w-full max-w-[520px] -translate-x-1/2 px-4 transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 fade-in">
      <div className="w-full relative group mx-auto">
        {/* Soft glow effect behind */}
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition duration-700"></div>

        <div className="relative flex items-center bg-white rounded-full p-2 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-gray-100 transition-shadow duration-300 hover:shadow-[0_12px_50px_rgb(0,0,0,0.12)]">
          <div className="flex items-center h-12 pl-3 md:pl-4">
            <span className="text-xl md:text-2xl font-bold text-gray-700 select-none tracking-tight">portyo.me/p/</span>
          </div>
          <div className="flex-1 flex items-center justify-start relative h-12">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(normalizeUsername(e.target.value))}
              placeholder={t("home.hero.ctaPlaceholder")}
              className="w-full bg-transparent border-none outline-none text-xl md:text-2xl font-bold text-text-main placeholder:text-gray-400 h-full text-left pl-0.5 tracking-tight"
              spellCheck={false}
            />
          </div>
          <button
            disabled={!isValid}
            onClick={() => navigate('/sign-up?step=1&sufix=' + username)}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base md:text-lg py-3 px-7 md:px-9 rounded-full transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            {t("home.hero.ctaButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
