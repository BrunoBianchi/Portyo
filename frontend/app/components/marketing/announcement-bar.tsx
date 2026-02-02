import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Flame } from "lucide-react";

const STORAGE_KEY = "portyo-announcement-closed";

interface AnnouncementBarProps {
  variant?: "promo" | "new-feature" | "update";
}

export default function AnnouncementBar({ variant = "promo" }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // Check if user has closed this announcement
    const closed = sessionStorage.getItem(STORAGE_KEY);
    if (!closed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  if (!isHydrated || !isVisible) return null;

  const content = {
    promo: {
      icon: <Flame className="w-4 h-4" />,
      badge: "HOT",
      message: "Get 7 days standard plan for free!",
      cta: "Get Started",
      href: "/sign-up?promo=free7days",
      badgeColor: "bg-orange-500",
    },
    "new-feature": {
      icon: null,
      badge: "NEW",
      message: "New automation features are now available",
      cta: "Learn More",
      href: "/features",
      badgeColor: "bg-primary",
    },
    update: {
      icon: null,
      badge: "UPDATE",
      message: "Portyo v2.0 is here with exciting new features",
      cta: "See What's New",
      href: "/blog/portyo-v2",
      badgeColor: "bg-blue-500",
    },
  };

  const current = content[variant];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed top-0 left-0 right-0 z-[60] bg-background border-b border-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10">
              {/* Left spacer for balance */}
              <div className="w-8" />

              {/* Center content */}
              <Link 
                to={current.href}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors group"
              >
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-white ${current.badgeColor}`}>
                  {current.icon}
                  {current.badge}
                </span>
                <span>{current.message}</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                  {current.cta}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close announcement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
