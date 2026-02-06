import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function QRCodeBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.qrValueLabel")}
        </label>
        <input
          type="text"
          value={block.qrCodeValue || ""}
          onChange={(e) => onChange({ qrCodeValue: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium font-mono text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder="https://..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
            {t("editor.editDrawer.fields.qrFgColorLabel")}
          </label>
          <input
            type="color"
            value={block.qrCodeColor || "#000000"}
            onChange={(e) => onChange({ qrCodeColor: e.target.value })}
            className="w-full h-12 p-1 bg-white border-2 border-black rounded-xl cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
            {t("editor.editDrawer.fields.qrBgColorLabel")}
          </label>
          <input
            type="color"
            value={block.qrCodeBgColor || "#FFFFFF"}
            onChange={(e) => onChange({ qrCodeBgColor: e.target.value })}
            className="w-full h-12 p-1 bg-white border-2 border-black rounded-xl cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
