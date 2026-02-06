/**
 * Text Block Renderer
 */
import React from "react";
import { BlockSection, escapeHtml } from "./utils";

interface TextBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const TextBlock: React.FC<TextBlockProps> = ({ block, bio }) => {
  const color = block.textColor || bio.usernameColor || "#374151";
  const fontSize = block.fontSize || "16px";
  const fontWeight = block.fontWeight || "500";
  const content = block.content || "";

  return (
    <BlockSection block={block}>
      <p
        style={{
          margin: 0,
          color,
          fontSize,
          fontWeight,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
        }}
        dangerouslySetInnerHTML={{
          __html: escapeHtml(content).replace(/\n/g, "<br>"),
        }}
      />
    </BlockSection>
  );
};

export default TextBlock;
