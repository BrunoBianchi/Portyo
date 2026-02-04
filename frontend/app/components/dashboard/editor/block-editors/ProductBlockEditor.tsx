import { useTranslation } from "react-i18next";
import { ProductCollectionSelector } from "../integration-selectors";
import { BlockStyleSettings } from "../block-style-settings";
import type { BioBlock } from "~/contexts/bio.context";

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
        bioId={block.bioId}
        config={config}
        onChange={handleConfigChange}
      />

      {/* Style Settings */}
      <BlockStyleSettings
        block={block}
        onUpdate={onChange}
      />
    </div>
  );
}
