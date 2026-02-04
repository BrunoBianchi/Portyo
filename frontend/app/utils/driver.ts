import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { driver, type DriveStep, type Config as DriverConfig } from "driver.js";
import "driver.js/dist/driver.css";

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

interface DriverHookOptions {
  primaryColor?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
  preventDefault?: boolean;
}

export const useDriverTour = (options: DriverHookOptions = {}) => {
  const { 
    primaryColor = "#d2e823", 
    onComplete, 
    onSkip,
    storageKey,
    preventDefault = false 
  } = options;
  
  const isMobile = useIsMobile();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Configuração do tema baseada nas cores do Portyo
  const driverConfig = useMemo<DriverConfig>(() => ({
    animate: true,
    overlayOpacity: 0.6,
    smoothScroll: true,
    allowKeyboardControl: true,
    disableActiveInteraction: false,
    showProgress: true,
    showButtons: ["next", "previous", "close"],
    popoverClass: "portyo-driver-theme",
    progressText: "{{current}} de {{total}}",
    nextBtnText: isMobile ? "Próximo" : "Próximo →",
    prevBtnText: isMobile ? "← Voltar" : "← Voltar",
    doneBtnText: "Concluir ✓",
    steps: [],
    onHighlightStarted: () => {
      setIsActive(true);
    },
    onDeselected: () => {
      setIsActive(false);
    },
    onDestroyed: () => {
      setIsActive(false);
      if (storageKey && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, "true");
      }
      onComplete?.();
    },
    onCloseClick: () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
      onSkip?.();
    },
  }), [isMobile, storageKey, onComplete, onSkip]);

  // Inicializa o driver
  useEffect(() => {
    driverRef.current = driver(driverConfig);
    
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, [driverConfig]);

  // Atualiza o tema quando a cor primária muda
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    // Adiciona variáveis CSS customizadas para o Driver.js
    const style = document.documentElement.style;
    style.setProperty("--driver-primary", primaryColor);
    style.setProperty("--driver-primary-light", `${primaryColor}20`);
    style.setProperty("--driver-primary-hover", `${primaryColor}dd`);
  }, [primaryColor]);

  const startTour = useCallback((steps: DriveStep[], startIndex: number = 0) => {
    if (!driverRef.current) return;
    
    // Verifica se deve prevenir (se já viu o tour)
    if (storageKey && typeof window !== "undefined") {
      const hasSeen = window.localStorage.getItem(storageKey);
      if (hasSeen && !preventDefault) return;
    }

    // Em mobile, ajusta os steps para melhor responsividade
    const adjustedSteps = isMobile 
      ? steps.map(step => ({
          ...step,
          popover: {
            ...step.popover,
            side: step.popover.side === "right" ? "bottom" : step.popover.side,
            align: "center",
          }
        }))
      : steps;

    driverRef.current.setSteps(adjustedSteps);
    driverRef.current.drive(startIndex);
  }, [isMobile, storageKey, preventDefault]);

  const destroyTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
  }, []);

  return { 
    startTour, 
    destroyTour, 
    isActive,
    isMobile 
  };
};

// Helper para criar steps padronizados
export const createTourStep = (
  element: string,
  title: string,
  description: string,
  options: {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    disableButtons?: ("next" | "previous" | "close")[];
  } = {}
): DriveStep => ({
  element,
  popover: {
    title,
    description,
    side: options.side || "bottom",
    align: options.align || "start",
    disableButtons: options.disableButtons,
  },
});

// Hook para iniciar o tour automaticamente
export const useAutoStartTour = (
  steps: DriveStep[],
  storageKey: string,
  primaryColor: string = "#d2e823",
  enabled: boolean = true
) => {
  const { startTour, isMobile } = useDriverTour({ 
    primaryColor, 
    storageKey,
    preventDefault: false 
  });

  useEffect(() => {
    if (!enabled || isMobile) return;
    if (typeof window === "undefined") return;
    
    const hasSeenTour = window.localStorage.getItem(storageKey);
    if (hasSeenTour) return;

    // Pequeno delay para garantir que os elementos estejam renderizados
    const timer = setTimeout(() => {
      startTour(steps);
    }, 1000);

    return () => clearTimeout(timer);
  }, [enabled, isMobile, steps, storageKey, startTour]);
};
