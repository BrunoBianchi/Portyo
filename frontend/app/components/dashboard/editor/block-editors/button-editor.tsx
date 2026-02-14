import { useTranslation } from "react-i18next";
import type { BlockEditorProps } from "./index";
import { EditorInput } from "./shared/editor-fields";
import { useState } from "react";
import { ShortLinkSelector } from "../integration-selectors";
import type { ShortLinkItem } from "~/services/block-integration.service";
import { useContext } from "react";
import BioContext from "~/contexts/bio.context";

export function ButtonBlockEditor({ block, onChange }: BlockEditorProps) {
  const { t } = useTranslation("dashboard");
  const { bio } = useContext(BioContext);
  const [mode, setMode] = useState<"manual" | "shortLink">("manual");

  const handleShortLinkSelect = (items: ShortLinkItem[]) => {
    const selected = items[0];
    if (!selected) {
      onChange({ href: "" });
      return;
    }

    const baseUrl = bio?.customDomain
      ? `https://${bio.customDomain}`
      : bio?.sufix
        ? `https://portyo.me/p/${bio.sufix}`
        : "https://portyo.me/p/username";

    onChange({
      href: `${baseUrl}/${selected.slug}`,
      title: block.title || selected.title,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            mode === "manual"
              ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {t("editor.blockIntegration.shortLinks.manual", { defaultValue: "Manual URL" })}
        </button>
        <button
          type="button"
          onClick={() => setMode("shortLink")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            mode === "shortLink"
              ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {t("editor.blockIntegration.shortLinks.saved", { defaultValue: "Saved short links" })}
        </button>
      </div>

      <EditorInput
        label={t("editor.editDrawer.fields.titleLabel")}
        value={block.title || ""}
        onChange={(v) => onChange({ title: v })}
        placeholder={t("editor.editDrawer.fields.titlePlaceholder")}
      />

      {mode === "manual" ? (
        <EditorInput
          label={t("editor.editDrawer.fields.urlLabel")}
          value={block.href || ""}
          onChange={(v) => onChange({ href: v })}
          placeholder={t("editor.editDrawer.fields.urlPlaceholder")}
          prefix="https://"
        />
      ) : (
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-0.5 text-black/40">
            {t("editor.blockIntegration.shortLinks.title", { defaultValue: "Short links" })}
          </label>
          <ShortLinkSelector
            bioId={block.bioId || null}
            selectedIds={[]}
            onSelect={handleShortLinkSelect}
          />
        </div>
      )}
    </div>
  );
}
