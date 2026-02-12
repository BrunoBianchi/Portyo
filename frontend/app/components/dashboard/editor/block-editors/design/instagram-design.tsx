import { memo } from "react";
import { Instagram, LayoutGrid, Image, Link2 } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorVisualPicker, EditorToggle, EditorColorField } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const variationOptions = [
  { value: "grid-shop", label: "Grid Shop", icon: <LayoutGrid className="w-4 h-4" /> },
  { value: "visual-gallery", label: "Galeria", icon: <Image className="w-4 h-4" /> },
  { value: "simple-link", label: "Link simples", icon: <Link2 className="w-4 h-4" /> },
];

const displayTypeOptions = [
  { value: "grid", label: "Grade" },
  { value: "carousel", label: "Carrossel" },
  { value: "list", label: "Lista" },
];

const textPositionOptions = [
  { value: "top", label: "Topo" },
  { value: "bottom", label: "Inferior" },
  { value: "overlay", label: "Overlay" },
];

export const InstagramDesignEditor = memo(function InstagramDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<Instagram className="w-3.5 h-3.5" />} title="Exibição">
        <EditorVisualPicker
          label="Variação"
          value={block.instagramVariation || "grid-shop"}
          onChange={(v) => onUpdate({ instagramVariation: v as any })}
          options={variationOptions}
          columns={3}
        />
        <EditorVisualPicker
          label="Tipo de visualização"
          value={block.instagramDisplayType || "grid"}
          onChange={(v) => onUpdate({ instagramDisplayType: v as any })}
          options={displayTypeOptions}
          columns={3}
        />
        <EditorVisualPicker
          label="Posição do texto"
          value={block.instagramTextPosition || "bottom"}
          onChange={(v) => onUpdate({ instagramTextPosition: v as any })}
          options={textPositionOptions}
          columns={3}
        />
        <EditorToggle
          label="Mostrar texto"
          checked={block.instagramShowText !== false}
          onChange={(v) => onUpdate({ instagramShowText: v })}
        />
      </EditorSection>

      <EditorSection title="Cores" noBorder>
        <EditorColorField
          label="Cor do texto"
          value={block.instagramTextColor || "#000000"}
          onChange={(v) => onUpdate({ instagramTextColor: v })}
        />
      </EditorSection>
    </div>
  );
});
