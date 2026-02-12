import type { BioBlock } from "~/contexts/bio.context";

export interface Integration {
  id: string;
  account_id: string;
  name: string;
}

export interface Bio {
  id: string;
  sufix: string;
  html: string;
  blocks: BioBlock[] | null;
  views: number;
  clicks: number;
  userId: string;
  integrations?: Integration[];
  bgType?:
    | "color"
    | "image"
    | "video"
    | "grid"
    | "dots"
    | "waves"
    | "polka"
    | "stripes"
    | "zigzag"
    | "mesh"
    | "particles"
    | "noise"
    | "abstract"
    | "palm-leaves"
    | "blueprint"
    | "marble"
    | "concrete"
    | "terracotta"
    | "wood-grain"
    | "brick"
    | "frosted-glass"
    | "steel"
    | "wheat"
    | "aurora"
    | "mesh-gradient"
    | "particles-float"
    | "gradient-animated"
    | "gradient"
    | "geometric"
    | "bubbles"
    | "confetti"
    | "starfield"
    | "rain";
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
  heroTransition?: boolean;
  navTabColor?: string;
  navTabTextColor?: string;
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
    threads?: string;
    twitch?: string;
    discord?: string;
    pinterest?: string;
    snapchat?: string;
    whatsapp?: string;
    telegram?: string;
    spotify?: string;
    behance?: string;
    dribbble?: string;
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
  buttonStyle?:
    | "solid"
    | "outline"
    | "ghost"
    | "hard-shadow"
    | "soft-shadow"
    | "3d"
    | "glass"
    | "gradient"
    | "neumorphism"
    | "clay"
    | "cyberpunk"
    | "pixel"
    | "neon"
    | "sketch"
    | "gradient-border"
    | "minimal-underline"
    | "architect"
    | "material"
    | "brutalist"
    | "outline-thick";
  theme?: string;
  buttonRadius?: string;
  buttonShadow?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  enableParallax?: boolean;
  parallaxIntensity?: number;
  parallaxDepth?: number;
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
  floatingElementsType?: string;
  floatingElementsColor?: string;
  floatingElementsDensity?: number;
  floatingElementsSize?: number;
  floatingElementsSpeed?: number;
  floatingElementsOpacity?: number;
  floatingElementsBlur?: number;
  customFloatingElementText?: string;
  customFloatingElementImage?: string;
}
