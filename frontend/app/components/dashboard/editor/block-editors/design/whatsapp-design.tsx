import { memo } from "react";
import { Palette, Sparkles, RectangleHorizontal } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorVisualPicker, EditorColorField } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const styleOptions = [
  { value: "solid", label: "Sólido" },
  { value: "outline", label: "Contorno" },
  { value: "gradient", label: "Gradiente" },
  { value: "glass", label: "Glass" },
  { value: "neon", label: "Neon" },
];

const shapeOptions = [
  { value: "pill", label: "Pill", icon: <RectangleHorizontal className="w-4 h-4" /> },
  { value: "rounded", label: "Arredondado", icon: <div className="w-5 h-3 border-2 border-current rounded-md" /> },
  { value: "square", label: "Quadrado", icon: <div className="w-5 h-3 border-2 border-current rounded-sm" /> },
];

const variationOptions = [
  { value: "direct-button", label: "Botão direto" },
  { value: "pre-filled-form", label: "Formulário" },
];

export const WhatsAppDesignEditor = memo(function WhatsAppDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<Sparkles className="w-3.5 h-3.5" />} title="Estilo">
        <EditorVisualPicker
          label="Variação"
          value={block.whatsappVariation || "direct-button"}
          onChange={(v) => onUpdate({ whatsappVariation: v as any })}
          options={variationOptions}
          columns={2}
        />
        <EditorVisualPicker
          label="Estilo visual"
          value={block.whatsappStyle || "solid"}
          onChange={(v) => onUpdate({ whatsappStyle: v as any })}
          options={styleOptions}
          columns={3}
        />
        <EditorVisualPicker
          label="Formato"
          value={block.whatsappShape || "pill"}
          onChange={(v) => onUpdate({ whatsappShape: v as any })}
          options={shapeOptions}
          columns={3}
        />
      </EditorSection>

      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Cores" noBorder>
        <div className="grid grid-cols-2 gap-3">
          <EditorColorField
            label="Cor do fundo"
            value={block.accent || "#25D366"}
            onChange={(v) => onUpdate({ accent: v })}
          />
          <EditorColorField
            label="Cor do texto"
            value={block.textColor || "#ffffff"}
            onChange={(v) => onUpdate({ textColor: v })}
          />
        </div>
      </EditorSection>
    </div>
  );
});
