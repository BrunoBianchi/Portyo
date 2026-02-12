import { memo } from "react";
import {
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorSlider, EditorColorField } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const fontSizeOptions = [
  { value: "14px", label: "14" },
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "20px", label: "20" },
  { value: "24px", label: "24" },
  { value: "28px", label: "28" },
  { value: "32px", label: "32" },
  { value: "40px", label: "40" },
  { value: "48px", label: "48" },
];

const fontWeightOptions = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
];

export const TextDesignEditor = memo(function TextDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<Type className="w-3.5 h-3.5" />} title="Tipografia">
        {/* Alignment */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-0.5 text-black/40">
            Alinhamento
          </label>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(
              [
                { value: "left", icon: AlignLeft },
                { value: "center", icon: AlignCenter },
                { value: "right", icon: AlignRight },
              ] as const
            ).map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdate({ align: value })}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${
                  (block.align || "center") === value
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-0.5 text-black/40">
            Tamanho da fonte
          </label>
          <div className="flex flex-wrap gap-1.5">
            {fontSizeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ fontSize: opt.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                  (block.fontSize || "16px") === opt.value
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-0.5 text-black/40">
            Peso da fonte
          </label>
          <select
            value={block.fontWeight || "500"}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all cursor-pointer"
          >
            {fontWeightOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </EditorSection>

      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Cores" noBorder>
        <EditorColorField
          label="Cor do texto"
          value={block.textColor || "#000000"}
          onChange={(v) => onUpdate({ textColor: v })}
        />
      </EditorSection>
    </div>
  );
});
