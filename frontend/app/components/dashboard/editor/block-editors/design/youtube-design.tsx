import { memo } from "react";
import { Youtube, LayoutGrid, Play, ListVideo } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorVisualPicker, EditorToggle, EditorColorField } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const variationOptions = [
  { value: "full-channel", label: "Canal", icon: <Youtube className="w-4 h-4" /> },
  { value: "single-video", label: "Vídeo único", icon: <Play className="w-4 h-4" /> },
  { value: "playlist", label: "Playlist", icon: <ListVideo className="w-4 h-4" /> },
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

export const YouTubeDesignEditor = memo(function YouTubeDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<Youtube className="w-3.5 h-3.5" />} title="Exibição">
        <EditorVisualPicker
          label="Variação"
          value={block.youtubeVariation || "full-channel"}
          onChange={(v) => onUpdate({ youtubeVariation: v as any })}
          options={variationOptions}
          columns={3}
        />
        <EditorVisualPicker
          label="Tipo de visualização"
          value={block.youtubeDisplayType || "grid"}
          onChange={(v) => onUpdate({ youtubeDisplayType: v as any })}
          options={displayTypeOptions}
          columns={3}
        />
        <EditorVisualPicker
          label="Posição do texto"
          value={block.youtubeTextPosition || "bottom"}
          onChange={(v) => onUpdate({ youtubeTextPosition: v as any })}
          options={textPositionOptions}
          columns={3}
        />
        <EditorToggle
          label="Mostrar texto"
          checked={block.youtubeShowText !== false}
          onChange={(v) => onUpdate({ youtubeShowText: v })}
        />
      </EditorSection>

      <EditorSection title="Cores" noBorder>
        <EditorColorField
          label="Cor do texto"
          value={block.youtubeTextColor || "#000000"}
          onChange={(v) => onUpdate({ youtubeTextColor: v })}
        />
      </EditorSection>
    </div>
  );
});
