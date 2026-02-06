/**
 * YouTube Feed Block Renderer
 */
import React, { useEffect, useState } from "react";
import { BlockSection, extractYouTubeId, normalizeUrl } from "./utils";
import { api } from "~/services/api";

interface YouTubeBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const YouTubeBlock: React.FC<YouTubeBlockProps> = ({ block }) => {
  const url = block.url || "";
  const variation = block.variation || "full-channel";
  const displayType = block.displayType || "grid";
  const textPosition = block.textPosition || "bottom";
  const channelText = block.channelText || "";

  // Single video variation
  if (variation === "single-video") {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;

    return (
      <BlockSection block={block}>
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>
      </BlockSection>
    );
  }

  // Full channel feed
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    api
      .get(`/public/youtube/fetch?url=${encodeURIComponent(url)}`)
      .then((res) => setVideos(res.data?.slice(0, 3) || []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [url]);

  const textLink = channelText ? (
    <a
      href={normalizeUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        textAlign: "center",
        fontSize: "13px",
        fontWeight: 600,
        color: "#6B7280",
        textDecoration: "none",
        padding: "8px 0",
      }}
    >
      {channelText}
    </a>
  ) : null;

  return (
    <BlockSection block={block}>
      {textPosition === "top" && textLink}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: displayType === "grid" ? "repeat(3, 1fr)" : "1fr",
          gap: "8px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "16/9",
                  background: "#F3F4F6",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
            ))
          : videos.map((video, i) => (
              <a
                key={i}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  position: "relative",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  background: "#F3F4F6",
                }}
              >
                <img
                  src={video.imageUrl}
                  alt={video.title || "YouTube video"}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </a>
            ))}
      </div>
      {textPosition !== "top" && textLink}
    </BlockSection>
  );
};

export default YouTubeBlock;
