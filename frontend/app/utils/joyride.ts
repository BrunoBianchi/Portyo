import { useEffect, useMemo, useState } from "react";
import type { Styles } from "react-joyride";

const MOBILE_BREAKPOINT = 768;

export const useIsMobile = (breakpoint: number = MOBILE_BREAKPOINT) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
};

export const useJoyrideSettings = (primaryColor: string) => {
  const isMobile = useIsMobile();

  const styles = useMemo<Styles>(
    () =>
      ({
        options: {
          arrowColor: "#ffffff",
          backgroundColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.6)",
          primaryColor,
          textColor: "#1a1a1a",
          zIndex: 10000,
          width: isMobile ? "92vw" : 420,
        },
        buttonNext: {
          backgroundColor: primaryColor,
          color: "#000000",
          fontWeight: 700,
          padding: isMobile ? "12px 24px" : "12px 28px",
          fontSize: isMobile ? "14px" : "15px",
          borderRadius: "12px",
          border: "none",
          boxShadow: `0 4px 12px ${primaryColor}40`,
          transition: "all 0.2s ease",
        },
        buttonBack: {
          color: "#6b7280",
          fontSize: isMobile ? "14px" : "15px",
          fontWeight: 600,
          marginRight: "12px",
          padding: isMobile ? "12px 20px" : "12px 24px",
          backgroundColor: "#f3f4f6",
          borderRadius: "12px",
          border: "none",
          transition: "all 0.2s ease",
        },
        buttonSkip: {
          color: "#6b7280",
          fontSize: isMobile ? "14px" : "15px",
          fontWeight: 600,
          padding: isMobile ? "12px 20px" : "12px 24px",
          backgroundColor: "#f3f4f6",
          borderRadius: "12px",
          border: "none",
          transition: "all 0.2s ease",
        },
        buttonClose: {
          color: "#9ca3af",
          padding: "8px",
          width: "32px",
          height: "32px",
          transition: "all 0.2s ease",
        },
        tooltip: {
          borderRadius: isMobile ? "20px" : "20px",
          padding: isMobile ? "24px" : "28px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipContent: {
          fontSize: isMobile ? "15px" : "16px",
          lineHeight: isMobile ? "1.6" : "1.65",
          padding: isMobile ? "0 0 20px 0" : "0 0 24px 0",
          color: "#374151",
          fontWeight: 500,
        },
        tooltipTitle: {
          fontSize: isMobile ? "18px" : "20px",
          fontWeight: 700,
          marginBottom: "12px",
          color: "#111827",
        },
        tooltipFooter: {
          marginTop: "20px",
        },
        spotlight: {
          borderRadius: isMobile ? "16px" : "12px",
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px ${primaryColor}30`,
        },
      } as Styles),
    [primaryColor, isMobile]
  );

  const joyrideProps = useMemo(
    () => ({
      scrollOffset: isMobile ? 120 : 80,
      spotlightPadding: isMobile ? 12 : 8,
      disableScrollParentFix: isMobile,
    }),
    [isMobile]
  );

  return { isMobile, styles, joyrideProps };
};
