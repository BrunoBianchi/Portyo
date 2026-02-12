import { memo } from "react";
import { QrCode, LayoutGrid, Palette } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorVisualPicker, EditorColorField } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const layoutOptions = [
  { value: "single", label: "Único" },
  { value: "multiple", label: "Múltiplos" },
  { value: "grid", label: "Grade" },
];

export const QRCodeDesignEditor = memo(function QRCodeDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<LayoutGrid className="w-3.5 h-3.5" />} title="Layout">
        <EditorVisualPicker
          label="Disposição"
          value={block.qrCodeLayout || "single"}
          onChange={(v) => onUpdate({ qrCodeLayout: v as any })}
          options={layoutOptions}
          columns={3}
        />
      </EditorSection>

      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Cores" noBorder>
        <div className="grid grid-cols-2 gap-3">
          <EditorColorField
            label="Cor do QR"
            value={block.qrCodeColor || "#000000"}
            onChange={(v) => onUpdate({ qrCodeColor: v })}
          />
          <EditorColorField
            label="Cor de fundo"
            value={block.qrCodeBgColor || "#FFFFFF"}
            onChange={(v) => onUpdate({ qrCodeBgColor: v })}
          />
        </div>
      </EditorSection>
    </div>
  );
});
