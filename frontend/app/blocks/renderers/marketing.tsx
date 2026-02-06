/**
 * Marketing Block Renderer
 */
import React, { Suspense, lazy } from "react";
import { BlockSection } from "./utils";

const MarketingWidget = lazy(() =>
  import("~/components/bio/marketing-widget").then((m) => ({ default: m.MarketingWidget }))
);

interface MarketingBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const MarketingBlock: React.FC<MarketingBlockProps> = ({ block, bio }) => {
  const slotId = block.marketingId || block.slotId || "";
  const bioId = bio.id;

  if (!slotId || !bioId) return null;

  return (
    <BlockSection block={block}>
      <Suspense
        fallback={
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              background: "rgba(255,255,255,0.5)",
              borderRadius: "24px",
              color: "#4b5563",
              border: "2px dashed #9ca3af",
            }}
          >
            Loading...
          </div>
        }
      >
        <MarketingWidget slotId={slotId} bioId={bioId} />
      </Suspense>
    </BlockSection>
  );
};

export default MarketingBlock;
