/**
 * BioRenderer — Unified React Bio Renderer
 *
 * Replaces dangerouslySetInnerHTML + hydration with pure React rendering.
 * Used in BOTH the editor preview AND the public bio page.
 *
 * Features:
 * - Design tokens as CSS custom properties for instant style updates
 * - Lazy-loaded block renderers (25 types)
 * - Profile header (classic / hero layouts)
 * - Subscribe modal (React portal)
 * - NSFW confirmation modal
 * - Share modal
 * - Portyo branding banner
 * - Tab system (links / blog / shop)
 * - Analytics tracking (GA + FB Pixel + internal)
 * - Font loading
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { api } from "~/services/api";
import {
  bioToDesignTokens,
  designTokensToStyleObject,
  getFontLinkUrl,
  getCustomFontCSS,
} from "~/lib/design-tokens";
import type { DesignTokens } from "~/lib/design-tokens";
import {
  PROFILE_DEFAULTS,
  IMAGE_STYLE_MAP,
  withDesignDefaults,
} from "~/constants/bio-defaults";
import { RenderBlocks } from "~/blocks/renderers";
import { normalizeUrl, escapeHtml } from "~/blocks/renderers/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BioRendererProps {
  bio: Record<string, any>;
  blocks: Array<Record<string, any>>;
  /** Editor preview mode — disables analytics, hides promo banner, enables upload overlay */
  isPreview?: boolean;
  /** Nested inside an existing page (no <html>/<body> wrapper) */
  isNested?: boolean;
  /** Public subdomain */
  subdomain?: string;
  /** Base URL for image/asset resolution */
  baseUrl?: string;
  /** Callback when a design token changes (for editor) */
  onDesignChange?: (tokens: DesignTokens) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const VERIFIED_BADGE = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 2 }}
    aria-label="Verified"
  >
    <path
      d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74Z"
      fill="#3b82f6"
    />
    <path
      d="m9 12 2 2 4-4"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  tiktok: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  twitter: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  ),
  youtube: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  email: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  ),
  website: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: "#E4405F",
  tiktok: "#000000",
  twitter: "#1DA1F2",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  email: "#EA4335",
  website: "#2563EB",
  github: "#111827",
};

// ─── Animation Keyframes CSS ────────────────────────────────────────────────

const ANIMATION_KEYFRAMES = `
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
@keyframes wobble { 0% { transform: translateX(0%); } 15% { transform: translateX(-25%) rotate(-5deg); } 30% { transform: translateX(20%) rotate(3deg); } 45% { transform: translateX(-15%) rotate(-3deg); } 60% { transform: translateX(10%) rotate(2deg); } 75% { transform: translateX(-5%) rotate(-1deg); } 100% { transform: translateX(0%); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
@keyframes flipIn { from { opacity: 0; transform: perspective(400px) rotateY(90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0deg); } }
@keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
@keyframes amoeba-pulse { 0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 25% { border-radius: 45% 55% 45% 55% / 50% 55% 45% 50%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } 75% { border-radius: 45% 55% 45% 55% / 55% 50% 50% 45%; } 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } }
@keyframes promoSlideUp { from { transform: translateX(-50%) translateY(100%); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
`;

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Social icon link */
const SocialLink: React.FC<{
  platform: string;
  url: string;
  usernameColor: string;
}> = React.memo(({ platform, url, usernameColor }) => {
  const icon = SOCIAL_ICONS[platform];
  if (!icon) return null;

  let href = url;
  if (platform === "email" && !href.startsWith("mailto:")) {
    href = `mailto:${href}`;
  } else {
    href = normalizeUrl(href);
  }

  const color = SOCIAL_COLORS[platform] || usernameColor;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={platform}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "white",
        color,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)",
        margin: "0 4px",
      }}
    >
      {icon}
    </a>
  );
});
SocialLink.displayName = "SocialLink";

/** Social links row */
const SocialLinks: React.FC<{
  socials: Record<string, string>;
  usernameColor: string;
}> = React.memo(({ socials, usernameColor }) => {
  const entries = Object.entries(socials).filter(
    ([key, value]) => value && SOCIAL_ICONS[key]
  );
  if (entries.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 12,
      }}
    >
      {entries.map(([key, value]) => (
        <SocialLink
          key={key}
          platform={key}
          url={value}
          usernameColor={usernameColor}
        />
      ))}
    </div>
  );
});
SocialLinks.displayName = "SocialLinks";

/** Subscribe button (bell icon) */
const SubscribeButton: React.FC<{ onOpen: () => void }> = React.memo(
  ({ onOpen }) => (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Subscribe"
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        color: "#111827",
        transition: "all 0.2s ease",
        zIndex: 20,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    </button>
  )
);
SubscribeButton.displayName = "SubscribeButton";

/** Profile image component */
const ProfileImage: React.FC<{
  src: string;
  alt: string;
  layout: string;
  size: string;
  imageStyle: string;
  isPreview?: boolean;
  fallbackSrc?: string;
}> = React.memo(
  ({ src, alt, layout, size, imageStyle, isPreview, fallbackSrc }) => {
    const imgStyleStr =
      IMAGE_STYLE_MAP[imageStyle] || IMAGE_STYLE_MAP.circle;

    if (layout === "hero") {
      const height = size === "large" ? 220 : 160;
      return (
        <div
          style={{
            width: "100%",
            height,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 14px 30px -10px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.4)",
            marginBottom: 18,
            background: "#f3f4f6",
            position: "relative",
          }}
        >
          <img
            src={src}
            alt={alt}
            onError={(e) => {
              if (fallbackSrc)
                (e.target as HTMLImageElement).src = fallbackSrc;
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {isPreview && <UploadOverlay />}
        </div>
      );
    }

    // Classic layout
    const dim = size === "large" ? 160 : 120;
    // Parse imgStyle string into React CSSProperties
    const parsedStyle = cssStringToObject(imgStyleStr);

    return (
      <div
        style={{
          width: dim,
          height: dim,
          overflow: "hidden",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
          border: "4px solid white",
          marginBottom: 16,
          background: "#f3f4f6",
          position: "relative",
          ...parsedStyle,
        }}
      >
        <img
          src={src}
          alt={alt}
          onError={(e) => {
            if (fallbackSrc)
              (e.target as HTMLImageElement).src = fallbackSrc;
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {isPreview && <UploadOverlay />}
      </div>
    );
  }
);
ProfileImage.displayName = "ProfileImage";

/** Upload overlay for editor preview */
const UploadOverlay: React.FC = () => (
  <div
    onClick={() => {
      window.parent?.postMessage({ type: "TRIGGER_IMAGE_UPLOAD" }, "*");
    }}
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: 0,
      transition: "opacity 0.2s",
      cursor: "pointer",
      color: "white",
      backdropFilter: "blur(2px)",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.opacity = "1";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.opacity = "0";
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  </div>
);

// ─── Subscribe Modal ────────────────────────────────────────────────────────

const SubscribeModal: React.FC<{
  bioId: string;
  open: boolean;
  onClose: () => void;
}> = ({ bioId, open, onClose }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (status === "loading" || !email.trim()) return;

      setStatus("loading");
      setMessage("");

      try {
        await api.post(`/public/email/subscribe/${bioId}`, {
          email: email.trim(),
        });
        setStatus("success");
        setMessage("Thanks for subscribing!");
        setEmail("");
        setTimeout(() => onClose(), 1600);
      } catch (err: any) {
        const s = err?.response?.status;
        if (s === 409) {
          setStatus("success");
          setMessage("Thanks for subscribing!");
          setTimeout(() => onClose(), 1600);
        } else {
          setStatus("error");
          setMessage(
            err?.response?.data?.message ||
              "Failed to subscribe. Please try again."
          );
        }
      }
    },
    [bioId, email, status, onClose]
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 6,
              width: "100%",
              background: "#f9fafb",
              border: "1.5px solid #e5e7eb",
              borderRadius: 16,
              boxShadow: "0 15px 35px -16px rgba(0,0,0,0.15)",
            }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                minWidth: 0,
                padding: "14px",
                border: "none",
                background: "transparent",
                fontSize: 16,
                outline: "none",
                fontWeight: 600,
                color: "#111827",
              }}
            />
            <button
              type="submit"
              aria-label="Subscribe"
              disabled={status === "loading"}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: "linear-gradient(135deg, rgb(17,24,39), rgb(31,41,55))",
                border: "none",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
                transition: "200ms",
                boxShadow: "rgba(17,24,39,0.2) 0px 4px 12px -2px",
                opacity: status === "loading" ? 0.8 : 1,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {message && (
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                color: status === "success" ? "#10b981" : "#ef4444",
              }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ─── NSFW Modal ─────────────────────────────────────────────────────────────

const NsfwModal: React.FC<{
  url: string;
  open: boolean;
  onClose: () => void;
}> = ({ url, open, onClose }) => {
  const handleContinue = useCallback(() => {
    onClose();
    if (url) window.open(url, "_blank");
  }, [url, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          margin: 16,
          background: "#ffffff",
          borderRadius: 20,
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 24px 60px -30px rgba(15,23,42,0.45)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px 22px 10px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(15, 23, 42, 0.08)",
                color: "#111827",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              18+
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
              Sensitive content
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "rgba(15,23,42,0.06)",
              color: "#111827",
              width: 32,
              height: 32,
              borderRadius: 9999,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div
          style={{
            padding: "0 22px 18px 22px",
            color: "#475569",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          This link may contain content intended for adults (18+). Do you want
          to continue?
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "0 22px 22px 22px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "#ffffff",
              color: "#111827",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go back
          </button>
          <button
            onClick={handleContinue}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #111827, #1f2937)",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 12px 22px -12px rgba(15,23,42,0.5)",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Share Modal ────────────────────────────────────────────────────────────

const ShareModal: React.FC<{
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}> = ({ url, title, open, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  if (!open) return null;

  const encodedUrl = encodeURIComponent(url);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 24,
          maxWidth: 380,
          width: "100%",
          margin: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Share
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "#6b7280",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUrl}`}
            alt="QR Code"
            style={{ width: 120, height: 120, borderRadius: 8 }}
          />
        </div>

        {/* Social links */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={shareIconStyle}
            aria-label="Share on Twitter"
          >
            𝕏
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={shareIconStyle}
            aria-label="Share on Facebook"
          >
            f
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={shareIconStyle}
            aria-label="Share on WhatsApp"
          >
            W
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={shareIconStyle}
            aria-label="Share on LinkedIn"
          >
            in
          </a>
        </div>

        {/* Copy link */}
        <button
          onClick={copyLink}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: copied ? "#ecfdf5" : "#f9fafb",
            color: copied ? "#059669" : "#374151",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
};

const shareIconStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  borderRadius: "50%",
  background: "#f3f4f6",
  color: "#374151",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 16,
  transition: "all 0.2s",
};

// ─── Promo Banner ───────────────────────────────────────────────────────────

const PromoBanner: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    style={{
      position: "fixed",
      bottom: 16,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 995,
      background: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderRadius: 50,
      padding: "6px 6px 6px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      boxShadow: "0 8px 32px -8px rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.08)",
      animation: "promoSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      color: "white",
      maxWidth: "calc(100vw - 32px)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          whiteSpace: "nowrap",
        }}
      >
        Made with
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "white",
          letterSpacing: "-0.2px",
        }}
      >
        Portyo
      </span>
    </div>
    <a
      href="https://portyo.me"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        background: "white",
        color: "black",
        borderRadius: 50,
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: 700,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
      }}
    >
      Try free
    </a>
    <button
      onClick={onClose}
      aria-label="Close"
      style={{
        background: "transparent",
        border: "none",
        borderRadius: "50%",
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
        cursor: "pointer",
        padding: 0,
        transition: "color 0.2s",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
);

// ─── Background Component ───────────────────────────────────────────────────

const BioBackground: React.FC<{
  bio: Record<string, any>;
  children: React.ReactNode;
}> = ({ bio, children }) => {
  const bgType = bio.bgType || "color";
  const bgColor = bio.bgColor || "#F3F4F6";
  const bgSecondary = bio.bgSecondaryColor || "#E5E7EB";

  const bgStyle = useMemo<React.CSSProperties>(() => {
    switch (bgType) {
      case "color":
        return { background: bgColor };
      case "image":
        return bio.bgImage
          ? {
              background: `url('${bio.bgImage}') no-repeat center center fixed`,
              backgroundSize: "cover",
            }
          : { background: bgColor };
      case "grid":
        return {
          backgroundColor: bgColor,
          backgroundImage: `linear-gradient(${bgSecondary} 1px, transparent 1px), linear-gradient(90deg, ${bgSecondary} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        };
      case "dots":
        return {
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(${bgSecondary} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        };
      case "polka":
        return {
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(${bgSecondary} 20%, transparent 20%), radial-gradient(${bgSecondary} 20%, transparent 20%)`,
          backgroundPosition: "0 0, 10px 10px",
          backgroundSize: "20px 20px",
        };
      case "stripes":
        return {
          background: `repeating-linear-gradient(45deg, ${bgColor}, ${bgColor} 10px, ${bgSecondary} 10px, ${bgSecondary} 20px)`,
        };
      case "zigzag":
        return {
          backgroundColor: bgColor,
          backgroundImage: `linear-gradient(135deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(225deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(45deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(315deg, ${bgSecondary} 25%, ${bgColor} 25%)`,
          backgroundPosition: "10px 0, 10px 0, 0 0, 0 0",
          backgroundSize: "20px 20px",
        };
      case "mesh":
        return {
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(at 40% 20%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 80% 0%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 0% 50%, ${bgSecondary} 0px, transparent 50%)`,
        };
      case "particles":
        return {
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(${bgSecondary} 2px, transparent 2px), radial-gradient(${bgSecondary} 2px, transparent 2px)`,
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        };
      case "noise":
        return {
          backgroundColor: bgColor,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
        };
      case "abstract":
        return {
          backgroundColor: bgColor,
          backgroundImage: `linear-gradient(30deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(150deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(30deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(150deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(60deg, ${bgSecondary}77 25%, transparent 25.5%, transparent 75%, ${bgSecondary}77 75%, ${bgSecondary}77), linear-gradient(60deg, ${bgSecondary}77 25%, transparent 25.5%, transparent 75%, ${bgSecondary}77 75%, ${bgSecondary}77)`,
          backgroundSize: "20px 35px",
          backgroundPosition: "0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px",
        };
      case "blueprint":
        return {
          backgroundColor: "#1e3a5f",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize:
            "100px 100px, 100px 100px, 20px 20px, 20px 20px",
          backgroundPosition: "-1px -1px, -1px -1px, -1px -1px, -1px -1px",
        };
      case "marble":
        return {
          backgroundColor: "#f5f5f5",
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.02) 50%, transparent 50%), linear-gradient(rgba(0,0,0,0.02) 50%, transparent 50%), radial-gradient(circle at 20% 30%, rgba(220,220,220,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(200,200,200,0.3) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(210,210,210,0.35) 0%, transparent 60%)",
          backgroundSize:
            "50px 50px, 50px 50px, 100% 100%, 100% 100%, 100% 100%",
          backgroundPosition: "0 0, 25px 25px, 0 0, 0 0, 0 0",
        };
      case "concrete":
        return {
          backgroundColor: "#9ca3af",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='concrete'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23concrete)' opacity='0.15'/%3E%3C/svg%3E"), linear-gradient(135deg, rgba(156,163,175,1) 0%, rgba(107,114,128,1) 100%)`,
        };
      case "waves":
        return {
          backgroundColor: bgColor,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${encodeURIComponent(bgSecondary)}' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        };
      case "palm-leaves":
      case "wheat":
        // These use special SVG overlay layers
        return { backgroundColor: bgColor, overflowX: "hidden" };
      case "dynamic-blur":
        return { background: "#000" };
      default:
        return { background: bgColor };
    }
  }, [bgType, bgColor, bgSecondary, bio.bgImage]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        ...bgStyle,
      }}
    >
      {/* Video background */}
      {bgType === "video" && bio.bgVideo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <video
            autoPlay
            muted={bio.bgVideoMuted !== false}
            loop={bio.bgVideoLoop !== false}
            playsInline
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: "100%",
              minHeight: "100%",
              objectFit: "cover",
            }}
          >
            <source src={bio.bgVideo} />
          </video>
          {(bio.bgVideoOverlay ?? 30) > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `rgba(0,0,0,${(bio.bgVideoOverlay ?? 30) / 100})`,
              }}
            />
          )}
        </div>
      )}

      {/* Dynamic blur background */}
      {bgType === "dynamic-blur" && bio.bgImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background: `url('${bio.bgImage}') center/cover no-repeat`,
            filter: `blur(${bio.blurIntensity ?? 5}px)`,
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* Image overlay */}
      {bgType === "image" && bio.bgImage && (bio.bgImageOverlay ?? 0) > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background: `rgba(0,0,0,${(bio.bgImageOverlay ?? 0) / 100})`,
          }}
        />
      )}

      {/* Palm-leaves / wheat overlay layers */}
      {(bgType === "palm-leaves" || bgType === "wheat") && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url('/background/${bgType === "palm-leaves" ? "Design sem nome (4).svg" : "wheat/Design sem nome (7).svg"}')`,
              backgroundSize: "600px 600px",
              backgroundRepeat: "repeat",
              transform: "rotate(15deg) translateZ(0)",
              opacity: 0.4,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url('/background/${bgType === "palm-leaves" ? "Design sem nome (5).svg" : "wheat/Design sem nome (8).svg"}')`,
              backgroundSize: "500px 500px",
              backgroundRepeat: "repeat",
              transform: "rotate(-10deg) translateZ(0)",
              opacity: 0.6,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {children}
    </div>
  );
};

// ─── Profile Header ─────────────────────────────────────────────────────────

const ProfileHeader: React.FC<{
  bio: Record<string, any>;
  isPreview?: boolean;
  onSubscribeOpen: () => void;
}> = React.memo(({ bio, isPreview, onSubscribeOpen }) => {
  const displayName = bio.seoTitle || bio.sufix || "User";
  const handle = bio.username || bio.sufix || "user";
  const usernameColor = bio.usernameColor || "#111827";
  const socials = bio.socials || {};
  const description = bio.description || "";
  const displayProfileImage = bio.displayProfileImage !== false;
  const imageStyle = bio.imageStyle || PROFILE_DEFAULTS.imageStyle;
  const profileImageLayout = bio.profileImageLayout || "classic";
  const profileImageSize = bio.profileImageSize || "small";
  const titleStyle = bio.titleStyle || "text";
  const profileImageSrc =
    bio.profileImage || "/base-img/card_base_image.png";
  const titleLogoSrc =
    bio.favicon || bio.ogImage || profileImageSrc;
  const maxWidth = 566;

  const isHeroLayout = profileImageLayout === "hero";

  if (isHeroLayout) {
    return (
      <div
        id="profile-header-card"
        style={{
          width: "100%",
          maxWidth,
          margin: "0 auto 20px auto",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            height: profileImageSize === "large" ? 380 : 320,
            borderRadius: 32,
            overflow: "hidden",
            boxShadow: "0 28px 60px -28px rgba(0,0,0,0.65)",
            background: "#0f172a",
            position: "relative",
          }}
        >
          {bio.enableSubscribeButton && (
            <SubscribeButton onOpen={onSubscribeOpen} />
          )}
          {displayProfileImage && (
            <img
              src={profileImageSrc}
              alt={displayName}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/base-img/card_base_image.png";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 65%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              textAlign: "center",
              padding: "0 20px 28px",
              gap: 8,
            }}
          >
            {titleStyle === "logo" && titleLogoSrc ? (
              <img
                src={titleLogoSrc}
                alt={displayName}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                style={{
                  maxWidth: 220,
                  maxHeight: 78,
                  objectFit: "contain",
                  filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.6))",
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#ffffff",
                  textShadow:
                    "0 6px 18px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {displayName}
                {bio.verified && VERIFIED_BADGE}
              </div>
            )}
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              @{handle}
            </div>
            <SocialLinks socials={socials} usernameColor="#ffffff" />
          </div>
        </div>
        {description && (
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: usernameColor,
              opacity: 0.85,
              margin: "20px auto 0",
              lineHeight: 1.6,
              textAlign: "center",
              maxWidth: 520,
              padding: "0 20px",
            }}
          >
            {description}
          </p>
        )}
      </div>
    );
  }

  // Classic layout
  return (
    <div
      id="profile-header-card"
      style={{
        width: "100%",
        maxWidth,
        margin: "0 auto 20px auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        zIndex: 10,
        paddingTop: 40,
      }}
    >
      {bio.enableSubscribeButton && (
        <SubscribeButton onOpen={onSubscribeOpen} />
      )}

      {/* Profile Image */}
      {displayProfileImage && (
        <ProfileImage
          src={profileImageSrc}
          alt={displayName}
          layout="classic"
          size={profileImageSize}
          imageStyle={imageStyle}
          isPreview={isPreview}
          fallbackSrc="/base-img/card_base_image.png"
        />
      )}

      {/* Name / Logo */}
      {titleStyle === "logo" && titleLogoSrc ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 0 8px 0",
          }}
        >
          <img
            src={titleLogoSrc}
            alt={displayName}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            style={{
              maxWidth: 180,
              maxHeight: 64,
              objectFit: "contain",
            }}
          />
        </div>
      ) : (
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: usernameColor,
            margin: "0 0 4px 0",
            textAlign: "center",
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          {displayName}
          {bio.verified && VERIFIED_BADGE}
        </h1>
      )}

      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: usernameColor,
          opacity: 0.6,
          marginBottom: 16,
        }}
      >
        @{handle}
      </div>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: usernameColor,
            opacity: 0.8,
            margin: "0 0 24px 0",
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 480,
          }}
        >
          {description}
        </p>
      )}

      {/* Socials */}
      <SocialLinks socials={socials} usernameColor={usernameColor} />
    </div>
  );
});
ProfileHeader.displayName = "ProfileHeader";

// ─── Branding Footer ────────────────────────────────────────────────────────

const BrandingFooter: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      padding: "24px 0 32px 0",
      width: "100%",
      position: "relative",
      zIndex: 10,
    }}
  >
    <a
      href="https://portyo.me"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        textDecoration: "none",
        fontSize: 12,
        color: "#4b5563",
        fontWeight: 500,
        padding: "6px 14px",
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s ease",
      }}
    >
      <span>Powered by</span>
      <span style={{ fontWeight: 800, color: "#111827" }}>Portyo</span>
    </a>
  </div>
);

// ─── Utility ────────────────────────────────────────────────────────────────

/** Convert a CSS string like "border-radius:50%; clip-path:..." to React CSSProperties */
function cssStringToObject(css: string): React.CSSProperties {
  const style: Record<string, string> = {};
  css
    .split(";")
    .filter(Boolean)
    .forEach((rule) => {
      const colonIdx = rule.indexOf(":");
      if (colonIdx === -1) return;
      const prop = rule.slice(0, colonIdx).trim();
      const value = rule.slice(colonIdx + 1).trim();
      // Convert kebab-case to camelCase
      const camelProp = prop.replace(/-([a-z])/g, (_, c) =>
        c.toUpperCase()
      );
      style[camelProp] = value;
    });
  return style;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const BioRenderer: React.FC<BioRendererProps> = ({
  bio: rawBio,
  blocks,
  isPreview = false,
  isNested = false,
  subdomain,
  baseUrl,
  onDesignChange,
}) => {
  // Merge with defaults
  const bio = useMemo(() => withDesignDefaults(rawBio), [rawBio]);

  // Design tokens
  const tokens = useMemo(() => bioToDesignTokens(bio), [bio]);
  const tokenStyle = useMemo(() => designTokensToStyleObject(tokens), [tokens]);

  // State
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [nsfwOpen, setNsfwOpen] = useState(false);
  const [nsfwUrl, setNsfwUrl] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [showPromo, setShowPromo] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent of token changes
  useEffect(() => {
    onDesignChange?.(tokens);
  }, [tokens, onDesignChange]);

  // Font loading
  useEffect(() => {
    if (typeof document === "undefined") return;

    const fontUrl = getFontLinkUrl(bio.font || "Inter");
    const customCSS = getCustomFontCSS(bio);

    const linkId = "bio-font-link";
    const styleId = "bio-font-style";

    // Clean up existing
    document.getElementById(linkId)?.remove();
    document.getElementById(styleId)?.remove();

    if (customCSS) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = customCSS;
      document.head.appendChild(styleEl);
    } else if (fontUrl) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = fontUrl;
      document.head.appendChild(link);
    }

    return () => {
      document.getElementById(linkId)?.remove();
      document.getElementById(styleId)?.remove();
    };
  }, [bio.font, bio.customFontUrl]);

  // NSFW link interception
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const handler = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-nsfw-ignore="true"]')) return;
      const el = target.closest('[data-nsfw="true"]') as HTMLElement | null;
      if (!el) return;
      event.preventDefault();
      event.stopPropagation();
      const url = el.getAttribute("data-nsfw-url") || "";
      if (!url) return;
      setNsfwUrl(url);
      setNsfwOpen(true);
    };

    root.addEventListener("click", handler, true);
    return () => root.removeEventListener("click", handler, true);
  }, [blocks]);

  // Share modal handlers
  useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).openShare = (
      _e: any,
      url: string,
      title: string
    ) => {
      setShareUrl(url);
      setShareTitle(title);
      setShareOpen(true);
    };
    (window as any).closeShare = () => setShareOpen(false);
    (window as any).openSubscribe = () => setSubscribeOpen(true);
    (window as any).closeSubscribe = () => setSubscribeOpen(false);
  }, []);

  // Body overflow lock for NSFW modal
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (nsfwOpen) {
      const prev = document.body.style.overflow;
      document.body.setAttribute("data-nsfw-prev-overflow", prev || "");
      document.body.style.overflow = "hidden";
    } else {
      const prev =
        document.body.getAttribute("data-nsfw-prev-overflow") || "";
      document.body.style.overflow = prev;
      document.body.removeAttribute("data-nsfw-prev-overflow");
    }
  }, [nsfwOpen]);

  // Card styling
  const cardStyle = useMemo<React.CSSProperties>(() => {
    const cardStyleType = bio.cardStyle || "none";
    if (cardStyleType === "none") return {};

    const cardBgColor = bio.cardBackgroundColor || "#ffffff";
    const cardOpacity = bio.cardOpacity ?? 100;
    const cardBlur = bio.cardBlur ?? 10;

    const r = parseInt(cardBgColor.substr(1, 2), 16) || 255;
    const g = parseInt(cardBgColor.substr(3, 2), 16) || 255;
    const b = parseInt(cardBgColor.substr(5, 2), 16) || 255;
    const alpha = cardOpacity / 100;

    const style: React.CSSProperties = {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
      borderRadius: 24,
      padding: "32px 24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    };

    if (cardStyleType === "frosted") {
      style.backdropFilter = `blur(${cardBlur}px)`;
      style.WebkitBackdropFilter = `blur(${cardBlur}px)`;
      style.border = "1px solid rgba(255,255,255,0.1)";
    }

    return style;
  }, [bio.cardStyle, bio.cardBackgroundColor, bio.cardOpacity, bio.cardBlur]);

  // Share URL
  const bioShareUrl = useMemo(() => {
    if (bio.customDomain) return `https://${bio.customDomain}`;
    return `https://portyo.me/p/${bio.sufix}`;
  }, [bio.customDomain, bio.sufix]);

  const maxWidth = 566;

  // Filter out product blocks from main rendering (handled by tab system)
  const visibleBlocks = useMemo(
    () => blocks.filter((b) => b.type !== "product"),
    [blocks]
  );

  return (
    <>
      {/* Global animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_KEYFRAMES }} />

      <BioBackground bio={bio}>
        <div
          ref={containerRef}
          style={{
            ...tokenStyle,
            fontFamily: tokens["--font-family"],
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Main content area with optional card styling */}
          <div
            style={{
              width: "100%",
              maxWidth,
              margin: "0 auto",
              padding: "0 16px",
              ...cardStyle,
            }}
          >
            {/* Profile Header */}
            <ProfileHeader
              bio={bio}
              isPreview={isPreview}
              onSubscribeOpen={() => setSubscribeOpen(true)}
            />

            {/* Blocks */}
            <RenderBlocks blocks={visibleBlocks} bio={bio} />
          </div>

          {/* Branding footer */}
          {!bio.removeBranding && <BrandingFooter />}
        </div>
      </BioBackground>

      {/* Modals */}
      <SubscribeModal
        bioId={bio.id}
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
      <NsfwModal
        url={nsfwUrl}
        open={nsfwOpen}
        onClose={() => {
          setNsfwOpen(false);
          setNsfwUrl("");
        }}
      />
      <ShareModal
        url={shareUrl || bioShareUrl}
        title={shareTitle || bio.seoTitle || subdomain || ""}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* Promo banner */}
      {!isPreview && showPromo && !bio.removeBranding && (
        <PromoBanner onClose={() => setShowPromo(false)} />
      )}
    </>
  );
};

BioRenderer.displayName = "BioRenderer";
export default BioRenderer;
