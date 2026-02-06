/**
 * QR Code Block Renderer
 */
import React from "react";
import { BlockSection, escapeHtml } from "./utils";

interface QRCodeBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const QRCodeBlock: React.FC<QRCodeBlockProps> = ({ block }) => {
  const variation = block.variation || "single";
  const codes: Array<{ url: string; label?: string }> = block.codes || [];
  const mainUrl = block.url || "";
  const mainLabel = block.label || "";
  const size = block.size || 200;
  const bgColor = (block.bgColor || "#FFFFFF").replace("#", "");
  const fgColor = (block.fgColor || "#000000").replace("#", "");

  const makeQrSrc = (url: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=${bgColor}&color=${fgColor}`;

  // Single QR code
  if (variation === "single" || codes.length === 0) {
    if (!mainUrl) return null;
    return (
      <BlockSection block={block}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <img src={makeQrSrc(mainUrl)} alt={`QR Code for ${mainLabel || mainUrl}`} width={size} height={size} />
          </div>
          {mainLabel && (
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{mainLabel}</span>
          )}
        </div>
      </BlockSection>
    );
  }

  // Grid layout
  if (variation === "grid") {
    return (
      <BlockSection block={block}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {codes.map((code, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <img src={makeQrSrc(code.url)} alt={`QR Code ${i + 1}`} width={size / 1.5} height={size / 1.5} />
              </div>
              {code.label && (
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{code.label}</span>
              )}
            </div>
          ))}
        </div>
      </BlockSection>
    );
  }

  // List layout
  return (
    <BlockSection block={block}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        {codes.map((code, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <img src={makeQrSrc(code.url)} alt={`QR Code ${i + 1}`} width={size} height={size} />
            </div>
            {code.label && (
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{code.label}</span>
            )}
          </div>
        ))}
      </div>
    </BlockSection>
  );
};

export default QRCodeBlock;
