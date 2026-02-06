/**
 * WhatsApp Block Renderer
 */
import React, { useState } from "react";
import { BlockSection, escapeHtml } from "./utils";

interface WhatsAppBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const WhatsAppBlock: React.FC<WhatsAppBlockProps> = ({ block }) => {
  const phone = block.phone || "";
  const message = block.message || "";
  const label = block.label || "Send Message on WhatsApp";
  const variation = block.variation || "direct-button";
  const whatsappStyle = block.whatsappStyle || "solid";
  const shape = block.whatsappShape || "pill";
  const bgColor = block.accentColor || block.accent || "#25D366";
  const textColor = block.textColor || "#FFFFFF";
  const [formMessage, setFormMessage] = useState(message);

  const radiusMap: Record<string, string> = {
    pill: "9999px",
    square: "0px",
    rounded: "12px",
  };
  const radius = radiusMap[shape] || "9999px";

  const waUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  // Pre-filled form variation
  if (variation === "pre-filled-form") {
    return (
      <BlockSection block={block}>
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "#166534" }}>WhatsApp</span>
          </div>
          <textarea
            value={formMessage}
            onChange={(e) => setFormMessage(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #bbf7d0",
              background: "#fff",
              fontSize: "14px",
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <a
            href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(formMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "14px",
              marginTop: "12px",
              borderRadius: "12px",
              backgroundColor: "#25D366",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              border: "none",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            Send Message
          </a>
        </div>
      </BlockSection>
    );
  }

  // Direct button (default)
  const styleMap: Record<string, React.CSSProperties> = {
    outline: {
      backgroundColor: "transparent",
      color: bgColor,
      border: `2px solid ${bgColor}`,
    },
    glass: {
      backgroundColor: `${bgColor}20`,
      color: bgColor,
      backdropFilter: "blur(10px)",
      border: `1px solid ${bgColor}30`,
    },
    gradient: {
      background: `linear-gradient(135deg, ${bgColor}, ${bgColor}CC)`,
      color: textColor,
    },
    neon: {
      backgroundColor: "transparent",
      color: bgColor,
      border: `2px solid ${bgColor}`,
      boxShadow: `0 0 10px ${bgColor}60, 0 0 20px ${bgColor}30`,
    },
    minimal: {
      backgroundColor: "transparent",
      color: bgColor,
      borderBottom: `2px solid ${bgColor}`,
      borderRadius: "0",
    },
    dark: {
      backgroundColor: "#111827",
      color: "#fff",
    },
    soft: {
      backgroundColor: "#f0fdf4",
      color: "#166534",
    },
    solid: {
      backgroundColor: bgColor,
      color: textColor,
    },
  };

  const btnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "16px 24px",
    borderRadius: radius,
    fontSize: "16px",
    fontWeight: 700,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    boxSizing: "border-box",
    ...(styleMap[whatsappStyle] || styleMap.solid),
  };

  return (
    <BlockSection block={block} style={{ padding: "6px 0" }}>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={btnStyle}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span>{label}</span>
      </a>
    </BlockSection>
  );
};

export default WhatsAppBlock;
