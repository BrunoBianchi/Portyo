/**
 * Tour Block Renderer
 */
import React, { useRef } from "react";
import { BlockSection, normalizeUrl, escapeHtml } from "./utils";

interface TourBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const TourBlock: React.FC<TourBlockProps> = ({ block }) => {
  const title = block.title || "Tour Dates";
  const dates: Array<{
    date?: string;
    location?: string;
    venue?: string;
    ticketUrl?: string;
    soldOut?: boolean;
    sellingFast?: boolean;
    image?: string;
  }> = block.dates || block.tours || [];
  const scrollRef = useRef<HTMLDivElement>(null);

  if (dates.length === 0) return null;

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  return (
    <BlockSection block={block}>
      <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px 0" }}>
        {title}
      </h3>
      <div style={{ position: "relative" }}>
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "14px",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            paddingBottom: "4px",
          }}
        >
          {dates.map((tour, i) => (
            <a
              key={i}
              href={tour.ticketUrl ? normalizeUrl(tour.ticketUrl) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: "0 0 200px",
                scrollSnapAlign: "start",
                aspectRatio: "3/4",
                borderRadius: "18px",
                overflow: "hidden",
                position: "relative",
                textDecoration: "none",
                backgroundImage: tour.image ? `url(${tour.image})` : "linear-gradient(135deg, #1f2937, #374151)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.7))" }} />

              {/* Badge */}
              {(tour.soldOut || tour.sellingFast) && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backgroundColor: tour.soldOut ? "#EF4444" : "#F59E0B",
                    color: "#fff",
                  }}
                >
                  {tour.soldOut ? "Sold Out" : "Selling Fast"}
                </div>
              )}

              {/* Content */}
              <div style={{ position: "absolute", bottom: "14px", left: "14px", right: "14px", color: "#fff" }}>
                {tour.date && (
                  <div style={{ fontSize: "11px", fontWeight: 700, opacity: 0.8, marginBottom: "4px" }}>
                    {tour.date}
                  </div>
                )}
                {tour.location && (
                  <div style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.2 }}>
                    {tour.location}
                  </div>
                )}
                {tour.venue && (
                  <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "2px" }}>
                    {tour.venue}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Scroll buttons */}
        {dates.length > 2 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "14px" }}>
            <button
              onClick={() => scroll(-1)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid #E5E7EB",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "#111827",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </BlockSection>
  );
};

export default TourBlock;
