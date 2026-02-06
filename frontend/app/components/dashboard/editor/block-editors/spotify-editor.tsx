import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function SpotifyBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      {/* Spotify URL */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.spotifyUrlLabel")}
        </label>
        <input
          type="text"
          value={block.spotifyUrl || ""}
          onChange={(e) => onChange({ spotifyUrl: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium font-mono text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.spotifyPlaceholder")}
        />
      </div>

      {/* Compact Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-xl">
        <label className="text-xs font-black uppercase tracking-wider">
          Modo compacto
        </label>
        <button
          type="button"
          onClick={() => onChange({ spotifyCompact: !block.spotifyCompact })}
          className={`w-12 h-6 rounded-full relative transition-colors ${block.spotifyCompact ? "bg-[#D2E823] border-2 border-black" : "bg-gray-200 border-2 border-gray-300"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white border border-black rounded-full transition-transform ${block.spotifyCompact ? "left-6" : "left-0.5"}`} />
        </button>
      </div>
    </div>
  );
}
