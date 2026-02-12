import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Upload, User, Type, Palette, Layers, LayoutGrid, Sparkles } from "lucide-react";
import type { Bio } from "~/types/bio";

interface DesignTabProps {
  bio: Bio | null;
  uploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateBio: (payload: Partial<Bio>) => void;
}

const fontOptions = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
  "Oswald",
  "Raleway",
  "Poppins",
  "Custom",
].map((value) => ({ value, label: value }));

const bgTypeOptions = [
  { value: "color", label: "Cor sólida" },
  { value: "gradient", label: "Gradiente" },
  { value: "gradient-animated", label: "Gradiente animado" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  { value: "grid", label: "Grid" },
  { value: "dots", label: "Dots" },
  { value: "polka", label: "Polka" },
  { value: "stripes", label: "Stripes" },
  { value: "zigzag", label: "Zigzag" },
  { value: "waves", label: "Waves" },
  { value: "mesh", label: "Mesh" },
  { value: "mesh-gradient", label: "Mesh Gradient" },
  { value: "particles", label: "Particles" },
  { value: "particles-float", label: "Particles Float" },
  { value: "noise", label: "Noise" },
  { value: "abstract", label: "Abstract" },
  { value: "geometric", label: "Geometric" },
  { value: "bubbles", label: "Bubbles" },
  { value: "confetti", label: "Confetti" },
  { value: "starfield", label: "Starfield" },
  { value: "rain", label: "Rain" },
  { value: "aurora", label: "Aurora" },
  { value: "blueprint", label: "Blueprint" },
  { value: "marble", label: "Marble" },
  { value: "concrete", label: "Concrete" },
  { value: "terracotta", label: "Terracotta" },
  { value: "wood-grain", label: "Wood Grain" },
  { value: "brick", label: "Brick" },
  { value: "frosted-glass", label: "Frosted Glass" },
  { value: "steel", label: "Steel" },
  { value: "palm-leaves", label: "Palm Leaves" },
  { value: "wheat", label: "Wheat" },
];

const cardStyleOptions = [
  { value: "none", label: "Sem card" },
  { value: "solid", label: "Sólido" },
  { value: "frosted", label: "Frosted" },
];

const imageStyleOptions = [
  { value: "circle", label: "Círculo" },
  { value: "rounded", label: "Rounded" },
  { value: "square", label: "Quadrado" },
  { value: "star", label: "Estrela" },
  { value: "hexagon", label: "Hexágono" },
  { value: "amoeba", label: "Ameba" },
];

const buttonStyleOptions = [
  { value: "solid", label: "Solid" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost" },
  { value: "hard-shadow", label: "Hard Shadow" },
  { value: "soft-shadow", label: "Soft Shadow" },
  { value: "3d", label: "3D" },
  { value: "glass", label: "Glass" },
  { value: "gradient", label: "Gradient" },
  { value: "neumorphism", label: "Neumorphism" },
  { value: "clay", label: "Clay" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "pixel", label: "Pixel" },
  { value: "neon", label: "Neon" },
  { value: "sketch", label: "Sketch" },
  { value: "gradient-border", label: "Gradient Border" },
  { value: "minimal-underline", label: "Minimal Underline" },
  { value: "architect", label: "Architect" },
  { value: "material", label: "Material" },
  { value: "brutalist", label: "Brutalist" },
  { value: "outline-thick", label: "Outline Thick" },
];

const parallaxAxisOptions = [
  { value: "y", label: "Vertical" },
  { value: "x", label: "Horizontal" },
  { value: "xy", label: "Ambos" },
];

const floatingElementsOptions = [
  { value: "circles", label: "Circles" },
  { value: "hearts", label: "Hearts" },
  { value: "fire", label: "Fire" },
  { value: "stars", label: "Stars" },
  { value: "sparkles", label: "Sparkles" },
  { value: "music", label: "Music" },
  { value: "leaves", label: "Leaves" },
  { value: "snow", label: "Snow" },
  { value: "bubbles", label: "Bubbles" },
  { value: "confetti", label: "Confetti" },
  { value: "diamonds", label: "Diamonds" },
  { value: "petals", label: "Petals" },
];

const ProfileImageSection = memo(function ProfileImageSection({
  bio,
  uploadingImage,
  onImageUpload,
}: {
  bio: Bio | null;
  uploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="bg-white border-2 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
        <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
        {t("editor.design.profileImage")}
      </h3>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-black overflow-hidden bg-gray-100">
            {bio?.profileImage ? (
              <img
                src={bio.profileImage}
                alt={t("editor.profileImage")}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8129D9] to-[#7221C4]">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            )}
          </div>
          {uploadingImage && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <label className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#8129D9] text-white rounded-lg sm:rounded-xl font-bold cursor-pointer hover:bg-[#7221C4] transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">{t("editor.design.uploadImage")}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageUpload}
            />
          </label>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2">{t("editor.design.imageHint")}</p>
        </div>
      </div>
    </div>
  );
});

const SectionCard = memo(function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border-2 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-base sm:text-lg mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
});

const TextField = memo(function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full px-3 py-2.5 bg-white border-2 border-gray-200 focus:border-black rounded-lg font-bold text-sm outline-none transition-all"
      />
    </label>
  );
});

const SelectField = memo(function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-3 py-2.5 bg-white border-2 border-gray-200 focus:border-black rounded-lg font-bold text-sm outline-none transition-all"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
});

const ColorField = memo(function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeValue = value || "#000000";
  return (
    <label className="block">
      <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg border-2 border-gray-200 bg-white"
        />
        <input
          type="text"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2.5 bg-white border-2 border-gray-200 focus:border-black rounded-lg font-bold text-sm outline-none transition-all"
          placeholder="#000000"
        />
      </div>
    </label>
  );
});

const ToggleField = memo(function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-2 border-black text-black"
      />
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </label>
  );
});

const RangeField = memo(function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold text-gray-500">{value}{suffix}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="mt-2 w-full accent-black"
      />
    </div>
  );
});
export const DesignTab = memo(function DesignTab({
  bio,
  uploadingImage,
  onImageUpload,
  onUpdateBio,
}: DesignTabProps) {
  const [draft, setDraft] = useState<Bio | null>(bio);

  useEffect(() => {
    setDraft(bio);
  }, [bio]);

  const updateField = useCallback(
    <K extends keyof Bio>(field: K, value: Bio[K]) => {
      setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
      onUpdateBio({ [field]: value } as Partial<Bio>);
    },
    [onUpdateBio]
  );

  const bgType = draft?.bgType || "color";
  const showSecondaryColor = useMemo(
    () => !["color", "image", "video"].includes(bgType),
    [bgType]
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-16 sm:pb-20">
      <ProfileImageSection
        bio={bio}
        uploadingImage={uploadingImage}
        onImageUpload={onImageUpload}
      />
      <SectionCard title="Tipografia" icon={<Type className="w-4 h-4 sm:w-5 sm:h-5" />}>
        <SelectField
          label="Fonte"
          value={draft?.font || "Inter"}
          onChange={(value) => updateField("font", value)}
          options={fontOptions}
        />
        {draft?.font === "Custom" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="URL da fonte"
              value={draft?.customFontUrl || ""}
              onChange={(value) => updateField("customFontUrl", value || undefined)}
              placeholder="https://.../font.woff2"
            />
            <TextField
              label="Nome da fonte"
              value={draft?.customFontName || ""}
              onChange={(value) => updateField("customFontName", value || undefined)}
              placeholder="Minha Fonte"
            />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Fundo" icon={<Palette className="w-4 h-4 sm:w-5 sm:h-5" />}>
        <SelectField
          label="Tipo"
          value={bgType}
          onChange={(value) => updateField("bgType", value)}
          options={bgTypeOptions}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Cor principal"
            value={draft?.bgColor || "#f8fafc"}
            onChange={(value) => updateField("bgColor", value)}
          />
          {showSecondaryColor && (
            <ColorField
              label="Cor secundária"
              value={draft?.bgSecondaryColor || "#e2e8f0"}
              onChange={(value) => updateField("bgSecondaryColor", value)}
            />
          )}
        </div>
        {bgType === "image" && (
          <TextField
            label="URL da imagem"
            value={draft?.bgImage || ""}
            onChange={(value) => updateField("bgImage", value || undefined)}
            placeholder="https://.../background.jpg"
            type="url"
          />
        )}
        {bgType === "video" && (
          <TextField
            label="URL do vídeo"
            value={draft?.bgVideo || ""}
            onChange={(value) => updateField("bgVideo", value || undefined)}
            placeholder="https://.../background.mp4"
            type="url"
          />
        )}
      </SectionCard>

      <SectionCard title="Parallax Effects" icon={<Layers className="w-4 h-4 sm:w-5 sm:h-5" />}>
        <ToggleField
          label="Ativar parallax"
          checked={draft?.enableParallax ?? false}
          onChange={(value) => updateField("enableParallax", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <RangeField
            label="Intensidade"
            value={draft?.parallaxIntensity ?? 50}
            onChange={(value) => updateField("parallaxIntensity", value)}
            min={0}
            max={100}
          />
          <RangeField
            label="Profundidade"
            value={draft?.parallaxDepth ?? 50}
            onChange={(value) => updateField("parallaxDepth", value)}
            min={0}
            max={100}
          />
        </div>
        <SelectField
          label="Eixo"
          value={draft?.parallaxAxis || "y"}
          onChange={(value) => updateField("parallaxAxis", value as Bio["parallaxAxis"])}
          options={parallaxAxisOptions}
        />
      </SectionCard>

      <SectionCard title="Estilo do Card" icon={<LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />}>
        <SelectField
          label="Tipo"
          value={draft?.cardStyle || "none"}
          onChange={(value) => updateField("cardStyle", value as Bio["cardStyle"])}
          options={cardStyleOptions}
        />
        <ColorField
          label="Cor do card"
          value={draft?.cardBackgroundColor || "#ffffff"}
          onChange={(value) => updateField("cardBackgroundColor", value)}
        />
        <RangeField
          label="Opacidade"
          value={draft?.cardOpacity ?? 100}
          onChange={(value) => updateField("cardOpacity", value)}
          min={0}
          max={100}
          suffix="%"
        />
        <RangeField
          label="Blur"
          value={draft?.cardBlur ?? 10}
          onChange={(value) => updateField("cardBlur", value)}
          min={0}
          max={40}
          suffix="px"
        />
      </SectionCard>

      <SectionCard title="Perfil" icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}>
        <ToggleField
          label="Exibir imagem do perfil"
          checked={draft?.displayProfileImage !== false}
          onChange={(value) => updateField("displayProfileImage", value)}
        />
        <SelectField
          label="Estilo da imagem"
          value={draft?.imageStyle || "circle"}
          onChange={(value) => updateField("imageStyle", value)}
          options={imageStyleOptions}
        />
        <ColorField
          label="Cor do nome"
          value={draft?.usernameColor || "#111827"}
          onChange={(value) => updateField("usernameColor", value)}
        />

      </SectionCard>

      <SectionCard title="Recursos" icon={<Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}>
        <ToggleField
          label="Botão de inscrição"
          checked={draft?.enableSubscribeButton ?? false}
          onChange={(value) => updateField("enableSubscribeButton", value)}
        />
        <SelectField
          label="Estilo padrão dos botões"
          value={draft?.buttonStyle || "solid"}
          onChange={(value) => updateField("buttonStyle", value as Bio["buttonStyle"])}
          options={buttonStyleOptions}
        />
        <ToggleField
          label="Elementos flutuantes"
          checked={draft?.floatingElements ?? false}
          onChange={(value) => updateField("floatingElements", value)}
        />
        {draft?.floatingElements && (
          <div className="space-y-4">
            <SelectField
              label="Tipo"
              value={draft?.floatingElementsType || "circles"}
              onChange={(value) => updateField("floatingElementsType", value)}
              options={floatingElementsOptions}
            />
            <ColorField
              label="Cor"
              value={draft?.floatingElementsColor || "#ffffff"}
              onChange={(value) => updateField("floatingElementsColor", value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <RangeField
                label="Densidade"
                value={draft?.floatingElementsDensity ?? 12}
                onChange={(value) => updateField("floatingElementsDensity", value)}
                min={4}
                max={40}
              />
              <RangeField
                label="Tamanho"
                value={draft?.floatingElementsSize ?? 24}
                onChange={(value) => updateField("floatingElementsSize", value)}
                min={8}
                max={80}
                suffix="px"
              />
              <RangeField
                label="Velocidade"
                value={draft?.floatingElementsSpeed ?? 12}
                onChange={(value) => updateField("floatingElementsSpeed", value)}
                min={4}
                max={40}
                suffix="s"
              />
              <RangeField
                label="Opacidade"
                value={draft?.floatingElementsOpacity ?? 0.35}
                onChange={(value) => updateField("floatingElementsOpacity", value)}
                min={0.05}
                max={0.9}
                step={0.05}
              />
            </div>
            <RangeField
              label="Blur"
              value={draft?.floatingElementsBlur ?? 0}
              onChange={(value) => updateField("floatingElementsBlur", value)}
              min={0}
              max={20}
              suffix="px"
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
});
