import { memo } from "react";
import { Music, User, Disc3, ListMusic, Album } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorVisualPicker, EditorToggle } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const variationOptions = [
  { value: "artist-profile", label: "Artista", icon: <User className="w-4 h-4" /> },
  { value: "single-track", label: "Faixa", icon: <Disc3 className="w-4 h-4" /> },
  { value: "playlist", label: "Playlist", icon: <ListMusic className="w-4 h-4" /> },
  { value: "album", label: "Álbum", icon: <Album className="w-4 h-4" /> },
];

export const SpotifyDesignEditor = memo(function SpotifyDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<Music className="w-3.5 h-3.5" />} title="Exibição" noBorder>
        <EditorVisualPicker
          label="Variação"
          value={block.spotifyVariation || "artist-profile"}
          onChange={(v) => onUpdate({ spotifyVariation: v as any })}
          options={variationOptions}
          columns={2}
        />
        <EditorToggle
          label="Modo compacto"
          checked={block.spotifyCompact || false}
          onChange={(v) => onUpdate({ spotifyCompact: v })}
        />
      </EditorSection>
    </div>
  );
});
