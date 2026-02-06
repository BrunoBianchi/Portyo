/**
 * Product Block Renderer
 * Products are loaded dynamically via the tab system — this is a placeholder.
 */
import React from "react";

interface ProductBlockProps {
  block: Record<string, any>;
  bio: Record<string, any>;
}

export const ProductBlock: React.FC<ProductBlockProps> = () => {
  // Product blocks are rendered through the tab/shop system, not inline
  return null;
};

export default ProductBlock;
