import { useTranslation } from "react-i18next";
import type { BlockEditorProps } from "./index";

export function TextBlockEditor({ block, onChange }: BlockEditorProps) {
  const { t } = useTranslation("dashboard");
  const isHeading = block.type === "heading";

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.titleLabel")}
        </label>
        <input
          type="text"
          value={block.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-bold text-lg focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.titlePlaceholder")}
        />
      </div>

      {!isHeading && (
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
            {t("editor.editDrawer.fields.contentLabel")}
          </label>
          <textarea
            value={block.body || ""}
            onChange={(e) => onChange({ body: e.target.value })}
            rows={4}
            className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20 resize-none"
            placeholder={t("editor.editDrawer.fields.contentPlaceholder")}
          />
        </div>
      )}
    </div>
  );
}
