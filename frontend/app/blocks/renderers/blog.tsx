/**
 * Blog Block Renderer
 *
 * Renders a blog post feed with horizontal carousel and navigation arrows.
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { BlockSection } from "./utils";
import { api } from "~/services/api";

/* ── Arrow Button ────────────────────────────────────────────────────── */
const ArrowButton: React.FC<{
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
}> = ({ direction, onClick, visible }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    aria-label={direction === "left" ? "Anterior" : "Próximo"}
    style={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      [direction === "left" ? "left" : "right"]: "-6px",
      zIndex: 10,
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      border: "none",
      background: "rgba(255,255,255,0.95)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
      transition: "opacity 0.25s, transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)";
      e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      e.currentTarget.style.transform = "translateY(-50%) scale(1)";
    }}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#374151"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: direction === "left" ? "rotate(180deg)" : "none" }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>
);

/* ── Dot Indicators ──────────────────────────────────────────────────── */
const DotIndicators: React.FC<{
  total: number;
  activeIndex: number;
  accentColor: string;
}> = ({ total, activeIndex, accentColor }) => {
  if (total <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "6px",
        paddingTop: "12px",
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: activeIndex === i ? "18px" : "6px",
            height: "6px",
            borderRadius: "99px",
            background: activeIndex === i ? accentColor : "#D1D5DB",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
};

/* ── Props ────────────────────────────────────────────────────────────── */
interface BlogBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

/* ── Main Component ──────────────────────────────────────────────────── */
export const BlogBlock: React.FC<BlogBlockProps> = ({ block, bio }) => {
  const bgColor = block.bgColor || "#ffffff";
  const titleColor = block.titleColor || "#1f2937";
  const tagBg = block.tagBg || "#f3f4f6";
  const tagText = block.tagText || "#4b5563";
  const accentColor = block.dateColor || "#f59e0b";

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 260;
  const GAP = 14;

  useEffect(() => {
    if (!bio.id) return;
    api
      .get(`/blog/${bio.id}?publicView=true`)
      .then((res) => setPosts(res.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [bio.id]);

  /* ── Scroll state tracking ───────────────────────────────────────── */
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < maxScroll - 4);

    // Calculate active dot index
    const idx = Math.round(scrollLeft / (CARD_WIDTH + GAP));
    setActiveIndex(Math.min(idx, posts.length - 1));
  }, [posts.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Delay to wait for layout
    const timer = setTimeout(updateScrollState, 100);
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState, posts]);

  /* ── Scroll actions ──────────────────────────────────────────────── */
  const scrollBy = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = (CARD_WIDTH + GAP) * (dir === "left" ? -1 : 1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  /* ── Loading skeleton ────────────────────────────────────────────── */
  if (loading) {
    return (
      <BlockSection block={block}>
        <div style={{ display: "flex", gap: "14px", overflow: "hidden" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: `0 0 ${CARD_WIDTH}px`,
                height: "240px",
                borderRadius: "18px",
                background: "linear-gradient(110deg, #f3f4f6 30%, #e5e7eb 50%, #f3f4f6 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      </BlockSection>
    );
  }

  if (posts.length === 0) {
    return (
      <BlockSection block={block}>
        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280", fontSize: "12px" }}>
          Nenhum post encontrado
        </div>
      </BlockSection>
    );
  }

  const showArrows = posts.length > 1;

  return (
    <BlockSection block={block}>
      <div
        style={{ position: "relative" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Left Arrow */}
        {showArrows && (
          <ArrowButton
            direction="left"
            onClick={() => scrollBy("left")}
            visible={hovered && canScrollLeft}
          />
        )}

        {/* Scrollable Card Track */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: `${GAP}px`,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            padding: "4px 2px 4px 2px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {posts.map((post, i) => {
            const date = new Date(post.createdAt).toLocaleDateString("pt-BR", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <article
                key={post.id || i}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = `/blog/post/${post.slug || post.id}`;
                  }
                }}
                style={{
                  flex: `0 0 ${CARD_WIDTH}px`,
                  scrollSnapAlign: "start",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  background: bgColor,
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  padding: "14px",
                  minWidth: `${CARD_WIDTH}px`,
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "100%",
                    height: 140,
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#e5e7eb",
                  }}
                >
                  <img
                    src={post.thumbnail || "/base-img/card_base_image.png"}
                    alt={post.title}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.3s",
                    }}
                  />
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <span
                    style={{
                      background: tagBg,
                      color: tagText,
                      padding: "2px 8px",
                      borderRadius: "99px",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Blog
                  </span>
                  <span
                    style={{
                      background: tagBg,
                      color: tagText,
                      padding: "2px 8px",
                      borderRadius: "99px",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {date}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    lineHeight: 1.3,
                    color: titleColor,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.title}
                </h3>
              </article>
            );
          })}
        </div>

        {/* Right Arrow */}
        {showArrows && (
          <ArrowButton
            direction="right"
            onClick={() => scrollBy("right")}
            visible={hovered && canScrollRight}
          />
        )}
      </div>

      {/* Dot indicators */}
      {showArrows && (
        <DotIndicators total={posts.length} activeIndex={activeIndex} accentColor={accentColor} />
      )}
    </BlockSection>
  );
};

export default BlogBlock;
