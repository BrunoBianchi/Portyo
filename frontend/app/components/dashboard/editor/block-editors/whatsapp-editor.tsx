import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { ColorPicker } from "../ColorPicker";

const whatsappStyleOptions = ["solid", "outline", "gradient", "glass", "neon", "minimal", "soft", "dark"];
const whatsappShapeOptions = ["pill", "rounded", "square"];

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function WhatsAppBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      {/* Button Label */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          Rótulo do botão
        </label>
        <input
          type="text"
          value={block.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder="Ex: Fale comigo no WhatsApp"
        />
      </div>

      {/* WhatsApp Number */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.whatsappNumberLabel")}
        </label>
        <input
          type="text"
          value={block.whatsappNumber || ""}
          onChange={(e) => onChange({ whatsappNumber: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium font-mono text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.whatsappNumberPlaceholder")}
        />
      </div>

      {/* Default Message */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.whatsappMessageLabel")}
        </label>
        <textarea
          value={block.whatsappMessage || ""}
          onChange={(e) => onChange({ whatsappMessage: e.target.value })}
          rows={3}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20 resize-none"
          placeholder={t("editor.editDrawer.fields.whatsappMessagePlaceholder")}
        />
      </div>

      {/* Style & Shape */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
            Estilo
          </label>
          <select
            value={block.whatsappStyle || "solid"}
            onChange={(e) => onChange({ whatsappStyle: e.target.value })}
            className="w-full p-3 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          >
            {whatsappStyleOptions.map((style) => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
            Formato
          </label>
          <select
            value={block.whatsappShape || "pill"}
            onChange={(e) => onChange({ whatsappShape: e.target.value })}
            className="w-full p-3 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          >
            {whatsappShapeOptions.map((shape) => (
              <option key={shape} value={shape}>
                {shape === "pill" ? "Pílula" : shape === "rounded" ? "Arredondado" : "Quadrado"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <ColorPicker
          label="Cor de fundo"
          value={block.accent || "#25D366"}
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
