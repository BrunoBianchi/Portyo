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
  { value: "bordered", label: "Bordas" },
];

export const BlogDesignEditor = memo(function BlogDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<LayoutGrid className="w-3.5 h-3.5" />} title="Layout">
        <EditorVisualPicker
          label="Layout"
          value={block.blogLayout || "grid"}
          onChange={(v) => onUpdate({ blogLayout: v as any })}
          options={layoutOptions}
          columns={3}
        />
        <EditorVisualPicker
          label="Estilo do card"
          value={block.blogCardStyle || "modern"}
          onChange={(v) => onUpdate({ blogCardStyle: v as any })}
          options={cardStyleOptions}
          columns={2}
        />
      </EditorSection>

      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Cores" noBorder>
        <div className="grid grid-cols-2 gap-3">
          <EditorColorField
            label="Fundo"
            value={block.blogBackgroundColor || "#ffffff"}
            onChange={(v) => onUpdate({ blogBackgroundColor: v })}
          />
          <EditorColorField
            label="Texto"
            value={block.blogTextColor || "#1f2937"}
            onChange={(v) => onUpdate({ blogTextColor: v })}
          />
          <EditorColorField
            label="Título"
            value={block.blogTitleColor || "#111827"}
            onChange={(v) => onUpdate({ blogTitleColor: v })}
          />
          <EditorColorField
            label="Data"
            value={block.blogDateColor || "#9ca3af"}
            onChange={(v) => onUpdate({ blogDateColor: v })}
          />
          <EditorColorField
            label="Fundo da tag"
            value={block.blogTagBackgroundColor || "#f3f4f6"}
            onChange={(v) => onUpdate({ blogTagBackgroundColor: v })}
          />
          <EditorColorField
            label="Texto da tag"
            value={block.blogTagTextColor || "#111827"}
            onChange={(v) => onUpdate({ blogTagTextColor: v })}
          />
        </div>
      </EditorSection>
    </div>
  );
});
