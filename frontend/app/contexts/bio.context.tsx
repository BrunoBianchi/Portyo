import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "~/services/api";
import AuthContext from "~/contexts/auth.context";

export type BioBlock = {
    id: string;
    type: "heading" | "text" | "button" | "image" | "divider" | "socials" | "video" | "blog" | "product" | "calendar" | "map" | "featured" | "affiliate" | "event" | "instagram" | "youtube" | "tour" | "spotify" | "qrcode" | "button_grid" | "form" | "portfolio" | "marketing" | "whatsapp" | "experience";
    title?: string;
    body?: string;
    // Form specific
    formId?: string;
    formBackgroundColor?: string;
    formTextColor?: string;
    href?: string;
    align?: "left" | "center" | "right" | "justify";
    fontSize?: string;
    fontWeight?: string;
    accent?: string;
    textColor?: string;
    mediaUrl?: string;
    // Button Grid specific
    gridItems?: {
        id: string;
        title: string;
        url: string;
        image: string; // Background image
        icon: string; // Small icon
    }[];
    // Button specific
    buttonStyle?: "solid" | "outline" | "ghost" | "hard-shadow" | "soft-shadow" | "3d" | "glass" | "gradient" | "neumorphism" | "clay" | "cyberpunk" | "pixel" | "neon" | "sketch" | "gradient-border" | "minimal-underline" | "architect" | "material" | "brutalist" | "outline-thick";
    theme?: string;
    buttonRadius?: string;
    buttonShadow?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonShape?: "pill" | "rounded" | "square";
    buttonShadowColor?: string;
    buttonImage?: string;
    buttonTextAlign?: "left" | "center" | "right";
    isNsfw?: boolean;
    animation?: "none" | "bounce" | "pulse" | "shake" | "wobble";
    animationTrigger?: "loop" | "once" | "hover";
    // WhatsApp specific
    whatsappNumber?: string;
    whatsappMessage?: string;
    whatsappStyle?: "solid" | "outline" | "glass" | "gradient" | "neon" | "minimal" | "soft" | "dark";
    whatsappShape?: "pill" | "rounded" | "square";
    whatsappVariation?: "direct-button" | "pre-filled-form";
    // Socials specific
    socials?: {
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
        github?: string;
    };
    socialsLayout?: "row" | "column";
    socialsLabel?: boolean;
    socialsVariation?: "icon-grid" | "detailed-list" | "floating-buttons";
    // Block reference
    bioId?: string;
    // Blog specific
    blogLayout?: "carousel" | "list" | "grid";
    blogCardStyle?: "featured" | "minimal" | "modern";
    blogPostCount?: number;
    blogPostIds?: string[];
    blogShowImages?: boolean;
    blogShowDates?: boolean;
    blogBackgroundColor?: string;
    blogTitleColor?: string;
    blogTextColor?: string;
    blogDateColor?: string;
    blogTagBackgroundColor?: string;
    blogTagTextColor?: string;
    // Blog Popup specific
    blogPopupStyle?: "classic" | "modern" | "simple";
    blogPopupBackgroundColor?: string;
    blogPopupTextColor?: string;
    blogPopupOverlayColor?: string;
    // Product specific
    products?: {
        id: string;
        title: string;
        price: string;
        image: string;
        url: string;
    }[];
    productIds?: string[];
    productLayout?: "grid" | "list" | "carousel";
    productCardStyle?: "default" | "minimal";
    productShowPrices?: boolean;
    productShowDescriptions?: boolean;
    productBackgroundColor?: string;
    productTextColor?: string;
    productAccentColor?: string;
    productButtonText?: string;
    // Calendar specific
    calendarTitle?: string;
    calendarUrl?: string;
    calendarColor?: string;
    calendarTextColor?: string;
    calendarAccentColor?: string;
    // Map specific
    mapTitle?: string;
    mapAddress?: string;
    // Featured specific
    featuredTitle?: string;
    featuredPrice?: string;
    featuredImage?: string;
    featuredUrl?: string;
    featuredColor?: string;
    featuredTextColor?: string;
    // Affiliate specific
    affiliateTitle?: string;
    affiliateCode?: string;
    affiliateImage?: string;
    affiliateUrl?: string;
    affiliateColor?: string;
    affiliateTextColor?: string;
    // Event specific
    eventTitle?: string;
    eventDate?: string;
    eventColor?: string;
    eventTextColor?: string;
    eventButtonText?: string;
    eventButtonUrl?: string;
    // Instagram specific
    instagramUsername?: string;
    instagramTitle?: string;
    instagramDisplayType?: "grid" | "list";
    instagramTextColor?: string;
    instagramTextPosition?: "top" | "bottom";
    instagramShowText?: boolean;
    instagramVariation?: "grid-shop" | "visual-gallery" | "simple-link";
    // Youtube specific
    youtubeUrl?: string;
    // QR Code specific
    qrCodeValue?: string;
    qrCodeLayout?: "single" | "multiple" | "grid";
    qrCodeColor?: string;
    qrCodeBgColor?: string;
    qrCodeTitle?: string;
    qrCodeItems?: {
        id: string;
        value: string;
        label: string;
    }[];

    youtubeTitle?: string;
    youtubeDisplayType?: "grid" | "list";
    youtubeTextColor?: string;
    youtubeTextPosition?: "top" | "bottom";
    youtubeShowText?: boolean;
    youtubeVariation?: "full-channel" | "single-video" | "playlist";
    // Tour specific
    tourTitle?: string;
    tours?: {
        id: string;
        date: string;
        location: string;
        venue?: string;
        image?: string;
        ticketUrl?: string;
        soldOut?: boolean;
        sellingFast?: boolean;
    }[];
    // Spotify specific
    spotifyUrl?: string;
    spotifyCompact?: boolean;
    spotifyVariation?: "artist-profile" | "single-track" | "playlist" | "album";
    // Portfolio specific
    portfolioTitle?: string;
    // Experience specific
    experienceTitle?: string;
    experiences?: {
        id: string;
        role: string;
        company: string;
        period?: string;
        location?: string;
        description?: string;
    }[];
    experienceRoleColor?: string;
    experienceTextColor?: string;
    experienceLineColor?: string;
    // Marketing specific
    marketingId?: string; // Reference to backend MarketingBlockEntity
    marketingTitle?: string;
    marketingDescription?: string;
    marketingImageUrl?: string;
    marketingLinkUrl?: string;
    marketingButtonText?: string;
    marketingBackgroundColor?: string;
    marketingTextColor?: string;
    marketingButtonColor?: string;
    marketingButtonTextColor?: string;
    marketingLayout?: "card" | "banner" | "compact" | "featured";
    marketingShowImage?: boolean;
    marketingShowButton?: boolean;
    marketingSponsorLabel?: string;
    // Image block effects
    imageScale?: number;           // 10-200 (percentage)
    imageRotation?: number;        // -180 to 180 degrees
    imageBlur?: number;            // 0-20px
    imageBrightness?: number;      // 0-200 (percentage)
    imageContrast?: number;        // 0-200 (percentage)
    imageSaturation?: number;      // 0-200 (percentage)
    imageGrayscale?: boolean;
    imageSepia?: boolean;
    imageBorderRadius?: number;    // 0-50px
    imageBorderWidth?: number;     // 0-10px
    imageBorderColor?: string;
    imageShadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
    imageHoverEffect?: "none" | "zoom" | "lift" | "glow" | "tilt";
    // Block container effects (applies to all blocks)
    blockOpacity?: number;         // 0-100
    blockBlur?: number;            // 0-20px backdrop blur
    blockShadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "glow";
    blockShadowColor?: string;
    blockBorderRadius?: number;    // 0-40px
    blockBorderWidth?: number;     // 0-8px
    blockBorderColor?: string;
    blockBackground?: string;
    blockPadding?: number;         // 0-40px
    entranceAnimation?: "none" | "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "zoomIn" | "bounceIn" | "flipIn";
    entranceDelay?: number;        // 0-1000ms
};

export interface Integration {
    id: string;
    account_id: string;
    name: string;
}

interface Bio {
    id: string;
    sufix: string;
    html: string;
    blocks: BioBlock[] | null;
    views: number;
    clicks: number;
    userId: string;
    integrations?: Integration[];
    bgType?: "color" | "image" | "video" | "grid" | "dots" | "waves" | "polka" | "stripes" | "zigzag" | "mesh" | "particles" | "noise" | "abstract" | "palm-leaves" | "blueprint" | "marble" | "concrete" | "terracotta" | "wood-grain" | "brick" | "frosted-glass" | "steel" | "wheat" | "aurora" | "mesh-gradient" | "particles-float" | "gradient-animated" | "gradient" | "geometric" | "bubbles" | "confetti" | "starfield" | "rain";
    bgColor?: string;
    bgSecondaryColor?: string;
    bgImage?: string;
    bgImageFit?: "cover" | "contain" | "fill" | "none" | "scale-down" | "repeat";
    bgImageOverlay?: number;
    bgVideo?: string;
    bgVideoLoop?: boolean;
    bgVideoMuted?: boolean;
    bgVideoOverlay?: number;
    usernameColor?: string;
    gradientDirection?: string;
    blurIntensity?: number;
    patternType?: string;
    patternColor?: string;
    imageStyle?: string;
    profileImageLayout?: "classic" | "hero";
    profileImageSize?: "small" | "large";
    titleStyle?: "text" | "logo";
    displayProfileImage?: boolean;
    profileImage?: string;
    description?: string;
    socials?: {
        instagram?: string;
        tiktok?: string;
        twitter?: string;
        youtube?: string;
        linkedin?: string;
        email?: string;
        website?: string;
        github?: string;
        facebook?: string;
    };
    enableSubscribeButton?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    favicon?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    seoKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
    removeBranding?: boolean;
    customDomain?: string | null;
    cardStyle?: "none" | "solid" | "frosted";
    cardBackgroundColor?: string;
    cardOpacity?: number;
    cardBlur?: number;
    cardBorderColor?: string;
    cardBorderWidth?: number;
    cardBorderRadius?: number;
    cardShadow?: string;
    cardPadding?: number;
    maxWidth?: number;
    font?: string;
    customFontUrl?: string;
    customFontName?: string;
    verified?: boolean;
    verificationStatus?: "none" | "pending" | "verified";
    buttonStyle?: "solid" | "outline" | "ghost" | "hard-shadow" | "soft-shadow" | "3d" | "glass" | "gradient" | "neumorphism" | "clay" | "cyberpunk" | "pixel" | "neon" | "sketch" | "gradient-border" | "minimal-underline" | "architect" | "material" | "brutalist" | "outline-thick";
    theme?: string;
    buttonRadius?: string;
    buttonShadow?: string;
    buttonShadowColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    // Parallax settings
    enableParallax?: boolean;
    parallaxIntensity?: number;   // 0-100
    parallaxDepth?: number;       // 0-100
    parallaxAxis?: "x" | "y" | "xy";
    parallaxLayers?: Array<{
        id: string;
        image: string;
        speed?: number;
        axis?: "x" | "y" | "xy";
        opacity?: number;
        size?: number;
        repeat?: boolean;
        rotate?: number;
        blur?: number;
        zIndex?: number;
        positionX?: number;
        positionY?: number;
    }>;
    floatingElements?: boolean;
    floatingElementsType?: string; // circles, hearts, fire, stars, sparkles, music, leaves, snow, bubbles, confetti, diamonds, petals, custom-emoji, custom-image
    floatingElementsColor?: string;
    floatingElementsDensity?: number; // count
    floatingElementsSize?: number; // px
    floatingElementsSpeed?: number; // seconds
    floatingElementsOpacity?: number; // 0-1
    floatingElementsBlur?: number; // px
    customFloatingElementText?: string;
    customFloatingElementImage?: string;
}

interface BioData {
    bios: Bio[];
    bio: Bio | null;
    createBio(sufix: string): Promise<void>;
    getBio(id: string): Promise<void>;
    getBios(): Promise<void>;
    updateBio(id: string, payload: Partial<Bio>): Promise<void>;
    selectBio(bio: Bio): void;
}

const BioContext = createContext<BioData>({} as BioData);

export const BioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bios, setBios] = useState<Bio[]>([]);
    const [bio, setBio] = useState<Bio | null>(null);
    const { user } = useContext(AuthContext);

    const getBios = async () => {
        try {
            const response = await api.get("/bio/");
            setBios(response.data);

            const savedBioId = localStorage.getItem("selectedBioId");
            const savedBio = response.data.find((b: Bio) => b.id === savedBioId);

            if (savedBio) {
                setBio(savedBio);
                // Fetch full details to ensure blocks are loaded (list might be partial)
                getBio(savedBio.id);
            } else if (response.data.length > 0 && !bio) {
                const firstBio = response.data[0];
                setBio(firstBio);
                getBio(firstBio.id);
            }
        } catch (error) {
            console.error("Failed to fetch bios", error);
        }
    };

    const createBio = async (sufix: string) => {
        try {
            await api.post("/bio/", { sufix });
            await getBios();
        } catch (error) {
            console.error("Failed to create bio", error);
            throw error;
        }
    };

    const getBio = async (id: string) => {
        try {
            const response = await api.get(`/bio/${id}`);
            setBio(response.data);
        } catch (error) {
            console.error("Failed to fetch bio", error);
        }
    };

    const updateBio = async (id: string, payload: Partial<Bio>) => {
        try {
            const response = await api.post(`/bio/update/${id}`, payload);
            setBio(response.data);
            setBios((prev) => prev.map((b) => (b.id === id ? { ...b, ...response.data } : b)));
        } catch (error) {
            console.error("Failed to update bio", error);
            throw error;
        }
    };

    const selectBio = (selectedBio: Bio) => {
        setBio(selectedBio);
        localStorage.setItem("selectedBioId", selectedBio.id);
        // Refresh full details to ensure we have blocks/settings
        getBio(selectedBio.id);
    };

    useEffect(() => {
        if (!user) {
            setBios([]);
            setBio(null);
            return;
        }

        getBios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <BioContext.Provider value={{ bio, bios, createBio, getBio, getBios, updateBio, selectBio }}>
            {children}
        </BioContext.Provider>
    );
};

export const useBio = () => useContext(BioContext);

export default BioContext;