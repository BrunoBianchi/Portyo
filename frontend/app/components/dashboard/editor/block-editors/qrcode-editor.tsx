import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorInput } from "./shared/editor-fields";
import { QRCodeSelector } from "../integration-selectors/qrcode-selector";
import type { QRCodeItem } from "~/services/block-integration.service";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function QRCodeBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const [useExisting, setUseExisting] = useState(
    (block.qrCodeSourceIds?.length ?? 0) > 0
  );
  const layout = block.qrCodeLayout || "single";
  const isMulti = layout === "multiple" || layout === "grid";

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

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUseExisting(false)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            !useExisting
              ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          URL Manual
        </button>
        <button
          type="button"
          onClick={() => setUseExisting(true)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            useExisting
              ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          QR Codes Salvos
        </button>
      </div>

      {/* Manual input */}
      {!useExisting && (
        <>
          <EditorInput
            label={t("editor.editDrawer.fields.qrValueLabel")}
            value={block.qrCodeValue || ""}
            onChange={(v) => onChange({ qrCodeValue: v })}
            placeholder="https://..."
            prefix="URL"
          />
          <p className="text-[10px] text-gray-400 -mt-2">
            Cores e layout do QR Code podem ser ajustados na aba Design.
          </p>
        </>
      )}

      {/* Selector from backend */}
      {useExisting && (
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-0.5 text-black/40">
            {isMulti ? "Selecione os QR Codes" : "Selecione um QR Code"}
          </label>
          <QRCodeSelector
            bioId={block.bioId || null}
            selectedIds={block.qrCodeSourceIds || []}
            onSelect={handleSelectQRCodes}
            multiSelect={isMulti}
          />
          <p className="text-[10px] text-gray-400 mt-2">
            Selecione QR codes já criados para exibir com analytics integrados.
          </p>
        </div>
      )}
    </div>
  );
}
