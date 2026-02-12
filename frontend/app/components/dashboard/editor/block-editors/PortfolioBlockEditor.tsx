import { useTranslation } from "react-i18next";
import { PortfolioGallerySelector } from "../integration-selectors";
import type { BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

interface PortfolioConfig {
  itemIds: string[];
  layout: "grid" | "masonry" | "carousel";
  columns: 2 | 3 | 4;
  showTitles: boolean;
  showDescriptions: boolean;
}

export function PortfolioBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  
  const config: PortfolioConfig = {
    itemIds: block.portfolioItemIds || [],
    layout: block.portfolioLayout || "grid",
    columns: block.portfolioColumns || 3,
    showTitles: block.portfolioShowTitles !== false,
    showDescriptions: block.portfolioShowDescriptions !== false,
  };

  const handleConfigChange = (newConfig: PortfolioConfig) => {
    onChange({
      portfolioItemIds: newConfig.itemIds,
      portfolioLayout: newConfig.layout,
      portfolioColumns: newConfig.columns,
      portfolioShowTitles: newConfig.showTitles,
      portfolioShowDescriptions: newConfig.showDescriptions,
    });
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Gallery Selector */}
      <PortfolioGallerySelector
        bioId={block.bioId}
        config={config}
        onChange={handleConfigChange}
      />
    </div>
  );
}
