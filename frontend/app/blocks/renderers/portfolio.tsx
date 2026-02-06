/**
 * Portfolio Block Renderer
 */
import React, { Suspense, lazy } from "react";
import { BlockSection } from "./utils";

const PortfolioWidget = lazy(() =>
  import("~/components/bio/portfolio-widget").then((m) => ({ default: m.PortfolioWidget }))
);

interface PortfolioBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const PortfolioBlock: React.FC<PortfolioBlockProps> = ({ block, bio }) => {
  const title = block.title || "Portfólio";
  const bioId = bio.id;

  if (!bioId) return null;

  return (
    <BlockSection block={block}>
      <Suspense
        fallback={
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "24px",
              color: "#1f2937",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            Loading portfolio...
          </div>
        }
      >
        <PortfolioWidget bioId={bioId} title={title} />
      </Suspense>
    </BlockSection>
  );
};

export default PortfolioBlock;
