import { useTranslation } from "react-i18next";
import type { BlockEditorProps } from "./index";

export function ImageBlockEditor({ block, onChange }: BlockEditorProps) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.imageUrlLabel")}
        </label>
        <input
          type="text"
          value={block.mediaUrl || ""}
          onChange={(e) => onChange({ mediaUrl: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium font-mono text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.imageUrlPlaceholder")}
        />
      </div>

      {block.mediaUrl && (
        <div className="rounded-xl overflow-hidden border-2 border-black">
          <img
            src={block.mediaUrl}
            alt={t("editor.previewAlt")}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isNsfw"
          checked={block.isNsfw || false}
          onChange={(e) => onChange({ isNsfw: e.target.checked })}
          className="w-5 h-5 border-2 border-black rounded"
        />
        <label htmlFor="isNsfw" className="text-sm font-medium">
          {t("editor.editDrawer.fields.nsfwHint")}
        </label>
      </div>
    </div>
  );
}
