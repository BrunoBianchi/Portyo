import { useState, useEffect, useContext, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { MetaFunction } from "react-router";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import AuthContext from "~/contexts/auth.context";
import {
  InstagramIcon,
  YouTubeIcon,
  TwitterIcon,
  LinkedInIcon,
  GitHubIcon,
  FacebookIcon,
  WhatsAppIcon,
  TikTokIcon,
  SpotifyIcon,
  ProductHuntIcon
} from "~/components/shared/icons";
import { Check, Plus, ExternalLink, AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

export const meta: MetaFunction = () => {
  return [
    { title: "Integrations | Portyo" },
    { name: "description", content: "Connect your favorite tools to Portyo." },
  ];
};

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "coming_soon";
  category: "social" | "marketing" | "analytics" | "content";
}

const buildIntegrations = (t: (key: string) => string): Integration[] => [
  {
    id: "stripe",
    name: "Stripe",
    description: t("dashboard.integrations.items.stripe"),
    icon: <div className="w-8 h-8 bg-[#635BFF] rounded-lg flex items-center justify-center text-white"><CreditCard className="w-5 h-5" /></div>,
    status: "disconnected",
    category: "marketing"
  },
  {
    id: "instagram",
    name: "Instagram",
    description: t("dashboard.integrations.items.instagram"),
    icon: <InstagramIcon className="w-8 h-8 text-[#E1306C]" />,
    status: "disconnected",
    category: "social"
  },
  {
    id: "youtube",
    name: "YouTube",
    description: t("dashboard.integrations.items.youtube"),
    icon: <YouTubeIcon className="w-8 h-8 text-[#FF0000]" />,
    status: "connected",
    category: "content"
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: t("dashboard.integrations.items.tiktok"),
    icon: <TikTokIcon className="w-8 h-8 text-[#000000]" />,
    status: "disconnected",
    category: "social"
  },
  {
    id: "spotify",
    name: "Spotify",
    description: t("dashboard.integrations.items.spotify"),
    icon: <SpotifyIcon className="w-8 h-8 text-[#1DB954]" />,
    status: "disconnected",
    category: "content"
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    description: t("dashboard.integrations.items.twitter"),
    icon: <TwitterIcon className="w-8 h-8 text-[#1DA1F2]" />,
    status: "disconnected",
    category: "social"
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: t("dashboard.integrations.items.googleAnalytics"),
    icon: <div className="w-8 h-8 bg-[#E37400] rounded-full flex items-center justify-center text-white font-bold text-xs">GA</div>,
    status: "disconnected",
    category: "analytics"
  }
];

export default function DashboardIntegrations() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { bio } = useContext(BioContext);
  const [searchParams] = useSearchParams();
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const baseIntegrations = useMemo(() => buildIntegrations(t), [t]);
  const [integrations, setIntegrations] = useState<Integration[]>(baseIntegrations);
  const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
  const isMobile = useIsMobile();
  const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:integrations-tour-done" });

  const [filter, setFilter] = useState<"all" | "social" | "marketing" | "analytics" | "content">("all");

  const filteredIntegrations = integrations.filter(
    (item) => filter === "all" || item.category === filter
  );

  useEffect(() => {
    setIntegrations((prev) =>
      prev.map((item) => {
        const base = baseIntegrations.find((b) => b.id === item.id);
        return base ? { ...base, status: item.status } : item;
      })
    );
  }, [baseIntegrations]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
    if (primaryFromTheme) {
      setTourPrimaryColor(primaryFromTheme);
    }
  }, [isMobile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) return;

    const hasSeenTour = window.localStorage.getItem("portyo:integrations-tour-done");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour(integrationsTourSteps);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isMobile, startTour]);

  const integrationsTourSteps: DriveStep[] = useMemo(() => [
    {
      element: "[data-tour=\"integrations-header\"]",
      popover: { title: t("dashboard.tours.integrations.steps.header"), description: t("dashboard.tours.integrations.steps.header"), side: "bottom", align: "start" },
    },
    {
      element: "[data-tour=\"integrations-filters\"]",
      popover: { title: t("dashboard.tours.integrations.steps.filters"), description: t("dashboard.tours.integrations.steps.filters"), side: "bottom", align: "start" },
    },
    {
      element: "[data-tour=\"integrations-grid\"]",
      popover: { title: t("dashboard.tours.integrations.steps.grid"), description: t("dashboard.tours.integrations.steps.grid"), side: "top", align: "start" },
    },
    {
      element: "[data-tour=\"integrations-card\"]",
      popover: { title: t("dashboard.tours.integrations.steps.card"), description: t("dashboard.tours.integrations.steps.card"), side: "top", align: "start" },
    },
    {
      element: "[data-tour=\"integrations-action\"]",
      popover: { title: t("dashboard.tours.integrations.steps.action"), description: t("dashboard.tours.integrations.steps.action"), side: "top", align: "start" },
    },
  ], [t]);

  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!bio?.id) return;
      try {
        const res = await api.get(`/integration?bioId=${bio.id}`);
        const connectedIntegrations = res.data;

        setIntegrations(prevIntegrations => prevIntegrations.map(integration => {
          if (integration.status === "coming_soon") return integration;

          const isConnected = connectedIntegrations.some((i: any) => {
            const provider = typeof i?.provider === "string" ? i.provider.toLowerCase() : "";
            const name = typeof i?.name === "string" ? i.name.toLowerCase().replace(/\s+/g, "-") : "";
            return provider === integration.id || name === integration.id;
          });

          if (isConnected) {
            return { ...integration, status: "connected" };
          } else {
            return { ...integration, status: "disconnected" };
          }
        }));
      } catch (error) {
        console.error("Failed to fetch integrations", error);
      }
    };

    fetchIntegrations();
  }, [bio?.id]);

  useEffect(() => {
    if (bio?.id) {
      checkStripeStatus();

      const stripeParam = searchParams.get("stripe");
      if (stripeParam === "return" || stripeParam === "refresh") {
        checkStripeStatus();
      }

      const successParam = searchParams.get("success");
      if (successParam === "instagram_connected") {
        // Re-fetch integration status
        // We can just rely on the main useEffect that fetches integrations, 
        // but we might want to show a toast or clean the URL.
        // For now, let's just let the main useEffect update the state because it depends on bio.id
        // We can force a refetch if needed, but the component remount or state update might trigger it.
        // Actually, better to explicitly re-fetch or rely on the fact that we just redirected back.
        // The main useEffect [bio?.id] runs on mount.
      }
    }
  }, [searchParams, bio?.id]);

  const checkStripeStatus = async () => {
    if (!bio?.id) return;
    try {
      const res = await api.get(`/stripe/status?bioId=${bio.id}`);
      if (res.data.connected) {
        setIntegrations(prev => prev.map(item =>
          item.id === "stripe" ? { ...item, status: "connected" } : item
        ));
      }
    } catch (error) {
      console.error("Failed to check stripe status", error);
    }
  };

  const handleConnectStripe = async () => {
    if (!bio?.id) return;
    setIsLoadingStripe(true);
    try {
      const res = await api.post("/stripe/connect", { bioId: bio.id });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Failed to connect stripe", error);
      setIsLoadingStripe(false);
    }
  };

  const handleStripeDashboard = async () => {
    if (!bio?.id) return;
    setIsLoadingStripe(true);
    try {
      const res = await api.post("/stripe/login-link", { bioId: bio.id });
      if (res.data.url) {
        window.open(res.data.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to get stripe login link", error);
    } finally {
      setIsLoadingStripe(false);
    }
  };

  const handleConnectGoogleAnalytics = async () => {
    if (!bio?.id) return;
    try {
      const res = await api.get(`/google-analytics/auth?bioId=${bio.id}`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Failed to connect google analytics", error);
    }
  };

  const handleConnectInstagram = async () => {
    if (!bio?.id) return;
    try {
      const res = await api.get(`/instagram/auth?bioId=${bio.id}`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Failed to connect instagram", error);
    }
  };

  const handleConnect = (id: string) => {
    if (id === "stripe") {
      handleConnectStripe();
      return;
    }
    if (id === "google-analytics") {
      handleConnectGoogleAnalytics();
      return;
    }
    if (id === "instagram") {
      handleConnectInstagram();
      return;
    }
    // Simulate connection
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === "connected" ? "disconnected" : "connected" };
      }
      return item;
    }));
  };

  return (
    <AuthorizationGuard>
      <div className="p-6 max-w-7xl mx-auto">

        <div className="mb-8" data-tour="integrations-header">
          <h1 className="text-4xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.integrations.title")}</h1>
          <p className="text-gray-600 font-medium text-lg">{t("dashboard.integrations.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide" data-tour="integrations-filters">
          {(["all", "social", "content", "marketing", "analytics"] as const).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 whitespace-nowrap ${filter === category
                ? "bg-[#C6F035] text-black"
                : "bg-white text-black hover:bg-gray-50"
                }`}
            >
              {t(`dashboard.integrations.filters.${category}`)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="integrations-grid">
          {filteredIntegrations.map((integration, index) => (
            <div
              key={integration.id}
              data-tour={index === 0 ? "integrations-card" : undefined}
              className="bg-white rounded-[20px] border-4 border-black p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col h-full group hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-100 border-2 border-black rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {integration.icon}
                </div>
                {integration.status === "connected" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C6F035] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    {t("dashboard.integrations.status.connected")}
                  </span>
                )}
                {integration.status === "coming_soon" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-black border-2 border-gray-300 uppercase tracking-wide">
                    {t("dashboard.integrations.status.comingSoon")}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-[#1A1A1A] mb-2 uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{integration.name}</h3>
              <p className="text-sm text-gray-600 font-medium mb-6 flex-1 leading-relaxed">
                {integration.description}
              </p>

              <div className="mt-auto">
                {integration.status === "coming_soon" ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-400 text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2 grayscale"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {t("dashboard.integrations.actions.notAvailable")}
                  </button>
                ) : (
                  <button
                    data-tour={index === 0 ? "integrations-action" : undefined}
                    onClick={() => {
                      if (integration.id === "stripe" && integration.status === "connected") {
                        handleStripeDashboard();
                      } else if (integration.id === "google-analytics" && (user?.plan === 'free' || !user?.plan)) {
                        // Prevent click for free users
                        return;
                      } else {
                        handleConnect(integration.id);
                      }
                    }}
                    disabled={integration.id === "stripe" && isLoadingStripe}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 ${integration.status === "connected"
                      ? "bg-white text-black hover:bg-gray-50"
                      : "bg-[#E94E77] text-white hover:bg-[#D43D64]"
                      } ${integration.id === "google-analytics" && (user?.plan === 'free' || !user?.plan) ? "opacity-50 cursor-not-allowed bg-gray-400 border-gray-500 text-white" : ""}`}
                  >
                    {integration.id === "stripe" && isLoadingStripe ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : integration.status === "connected" ? (
                      <>
                        {integration.id === "stripe" ? (
                          <>
                            <ExternalLink className="w-4 h-4 stroke-[3px]" />
                            {t("dashboard.integrations.actions.dashboard")}
                          </>
                        ) : (
                          t("dashboard.integrations.actions.disconnect")
                        )}
                      </>
                    ) : integration.id === "google-analytics" && (user?.plan === 'free' || !user?.plan) ? (
                      <>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{t("dashboard.integrations.actions.upgradeToConnect")}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        {t("dashboard.integrations.actions.connect")}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[20px] border-4 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl border-2 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-black text-[#1A1A1A] mb-2 uppercase">No integrations found</h3>
            <p className="text-gray-500 font-medium">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </AuthorizationGuard>
  );
}
