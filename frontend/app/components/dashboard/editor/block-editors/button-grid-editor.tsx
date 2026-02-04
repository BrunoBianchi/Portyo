import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { BlockStyleSettings } from "../block-style-settings";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function ButtonGridBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.gridItemsLabel")}
        </label>
        <textarea
          value={JSON.stringify(block.gridItems || [], null, 2)}
          onChange={(e) => {
            try {
              const gridItems = JSON.parse(e.target.value);
              onChange({ gridItems });
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={8}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-mono text-xs focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20 resize-none"
          placeholder={t("editor.editDrawer.fields.gridItemsPlaceholder")}
        />
      </div>
      <BlockStyleSettings block={block} onUpdate={onChange} />
    </div>
  );
}
