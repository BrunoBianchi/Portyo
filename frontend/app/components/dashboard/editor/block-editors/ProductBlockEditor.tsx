import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ProductCollectionSelector } from "../integration-selectors";
import BioContext, { type BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

interface ProductConfig {
  productIds: string[];
  layout: "grid" | "list" | "carousel";
  showPrices: boolean;
  showDescriptions: boolean;
}

export function ProductBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const { bio } = useContext(BioContext);

  // Use block.bioId or fallback to context bio.id
  const effectiveBioId = block.bioId || bio?.id || null;

  const config: ProductConfig = {
    productIds: block.productIds || [],
    layout: block.productLayout || "grid",
    showPrices: block.productShowPrices !== false,
    showDescriptions: block.productShowDescriptions !== false,
  };

  const handleConfigChange = (newConfig: ProductConfig) => {
    onChange({
      productIds: newConfig.productIds,
      productLayout: newConfig.layout,
      productShowPrices: newConfig.showPrices,
      productShowDescriptions: newConfig.showDescriptions,
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Collection Selector */}
      <ProductCollectionSelector
        bioId={effectiveBioId}
        config={config}
        onChange={handleConfigChange}
      />
    </div>
  );
}
