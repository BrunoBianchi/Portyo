/**
 * Design Tokens System
 *
 * Converts Bio design settings into CSS Custom Properties.
 * This enables dynamic theming without regenerating HTML —
 * just update CSS variables and the entire page reacts.
 *
 * Usage:
 *   const tokens = bioToDesignTokens(bio);
 *   const css = designTokensToCSS(tokens);           // for <style> injection
 *   const style = designTokensToStyleObject(tokens);  // for React style prop
 */

import {
  BUTTON_DEFAULTS,
  BUTTON_RADIUS_MAP,
  BUTTON_SHADOW_MAP,
  CARD_DEFAULTS,
  BG_DEFAULTS,
  TYPOGRAPHY_DEFAULTS,
  FONT_URLS,
  PROFILE_DEFAULTS,
  IMAGE_STYLE_MAP,
  LAYOUT_DEFAULTS,
} from "~/constants/bio-defaults";

// ─── Token Interface ────────────────────────────────────────────────────────

export interface DesignTokens {
  // Button
  "--btn-bg": string;
  "--btn-text": string;
  "--btn-radius": string;
  "--btn-shadow": string;
  "--btn-style": string;

  // Card
  "--card-bg": string;
  "--card-opacity": string;
  "--card-blur": string;
  "--card-border-color": string;
  "--card-border-width": string;
  "--card-border-radius": string;
  "--card-shadow": string;
  "--card-padding": string;

  // Background
  "--bio-bg": string;
  "--bio-bg-secondary": string;

  // Typography
  "--font-family": string;
  "--username-color": string;

  // Layout
  "--max-width": string;

  // Profile image
  "--profile-img-style": string;

  // Allow additional custom tokens
  [key: `--${string}`]: string;
}

// ─── Token Generation ───────────────────────────────────────────────────────

/**
 * Convert a Bio object into a flat DesignTokens map.
 */
export function bioToDesignTokens(bio: Record<string, any>): DesignTokens {
  const btnColor = bio.buttonColor || BUTTON_DEFAULTS.color;
  const btnTextColor = bio.buttonTextColor || BUTTON_DEFAULTS.textColor;
  const btnRadius = BUTTON_RADIUS_MAP[bio.buttonRadius || BUTTON_DEFAULTS.radius] ?? BUTTON_RADIUS_MAP.rounder;
  const btnShadow = BUTTON_SHADOW_MAP[bio.buttonShadow || BUTTON_DEFAULTS.shadow] ?? "none";
  const btnStyle = bio.buttonStyle || BUTTON_DEFAULTS.style;

  const font = bio.font || TYPOGRAPHY_DEFAULTS.font;
  const fontFamily =
    font === "Custom" && bio.customFontName
      ? `'${bio.customFontName}', sans-serif`
      : font === "Custom" && bio.customFontUrl
        ? "'CustomFont', sans-serif"
        : `'${font}', sans-serif`;

  return {
    // Button
    "--btn-bg": btnColor,
    "--btn-text": btnTextColor,
    "--btn-radius": btnRadius,
    "--btn-shadow": btnShadow,
    "--btn-style": btnStyle,

    // Card
    "--card-bg": bio.cardBackgroundColor || CARD_DEFAULTS.backgroundColor,
    "--card-opacity": String((bio.cardOpacity ?? CARD_DEFAULTS.opacity) / 100),
    "--card-blur": `${bio.cardBlur ?? CARD_DEFAULTS.blur}px`,
    "--card-border-color": bio.cardBorderColor || CARD_DEFAULTS.borderColor,
    "--card-border-width": `${bio.cardBorderWidth ?? CARD_DEFAULTS.borderWidth}px`,
    "--card-border-radius": `${bio.cardBorderRadius ?? CARD_DEFAULTS.borderRadius}px`,
    "--card-shadow": bio.cardShadow || CARD_DEFAULTS.shadow,
    "--card-padding": `${bio.cardPadding ?? CARD_DEFAULTS.padding}px`,

    // Background
    "--bio-bg": bio.bgColor || BG_DEFAULTS.color,
    "--bio-bg-secondary": bio.bgSecondaryColor || BG_DEFAULTS.secondaryColor,

    // Typography
    "--font-family": fontFamily,
    "--username-color": bio.usernameColor || TYPOGRAPHY_DEFAULTS.usernameColor,

    // Layout
    "--max-width": `${bio.maxWidth || LAYOUT_DEFAULTS.maxWidth}px`,

    // Profile
    "--profile-img-style": IMAGE_STYLE_MAP[bio.imageStyle || PROFILE_DEFAULTS.imageStyle] || IMAGE_STYLE_MAP.circle,
  };
}

// ─── CSS Generation ─────────────────────────────────────────────────────────

/**
 * Convert tokens to a CSS string that can be injected in a <style> tag.
 * Scoped under a selector (default: `:root`).
 */
export function designTokensToCSS(tokens: DesignTokens, selector = ":root"): string {
  const lines = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `${selector} {\n${lines}\n}`;
}

/**
 * Convert tokens to a React CSSProperties-compatible object.
 * Useful for inline style on wrapper elements.
 */
export function designTokensToStyleObject(tokens: DesignTokens): Record<string, string> {
  return { ...tokens };
}

// ─── Font Link Helper ───────────────────────────────────────────────────────

/**
 * Returns a Google Fonts <link> URL for the given font name, or null for custom/unknown.
 */
export function getFontLinkUrl(font: string): string | null {
  return FONT_URLS[font] ?? null;
}

/**
 * Returns a @font-face CSS string for custom font, or null.
 */
export function getCustomFontCSS(bio: Record<string, any>): string | null {
  if (bio.font !== "Custom" || !bio.customFontUrl) return null;

  const extension = bio.customFontUrl.split(".").pop()?.toLowerCase() || "ttf";
  const formatMap: Record<string, string> = {
    woff: "woff",
    woff2: "woff2",
    otf: "opentype",
    ttf: "truetype",
  };
  const format = formatMap[extension] || "truetype";

  return `@font-face {
  font-family: 'CustomFont';
  src: url('${bio.customFontUrl}') format('${format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;
}

// ─── Button Style Generator ─────────────────────────────────────────────────

/**
 * Generates the complete inline CSS for a button based on its style type and tokens.
 * This replaces the giant if/else chain in html-generator.ts for button styling.
 *
 * @param style - The button style type (solid, outline, glass, etc.)
 * @param bgColor - The button background color
 * @param textColor - The button text color
 * @param radius - The border radius value (e.g. "16px")
 * @param shadow - The box-shadow value
 */
export function getButtonStyleCSS(
  style: string,
  bgColor: string,
  textColor: string,
  radius: string,
  shadow: string
): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: 700,
    textDecoration: "none",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    border: "none",
    boxSizing: "border-box",
    textAlign: "center",
    borderRadius: radius,
    boxShadow: shadow !== "none" ? shadow : undefined,
  };

  switch (style) {
    case "outline":
      return {
        ...base,
        backgroundColor: "transparent",
        color: bgColor,
        border: `2px solid ${bgColor}`,
      };

    case "ghost":
      return {
        ...base,
        backgroundColor: `${bgColor}10`,
        color: bgColor,
      };

    case "hard-shadow":
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
        boxShadow: `4px 4px 0px ${bgColor}88`,
        border: `2px solid ${bgColor}`,
      };

    case "soft-shadow":
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
        boxShadow: `0 8px 24px -4px ${bgColor}40`,
      };

    case "3d":
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
        borderBottom: `4px solid ${bgColor}88`,
        boxShadow: `0 4px 6px ${bgColor}20`,
      };

    case "glass":
      return {
        ...base,
        backgroundColor: `${bgColor}20`,
        color: textColor,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${bgColor}30`,
      };

    case "gradient":
      return {
        ...base,
        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}CC)`,
        color: textColor,
      };

    case "neumorphism":
      return {
        ...base,
        backgroundColor: "#e0e0e0",
        color: bgColor,
        boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
        border: "none",
      };

    case "clay":
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
        boxShadow: `0 4px 0 ${bgColor}88, inset 0 -2px 4px ${bgColor}40`,
        borderRadius: radius,
      };

    case "cyberpunk":
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
        clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
        borderRadius: "0",
      };

    case "pixel":
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: "0",
        border: `3px solid ${bgColor}`,
        boxShadow: `4px 4px 0 ${bgColor}`,
        imageRendering: "pixelated" as any,
      };

    case "neon":
      return {
        ...base,
        backgroundColor: "transparent",
        color: bgColor,
        border: `2px solid ${bgColor}`,
        boxShadow: `0 0 10px ${bgColor}60, 0 0 20px ${bgColor}30, inset 0 0 10px ${bgColor}10`,
        textShadow: `0 0 8px ${bgColor}`,
      };

    case "sketch":
      return {
        ...base,
        backgroundColor: "transparent",
        color: bgColor,
        border: `2px dashed ${bgColor}`,
      };

    case "gradient-border":
      return {
        ...base,
        backgroundColor: "transparent",
        color: bgColor,
        border: `2px solid ${bgColor}`,
        backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${bgColor}, ${bgColor}66)`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      };

    case "minimal-underline":
      return {
        ...base,
        backgroundColor: "transparent",
        color: bgColor,
        borderRadius: "0",
        borderBottom: `2px solid ${bgColor}`,
        padding: "12px 8px",
      };

    case "architect":
      return {
        ...base,
        backgroundColor: "transparent",
        color: bgColor,
        border: `1px solid ${bgColor}`,
        borderRadius: "0",
      };

    case "material":
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
        boxShadow: `0 2px 5px 0 ${bgColor}26, 0 2px 10px 0 ${bgColor}1A`,
      };

    case "brutalist":
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
        border: `3px solid #000`,
        boxShadow: "5px 5px 0 #000",
        borderRadius: "0",
      };

    case "outline-thick":
      return {
        ...base,
        backgroundColor: "transparent",
        color: bgColor,
        border: `3px solid ${bgColor}`,
      };

    case "solid":
    default:
      return {
        ...base,
        backgroundColor: bgColor,
        color: textColor,
      };
  }
}
