import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ClaimUsernameInput() {
  const [username, setUsername] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isMounted) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 rounded-full blur-xl opacity-0" />
          <div className="relative flex items-center bg-surface-card rounded-full shadow-2xl shadow-black/50 border-2 border-border overflow-hidden pr-2 pl-6 sm:pl-8 h-16 sm:h-20">
            <div className="flex items-center shrink-0">
              <span className="text-foreground font-bold text-base sm:text-xl tracking-tight">portyo.me/p/</span>
            </div>
            <input
              type="text"
              placeholder="yourname"
              disabled
              className="flex-1 bg-transparent border-none outline-none text-base sm:text-xl font-semibold text-foreground placeholder:text-muted-foreground min-w-0 ml-1 h-full"
            />
            <button
              disabled
              className="shrink-0 font-bold text-sm sm:text-base px-5 sm:px-8 h-12 sm:h-14 rounded-full bg-muted text-muted-foreground cursor-not-allowed flex items-center gap-2"
            >
              <span className="hidden sm:inline">Claim Now</span>
              <span className="sm:hidden">Claim</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-muted-foreground text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            Choose your unique link
          </span>
        </div>
      </div>
    );
  }

  function handleClaim() {
    navigate('/sign-up?step=1&sufix=' + username);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && isValid) {
      handleClaim();
    }
  }

  function normalizeUsername(value: string) {
    return value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+/, "")
      .replace(/-+/g, "-");
  }

  const isValid = username.length >= 5 && !username.endsWith("-");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Animated glow effect */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500" />
        
        {/* Main card container - pill shape */}
        <div className={`
          relative flex items-center
          bg-surface-card rounded-full
          shadow-2xl shadow-black/50
          border-2 transition-all duration-300 
          ${isFocused ? 'border-primary/50 shadow-primary/20' : 'border-border'}
          group-hover:border-border-hover
          overflow-hidden
          pr-2 pl-6 sm:pl-8
          h-16 sm:h-20
        `}>
          {/* URL prefix */}
          <div className="flex items-center shrink-0">
            <span className="text-foreground font-bold text-base sm:text-xl tracking-tight">portyo.me/p/</span>
          </div>
          
          {/* Input */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(normalizeUsername(e.target.value))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={t("home.hero.ctaPlaceholder", "yourname")}
            className="flex-1 bg-transparent border-none outline-none text-base sm:text-xl font-semibold text-foreground placeholder:text-muted-foreground min-w-0 ml-1 h-full"
            spellCheck={false}
            autoComplete="off"
          />
          
          {/* Button */}
          <button
            disabled={!isValid}
            onClick={handleClaim}
            className={`
              shrink-0 
              font-bold text-sm sm:text-base
              px-5 sm:px-8 h-12 sm:h-14
              rounded-full
              transition-all duration-300 
              flex items-center gap-2 
              group/btn
              ${isValid 
                ? 'bg-primary hover:bg-primary-hover text-background shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            <span className="hidden sm:inline">{t("home.hero.ctaButton", "Claim Now")}</span>
            <span className="sm:hidden">{t("home.hero.ctaButton", "Claim")}</span>
            <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isValid ? 'group-hover/btn:translate-x-1' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Helper text */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {username.length > 0 && username.length < 5 ? (
          <span className="text-destructive text-sm font-medium flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-4 h-4" />
            Username must be at least 5 characters
          </span>
        ) : (
          <span className="text-muted-foreground text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            Choose your unique link
          </span>
        )}
      </div>
    </div>
  );
}
