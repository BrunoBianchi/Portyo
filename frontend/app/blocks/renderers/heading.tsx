/**
 * Heading Block Renderer
 */
import React from "react";
import { BlockSection } from "./utils";

interface HeadingBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, bio }) => {
  const color = block.textColor || bio.usernameColor || "#111827";
  const fontSize = block.fontSize || "32px";
  const fontWeight = block.fontWeight || "800";

  return (
    <BlockSection block={block}>
      <h2
        style={{
          margin: 0,
          color,
          fontSize,
          fontWeight,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {block.content || "Heading"}
      </h2>
      {block.subtitle && (
        <p
          style={{
            margin: "6px 0 0 0",
            color: `${color}99`,
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          {block.subtitle}
        </p>
      )}
    </BlockSection>
  );
};

export default HeadingBlock;
