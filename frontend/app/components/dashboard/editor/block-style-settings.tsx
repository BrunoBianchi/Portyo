import { useTranslation } from "react-i18next";
import { type BioBlock } from "~/contexts/bio.context";
import { Paintbrush, Box, Sparkles, Palette } from "lucide-react";
import { ColorPicker } from "./ColorPicker";

interface BlockStyleSettingsProps {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

export function BlockStyleSettings({ block, onUpdate }: BlockStyleSettingsProps) {
  const { t } = useTranslation("dashboard");

  const updateBlockStyle = (key: keyof BioBlock, value: any) => {
    onUpdate({ [key]: value });
  };

  const shadowOptions = [
    { value: "none", label: t("editor.blockStyle.shadows.none") },
    { value: "sm", label: t("editor.blockStyle.shadows.sm") },
    { value: "md", label: t("editor.blockStyle.shadows.md") },
    { value: "lg", label: t("editor.blockStyle.shadows.lg") },
    { value: "xl", label: t("editor.blockStyle.shadows.xl") },
    { value: "2xl", label: t("editor.blockStyle.shadows.2xl") },
    { value: "glow", label: t("editor.blockStyle.shadows.glow") },
  ];

  const animationOptions = [
    { value: "none", label: t("editor.blockStyle.animations.none") },
    { value: "fadeIn", label: t("editor.blockStyle.animations.fadeIn") },
    { value: "slideUp", label: t("editor.blockStyle.animations.slideUp") },
    { value: "slideDown", label: t("editor.blockStyle.animations.slideDown") },
    { value: "slideLeft", label: t("editor.blockStyle.animations.slideLeft") },
    { value: "slideRight", label: t("editor.blockStyle.animations.slideRight") },
    { value: "zoomIn", label: t("editor.blockStyle.animations.zoomIn") },
    { value: "bounceIn", label: t("editor.blockStyle.animations.bounceIn") },
    { value: "flipIn", label: t("editor.blockStyle.animations.flipIn") },
  ];

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-black/60 uppercase tracking-wider">
          <Palette className="w-4 h-4" />
          {t("editor.blockStyle.sections.colors")}
        </div>

        {/* Background Color */}
        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label={t("editor.blockStyle.background")}
            value={block.blockBackground || "#FFFFFF"}
            onChange={(value) => updateBlockStyle("blockBackground", value)}
          />

          <ColorPicker
            label={t("editor.blockStyle.textColor")}
            value={block.textColor || "#000000"}
            onChange={(value) => updateBlockStyle("textColor", value)}
          />
        </div>
      </div>

      <div className="h-px bg-black/10" />

      {/* Container Effects Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-black/60 uppercase tracking-wider">
          <Box className="w-4 h-4" />
          {t("editor.blockStyle.sections.container")}
        </div>

        {/* Opacity */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-bold text-black/60">
              {t("editor.blockStyle.opacity")}
            </label>
            <span className="text-xs font-mono text-black/40">
              {block.blockOpacity ?? 100}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={block.blockOpacity ?? 100}
            onChange={(e) => updateBlockStyle("blockOpacity", parseInt(e.target.value))}
            className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#8129D9]"
          />
        </div>

        {/* Border Radius */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-bold text-black/60">
              {t("editor.blockStyle.borderRadius")}
            </label>
            <span className="text-xs font-mono text-black/40">
              {block.blockBorderRadius ?? 12}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={block.blockBorderRadius ?? 12}
            onChange={(e) => updateBlockStyle("blockBorderRadius", parseInt(e.target.value))}
            className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#8129D9]"
          />
        </div>

        {/* Padding */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-bold text-black/60">
              {t("editor.blockStyle.padding")}
            </label>
            <span className="text-xs font-mono text-black/40">
              {block.blockPadding ?? 16}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={block.blockPadding ?? 16}
            onChange={(e) => updateBlockStyle("blockPadding", parseInt(e.target.value))}
            className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#8129D9]"
          />
        </div>
      </div>

      <div className="h-px bg-black/10" />

      {/* Border Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-black/60 uppercase tracking-wider">
          <Paintbrush className="w-4 h-4" />
          {t("editor.blockStyle.sections.border")}
        </div>

        {/* Border Width */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-bold text-black/60">
              {t("editor.blockStyle.borderWidth")}
            </label>
            <span className="text-xs font-mono text-black/40">
              {block.blockBorderWidth ?? 0}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            value={block.blockBorderWidth ?? 0}
            onChange={(e) => updateBlockStyle("blockBorderWidth", parseInt(e.target.value))}
            className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#8129D9]"
          />
        </div>

        {/* Border Color */}
        <ColorPicker
          label={t("editor.blockStyle.borderColor")}
          value={block.blockBorderColor || "#E5E7EB"}
          onChange={(value) => updateBlockStyle("blockBorderColor", value)}
        />
      </div>

      <div className="h-px bg-black/10" />

      {/* Shadow Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-black/60 uppercase tracking-wider">
          <Box className="w-4 h-4" />
          {t("editor.blockStyle.sections.shadow")}
        </div>

        <div>
          <label className="block text-xs font-bold text-black/60 mb-2">
            {t("editor.blockStyle.shadow")}
          </label>
          <select
            value={block.blockShadow || "none"}
            onChange={(e) => updateBlockStyle("blockShadow", e.target.value)}
            className="w-full p-3 bg-white border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#D2E823]"
          >
            {shadowOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {block.blockShadow && block.blockShadow !== "none" && (
          <div>
            <label className="block text-xs font-bold text-black/60 mb-2">
              {t("editor.blockStyle.shadowColor")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.blockShadowColor || "#000000"}
                onChange={(e) => updateBlockStyle("blockShadowColor", e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-black cursor-pointer"
              />
              <input
                type="text"
                value={block.blockShadowColor || "#000000"}
                onChange={(e) => updateBlockStyle("blockShadowColor", e.target.value)}
                className="flex-1 p-2 bg-white border-2 border-black rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#D2E823]"
                placeholder="#000000"
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-black/10" />

      {/* Animation Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-black/60 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          {t("editor.blockStyle.sections.animation")}
        </div>

        <div>
          <label className="block text-xs font-bold text-black/60 mb-2">
            {t("editor.blockStyle.entranceAnimation")}
          </label>
          <select
            value={block.entranceAnimation || "none"}
            onChange={(e) => updateBlockStyle("entranceAnimation", e.target.value)}
            className="w-full p-3 bg-white border-2 border-black rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#D2E823]"
          >
            {animationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {block.entranceAnimation && block.entranceAnimation !== "none" && (
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-black/60">
                {t("editor.blockStyle.entranceDelay")}
              </label>
              <span className="text-xs font-mono text-black/40">
                {block.entranceDelay ?? 0}ms
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={block.entranceDelay ?? 0}
              onChange={(e) => updateBlockStyle("entranceDelay", parseInt(e.target.value))}
              className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#8129D9]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
