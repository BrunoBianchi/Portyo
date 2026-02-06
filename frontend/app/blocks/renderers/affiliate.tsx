/**
 * Affiliate Block Renderer
 */
import React, { useState } from "react";
import { BlockSection, escapeHtml } from "./utils";

interface AffiliateBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const AffiliateBlock: React.FC<AffiliateBlockProps> = ({ block }) => {
  const title = block.title || "Affiliate";
  const image = block.image || "/base-img/card_base_image.png";
  const couponCode = block.couponCode || block.code || "";
  const bgColor = block.bgColor || "#FFFFFF";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <BlockSection block={block}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px",
          borderRadius: "20px",
          backgroundColor: bgColor,
          border: "1px solid #F3F4F6",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "14px",
            overflow: "hidden",
            flexShrink: 0,
            backgroundColor: "#F3F4F6",
          }}
        >
          <img
            src={image}
            alt={title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827", marginBottom: "8px" }}>
            {title}
          </div>
          {couponCode && (
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "#F3F4F6",
                border: "2px dashed #D1D5DB",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px",
                color: "#111827",
                fontFamily: "monospace",
                transition: "all 0.2s",
                width: "100%",
                justifyContent: "center",
              }}
            >
              {copied ? "✓ Copied!" : couponCode}
              {!copied && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </BlockSection>
  );
};

export default AffiliateBlock;
