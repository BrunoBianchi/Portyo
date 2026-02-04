import { useTranslation } from "react-i18next";
import { MarketingSlotSelector } from "../integration-selectors";
import { BlockStyleSettings } from "../block-style-settings";
import type { BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function MarketingBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  const handleSlotSelect = (slot: { id: string; name: string } | null) => {
    onChange({
      marketingSlotId: slot?.id,
      marketingSlotName: slot?.name,
    });
  };

  return (
    <div className="space-y-6">
      {/* Marketing Slot Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          {t("editor.blockIntegration.marketing.title")}
        </label>
        <MarketingSlotSelector
          bioId={block.bioId}
          selectedSlotId={block.marketingSlotId}
          onSelect={handleSlotSelect}
        />
        <p className="text-xs text-gray-500">
          {t("editor.blockItem.marketing.helper")}
        </p>
      </div>

      {/* Info about locked state */}
      {block.marketingSlotId && (
        <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            {t("editor.blockItem.marketing.locked")}
          </p>
        </div>
      )}

      {/* Style Settings */}
      <BlockStyleSettings
        block={block}
        onUpdate={onChange}
      />
    </div>
  );
}
