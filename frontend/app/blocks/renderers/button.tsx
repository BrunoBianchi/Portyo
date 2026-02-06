/**
 * Button Block Renderer
 */
import React from "react";
import { BlockSection, normalizeUrl, escapeHtml } from "./utils";
import {
  BUTTON_DEFAULTS,
  BUTTON_RADIUS_MAP,
  BUTTON_SHADOW_MAP,
} from "~/constants/bio-defaults";
import { getButtonStyleCSS } from "~/lib/design-tokens";

/** Convert hex color to "r, g, b" partial for replacing rgba() in shadow strings */
function hexToRgbPartial(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}`;
}

interface ButtonBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ block, bio }) => {
  const label = block.title || block.label || block.content || "Button";
  const url = normalizeUrl(block.href || block.url || "");
  const style = block.buttonStyle || bio.buttonStyle || BUTTON_DEFAULTS.style;
  const bgColor = block.accent || bio.buttonColor || BUTTON_DEFAULTS.color;
  const textColor = block.textColor || bio.buttonTextColor || BUTTON_DEFAULTS.textColor;
  const radius = BUTTON_RADIUS_MAP[block.buttonShape || block.shape || bio.buttonRadius || BUTTON_DEFAULTS.radius] ?? BUTTON_RADIUS_MAP.rounder;
  const shadowKey = block.buttonShadow || block.shadow || bio.buttonShadow || BUTTON_DEFAULTS.shadow;
  const shadowColor = block.buttonShadowColor || bio.buttonShadowColor || undefined;
  const shadow = shadowColor
    ? BUTTON_SHADOW_MAP[shadowKey]?.replace(/rgba\(0,\s*0,\s*0/g, hexToRgbPartial(shadowColor)) ?? "none"
    : BUTTON_SHADOW_MAP[shadowKey] ?? "none";
  const thumbnail = block.thumbnail;
  const isNsfw = block.nsfw || block.isNsfw;

  // Image grid style is special — card with background image
  if (style === "image-grid") {
    return (
      <BlockSection block={block} style={{ padding: "6px 0" }}>
        <a
          href={isNsfw ? "#" : url}
          target="_blank"
          rel="noopener noreferrer"
          data-nsfw={isNsfw ? "true" : undefined}
          data-nsfw-url={isNsfw ? url : undefined}
          style={{
            display: "inline-block",
            width: "50%",
            aspectRatio: "261/151",
            borderRadius: "18px",
            overflow: "hidden",
            backgroundImage: block.bgImage ? `url(${block.bgImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: bgColor,
            position: "relative",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              padding: "16px",
              background: "linear-gradient(transparent 40%, rgba(0,0,0,0.6))",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {label}
            </span>
          </div>
        </a>
      </BlockSection>
    );
  }

  const btnStyles = getButtonStyleCSS(style, bgColor, textColor, radius, shadow);

  return (
    <BlockSection block={block} style={{ padding: "6px 0" }}>
      <a
        href={isNsfw ? "#" : url}
        target="_blank"
        rel="noopener noreferrer"
        data-nsfw={isNsfw ? "true" : undefined}
        data-nsfw-url={isNsfw ? url : undefined}
        style={btnStyles}
      >
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        )}
        <span>{label}</span>
      </a>
    </BlockSection>
  );
};

export default ButtonBlock;
