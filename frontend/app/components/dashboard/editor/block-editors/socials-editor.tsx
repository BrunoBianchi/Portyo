import { useTranslation } from "react-i18next";
import type { BlockEditorProps } from "./index";

const platforms = [
  { key: "instagram", icon: "📷" },
  { key: "twitter", icon: "🐦" },
  { key: "tiktok", icon: "🎵" },
  { key: "youtube", icon: "▶️" },
  { key: "linkedin", icon: "💼" },
  { key: "github", icon: "💻" },
  { key: "facebook", icon: "👥" },
];

export function SocialsBlockEditor({ block, onChange }: BlockEditorProps) {
  const { t } = useTranslation("dashboard");
  const socials = block.socials || {};

  return (
    <div className="space-y-4">
      {/* Layout Toggle */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          Layout
        </label>
        <div className="flex bg-gray-100 border-2 border-black rounded-xl p-1">
          <button
            type="button"
            onClick={() => onChange({ socialsLayout: "row" })}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              (block.socialsLayout || "row") === "row"
                ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black"
                : "text-black/50 hover:text-black"
            }`}
          >
            Linha
          </button>
          <button
            type="button"
            onClick={() => onChange({ socialsLayout: "column" })}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              block.socialsLayout === "column"
                ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black"
                : "text-black/50 hover:text-black"
            }`}
          >
            Coluna
          </button>
        </div>
      </div>

      {/* Show Labels Toggle */}
      <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-xl">
        <label className="text-xs font-black uppercase tracking-wider">
          {t("editor.blockItem.socials.showLabels")}
        </label>
        <button
          type="button"
          onClick={() => onChange({ socialsLabel: !block.socialsLabel })}
          className={`w-12 h-6 rounded-full relative transition-colors ${block.socialsLabel ? "bg-[#D2E823] border-2 border-black" : "bg-gray-200 border-2 border-gray-300"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white border border-black rounded-full transition-transform ${block.socialsLabel ? "left-6" : "left-0.5"}`} />
        </button>
      </div>

      {/* Platform Inputs */}
      {platforms.map((platform) => (
        <div key={platform.key} className="flex items-center gap-3">
          <span className="text-2xl">{platform.icon}</span>
          <div className="flex-1">
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              {t(`editor.blockItem.socials.platforms.${platform.key}`, { defaultValue: platform.key })}
            </label>
            <input
              type="text"
              value={socials[platform.key as keyof typeof socials] || ""}
              onChange={(e) =>
                onChange({
                  socials: { ...socials, [platform.key]: e.target.value },
                })
              }
              className="w-full p-3 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              placeholder={`@${platform.key}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
