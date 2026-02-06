import { useTranslation } from "react-i18next";
import type { BlockEditorProps } from "./index";
import { ColorPicker } from "../ColorPicker";

const buttonStyleOptions = [
  "solid", "outline", "gradient", "glass", "neon", 
  "ghost", "hard-shadow", "soft-shadow", "3d", 
  "neumorphism", "clay", "cyberpunk", "pixel",
  "sketch", "gradient-border", "minimal-underline",
  "architect", "material", "brutalist", "outline-thick"
];

const buttonShapeOptions = ["pill", "rounded", "square"];

export function ButtonBlockEditor({ block, onChange }: BlockEditorProps) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.titleLabel")}
        </label>
        <input
          type="text"
          value={block.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-bold text-lg focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.titlePlaceholder")}
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.urlLabel")}
        </label>
        <input
          type="text"
          value={block.href || ""}
          onChange={(e) => onChange({ href: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium font-mono text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.urlPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
            {t("editor.editDrawer.fields.buttonStyleLabel")}
          </label>
          <select
            value={block.buttonStyle || "solid"}
            onChange={(e) => onChange({ buttonStyle: e.target.value as BioBlock["buttonStyle"] })}
            className="w-full p-3 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          >
            {buttonStyleOptions.map((style) => (
              <option key={style} value={style}>
                {t(`editor.blockStyle.buttonStyles.${style}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
            {t("editor.editDrawer.fields.buttonShapeLabel")}
          </label>
          <select
            value={block.buttonShape || "rounded"}
            onChange={(e) => onChange({ buttonShape: e.target.value as BioBlock["buttonShape"] })}
            className="w-full p-3 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          >
            {buttonShapeOptions.map((shape) => (
              <option key={shape} value={shape}>
                {t(`editor.blockStyle.buttonShapes.${shape}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker
          label="Cor de fundo"
          value={block.accent || "#000000"}
          onChange={(val) => onChange({ accent: val })}
        />
        <ColorPicker
          label="Cor do texto"
          value={block.textColor || "#ffffff"}
          onChange={(val) => onChange({ textColor: val })}
        />
      </div>
    </div>
  );
}
