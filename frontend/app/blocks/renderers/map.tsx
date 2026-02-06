/**
 * Map Block Renderer
 */
import React from "react";
import { BlockSection, escapeHtml } from "./utils";

interface MapBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const MapBlock: React.FC<MapBlockProps> = ({ block }) => {
  const address = block.address || "";
  const title = block.title || "";

  if (!address) return null;

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <BlockSection block={block}>
      <div
        style={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          height: "280px",
          border: "1px solid #E5E7EB",
        }}
      >
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title || "Map"}
        />
        {(title || address) && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              right: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {title && (
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>{title}</div>
            )}
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: title ? "4px" : 0 }}>
              {address}
            </div>
          </div>
        )}
      </div>
    </BlockSection>
  );
};

export default MapBlock;
