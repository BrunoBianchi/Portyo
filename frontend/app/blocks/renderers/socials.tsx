/**
 * Socials Block Renderer
 */
import React from "react";
import { BlockSection, normalizeUrl } from "./utils";

interface SocialsBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

const PLATFORM_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: "M7.8 2h8.4C19 2 22 5 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C5 22 2 19 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z", color: "#E4405F", label: "Instagram" },
  twitter: { icon: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z", color: "#1DA1F2", label: "Twitter" },
  linkedin: { icon: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z", color: "#0A66C2", label: "LinkedIn" },
  youtube: { icon: "M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z", color: "#FF0000", label: "YouTube" },
  github: { icon: "M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z", color: "#333", label: "GitHub" },
  tiktok: { icon: "M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z", color: "#010101", label: "TikTok" },
  facebook: { icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", color: "#1877F2", label: "Facebook" },
  email: { icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 4l-8 5-8-5v2l8 5 8-5V8z", color: "#EA4335", label: "Email" },
  website: { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z", color: "#4285F4", label: "Website" },
};

const SocialIcon: React.FC<{ platform: string; size?: number }> = ({ platform, size = 20 }) => {
  const info = PLATFORM_ICONS[platform];
  if (!info) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={info.icon} />
    </svg>
  );
};

export const SocialsBlock: React.FC<SocialsBlockProps> = ({ block, bio }) => {
  const socials = block.platforms || block.socials || bio.socials || {};
  const variation = block.variation || "default";
  const layout = block.layout || "row";
  const showLabel = block.showLabel !== false;
  const iconSize = block.iconSize || 20;

  const entries = Object.entries(socials).filter(([, url]) => url);

  if (entries.length === 0) return null;

  // Floating buttons variation — fixed position
  if (variation === "floating-buttons") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "16px",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {entries.map(([platform, url]) => {
          const info = PLATFORM_ICONS[platform];
          if (!info) return null;
          return (
            <a
              key={platform}
              href={normalizeUrl(url as string)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={info.label}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: info.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "transform 0.2s",
              }}
            >
              <SocialIcon platform={platform} size={iconSize} />
            </a>
          );
        })}
      </div>
    );
  }

  // Detailed list variation
  if (variation === "detailed-list") {
    return (
      <BlockSection block={block}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {entries.map(([platform, url]) => {
            const info = PLATFORM_ICONS[platform];
            if (!info) return null;
            return (
              <a
                key={platform}
                href={normalizeUrl(url as string)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  backgroundColor: `${info.color}10`,
                  border: `1px solid ${info.color}20`,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    backgroundColor: info.color,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SocialIcon platform={platform} size={iconSize} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>
                    {info.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {(url as string).replace(/https?:\/\//, "").slice(0, 40)}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </BlockSection>
    );
  }

  // Default: icon row/column
  return (
    <BlockSection block={block}>
      <div
        style={{
          display: "flex",
          flexDirection: layout === "column" ? "column" : "row",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: block.align === "center" ? "center" : "flex-start",
          alignItems: layout === "column" ? "stretch" : "center",
        }}
      >
        {entries.map(([platform, url]) => {
          const info = PLATFORM_ICONS[platform];
          if (!info) return null;
          return (
            <a
              key={platform}
              href={normalizeUrl(url as string)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={info.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: showLabel ? "auto" : "44px",
                height: "44px",
                padding: showLabel ? "0 16px" : "0",
                borderRadius: "12px",
                backgroundColor: `${info.color}12`,
                color: info.color,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              <SocialIcon platform={platform} size={iconSize} />
              {showLabel && <span>{info.label}</span>}
            </a>
          );
        })}
      </div>
    </BlockSection>
  );
};

export default SocialsBlock;
