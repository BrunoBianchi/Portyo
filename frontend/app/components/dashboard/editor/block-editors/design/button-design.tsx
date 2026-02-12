import { memo } from "react";
import { Palette, RectangleHorizontal, Sparkles } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorSection, EditorColorField, EditorVisualPicker } from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const buttonStyleOptions = [
  { value: "solid", label: "Sólido" },
  { value: "outline", label: "Contorno" },
  { value: "gradient", label: "Gradiente" },
  { value: "glass", label: "Glass" },
  { value: "neon", label: "Neon" },
  { value: "ghost", label: "Ghost" },
  { value: "hard-shadow", label: "Hard Shadow" },
  { value: "soft-shadow", label: "Soft Shadow" },
  { value: "3d", label: "3D" },
  { value: "neumorphism", label: "Neumorphism" },
  { value: "clay", label: "Clay" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "pixel", label: "Pixel" },
  { value: "sketch", label: "Sketch" },
  { value: "gradient-border", label: "Grad Border" },
  { value: "minimal-underline", label: "Underline" },
  { value: "architect", label: "Architect" },
  { value: "material", label: "Material" },
  { value: "brutalist", label: "Brutalist" },
  { value: "outline-thick", label: "Outline Thick" },
];

const buttonShapeOptions = [
  { value: "pill", label: "Pill", icon: <RectangleHorizontal className="w-4 h-4" /> },
  { value: "rounded", label: "Arredondado", icon: <div className="w-5 h-3 border-2 border-current rounded-md" /> },
  { value: "square", label: "Quadrado", icon: <div className="w-5 h-3 border-2 border-current rounded-sm" /> },
];

export const ButtonDesignEditor = memo(function ButtonDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<Sparkles className="w-3.5 h-3.5" />} title="Estilo do botão">
        {/* Button Style */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider mb-2 ml-0.5 text-black/40">
            Estilo visual
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {buttonStyleOptions.map((opt) => {
              const isActive = (block.buttonStyle || "solid") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate({ buttonStyle: opt.value as any })}
                  className={`px-2 py-2 rounded-lg text-[10px] font-bold border-2 transition-all leading-tight ${
                    isActive
                      ? "border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                      : "border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Button Shape */}
        <EditorVisualPicker
          label="Formato"
          value={block.buttonShape || "rounded"}
          onChange={(v) => onUpdate({ buttonShape: v as any })}
          options={buttonShapeOptions}
          columns={3}
        />
      </EditorSection>

      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Cores" noBorder>
        <div className="grid grid-cols-2 gap-3">
          <EditorColorField
            label="Cor do fundo"
            value={block.accent || "#111827"}
            onChange={(v) => onUpdate({ accent: v })}
          />
          <EditorColorField
            label="Cor do texto"
            value={block.textColor || "#ffffff"}
            onChange={(v) => onUpdate({ textColor: v })}
          />
        </div>
      </EditorSection>
    </div>
  );
});
