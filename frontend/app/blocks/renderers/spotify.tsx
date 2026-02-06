/**
 * Spotify Block Renderer
 */
import React from "react";
import { BlockSection } from "./utils";

interface SpotifyBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const SpotifyBlock: React.FC<SpotifyBlockProps> = ({ block }) => {
  const url = block.url || "";
  const compact = block.compact;
  const variation = block.variation || "single-track";

  if (!url) return null;

  // Convert Spotify URL to embed URL
  const embedUrl = url.includes("/embed/")
    ? url
    : url.replace("open.spotify.com", "open.spotify.com/embed");

  let height: number;
  if (variation === "single-track") {
    height = compact ? 80 : 152;
  } else {
    // album, playlist, artist-profile
    height = 380;
  }

  return (
    <BlockSection block={block}>
      <div style={{ borderRadius: "12px", overflow: "hidden" }}>
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{
            border: "none",
            borderRadius: "12px",
          }}
        />
      </div>
    </BlockSection>
  );
};

export default SpotifyBlock;
