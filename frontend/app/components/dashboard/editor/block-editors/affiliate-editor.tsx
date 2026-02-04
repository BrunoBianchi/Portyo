import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { BlockStyleSettings } from "../block-style-settings";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function AffiliateBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.affiliateTitleLabel")}
        </label>
        <input
          type="text"
          value={block.affiliateTitle || ""}
          onChange={(e) => onChange({ affiliateTitle: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.affiliateTitlePlaceholder")}
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.affiliateCodeLabel")}
        </label>
        <input
          type="text"
          value={block.affiliateCode || ""}
          onChange={(e) => onChange({ affiliateCode: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.affiliateCodePlaceholder")}
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.affiliateImageLabel")}
        </label>
        <input
          type="text"
          value={block.affiliateImage || ""}
          onChange={(e) => onChange({ affiliateImage: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium font-mono text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.affiliateUrlLabel")}
        </label>
        <input
          type="text"
          value={block.affiliateUrl || ""}
          onChange={(e) => onChange({ affiliateUrl: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium font-mono text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder="https://..."
        />
      </div>
      <BlockStyleSettings block={block} onUpdate={onChange} />
    </div>
  );
}
