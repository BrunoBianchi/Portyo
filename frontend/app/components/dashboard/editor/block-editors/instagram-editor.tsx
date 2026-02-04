import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { BlockStyleSettings } from "../block-style-settings";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function InstagramBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.instagramUsernameLabel")}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 font-bold">@</span>
          <input
            type="text"
            value={block.instagramUsername || ""}
            onChange={(e) => onChange({ instagramUsername: e.target.value })}
            className="w-full p-4 pl-8 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
            placeholder={t("editor.editDrawer.fields.instagramPlaceholder")}
          />
        </div>
      </div>
      <BlockStyleSettings block={block} onUpdate={onChange} />
    </div>
  );
}
