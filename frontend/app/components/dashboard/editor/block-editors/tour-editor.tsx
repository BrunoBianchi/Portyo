import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { BlockStyleSettings } from "../block-style-settings";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function TourBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.tourTitleLabel")}
        </label>
        <input
          type="text"
          value={block.tourTitle || ""}
          onChange={(e) => onChange({ tourTitle: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.tourTitlePlaceholder")}
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.tourDatesLabel")}
        </label>
        <textarea
          value={JSON.stringify(block.tours || [], null, 2)}
          onChange={(e) => {
            try {
              const tours = JSON.parse(e.target.value);
              onChange({ tours });
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={6}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-mono text-xs focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20 resize-none"
          placeholder={t("editor.editDrawer.fields.tourDatesPlaceholder")}
        />
      </div>
      <BlockStyleSettings block={block} onUpdate={onChange} />
    </div>
  );
}
