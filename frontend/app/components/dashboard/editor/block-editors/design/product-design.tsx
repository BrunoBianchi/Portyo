import { memo } from "react";
import { Palette, LayoutGrid } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorVisualPicker, EditorColorField, EditorToggle, EditorInput } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const layoutOptions = [
  { value: "grid", label: "Grade" },
  { value: "list", label: "Lista" },
  { value: "carousel", label: "Carrossel" },
];

const cardStyleOptions = [
  { value: "default", label: "Padrão" },
  { value: "modern", label: "Moderno" },
  { value: "minimal", label: "Minimal" },
];

export const ProductDesignEditor = memo(function ProductDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<LayoutGrid className="w-3.5 h-3.5" />} title="Layout">
        <EditorVisualPicker
          label="Layout"
          value={block.productLayout || "grid"}
          onChange={(v) => onUpdate({ productLayout: v as any })}
          options={layoutOptions}
          columns={3}
        />
        <EditorVisualPicker
          label="Estilo do card"
          value={block.productCardStyle || "default"}
          onChange={(v) => onUpdate({ productCardStyle: v as any })}
          options={cardStyleOptions}
          columns={3}
        />
        <EditorToggle
          label="Mostrar preços"
          checked={block.productShowPrices !== false}
          onChange={(v) => onUpdate({ productShowPrices: v })}
        />
        <EditorToggle
          label="Mostrar descrições"
          checked={block.productShowDescriptions !== false}
          onChange={(v) => onUpdate({ productShowDescriptions: v })}
        />
        <EditorInput
          label="Texto do botão"
          value={block.productButtonText || "View Product"}
          onChange={(v) => onUpdate({ productButtonText: v })}
          placeholder="View Product"
        />
      </EditorSection>

      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Cores" noBorder>
        <div className="grid grid-cols-2 gap-3">
          <EditorColorField
            label="Fundo"
            value={block.productBackgroundColor || "#ffffff"}
            onChange={(v) => onUpdate({ productBackgroundColor: v })}
          />
          <EditorColorField
            label="Texto"
            value={block.productTextColor || "#1f2937"}
            onChange={(v) => onUpdate({ productTextColor: v })}
          />
        </div>
        <EditorColorField
          label="Destaque"
          value={block.productAccentColor || "#000000"}
          onChange={(v) => onUpdate({ productAccentColor: v })}
        />
      </EditorSection>
    </div>
  );
});
