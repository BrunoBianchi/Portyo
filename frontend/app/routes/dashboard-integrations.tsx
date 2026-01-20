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
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useJoyrideSettings } from "~/utils/joyride";

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
    id: "linkedin",
    name: "LinkedIn",
    description: t("dashboard.integrations.items.linkedin"),
    icon: <LinkedInIcon className="w-8 h-8 text-[#0A66C2]" />,
    status: "coming_soon",
    category: "social"
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: t("dashboard.integrations.items.mailchimp"),
    icon: <div className="w-8 h-8 bg-[#FFE01B] rounded-full flex items-center justify-center text-black font-bold text-xs">MC</div>,
    status: "coming_soon",
    category: "marketing"
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: t("dashboard.integrations.items.googleAnalytics"),
    icon: <div className="w-8 h-8 bg-[#E37400] rounded-full flex items-center justify-center text-white font-bold text-xs">GA</div>,
    status: "disconnected",
    category: "analytics"
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    description: t("dashboard.integrations.items.productHunt"),
    icon: <ProductHuntIcon className="w-8 h-8 text-[#DA552F]" />,
    status: "disconnected",
    category: "marketing"
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
  const [tourRun, setTourRun] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
  const { isMobile, styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);

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

    const hasSeenTour = window.localStorage.getItem("portyo:integrations-tour-done");
    if (!hasSeenTour) {
      setTourRun(true);
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
    if (primaryFromTheme) {
      setTourPrimaryColor(primaryFromTheme);
    }
  }, [isMobile]);

  const integrationsTourSteps: Step[] = [
    {
      target: "[data-tour=\"integrations-header\"]",
      content: t("dashboard.tours.integrations.steps.header"),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "[data-tour=\"integrations-filters\"]",
      content: t("dashboard.tours.integrations.steps.filters"),
      placement: "bottom",
    },
    {
      target: "[data-tour=\"integrations-grid\"]",
      content: t("dashboard.tours.integrations.steps.grid"),
      placement: "top",
    },
    {
      target: "[data-tour=\"integrations-card\"]",
      content: t("dashboard.tours.integrations.steps.card"),
      placement: "top",
    },
    {
      target: "[data-tour=\"integrations-action\"]",
      content: t("dashboard.tours.integrations.steps.action"),
      placement: "top",
    },
  ];

  const handleIntegrationsTourCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
      const delta = action === ACTIONS.PREV ? -1 : 1;
      setTourStepIndex(index + delta);
      return;
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setTourRun(false);
      setTourStepIndex(0);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("portyo:integrations-tour-done", "true");
      }
    }
  };

  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!bio?.id) return;
      try {
        const res = await api.get(`/integration?bioId=${bio.id}`);
        const connectedIntegrations = res.data;

        setIntegrations(prevIntegrations => prevIntegrations.map(integration => {
          if (integration.status === "coming_soon") return integration;

          const isConnected = connectedIntegrations.some((i: any) => i.name === integration.id);

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
        <Joyride
          steps={integrationsTourSteps}
          run={tourRun && !isMobile}
          stepIndex={tourStepIndex}
          continuous
          showSkipButton
          spotlightClicks
          scrollToFirstStep
          callback={handleIntegrationsTourCallback}
          styles={joyrideStyles}
          scrollOffset={joyrideProps.scrollOffset}
          spotlightPadding={joyrideProps.spotlightPadding}
          disableScrollParentFix={joyrideProps.disableScrollParentFix}
        />
        <div className="mb-8" data-tour="integrations-header">
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.integrations.title")}</h1>
          <p className="text-gray-500 mt-1">{t("dashboard.integrations.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide" data-tour="integrations-filters">
          {(["all", "social", "content", "marketing", "analytics"] as const).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === category
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
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
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {integration.icon}
                </div>
                {integration.status === "connected" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                    <Check className="w-3 h-3" />
                    {t("dashboard.integrations.status.connected")}
                  </span>
                )}
                {integration.status === "coming_soon" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                    {t("dashboard.integrations.status.comingSoon")}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{integration.name}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1 leading-relaxed">
                {integration.description}
              </p>

              <div className="mt-auto">
                {integration.status === "coming_soon" ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
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
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${integration.status === "connected"
                      ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      : "bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg transform active:scale-95"
                      }`}
                  >
                    {integration.id === "stripe" && isLoadingStripe ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : integration.status === "connected" ? (
                      <>
                        {integration.id === "stripe" ? (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            {t("dashboard.integrations.actions.dashboard")}
                          </>
                        ) : (
                          t("dashboard.integrations.actions.disconnect")
                        )}
                      </>
                    ) : integration.id === "google-analytics" && (user?.plan === 'free' || !user?.plan) ? (
                      <>
                        <div className="flex items-center gap-2 text-yellow-500">
                          <AlertCircle className="w-4 h-4" />
                          <span>{t("dashboard.integrations.actions.upgradeToConnect")}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No integrations found</h3>
            <p className="text-gray-500">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </AuthorizationGuard>
  );
}
