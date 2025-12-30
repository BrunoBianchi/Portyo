import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router";
import type { MetaFunction } from "react-router";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
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
} from "~/components/icons";
import { Check, Plus, ExternalLink, AlertCircle, CreditCard, Loader2 } from "lucide-react";

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

export default function DashboardIntegrations() {
  const { bio } = useContext(BioContext);
  const [searchParams] = useSearchParams();
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "stripe",
      name: "Stripe",
      description: "Accept payments and donations directly on your page.",
      icon: <div className="w-8 h-8 bg-[#635BFF] rounded-lg flex items-center justify-center text-white"><CreditCard className="w-5 h-5" /></div>,
      status: "disconnected",
      category: "marketing"
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Display your latest posts and stories directly on your bio page.",
      icon: <InstagramIcon className="w-8 h-8 text-[#E1306C]" />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "youtube",
      name: "YouTube",
      description: "Embed your latest videos or playlists automatically.",
      icon: <YouTubeIcon className="w-8 h-8 text-[#FF0000]" />,
      status: "connected",
      category: "content"
    },
    {
      id: "tiktok",
      name: "TikTok",
      description: "Showcase your viral TikTok videos to your audience.",
      icon: <TikTokIcon className="w-8 h-8 text-[#000000]" />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "spotify",
      name: "Spotify",
      description: "Share your favorite tracks, albums, or playlists.",
      icon: <SpotifyIcon className="w-8 h-8 text-[#1DB954]" />,
      status: "disconnected",
      category: "content"
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      description: "Display your latest tweets and engage with your followers.",
      icon: <TwitterIcon className="w-8 h-8 text-[#1DA1F2]" />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Connect your professional profile and show your latest updates.",
      icon: <LinkedInIcon className="w-8 h-8 text-[#0A66C2]" />,
      status: "coming_soon",
      category: "social"
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Collect emails and grow your newsletter audience.",
      icon: <div className="w-8 h-8 bg-[#FFE01B] rounded-full flex items-center justify-center text-black font-bold text-xs">MC</div>,
      status: "coming_soon",
      category: "marketing"
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Track visitors and gain deeper insights into your traffic.",
      icon: <div className="w-8 h-8 bg-[#E37400] rounded-full flex items-center justify-center text-white font-bold text-xs">GA</div>,
      status: "coming_soon",
      category: "analytics"
    },
    {
        id: "producthunt",
        name: "Product Hunt",
        description: "Showcase your latest launched products.",
        icon: <ProductHuntIcon className="w-8 h-8 text-[#DA552F]" />,
        status: "disconnected",
        category: "marketing"
    }
  ]);

  const [filter, setFilter] = useState<"all" | "social" | "marketing" | "analytics" | "content">("all");

  const filteredIntegrations = integrations.filter(
    (item) => filter === "all" || item.category === filter
  );

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

  const handleConnect = (id: string) => {
    if (id === "stripe") {
        handleConnectStripe();
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">Connect your favorite tools to supercharge your bio page.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {(["all", "social", "content", "marketing", "analytics"] as const).map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === category
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <div 
            key={integration.id} 
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                {integration.icon}
              </div>
              {integration.status === "connected" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                  <Check className="w-3 h-3" />
                  Connected
                </span>
              )}
              {integration.status === "coming_soon" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                  Coming Soon
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
                  Not Available Yet
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (integration.id === "stripe" && integration.status === "connected") {
                        handleStripeDashboard();
                    } else {
                        handleConnect(integration.id);
                    }
                  }}
                  disabled={integration.id === "stripe" && isLoadingStripe}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    integration.status === "connected"
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
                            Dashboard
                          </>
                      ) : (
                          "Disconnect"
                      )}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Connect
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
  );
}
