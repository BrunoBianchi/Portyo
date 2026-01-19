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
          overlayColor: "rgba(0, 0, 0, 0.45)",
          primaryColor,
          textColor: "#171717",
          zIndex: 10000,
          width: isMobile ? "92vw" : 380,
        },
        buttonNext: {
          color: "#171717",
          fontWeight: 700,
          padding: isMobile ? "8px 14px" : undefined,
          fontSize: isMobile ? "14px" : undefined,
        },
        buttonBack: {
          color: "#5b5b5b",
          fontSize: isMobile ? "14px" : undefined,
        },
        buttonSkip: {
          color: "#5b5b5b",
          fontSize: isMobile ? "14px" : undefined,
        },
        tooltip: {
          borderRadius: isMobile ? "16px" : "14px",
          padding: isMobile ? "16px" : undefined,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipContent: {
          fontSize: isMobile ? "15px" : "14px",
          lineHeight: isMobile ? "1.5" : "1.4",
        },
        spotlight: {
          borderRadius: isMobile ? "16px" : "12px",
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
