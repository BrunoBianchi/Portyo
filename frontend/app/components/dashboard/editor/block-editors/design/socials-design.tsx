import { memo } from "react";
import { LayoutGrid, List, MessageCircle, Rows3, Columns3 } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorVisualPicker, EditorToggle } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const variationOptions = [
  { value: "icon-grid", label: "Grade", icon: <LayoutGrid className="w-4 h-4" /> },
  { value: "detailed-list", label: "Lista", icon: <List className="w-4 h-4" /> },
  { value: "floating-buttons", label: "Flutuantes", icon: <MessageCircle className="w-4 h-4" /> },
];

const layoutOptions = [
  { value: "row", label: "Horizontal", icon: <Columns3 className="w-4 h-4" /> },
  { value: "column", label: "Vertical", icon: <Rows3 className="w-4 h-4" /> },
];

export const SocialsDesignEditor = memo(function SocialsDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<LayoutGrid className="w-3.5 h-3.5" />} title="Exibição" noBorder>
        <EditorVisualPicker
          label="Estilo de exibição"
          value={block.socialsVariation || "icon-grid"}
          onChange={(v) => onUpdate({ socialsVariation: v as any })}
          options={variationOptions}
          columns={3}
        />

        {(block.socialsVariation || "icon-grid") === "icon-grid" && (
          <EditorVisualPicker
            label="Layout"
            value={block.socialsLayout || "row"}
            onChange={(v) => onUpdate({ socialsLayout: v as any })}
            options={layoutOptions}
            columns={2}
          />
        )}

        <EditorToggle
          label="Mostrar rótulos"
          checked={block.socialsLabel || false}
          onChange={(v) => onUpdate({ socialsLabel: v })}
        />
      </EditorSection>
    </div>
  );
});
