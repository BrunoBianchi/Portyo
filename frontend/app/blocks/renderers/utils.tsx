/**
 * Block Renderer Utilities
 *
 * Shared helpers for all block renderer components.
 */

import React from "react";

/**
 * Escape HTML entities in a string.
 */
export function escapeHtml(value = ""): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Generate a stable className from block type + id.
 */
export function blockClass(type: string, id?: string): string {
  return `bio-block bio-block--${type}${id ? ` block-${id}` : ""}`;
}

/**
 * Normalize an external URL (ensure https://).
 */
export function normalizeUrl(url: string): string {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("mailto:") || url.startsWith("tel:")) return url;
  return `https://${url}`;
}

/**
 * Extract YouTube video ID from a URL.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Build animation styles from block animation settings.
 */
export function getAnimationStyles(
  block: Record<string, any>
): React.CSSProperties {
  const trigger = block.animationTrigger || "loop";
  const anim = block.animation;
  if (!anim || anim === "none") return {};

  const speed = block.animationSpeed || "1s";
  const iteration = trigger === "loop" ? "infinite" : "1";
  return {
    animation: `${anim} ${speed} ease-in-out ${iteration}`,
  };
}

/**
 * Build entrance animation styles.
 */
export function getEntranceAnimationStyles(
  block: Record<string, any>
): React.CSSProperties {
  if (!block.entranceAnimation || block.entranceAnimation === "none") return {};
  const delay = block.entranceDelay || 0;
  return {
    animation: `${block.entranceAnimation} 0.6s ease-out ${delay}ms both`,
  };
}

/**
 * Block wrapper styles — applies block-level customization (bg, border, shadow, padding).
 */
export function getBlockWrapperStyles(block: Record<string, any>): React.CSSProperties {
  const hasCustom =
    block.blockBackground ||
    block.blockBorderWidth ||
    block.blockShadow ||
    block.blockPadding !== undefined ||
    block.blockOpacity !== undefined;

  if (!hasCustom) return {};

  const style: React.CSSProperties = {
    backgroundColor: block.blockBackground || "transparent",
    color: block.textColor || "inherit",
    borderRadius: `${block.blockBorderRadius ?? 12}px`,
    padding: `${block.blockPadding ?? 0}px`,
    opacity: (block.blockOpacity ?? 100) / 100,
    transition: "all 0.2s ease",
  };

  if (block.blockBorderWidth) {
    style.border = `${block.blockBorderWidth}px solid ${block.blockBorderColor || "#E5E7EB"}`;
  }

  if (block.blockShadow && block.blockShadow !== "none") {
    const shadowMap: Record<string, string> = {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      glow: "0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)",
    };
    style.boxShadow = shadowMap[block.blockShadow] || undefined;
  }

  return style;
}

/**
 * Shared section wrapper component with animation and block-level styles.
 */
export const BlockSection: React.FC<{
  block: Record<string, any>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}> = ({ block, children, className, style, as: Tag = "section" }) => {
  const wrapperStyles = getBlockWrapperStyles(block);
  const animStyles = getAnimationStyles(block);
  const entranceStyles = getEntranceAnimationStyles(block);
  const align = block.align || "left";

  const mergedStyle: React.CSSProperties = {
    textAlign: align as any,
    padding: "12px 0",
    ...wrapperStyles,
    ...animStyles,
    ...entranceStyles,
    ...style,
  };

  return React.createElement(
    Tag,
    {
      className: `${blockClass(block.type, block.id)} ${className || ""}`.trim(),
      style: mergedStyle,
      "data-block-id": block.id,
      "data-block-type": block.type,
    },
    children
  );
};
