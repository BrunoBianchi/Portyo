/**
 * Centralized Bio Design Defaults
 *
 * Single source of truth for ALL design-related default values.
 * Used by: html-generator, dashboard-design, dashboard-editor, BioRenderer, PreviewCard.
 *
 * NEVER hardcode design defaults elsewhere — import from here.
 */

// ─── Button Defaults ────────────────────────────────────────────────────────

export const BUTTON_DEFAULTS = {
  style: "solid" as const,
  radius: "rounder" as const,
  shadow: "none" as const,
  color: "#111827",
  textColor: "#FFFFFF",
} as const;

export const BUTTON_RADIUS_MAP: Record<string, string> = {
  square: "0px",
  round: "8px",
  rounder: "16px",
  full: "9999px",
  pill: "9999px",
};

export const BUTTON_SHADOW_MAP: Record<string, string> = {
  none: "none",
  soft: "0 4px 14px -4px rgba(0,0,0,0.15)",
  strong: "0 8px 24px -6px rgba(0,0,0,0.25)",
  hard: "4px 4px 0px rgba(0,0,0,0.9)",
};

export const BUTTON_STYLES = [
  "solid",
  "outline",
  "ghost",
  "hard-shadow",
  "soft-shadow",
  "3d",
  "glass",
  "gradient",
  "neumorphism",
  "clay",
  "cyberpunk",
  "pixel",
  "neon",
  "sketch",
  "gradient-border",
  "minimal-underline",
  "architect",
  "material",
  "brutalist",
  "outline-thick",
] as const;

export type ButtonStyle = (typeof BUTTON_STYLES)[number];

// ─── Card Defaults ──────────────────────────────────────────────────────────

export const CARD_DEFAULTS = {
  style: "none" as const,
  backgroundColor: "#FFFFFF",
  opacity: 100,
  blur: 8,
  borderColor: "#E5E7EB",
  borderWidth: 0,
  borderRadius: 16,
  shadow: "none" as const,
  padding: 16,
} as const;

// ─── Background Defaults ────────────────────────────────────────────────────

export const BG_DEFAULTS = {
  type: "color" as const,
  color: "#F3F4F6",
  secondaryColor: "#E5E7EB",
  imageFit: "cover" as const,
  imageOverlay: 0,
  videoLoop: true,
  videoMuted: true,
  videoOverlay: 30,
  gradientDirection: "to bottom right",
  blurIntensity: 5,
  patternColor: "#E5E7EB",
} as const;

// ─── Typography Defaults ────────────────────────────────────────────────────

export const TYPOGRAPHY_DEFAULTS = {
  font: "Inter",
  usernameColor: "#111827",
} as const;

export const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
  "Oswald",
  "Raleway",
  "Poppins",
  "Custom",
] as const;

export const FONT_URLS: Record<string, string> = {
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
  Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap",
  Lato: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap",
  Montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap",
  "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap",
  Merriweather: "https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap",
  Oswald: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap",
  Raleway: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&display=swap",
  Poppins: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap",
};

// ─── Profile Image Defaults ─────────────────────────────────────────────────

export const PROFILE_DEFAULTS = {
  imageLayout: "classic" as const,
  imageSize: "small" as const,
  imageStyle: "circle" as const,
  titleStyle: "text" as const,
  displayProfileImage: true,
} as const;

export const IMAGE_STYLE_MAP: Record<string, string> = {
  circle: "border-radius:50%;",
  rounded: "border-radius:24px;",
  square: "border-radius:0;",
  star: "clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);",
  hexagon: "clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);",
  amoeba: "border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; animation: amoeba-pulse 6s ease-in-out infinite;",
};

// ─── Parallax Defaults ──────────────────────────────────────────────────────

export const PARALLAX_DEFAULTS = {
  enabled: false,
  intensity: 50,
  depth: 3,
  axis: "y" as const,
  layers: [] as any[],
} as const;

// ─── Floating Elements Defaults ─────────────────────────────────────────────

export const FLOATING_DEFAULTS = {
  enabled: false,
  type: "circles",
  color: "#6366F1",
  density: 15,
  size: 20,
  speed: 3,
  opacity: 30,
  blur: 0,
} as const;

// ─── Block-level Defaults ───────────────────────────────────────────────────

export const BLOCK_SHADOW_MAP: Record<string, string> = {
  none: "",
  sm: "box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);",
  md: "box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);",
  lg: "box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);",
  xl: "box-shadow:0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);",
  "2xl": "box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25);",
  glow: "box-shadow:0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2);",
};

// ─── Layout Defaults ────────────────────────────────────────────────────────

export const LAYOUT_DEFAULTS = {
  maxWidth: 680,
} as const;

// ─── Animations ─────────────────────────────────────────────────────────────

export const ENTRANCE_ANIMATIONS = [
  "none",
  "fadeIn",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
  "zoomIn",
  "bounceIn",
  "flipIn",
] as const;

export const LOOP_ANIMATIONS = [
  "none",
  "spin",
  "bounce",
  "pulse",
  "shake",
  "wobble",
  "float",
] as const;

// ─── Aggregated Full Defaults ───────────────────────────────────────────────

/**
 * Complete bio design defaults — merge with incoming bio to fill missing fields.
 */
export const BIO_DESIGN_DEFAULTS = {
  // Background
  bgType: BG_DEFAULTS.type,
  bgColor: BG_DEFAULTS.color,
  bgSecondaryColor: BG_DEFAULTS.secondaryColor,
  bgImageFit: BG_DEFAULTS.imageFit,
  bgImageOverlay: BG_DEFAULTS.imageOverlay,
  bgVideoLoop: BG_DEFAULTS.videoLoop,
  bgVideoMuted: BG_DEFAULTS.videoMuted,
  bgVideoOverlay: BG_DEFAULTS.videoOverlay,
  gradientDirection: BG_DEFAULTS.gradientDirection,
  blurIntensity: BG_DEFAULTS.blurIntensity,
  patternColor: BG_DEFAULTS.patternColor,

  // Typography
  font: TYPOGRAPHY_DEFAULTS.font,
  usernameColor: TYPOGRAPHY_DEFAULTS.usernameColor,

  // Profile
  profileImageLayout: PROFILE_DEFAULTS.imageLayout,
  profileImageSize: PROFILE_DEFAULTS.imageSize,
  imageStyle: PROFILE_DEFAULTS.imageStyle,
  titleStyle: PROFILE_DEFAULTS.titleStyle,
  displayProfileImage: PROFILE_DEFAULTS.displayProfileImage,

  // Buttons
  buttonStyle: BUTTON_DEFAULTS.style,
  buttonRadius: BUTTON_DEFAULTS.radius,
  buttonShadow: BUTTON_DEFAULTS.shadow,
  buttonColor: BUTTON_DEFAULTS.color,
  buttonTextColor: BUTTON_DEFAULTS.textColor,

  // Card
  cardStyle: CARD_DEFAULTS.style,
  cardBackgroundColor: CARD_DEFAULTS.backgroundColor,
  cardOpacity: CARD_DEFAULTS.opacity,
  cardBlur: CARD_DEFAULTS.blur,
  cardBorderColor: CARD_DEFAULTS.borderColor,
  cardBorderWidth: CARD_DEFAULTS.borderWidth,
  cardBorderRadius: CARD_DEFAULTS.borderRadius,
  cardShadow: CARD_DEFAULTS.shadow,
  cardPadding: CARD_DEFAULTS.padding,

  // Parallax
  enableParallax: PARALLAX_DEFAULTS.enabled,
  parallaxIntensity: PARALLAX_DEFAULTS.intensity,
  parallaxDepth: PARALLAX_DEFAULTS.depth,
  parallaxAxis: PARALLAX_DEFAULTS.axis,
  parallaxLayers: PARALLAX_DEFAULTS.layers,

  // Floating
  floatingElements: FLOATING_DEFAULTS.enabled,
  floatingElementsType: FLOATING_DEFAULTS.type,
  floatingElementsColor: FLOATING_DEFAULTS.color,
  floatingElementsDensity: FLOATING_DEFAULTS.density,
  floatingElementsSize: FLOATING_DEFAULTS.size,
  floatingElementsSpeed: FLOATING_DEFAULTS.speed,
  floatingElementsOpacity: FLOATING_DEFAULTS.opacity,
  floatingElementsBlur: FLOATING_DEFAULTS.blur,

  // Layout
  maxWidth: LAYOUT_DEFAULTS.maxWidth,
} as const;

/**
 * Helper: merge bio with defaults (only fills missing/undefined fields)
 */
export function withDesignDefaults<T extends Record<string, any>>(bio: T | null | undefined): T & typeof BIO_DESIGN_DEFAULTS {
  if (!bio) return { ...BIO_DESIGN_DEFAULTS } as any;
  const merged = { ...BIO_DESIGN_DEFAULTS } as any;
  for (const key of Object.keys(bio)) {
    if (bio[key] !== undefined && bio[key] !== null) {
      merged[key] = bio[key];
    }
  }
  return merged;
}
