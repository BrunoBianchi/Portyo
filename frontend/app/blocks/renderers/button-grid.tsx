/**
 * Button Grid Block Renderer
 */
import React from "react";
import { BlockSection, normalizeUrl, escapeHtml } from "./utils";

interface ButtonGridBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const ButtonGridBlock: React.FC<ButtonGridBlockProps> = ({ block }) => {
  const items: Array<{
    title?: string;
    url?: string;
    image?: string;
    icon?: string;
  }> = block.items || block.buttons || [];

  if (items.length === 0) return null;

  return (
    <BlockSection block={block}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {items.map((item, i) => (
          <a
            key={i}
            href={normalizeUrl(item.url || "")}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              aspectRatio: "261/151",
              borderRadius: "18px",
              overflow: "hidden",
              position: "relative",
              textDecoration: "none",
              display: "block",
              backgroundImage: item.image ? `url(${item.image})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#F3F4F6",
            }}
          >
            {/* Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(transparent 40%, rgba(0,0,0,0.55))",
              }}
            />

            {/* Icon */}
            {item.icon && (
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                {item.icon}
              </div>
            )}

            {/* Title */}
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                right: "12px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: 1.2,
              }}
            >
              {item.title || "Link"}
            </div>
          </a>
        ))}
      </div>
    </BlockSection>
  );
};

export default ButtonGridBlock;
