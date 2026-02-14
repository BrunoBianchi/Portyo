import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorInput } from "./shared/editor-fields";
import { QRCodeSelector } from "../integration-selectors/qrcode-selector";
import { ShortLinkSelector } from "../integration-selectors/short-link-selector";
import type { QRCodeItem, ShortLinkItem } from "~/services/block-integration.service";
import { useContext } from "react";
import BioContext from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function QRCodeBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const { bio } = useContext(BioContext);
  const [mode, setMode] = useState<"manual" | "savedQr" | "shortLink">(
    (block.qrCodeSourceIds?.length ?? 0) > 0 ? "savedQr" : "manual"
  );
  const layout = block.qrCodeLayout || "single";
  const isMulti = layout === "multiple" || layout === "grid";

  const baseShortUrl = bio?.customDomain
    ? `https://${bio.customDomain}`
    : bio?.sufix
      ? `https://portyo.me/p/${bio.sufix}`
      : "https://portyo.me/p/username";

  const handleSelectQRCodes = (items: QRCodeItem[]) => {
    const ids = items.map((i) => i.id);
    onChange({ qrCodeSourceIds: ids });

    if (items.length === 1 && !isMulti) {
      onChange({ qrCodeValue: items[0].value, qrCodeSourceIds: ids });
    } else if (items.length > 0) {
      const qrCodeItems = items.map((item) => ({
        id: item.id,
        value: item.value,
        label: item.value.replace(/^https?:\/\//, "").slice(0, 40),
      }));
      onChange({ qrCodeItems, qrCodeSourceIds: ids });
    }
  };

  const handleSelectShortLinks = (items: ShortLinkItem[]) => {
    if (!items.length) {
      onChange({ qrCodeValue: "", qrCodeItems: [], qrCodeSourceIds: [] });
      return;
    }

    const mappedItems = items.map((item) => ({
      id: item.id,
      value: `${baseShortUrl}/${item.slug}`,
      label: item.title,
    }));

    if (!isMulti) {
      onChange({
        qrCodeValue: mappedItems[0].value,
        qrCodeItems: [],
        qrCodeSourceIds: [],
      });
      return;
    }

    onChange({
      qrCodeItems: mappedItems,
      qrCodeValue: mappedItems[0].value,
      qrCodeSourceIds: [],
    });
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
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
          onClick={() => setMode("savedQr")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            mode === "savedQr"
              ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {t("editor.blockIntegration.qr.saved", { defaultValue: "Saved QR codes" })}
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

      {/* Manual input */}
      {mode === "manual" && (
        <>
          <EditorInput
            label={t("editor.editDrawer.fields.qrValueLabel")}
            value={block.qrCodeValue || ""}
            onChange={(v) => onChange({ qrCodeValue: v })}
            placeholder="https://..."
            prefix="URL"
          />
          <p className="text-[10px] text-gray-400 -mt-2">
            {t("editor.blockIntegration.qr.designHint", { defaultValue: "QR Code colors and layout can be adjusted in the Design tab." })}
          </p>
        </>
      )}

      {/* Selector from backend */}
      {mode === "savedQr" && (
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-0.5 text-black/40">
            {isMulti
              ? t("editor.blockIntegration.qr.selectMany", { defaultValue: "Select QR Codes" })
              : t("editor.blockIntegration.qr.selectOne", { defaultValue: "Select one QR Code" })}
          </label>
          <QRCodeSelector
            bioId={block.bioId || null}
            selectedIds={block.qrCodeSourceIds || []}
            onSelect={handleSelectQRCodes}
            multiSelect={isMulti}
          />
          <p className="text-[10px] text-gray-400 mt-2">
            {t("editor.blockIntegration.qr.savedHint", { defaultValue: "Use existing QR codes with integrated analytics." })}
          </p>
        </div>
      )}

      {mode === "shortLink" && (
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-0.5 text-black/40">
            {isMulti
              ? t("editor.blockIntegration.shortLinks.selectMany", { defaultValue: "Select short links" })
              : t("editor.blockIntegration.shortLinks.select", { defaultValue: "Select short link" })}
          </label>
          <ShortLinkSelector
            bioId={block.bioId || null}
            selectedIds={[]}
            onSelect={handleSelectShortLinks}
            multiSelect={isMulti}
          />
          <p className="text-[10px] text-gray-400 mt-2">
            {t("editor.blockIntegration.shortLinks.qrHint", { defaultValue: "Selected short links become QR destinations automatically." })}
          </p>
        </div>
      )}
    </div>
  );
}
