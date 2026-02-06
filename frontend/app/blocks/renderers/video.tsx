/**
 * Video Block Renderer
 */
import React from "react";
import { BlockSection, extractYouTubeId } from "./utils";

interface VideoBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  const videoId = extractYouTubeId(block.url || "");
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
};

export default VideoBlock;
