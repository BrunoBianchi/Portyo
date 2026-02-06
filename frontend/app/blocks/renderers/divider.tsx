/**
 * Divider Block Renderer
 */
import React from "react";
import { BlockSection } from "./utils";

interface DividerBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ block }) => {
  return (
    <BlockSection block={block}>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #E5E7EB",
          margin: "18px 0",
        }}
      />
    </BlockSection>
  );
};

export default DividerBlock;
