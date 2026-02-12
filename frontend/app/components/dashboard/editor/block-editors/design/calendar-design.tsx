import { memo } from "react";
import { Palette } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorColorField } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

export const CalendarDesignEditor = memo(function CalendarDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Cores" noBorder>
        <div className="grid grid-cols-2 gap-3">
          <EditorColorField
            label="Cor de fundo"
            value={block.calendarColor || "#ffffff"}
            onChange={(v) => onUpdate({ calendarColor: v })}
          />
          <EditorColorField
            label="Cor do texto"
            value={block.calendarTextColor || "#1f2937"}
            onChange={(v) => onUpdate({ calendarTextColor: v })}
          />
        </div>
        <EditorColorField
          label="Cor de destaque"
          value={block.calendarAccentColor || "#2563eb"}
          onChange={(v) => onUpdate({ calendarAccentColor: v })}
        />
      </EditorSection>
    </div>
  );
});
