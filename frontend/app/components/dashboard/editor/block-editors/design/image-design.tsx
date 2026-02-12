import { memo } from "react";
import {
  Palette,
  Image as ImageIcon,
  RotateCw,
  SunDim,
  Contrast,
  Droplets,
  MousePointerClick,
} from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import {
  EditorSection,
  EditorSlider,
  EditorColorField,
  EditorVisualPicker,
  EditorSelect,
} from "../shared/editor-fields";

interface Props {
  block: BioBlock;
  onUpdate: (updates: Partial<BioBlock>) => void;
}

const hoverEffectOptions = [
  { value: "none", label: "Nenhum" },
  { value: "zoom", label: "Zoom" },
  { value: "blur", label: "Blur" },
  { value: "grayscale", label: "Escala cinza" },
  { value: "brightness", label: "Brilho" },
  { value: "rotate", label: "Rotação" },
];

const shadowOptions = [
  { value: "none", label: "Nenhuma" },
  { value: "sm", label: "Pequena" },
  { value: "md", label: "Média" },
  { value: "lg", label: "Grande" },
  { value: "xl", label: "Extra grande" },
];

export const ImageDesignEditor = memo(function ImageDesignEditor({ block, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <EditorSection icon={<ImageIcon className="w-3.5 h-3.5" />} title="Transformações">
        <EditorSlider
          label="Escala"
          value={block.imageScale ?? 100}
          onChange={(v) => onUpdate({ imageScale: v })}
          min={50}
          max={150}
          unit="%"
        />
        <EditorSlider
          label="Rotação"
          value={block.imageRotation ?? 0}
          onChange={(v) => onUpdate({ imageRotation: v })}
          min={-180}
          max={180}
          unit="°"
        />
        <EditorSlider
          label="Arredondamento"
          value={block.imageBorderRadius ?? 0}
          onChange={(v) => onUpdate({ imageBorderRadius: v })}
          min={0}
          max={50}
          unit="%"
        />
      </EditorSection>

      <EditorSection icon={<SunDim className="w-3.5 h-3.5" />} title="Filtros">
        <EditorSlider
          label="Brilho"
          value={block.imageBrightness ?? 100}
          onChange={(v) => onUpdate({ imageBrightness: v })}
          min={0}
          max={200}
          unit="%"
        />
        <EditorSlider
          label="Contraste"
          value={block.imageContrast ?? 100}
          onChange={(v) => onUpdate({ imageContrast: v })}
          min={0}
          max={200}
          unit="%"
        />
        <EditorSlider
          label="Saturação"
          value={block.imageSaturation ?? 100}
          onChange={(v) => onUpdate({ imageSaturation: v })}
          min={0}
          max={200}
          unit="%"
        />
        <EditorSlider
          label="Desfoque"
          value={block.imageBlur ?? 0}
          onChange={(v) => onUpdate({ imageBlur: v })}
          min={0}
          max={20}
          unit="px"
        />
        <EditorSlider
          label="Escala de cinza"
          value={typeof block.imageGrayscale === 'number' ? block.imageGrayscale : 0}
          onChange={(v) => onUpdate({ imageGrayscale: v as any })}
          min={0}
          max={100}
          unit="%"
        />
        <EditorSlider
          label="Sépia"
          value={typeof block.imageSepia === 'number' ? block.imageSepia : 0}
          onChange={(v) => onUpdate({ imageSepia: v as any })}
          min={0}
          max={100}
          unit="%"
        />
      </EditorSection>

      <EditorSection icon={<Palette className="w-3.5 h-3.5" />} title="Borda">
        <EditorSlider
          label="Espessura da borda"
          value={block.imageBorderWidth ?? 0}
          onChange={(v) => onUpdate({ imageBorderWidth: v })}
          min={0}
          max={10}
          unit="px"
        />
        {(block.imageBorderWidth ?? 0) > 0 && (
          <EditorColorField
            label="Cor da borda"
            value={block.imageBorderColor || "#000000"}
            onChange={(v) => onUpdate({ imageBorderColor: v })}
          />
        )}
      </EditorSection>

      <EditorSection icon={<MousePointerClick className="w-3.5 h-3.5" />} title="Sombra e hover" noBorder>
        <EditorSelect
          label="Sombra"
          value={block.imageShadow || "none"}
          onChange={(v) => onUpdate({ imageShadow: v as BioBlock['imageShadow'] })}
          options={shadowOptions}
        />
        <EditorSelect
          label="Efeito hover"
          value={block.imageHoverEffect || "none"}
          onChange={(v) => onUpdate({ imageHoverEffect: v as BioBlock['imageHoverEffect'] })}
          options={hoverEffectOptions}
        />
      </EditorSection>
    </div>
  );
});
