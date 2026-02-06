/**
 * Featured Product Block Renderer
 */
import React from "react";
import { BlockSection, normalizeUrl, escapeHtml } from "./utils";

interface FeaturedBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const FeaturedBlock: React.FC<FeaturedBlockProps> = ({ block }) => {
  const title = block.title || "Product";
  const image = block.image || "/base-img/card_base_image.png";
  const price = block.price || "";
  const url = normalizeUrl(block.url || "");
  const bgColor = block.bgColor || "#FFFFFF";

  return (
    <BlockSection block={block}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="product-item-link"
        data-product-id={block.productId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px",
          borderRadius: "20px",
          backgroundColor: bgColor,
          border: "1px solid #F3F4F6",
          textDecoration: "none",
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
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
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827", marginBottom: "4px" }}>
            {title}
          </div>
          <div
            style={{
              display: "flex",
              height: "6px",
              borderRadius: "3px",
              backgroundColor: "#F3F4F6",
              width: "80%",
              marginBottom: "6px",
            }}
          />
          <div
            style={{
              display: "flex",
              height: "6px",
              borderRadius: "3px",
              backgroundColor: "#F3F4F6",
              width: "60%",
            }}
          />
          {price && (
            <>
              <hr style={{ border: "none", borderTop: "1px solid #F3F4F6", margin: "12px 0" }} />
              <div style={{ fontWeight: 800, fontSize: "14px", color: "#111827" }}>
                Buy now for {price}
              </div>
            </>
          )}
        </div>
      </a>
    </BlockSection>
  );
};

export default FeaturedBlock;
