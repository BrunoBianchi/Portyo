/**
 * Image Block Renderer
 */
import React from "react";
import { BlockSection } from "./utils";

interface ImageBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

const HOVER_EFFECTS: Record<string, React.CSSProperties> = {
  zoom: { transform: "scale(1.05)" },
  lift: { transform: "translateY(-6px)", boxShadow: "0 12px 24px -8px rgba(0,0,0,0.2)" },
  glow: { boxShadow: "0 0 24px rgba(99,102,241,0.4)" },
  tilt: { transform: "perspective(600px) rotateY(5deg)" },
};

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  const src = block.url || block.src || "";
  const alt = block.alt || "Image";
  const width = block.width || "100%";
  const height = block.height || "auto";
  const borderRadius = block.borderRadius ?? 12;
  const objectFit = block.objectFit || "cover";

  // Filters
  const filters: string[] = [];
  if (block.blur) filters.push(`blur(${block.blur}px)`);
  if (block.brightness !== undefined && block.brightness !== 100) filters.push(`brightness(${block.brightness}%)`);
  if (block.contrast !== undefined && block.contrast !== 100) filters.push(`contrast(${block.contrast}%)`);
  if (block.saturation !== undefined && block.saturation !== 100) filters.push(`saturate(${block.saturation}%)`);
  if (block.grayscale) filters.push(`grayscale(${block.grayscale}%)`);
  if (block.sepia) filters.push(`sepia(${block.sepia}%)`);

  // Transform
  const transforms: string[] = [];
  if (block.scale && block.scale !== 100) transforms.push(`scale(${block.scale / 100})`);
  if (block.rotation) transforms.push(`rotate(${block.rotation}deg)`);

  const shadowMap: Record<string, string> = {
    sm: "0 1px 2px rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  };

  const imgStyle: React.CSSProperties = {
    width: typeof width === "number" ? `${width}%` : width,
    height,
    borderRadius: `${borderRadius}px`,
    objectFit: objectFit as any,
    display: "block",
    maxWidth: "100%",
    filter: filters.length ? filters.join(" ") : undefined,
    transform: transforms.length ? transforms.join(" ") : undefined,
    boxShadow: block.imageShadow ? shadowMap[block.imageShadow] : undefined,
    border: block.borderWidth ? `${block.borderWidth}px solid ${block.borderColor || "#E5E7EB"}` : undefined,
    transition: "all 0.3s ease",
  };

  const hoverEffect = block.hoverEffect && HOVER_EFFECTS[block.hoverEffect];
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <BlockSection block={block}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          ...imgStyle,
          ...(isHovered && hoverEffect ? hoverEffect : {}),
        }}
        onMouseEnter={() => hoverEffect && setIsHovered(true)}
        onMouseLeave={() => hoverEffect && setIsHovered(false)}
      />
    </BlockSection>
  );
};

export default ImageBlock;
