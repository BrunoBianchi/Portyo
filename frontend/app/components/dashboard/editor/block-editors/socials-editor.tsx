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

      <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-100">
        <input
          type="checkbox"
          id="showLabels"
          checked={block.socialsLabel || false}
          onChange={(e) => onChange({ socialsLabel: e.target.checked })}
          className="w-5 h-5 border-2 border-black rounded"
        />
        <label htmlFor="showLabels" className="text-sm font-medium">
          {t("editor.blockItem.socials.showLabels")}
        </label>
      </div>
    </div>
  );
}
