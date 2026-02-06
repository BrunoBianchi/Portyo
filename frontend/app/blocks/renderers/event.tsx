/**
 * Event Block Renderer (with countdown timer)
 */
import React, { useState, useEffect } from "react";
import { BlockSection, normalizeUrl, escapeHtml } from "./utils";

interface EventBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

function useCountdown(targetDate: string) {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff < 0) {
        setRemaining({ d: 0, h: 0, m: 0, s: 0, expired: true });
        return;
      }
      setRemaining({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return remaining;
}

export const EventBlock: React.FC<EventBlockProps> = ({ block }) => {
  const title = block.title || "Event";
  const date = block.date || "";
  const bgColor = block.bgColor || "#111827";
  const textColor = block.textColor || "#FFFFFF";
  const ctaLabel = block.ctaLabel || "";
  const ctaUrl = block.ctaUrl || "";

  const countdown = useCountdown(date);

  const boxStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.1)",
    minWidth: "60px",
  };

  const numStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: 800,
    color: textColor,
    lineHeight: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    color: `${textColor}99`,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "4px",
  };

  return (
    <BlockSection block={block}>
      <div
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: "20px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 18px 0", color: textColor }}>
          {title}
        </h3>

        {countdown.expired ? (
          <div style={{ fontSize: "18px", fontWeight: 600, padding: "12px" }}>Event Started</div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={boxStyle}>
              <span style={numStyle}>{String(countdown.d).padStart(2, "0")}</span>
              <span style={labelStyle}>Days</span>
            </div>
            <div style={boxStyle}>
              <span style={numStyle}>{String(countdown.h).padStart(2, "0")}</span>
              <span style={labelStyle}>Hours</span>
            </div>
            <div style={boxStyle}>
              <span style={numStyle}>{String(countdown.m).padStart(2, "0")}</span>
              <span style={labelStyle}>Mins</span>
            </div>
            <div style={boxStyle}>
              <span style={numStyle}>{String(countdown.s).padStart(2, "0")}</span>
              <span style={labelStyle}>Secs</span>
            </div>
          </div>
        )}

        {ctaLabel && ctaUrl && (
          <a
            href={normalizeUrl(ctaUrl)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "18px",
              padding: "12px 28px",
              borderRadius: "12px",
              backgroundColor: textColor,
              color: bgColor,
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </BlockSection>
  );
};

export default EventBlock;
