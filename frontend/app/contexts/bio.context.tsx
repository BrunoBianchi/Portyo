import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "~/services/api";

export type BioBlock = {
    id: string;
    type: "heading" | "text" | "button" | "image" | "divider" | "socials" | "video" | "blog" | "product" | "calendar" | "map" | "featured" | "affiliate" | "event" | "instagram" | "youtube" | "tour" | "spotify" | "qrcode";
    title?: string;
    body?: string;
    href?: string;
    align?: "left" | "center" | "right";
    accent?: string;
    textColor?: string;
    mediaUrl?: string;
    // Button specific
    buttonStyle?: "solid" | "outline" | "ghost" | "hard-shadow" | "soft-shadow" | "3d" | "glass" | "gradient" | "neumorphism" | "clay" | "cyberpunk" | "pixel" | "neon" | "sketch" | "gradient-border" | "minimal-underline";
    buttonShape?: "pill" | "rounded" | "square";
    buttonShadowColor?: string;
    buttonImage?: string;
    buttonTextAlign?: "left" | "center" | "right";
    isNsfw?: boolean;
    animation?: "none" | "bounce" | "pulse" | "shake" | "wobble";
    animationTrigger?: "loop" | "once" | "hover";
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
    // Blog specific
    blogLayout?: "carousel" | "list" | "grid";
    blogCardStyle?: "featured" | "minimal" | "modern";
    blogPostCount?: number;
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
    productLayout?: "grid" | "list" | "carousel";
    productCardStyle?: "default" | "minimal";
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

};

interface Bio {
    id: string;
    sufix: string;
    html: string;
    blocks: BioBlock[] | null;
    views: number;
    clicks: number;
    userId: string;
    bgType?: "color" | "image" | "video" | "grid" | "dots" | "waves" | "polka" | "stripes" | "zigzag" | "mesh" | "particles" | "noise" | "abstract";
    bgColor?: string;
    bgSecondaryColor?: string;
    bgImage?: string;
    bgVideo?: string;
    usernameColor?: string;
    imageStyle?: string;
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
    customDomain?: string;
    cardStyle?: string;
    cardBackgroundColor?: string;
    cardBorderColor?: string;
    cardBorderWidth?: number;
    cardBorderRadius?: number;
    cardShadow?: string;
    cardPadding?: number;
    maxWidth?: number;
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

    const getBios = async () => {
        try {
            const response = await api.get("/bio/");
            setBios(response.data);
            
            const savedBioId = localStorage.getItem("selectedBioId");
            const savedBio = response.data.find((b: Bio) => b.id === savedBioId);

            if (savedBio) {
                setBio(savedBio);
            } else if (response.data.length > 0 && !bio) {
                setBio(response.data[0]);
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
    };

    useEffect(() => {
        getBios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <BioContext.Provider value={{ bio, bios, createBio, getBio, getBios, updateBio, selectBio }}>
            {children}
        </BioContext.Provider>
    );
};

export const useBio = () => useContext(BioContext);

export default BioContext;