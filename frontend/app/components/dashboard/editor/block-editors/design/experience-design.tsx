import { memo } from "react";
import { Palette } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorColorField } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

export const ExperienceDesignEditor = memo(function ExperienceDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Cores" noBorder>
        <div className="grid grid-cols-2 gap-3">
          <EditorColorField
            label="Cor do cargo"
            value={block.experienceRoleColor || "#111827"}
            onChange={(v) => onUpdate({ experienceRoleColor: v })}
          />
          <EditorColorField
            label="Cor do texto"
            value={block.experienceTextColor || "#374151"}
            onChange={(v) => onUpdate({ experienceTextColor: v })}
          />
        </div>
        <EditorColorField
          label="Cor da linha"
          value={block.experienceLineColor || "#e5e7eb"}
          onChange={(v) => onUpdate({ experienceLineColor: v })}
        />
      </EditorSection>
    </div>
  );
});
