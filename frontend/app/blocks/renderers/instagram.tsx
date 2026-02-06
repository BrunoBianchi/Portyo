/**
 * Instagram Feed Block Renderer
 * 
 * Supports 3 variations:
 * - grid-shop: Instagram grid with clickable posts (fetch from API)
 * - visual-gallery: Visual gallery of latest posts/reels
 * - simple-link: Classic gradient button link to profile
 */
import React, { useEffect, useState } from "react";
import { BlockSection } from "./utils";
import { api } from "~/services/api";

/* ── Instagram SVG Icon ──────────────────────────────────────────────── */
const InstagramIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7.8 2h8.4C19 2 22 5 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C5 22 2 19 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
  </svg>
);

/* ── Skeleton placeholder ────────────────────────────────────────────── */
const Skeleton: React.FC<{ aspectRatio?: string }> = ({ aspectRatio = "1" }) => (
  <div
    style={{
      aspectRatio,
      background: "linear-gradient(110deg, #f3f4f6 30%, #e5e7eb 50%, #f3f4f6 70%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease-in-out infinite",
      borderRadius: "8px",
    }}
  />
);

/* ── Username link line ──────────────────────────────────────────────── */
const UsernameLink: React.FC<{
  username: string;
  textColor: string;
  showIcon?: boolean;
}> = ({ username, textColor, showIcon = true }) => (
  <a
    href={`https://instagram.com/${username}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      fontWeight: 600,
      color: textColor,
      textDecoration: "none",
      transition: "opacity 0.2s",
    }}
  >
    {showIcon && <InstagramIcon size={14} color={textColor} />}
    @{username}
  </a>
);

/* ── Props ────────────────────────────────────────────────────────────── */
interface InstagramBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

/* ── Main Component ──────────────────────────────────────────────────── */
export const InstagramBlock: React.FC<InstagramBlockProps> = ({ block }) => {
  // Read properties using the correct prefixed names (matching editor + entity)
  const username = block.instagramUsername || "";
  const variation = block.instagramVariation || "grid-shop";
  const displayType = block.instagramDisplayType || "grid";
  const showText = block.instagramShowText !== false;
  const textPosition = block.instagramTextPosition || "bottom";
  const textColor = block.instagramTextColor || "#0095f6";

  /* ────────────────────────────────────────────────────────────────────
   * VARIATION 1: simple-link — Gradient button to profile
   * ──────────────────────────────────────────────────────────────────── */
  if (variation === "simple-link") {
    return (
      <BlockSection block={block} style={{ padding: "6px 0" }}>
        <a
          href={`https://instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "16px 24px",
            borderRadius: "var(--bio-button-radius, 16px)",
            background: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "16px",
            textDecoration: "none",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 14px rgba(225,48,108,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(225,48,108,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(225,48,108,0.3)";
          }}
        >
          <InstagramIcon size={20} color="#fff" />
          <span>{username ? `Seguir @${username}` : "Seguir no Instagram"}</span>
        </a>
      </BlockSection>
    );
  }

  /* ────────────────────────────────────────────────────────────────────
   * VARIATIONS 2 & 3: grid-shop / visual-gallery — Fetch posts from API
   * ──────────────────────────────────────────────────────────────────── */
  return (
    <InstagramFeed
      block={block}
      username={username}
      variation={variation}
      displayType={displayType}
      showText={showText}
      textPosition={textPosition}
      textColor={textColor}
    />
  );
};

/* ── Feed sub-component (uses hooks, avoids conditional hook calls) ─── */
const InstagramFeed: React.FC<{
  block: Record<string, any>;
  username: string;
  variation: string;
  displayType: string;
  showText: boolean;
  textPosition: string;
  textColor: string;
}> = ({ block, username, variation, displayType, showText, textPosition, textColor }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const postCount = variation === "visual-gallery" ? 6 : 3;

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/public/instagram/${username}`)
      .then((res) => setPosts(res.data?.slice(0, postCount) || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [username, postCount]);

  /* Username text block */
  const textBlock = showText ? (
    <div
      style={{
        textAlign: "center",
        padding: "10px 0",
      }}
    >
      <UsernameLink username={username} textColor={textColor} />
    </div>
  ) : null;

  /* Placeholder grid while loading */
  const skeletonCount = variation === "visual-gallery" ? 6 : 3;
  const gridCols = variation === "visual-gallery"
    ? "repeat(3, 1fr)"
    : displayType === "grid"
      ? "repeat(3, 1fr)"
      : "1fr";

  /* ── VARIATION 2: grid-shop (Instagram grid with links) ────────── */
  if (variation === "grid-shop") {
    return (
      <BlockSection block={block}>
        {textPosition === "top" && textBlock}

        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 4px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <InstagramIcon size={16} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--bio-text-color, #111)" }}>
              {username ? `@${username}` : "Instagram"}
            </div>
          </div>
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              background: "#0095f6",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            Seguir
          </a>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: "3px",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {loading
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} />)
            : posts.map((post, i) => (
                <a
                  key={i}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    position: "relative",
                    aspectRatio: "1",
                    overflow: "hidden",
                    background: "#F3F4F6",
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <img
                    src={post.imageUrl}
                    alt={`Instagram post by ${username}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.3s",
                      transform: hoveredIndex === i ? "scale(1.05)" : "scale(1)",
                    }}
                  />
                  {/* Hover overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.3)",
                      opacity: hoveredIndex === i ? 1 : 0,
                      transition: "opacity 0.3s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                </a>
              ))}
        </div>

        {textPosition !== "top" && textBlock}
      </BlockSection>
    );
  }

  /* ── VARIATION 3: visual-gallery (Posts/Reels gallery) ──────────── */
  return (
    <BlockSection block={block}>
      {textPosition === "top" && textBlock}

      {/* Gallery grid — 3x2 layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "4px",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {loading
          ? Array.from({ length: skeletonCount }, (_, i) => <Skeleton key={i} />)
          : posts.map((post, i) => (
              <a
                key={i}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  position: "relative",
                  aspectRatio: "1",
                  overflow: "hidden",
                  background: "#F3F4F6",
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={post.imageUrl}
                  alt={`Instagram post ${i + 1}`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.3s",
                    transform: hoveredIndex === i ? "scale(1.08)" : "scale(1)",
                  }}
                />
                {/* Play icon for reels */}
                {post.isReel && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}
                {/* Hover overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.25)",
                    opacity: hoveredIndex === i ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}
                />
              </a>
            ))}
      </div>

      {/* Profile bar at bottom */}
      <a
        href={`https://instagram.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px",
          marginTop: "8px",
          borderRadius: "12px",
          background: "rgba(225,48,108,0.08)",
          color: "#E1306C",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          transition: "background 0.2s",
        }}
      >
        <InstagramIcon size={16} color="#E1306C" />
        {username ? `Ver mais em @${username}` : "Ver no Instagram"}
      </a>

      {textPosition !== "top" && textBlock}
    </BlockSection>
  );
};

export default InstagramBlock;
