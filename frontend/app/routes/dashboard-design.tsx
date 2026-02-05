import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Upload, User, Paintbrush, Image as ImageIcon, Type, Columns2, Palette, Sparkles, ChevronRight, Check, Play, Grid3X3, Footprints, Pencil, X } from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import { useContext } from "react";
import type { Bio } from "../types/bio";
import { blocksToHtml } from "~/services/html-generator";

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

// Visual option picker component
const VisualOptionPicker = memo(function VisualOptionPicker({
  label,
  options,
  value,
  onChange,
  columns = 4,
}: {
  label: string;
  options: Array<{ value: string; label: string; icon?: React.ReactNode; preview?: React.ReactNode }>;
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-gray-700 block mb-3">{label}</span>
      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${isActive
                ? "border-gray-900 bg-gray-50"
                : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="mb-2">
                {option.preview || option.icon || (
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                )}
              </div>
              <span className="text-xs font-medium text-gray-600">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// Color picker with hex input
const ColorPicker = memo(function ColorPicker({
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
    <div>
      <span className="text-sm font-semibold text-gray-700 block mb-3">{label}</span>
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
        <input
          type="text"
          value={safeValue.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm font-medium text-gray-700 bg-transparent outline-none"
          placeholder="#000000"
        />
        <input
          type="color"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer bg-transparent"
          style={{ padding: 0 }}
        />
      </div>
    </div>
  );
});

// Simple select field
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
    <div>
      <span className="text-sm font-semibold text-gray-700 block mb-3">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-gray-400 rounded-xl text-sm font-medium outline-none transition-all"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

// Toggle switch
const ToggleSwitch = memo(function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors ${checked ? "bg-gray-900" : "bg-gray-200"
          }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
});

// Text input field
const TextField = memo(function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-gray-700 block mb-3">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-gray-400 rounded-xl text-sm font-medium outline-none transition-all"
      />
    </div>
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-xs font-bold text-gray-500">{value}{suffix}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gray-900"
      />
    </div>
  );
});

// Preview card component
const PreviewCard = memo(function PreviewCard({ bio }: { bio: Bio | null }) {
  const bgColor = bio?.bgColor || "#ECEEF1";
  const buttonStyle = bio?.buttonStyle || "solid";
  const buttonRadius = bio?.buttonRadius || "rounder";

  return (
    <div className="sticky top-8">
      <div className="w-[280px] rounded-[32px] bg-[#f5f5f5] p-6 shadow-xl border border-gray-200">
        <div className="w-full h-[480px] rounded-[24px] border border-gray-200 bg-white overflow-hidden">
          <div className="h-full w-full" style={{ background: bgColor }}>
            <div className="p-6 flex flex-col items-center gap-4">
              {/* Profile */}
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {bio?.profileImage ? (
                  <img src={bio.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="text-sm font-bold text-gray-900">
                @{bio?.sufix || "username"}
              </div>
              {/* Sample buttons */}
              <div className="w-full mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-full py-3 px-4 text-center text-sm font-medium ${buttonStyle === "solid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : buttonStyle === "outline"
                        ? "bg-transparent border-2 border-white text-white"
                        : "bg-white/20 backdrop-blur text-white"
                      } ${buttonRadius === "square"
                        ? "rounded-none"
                        : buttonRadius === "round"
                          ? "rounded-lg"
                          : buttonRadius === "rounder"
                            ? "rounded-2xl"
                            : "rounded-full"
                      }`}
                  >
                    Seu link aqui
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400">
          Junte-se a @{bio?.sufix || "username"} no Portyo
        </div>
      </div>
    </div>
  );
});

// Theme card component with rich visual preview
const ThemeCard = memo(function ThemeCard({
  theme,
  isActive,
  onClick,
}: {
  theme: {
    id: string;
    name: string;
    bgColor: string;
    textColor: string;
    accentColor?: string;
    pattern?: 'dots' | 'grid' | 'stripes' | 'waves';
    style?: 'minimal' | 'bold' | 'gradient' | 'dark' | 'typography';
    isPro?: boolean;
    gradient?: string;
    bgType?: Bio["bgType"];
    bgImage?: string;
  };
  isActive: boolean;
  onClick: () => void;
}) {
  const getPatternStyle = (): React.CSSProperties => {
    switch (theme.pattern) {
      case 'dots':
        return { backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.textColor}20 2px, transparent 0)`, backgroundSize: '14px 14px' };
      case 'grid':
        return { backgroundImage: `linear-gradient(${theme.textColor}10 1px, transparent 1px), linear-gradient(90deg, ${theme.textColor}10 1px, transparent 1px)`, backgroundSize: '20px 20px' };
      case 'stripes':
        return { backgroundImage: `repeating-linear-gradient(45deg, ${theme.textColor}08 0px, ${theme.textColor}08 2px, transparent 2px, transparent 10px)` };
      default:
        return {};
    }
  };

  const bgStyle: React.CSSProperties = theme.bgImage
    ? { backgroundImage: `url(${theme.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', ...getPatternStyle() }
    : theme.gradient
      ? { background: theme.gradient, ...getPatternStyle() }
      : { background: theme.bgColor, ...getPatternStyle() };

  return (
    <button
      onClick={onClick}
      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all group hover:shadow-xl hover:-translate-y-1 ${isActive ? "border-[#c8e600] ring-4 ring-[#c8e600]/20 shadow-lg" : "border-gray-200 hover:border-gray-300"
        }`}
      style={bgStyle}
    >
      {/* Pro badge */}
      {theme.isPro && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#c8e600] rounded-full flex items-center justify-center z-10 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-black" />
        </div>
      )}

      {/* Active check */}
      {isActive && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-[#c8e600] rounded-full flex items-center justify-center z-10 shadow-md">
          <Check className="w-3.5 h-3.5 text-black" />
        </div>
      )}

      {/* Preview content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
        {theme.style === 'minimal' ? (
          <div className="w-10 h-10 rounded-full border-2 border-dashed" style={{ borderColor: theme.textColor + '40' }} />
        ) : (
          <>
            {/* Typography sample */}
            <div
              className="text-4xl font-bold transition-transform group-hover:scale-110"
              style={{ color: theme.textColor }}
            >
              Aa
            </div>
            {/* Accent bar */}
            {theme.accentColor && (
              <div
                className="w-14 h-4 rounded-full mt-3 shadow-sm"
                style={{ background: theme.accentColor }}
              />
            )}
          </>
        )}
      </div>

      {/* Name label */}
      <div className="absolute bottom-0 left-0 right-0 py-2.5 px-3 text-center bg-gradient-to-t from-black/20 to-transparent">
        <span
          className="text-xs font-semibold"
          style={{ color: theme.textColor }}
        >
          {theme.name}
        </span>
      </div>
    </button>
  );
});


export default function DashboardDesign() {
  const { bio: contextBio, updateBio } = useContext(BioContext);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation("dashboard");
  const [activeSection, setActiveSection] = useState("header");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [wallpaperPopup, setWallpaperPopup] = useState<string | null>(null);
  const [draftBio, setDraftBio] = useState<Bio | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const pendingPayloadRef = useRef<Partial<Bio>>({});
  const pendingBioRef = useRef<Bio | null>(null);
  const bio = draftBio ?? contextBio;

  const commitUpdates = useCallback(async () => {
    if (!contextBio) return;
    const payload = pendingPayloadRef.current;
    pendingPayloadRef.current = {};

    const nextBio = pendingBioRef.current || { ...contextBio, ...payload };
    try {
      const html = await blocksToHtml(nextBio.blocks || [], user, nextBio);
      await updateBio(contextBio.id, { ...payload, html });
    } catch (error) {
      console.error("Design update failed:", error);
    }
  }, [contextBio, updateBio, user]);

  const scheduleCommit = useCallback((delay: number) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(commitUpdates, delay);
  }, [commitUpdates]);

  const updateField = useCallback(
    <K extends keyof Bio>(field: K, value: Bio[K]) => {
      if (!contextBio) return;
      pendingPayloadRef.current = { ...pendingPayloadRef.current, [field]: value } as Partial<Bio>;
      setDraftBio((prev) => {
        const base = prev ?? contextBio;
        const next = { ...base, [field]: value } as Bio;
        pendingBioRef.current = next;
        return next;
      });
      scheduleCommit(350);
    },
    [contextBio, scheduleCommit]
  );

  const updateRangeField = useCallback(
    <K extends keyof Bio>(field: K, value: Bio[K]) => {
      if (!contextBio) return;
      pendingPayloadRef.current = { ...pendingPayloadRef.current, [field]: value } as Partial<Bio>;
      setDraftBio((prev) => {
        const base = prev ?? contextBio;
        const next = { ...base, [field]: value } as Bio;
        pendingBioRef.current = next;
        return next;
      });
      scheduleCommit(650);
    },
    [contextBio, scheduleCommit]
  );

  const updateFields = useCallback((payload: Partial<Bio>) => {
    if (!contextBio) return;
    pendingPayloadRef.current = { ...pendingPayloadRef.current, ...payload };
    setDraftBio((prev) => {
      const base = prev ?? contextBio;
      const next = { ...base, ...payload } as Bio;
      pendingBioRef.current = next;
      return next;
    });
    scheduleCommit(350);
  }, [contextBio, scheduleCommit]);

  useEffect(() => {
    setDraftBio(contextBio);
  }, [contextBio]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contextBio) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("bioId", contextBio.id);

    try {
      const response = await api.post(`/user/upload-bio-logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = response.data?.url || response.data?.medium;
      if (imageUrl) {
        await updateBio(contextBio.id, { profileImage: imageUrl });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploadingImage(false);
    }
  }, [contextBio, updateBio]);

  const sections = useMemo(
    () => [
      { key: "header", label: "Header", icon: Camera },
      { key: "theme", label: "Theme", icon: Paintbrush },
      { key: "wallpaper", label: "Wallpaper", icon: ImageIcon },
      { key: "text", label: "Text", icon: Type },
      { key: "buttons", label: "Buttons", icon: Columns2 },
      { key: "colors", label: "Colors", icon: Palette },
      { key: "footer", label: "Footer", icon: Footprints },
    ],
    []
  );

  // Theme presets with beautiful visual styles
  type ThemePreset = {
    id: string;
    name: string;
    bgColor: string;
    textColor: string;
    accentColor?: string;
    pattern?: 'dots' | 'grid' | 'stripes' | 'waves';
    style?: 'minimal' | 'bold' | 'gradient' | 'dark' | 'typography';
    isPro?: boolean;
    gradient?: string;
    bgType?: Bio["bgType"];
    bgImage?: string;
  };

  const themes: ThemePreset[] = [
    { id: "custom", name: "Custom", bgColor: "#ffffff", textColor: "#000000", style: 'minimal' as const },
    { id: "agate", name: "Agate", bgColor: "#10b981", textColor: "#ffffff", accentColor: "#c8e600", gradient: "linear-gradient(135deg, #10b981 0%, #c8e600 100%)", isPro: true },
    { id: "air", name: "Air", bgColor: "#ffffff", textColor: "#1a1a1a", pattern: 'dots' as const },
    { id: "astrid", name: "Astrid", bgColor: "#1a1a1a", textColor: "#ffffff", pattern: 'grid' as const },
    { id: "aura", name: "Aura", bgColor: "#f5f5f4", textColor: "#44403c", gradient: "linear-gradient(180deg, #ffffff 0%, #e7e5e4 100%)" },
    { id: "bliss", name: "Bliss", bgColor: "#fef3c7", textColor: "#92400e", accentColor: "#f59e0b", gradient: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)" },
    { id: "blocks", name: "Blocks", bgColor: "#fce7f3", textColor: "#9d174d", accentColor: "#ec4899", gradient: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 50%, #ec4899 100%)" },
    { id: "bloom", name: "Bloom", bgColor: "#eef2ff", textColor: "#4338ca", accentColor: "#6366f1", gradient: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 50%, #818cf8 100%)" },
    { id: "breeze", name: "Breeze", bgColor: "#ecfeff", textColor: "#0e7490", accentColor: "#06b6d4", gradient: "linear-gradient(135deg, #ecfeff 0%, #a5f3fc 100%)" },
    { id: "encore", name: "Encore", bgColor: "#fff7ed", textColor: "#9a3412", accentColor: "#f97316", gradient: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fb923c 100%)" },
    { id: "grid", name: "Grid", bgColor: "#18181b", textColor: "#fafafa", pattern: 'grid' as const },
    { id: "groove", name: "Groove", bgColor: "#450a0a", textColor: "#fecaca", accentColor: "#ef4444", gradient: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 50%, #1f2937 100%)" },
    { id: "noir-noise", name: "Noir Noise", bgColor: "#0f0f12", textColor: "#f8fafc", accentColor: "#9ca3af", bgType: "noise" },
    { id: "studio-concrete", name: "Studio Concrete", bgColor: "#9ca3af", textColor: "#111827", accentColor: "#e5e7eb", bgType: "concrete" },
    { id: "aurora-pro", name: "Aurora Pro", bgColor: "#0f172a", textColor: "#e2e8f0", accentColor: "#22d3ee", bgType: "aurora" },
    { id: "mesh-violet", name: "Mesh Violet", bgColor: "#7c3aed", textColor: "#f8fafc", accentColor: "#f472b6", bgType: "mesh-gradient" },
    { id: "marble-classic", name: "Marble", bgColor: "#f5f5f5", textColor: "#111827", accentColor: "#e2e8f0", bgType: "marble" },
    { id: "blueprint", name: "Blueprint", bgColor: "#1e3a5f", textColor: "#e2e8f0", accentColor: "#38bdf8", bgType: "blueprint" },
    { id: "confetti", name: "Confetti", bgColor: "#fff7ed", textColor: "#7c2d12", accentColor: "#f97316", bgType: "confetti" },
    { id: "starfield", name: "Starfield", bgColor: "#0b1020", textColor: "#e5e7eb", accentColor: "#93c5fd", bgType: "starfield" },
    { id: "wheat", name: "Wheat", bgColor: "#fef3c7", textColor: "#92400e", accentColor: "#f59e0b", bgType: "wheat" },
    // New themes with image backgrounds from /public/themes
    { id: "ocean-wave", name: "Ocean Wave", bgColor: "#1a4d5c", textColor: "#ffffff", accentColor: "#4ecdc4", bgType: "image", bgImage: "/themes/blue-green.png", isPro: true },
    { id: "deep-blue", name: "Deep Blue", bgColor: "#0a2f5c", textColor: "#ffffff", accentColor: "#2d6cb3", bgType: "image", bgImage: "/themes/blue.png", isPro: true },
    { id: "orange-noise", name: "Orange Noise", bgColor: "#d96b2f", textColor: "#ffffff", accentColor: "#f0a968", bgType: "image", bgImage: "/themes/orange-noise.png", isPro: true },
    { id: "geometric-orange", name: "Geometric Orange", bgColor: "#d65c28", textColor: "#d65c28", accentColor: "#e87a45", bgType: "image", bgImage: "/themes/quadricular-orange.png", isPro: true },
    { id: "sunset-glow", name: "Sunset Glow", bgColor: "#e84855", textColor: "#ffffff", accentColor: "#f5a961", bgType: "image", bgImage: "/themes/red-pink-orange.png", isPro: true },
    { id: "light-spectrum", name: "Light Spectrum", bgColor: "#f0f5fa", textColor: "#2a4a66", accentColor: "#5a8db8", bgType: "image", bgImage: "/themes/white-blue-orange.jpg", isPro: true },
  ];


  // Button style options with visual previews
  const buttonStyleOptions = [
    {
      value: "solid", label: "Solid", preview: (
        <div className="w-16 h-8 bg-gray-800 rounded-lg" />
      )
    },
    {
      value: "glass", label: "Glass", preview: (
        <div className="w-16 h-8 bg-gray-300/50 backdrop-blur border border-gray-400 rounded-lg" />
      )
    },
    {
      value: "outline", label: "Outline", preview: (
        <div className="w-16 h-8 bg-transparent border-2 border-gray-800 rounded-lg" />
      )
    },
  ];

  // Corner roundness options
  const cornerOptions = [
    {
      value: "square", label: "Square", preview: (
        <div className="w-12 h-12 border-2 border-gray-300 rounded-none flex items-end justify-start p-1">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-400" />
        </div>
      )
    },
    {
      value: "round", label: "Round", preview: (
        <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-end justify-start p-1">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-400 rounded-bl" />
        </div>
      )
    },
    {
      value: "rounder", label: "Rounder", preview: (
        <div className="w-12 h-12 border-2 border-gray-800 bg-gray-50 rounded-2xl flex items-end justify-start p-1">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-400 rounded-bl-lg" />
        </div>
      )
    },
    {
      value: "full", label: "Full", preview: (
        <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center">
          <div className="w-6 h-3 border-2 border-gray-400 rounded-full" />
        </div>
      )
    },
  ];

  // Button shadow options
  const shadowOptions = [
    { value: "none", label: "None" },
    { value: "soft", label: "Soft" },
    { value: "strong", label: "Strong" },
    { value: "hard", label: "Hard" },
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

  // Wallpaper style options
  const wallpaperStyleOptions = [
    {
      value: "color", label: "Fill", preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg border-2 border-gray-300" />
      )
    },
    {
      value: "gradient", label: "Gradient", preview: (
        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg" />
      )
    },
    {
      value: "blur", label: "Blur", preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg blur-sm" />
      )
    },
    {
      value: "pattern", label: "Pattern", preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg grid grid-cols-3 gap-0.5 p-1">
          {[...Array(9)].map((_, i) => <div key={i} className="bg-gray-400 rounded-sm" />)}
        </div>
      )
    },
    {
      value: "image", label: "Image", preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <ImageIcon className="w-5 h-5 text-gray-400" />
        </div>
      )
    },
    {
      value: "video", label: "Video", preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <Play className="w-5 h-5 text-gray-400" />
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900">Design</h1>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50 transition-colors">
            <Sparkles className="w-4 h-4" />
            Enhance
          </button>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr_320px] gap-8 h-[calc(100vh-140px)]">
          {/* Sidebar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 h-fit sticky top-8">
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const active = activeSection === section.key;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                      ? "bg-[#c8e600]/15 text-gray-900 border-l-2 border-[#c8e600] -ml-0.5"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header Section */}
            {activeSection === "header" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Header</h2>

                {/* Profile Image with Edit Button */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                    {bio?.profileImage ? (
                      <img src={bio.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white/70" />
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-semibold cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <Pencil className="w-4 h-4" />
                    Edit
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                {/* Profile Image Layout */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">Profile image layout</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateField("profileImageLayout", "classic")}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${bio?.profileImageLayout !== "hero"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Classic</span>
                    </button>
                    <button
                      onClick={() => updateField("profileImageLayout", "hero")}
                      className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${bio?.profileImageLayout === "hero"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="w-8 h-8 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-2">
                        <div className="w-4 h-4 border border-dashed border-gray-400 rounded flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Hero</span>
                      <div className="absolute top-2 right-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-gray-500" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">Title</span>
                  <input
                    type="text"
                    value={`@${bio?.sufix || "username"}`}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:border-gray-300"
                  />
                </div>

                {/* Title Style */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">Title style</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateField("titleStyle", "text")}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${bio?.titleStyle !== "logo"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="text-2xl font-bold text-gray-700 mb-2">Aa</div>
                      <span className="text-sm font-semibold text-gray-700">Text</span>
                    </button>
                    <button
                      onClick={() => updateField("titleStyle", "logo")}
                      className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${bio?.titleStyle === "logo"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm font-semibold text-gray-700">Logo</span>
                      <div className="absolute top-2 right-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-gray-500" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Size */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">Size</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateField("profileImageSize", "small")}
                      className={`flex items-center justify-center py-2.5 rounded-xl border-2 transition-all hover:shadow-md ${(bio?.profileImageSize || "small") === "small"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <span className="text-sm font-semibold text-gray-700">Small</span>
                    </button>
                    <button
                      onClick={() => updateField("profileImageSize", "large")}
                      className={`relative flex items-center justify-center py-2.5 rounded-xl border-2 transition-all hover:shadow-md ${(bio?.profileImageSize || "small") === "large"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <span className="text-sm font-semibold text-gray-700">Large</span>
                      <div className="absolute top-2 right-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-gray-500" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Title Font */}
                <div className="mb-6">
                  <SelectField
                    label="Title font"
                    value={bio?.font || "Inter"}
                    options={[
                      { value: "Inter", label: "Inter" },
                      { value: "Roboto", label: "Roboto" },
                      { value: "Poppins", label: "Poppins" },
                      { value: "Montserrat", label: "Montserrat" },
                      { value: "Playfair Display", label: "Playfair Display" },
                      { value: "Outfit", label: "Outfit" },
                      { value: "Space Grotesk", label: "Space Grotesk" },
                    ]}
                    onChange={(value) => updateField("font", value)}
                  />
                </div>

                {/* Title Font Color */}
                <div className="mb-6">
                  <ColorPicker
                    label="Title font color"
                    value={bio?.usernameColor || "#000000"}
                    onChange={(value) => updateField("usernameColor", value)}
                  />
                </div>

                {/* Verification Section */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Verification</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Show that you're the real deal, and help visitors feel more confident engaging with your content.
                  </p>
                  <button className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-[#c8e600] flex items-center justify-center">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                    Get verified
                  </button>
                </div>
              </div>
            )}

            {/* Theme Section */}
            {activeSection === "theme" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Theme</h2>

                <div className="flex gap-4 mb-6">
                  <button className="px-4 py-2 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
                    Customizable
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600">
                    Curated
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {themes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isActive={bio?.bgColor === theme.bgColor}
                      onClick={() => {
                        const nextBgType: Bio["bgType"] = theme.bgType
                          ? theme.bgType
                          : theme.gradient
                            ? "gradient"
                            : theme.pattern
                              ? theme.pattern
                              : (bio?.bgType || "color");

                        updateFields({
                          theme: theme.id,
                          bgColor: theme.bgColor,
                          bgType: nextBgType,
                          bgSecondaryColor: theme.accentColor || bio?.bgSecondaryColor,
                          usernameColor: theme.textColor,
                          cardBackgroundColor: theme.accentColor || bio?.cardBackgroundColor,
                          ...(theme.bgImage && { bgImage: theme.bgImage }),
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Wallpaper Section */}
            {activeSection === "wallpaper" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Wallpaper</h2>

                {/* Wallpaper Style Grid */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">Wallpaper style</span>
                  <div className="grid grid-cols-4 gap-3">
                    {wallpaperStyleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateField("bgType", option.value as Bio["bgType"]);
                          // Open popup for styles that need configuration
                          if (["gradient", "blur", "pattern", "image", "video"].includes(option.value)) {
                            setWallpaperPopup(option.value);
                          }
                        }}
                        className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${bio?.bgType === option.value
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        {option.preview}
                        <span className="text-xs font-medium text-gray-600 mt-2">{option.label}</span>
                        {bio?.bgType === option.value && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Color Picker - Always visible */}
                <div className="mt-6">
                  <ColorPicker
                    label="Background color"
                    value={bio?.bgColor || "#ECEEF1"}
                    onChange={(value) => updateField("bgColor", value)}
                  />
                </div>

                {/* Secondary Color for Gradient */}
                {bio?.bgType === "gradient" && (
                  <div className="mt-4">
                    <ColorPicker
                      label="Secondary color"
                      value={bio?.bgSecondaryColor || "#000000"}
                      onChange={(value) => updateField("bgSecondaryColor", value)}
                    />
                  </div>
                )}

                {/* Image URL */}
                {bio?.bgType === "image" && (
                  <div className="mt-4">
                    <TextField
                      label="Image URL"
                      value={bio?.bgImage || ""}
                      onChange={(value) => updateField("bgImage", value || undefined)}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {/* Video URL */}
                {bio?.bgType === "video" && (
                  <div className="mt-4">
                    <TextField
                      label="Video URL"
                      value={bio?.bgVideo || ""}
                      onChange={(value) => updateField("bgVideo", value || undefined)}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {/* Popup Modals */}
                {wallpaperPopup && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setWallpaperPopup(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 capitalize">
                          {wallpaperPopup} Settings
                        </h3>
                        <button
                          onClick={() => setWallpaperPopup(null)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      {/* Gradient Settings */}
                      {wallpaperPopup === "gradient" && (
                        <div className="space-y-4">
                          <ColorPicker
                            label="Primary color"
                            value={bio?.bgColor || "#FFFFFF"}
                            onChange={(value) => updateField("bgColor", value)}
                          />
                          <ColorPicker
                            label="Secondary color"
                            value={bio?.bgSecondaryColor || "#000000"}
                            onChange={(value) => updateField("bgSecondaryColor", value)}
                          />
                          <SelectField
                            label="Direction"
                            value={bio?.gradientDirection || "to-br"}
                            onChange={(value) => updateField("gradientDirection", value)}
                            options={[
                              { value: "to-r", label: "Left to Right" },
                              { value: "to-l", label: "Right to Left" },
                              { value: "to-b", label: "Top to Bottom" },
                              { value: "to-t", label: "Bottom to Top" },
                              { value: "to-br", label: "Diagonal ↘" },
                              { value: "to-bl", label: "Diagonal ↙" },
                              { value: "to-tr", label: "Diagonal ↗" },
                              { value: "to-tl", label: "Diagonal ↖" },
                            ]}
                          />
                        </div>
                      )}

                      {/* Blur Settings */}
                      {wallpaperPopup === "blur" && (
                        <div className="space-y-4">
                          <ColorPicker
                            label="Background color"
                            value={bio?.bgColor || "#FFFFFF"}
                            onChange={(value) => updateField("bgColor", value)}
                          />
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Blur intensity</label>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={bio?.blurIntensity || 10}
                              onChange={(e) => updateRangeField("blurIntensity", parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>None</span>
                              <span>Max</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pattern Settings */}
                      {wallpaperPopup === "pattern" && (
                        <div className="space-y-4">
                          <ColorPicker
                            label="Background color"
                            value={bio?.bgColor || "#FFFFFF"}
                            onChange={(value) => updateField("bgColor", value)}
                          />
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-3">Pattern type</label>
                            <div className="grid grid-cols-3 gap-2">
                              {["dots", "grid", "stripes", "waves", "circles", "triangles"].map((pattern) => (
                                <button
                                  key={pattern}
                                  onClick={() => updateField("patternType", pattern)}
                                  className={`p-3 rounded-lg border-2 transition-all text-xs font-medium capitalize ${bio?.patternType === pattern
                                      ? "border-gray-900 bg-gray-50"
                                      : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                  {pattern}
                                </button>
                              ))}
                            </div>
                          </div>
                          <ColorPicker
                            label="Pattern color"
                            value={bio?.patternColor || "#000000"}
                            onChange={(value) => updateField("patternColor", value)}
                          />
                        </div>
                      )}

                      {/* Image Settings */}
                      {wallpaperPopup === "image" && (
                        <div className="space-y-4">
                          <TextField
                            label="Image URL"
                            value={bio?.bgImage || ""}
                            onChange={(value) => updateField("bgImage", value || undefined)}
                            placeholder="https://..."
                          />
                          <SelectField
                            label="Image fit"
                            value={bio?.bgImageFit || "cover"}
                            onChange={(value) => updateField("bgImageFit", value as Bio["bgImageFit"])}
                            options={[
                              { value: "cover", label: "Cover (fill)" },
                              { value: "contain", label: "Contain (fit)" },
                              { value: "repeat", label: "Repeat (tile)" },
                            ]}
                          />
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Overlay opacity</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={bio?.bgImageOverlay || 0}
                              onChange={(e) => updateRangeField("bgImageOverlay", parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Video Settings */}
                      {wallpaperPopup === "video" && (
                        <div className="space-y-4">
                          <TextField
                            label="Video URL"
                            value={bio?.bgVideo || ""}
                            onChange={(value) => updateField("bgVideo", value || undefined)}
                            placeholder="https://..."
                          />
                          <ToggleSwitch
                            label="Loop video"
                            checked={bio?.bgVideoLoop !== false}
                            onChange={(value) => updateField("bgVideoLoop", value)}
                          />
                          <ToggleSwitch
                            label="Mute audio"
                            checked={bio?.bgVideoMuted !== false}
                            onChange={(value) => updateField("bgVideoMuted", value)}
                          />
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Overlay opacity</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={bio?.bgVideoOverlay || 0}
                              onChange={(e) => updateRangeField("bgVideoOverlay", parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {/* Apply Button */}
                      <button
                        onClick={() => setWallpaperPopup(null)}
                        className="w-full mt-6 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text Section */}
            {activeSection === "text" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Text</h2>

                <div className="space-y-6">
                  <SelectField
                    label="Page text font"
                    value={bio?.font || "Inter"}
                    onChange={(value) => updateField("font", value)}
                    options={fontOptions}
                  />

                  <ColorPicker
                    label="Page text color"
                    value={bio?.usernameColor || "#000000"}
                    onChange={(value) => updateField("usernameColor", value)}
                  />

                  <SelectField
                    label="Title font"
                    value={bio?.font || "Inter"}
                    onChange={(value) => updateField("font", value)}
                    options={fontOptions}
                  />

                  <ColorPicker
                    label="Title font color"
                    value={bio?.usernameColor || "#000000"}
                    onChange={(value) => updateField("usernameColor", value)}
                  />
                </div>
              </div>
            )}

            {/* Buttons Section */}
            {activeSection === "buttons" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Buttons</h2>

                <div className="space-y-8">
                  <VisualOptionPicker
                    label="Button style"
                    options={buttonStyleOptions}
                    value={bio?.buttonStyle || "solid"}
                    onChange={(value) => updateField("buttonStyle", value as Bio["buttonStyle"])}
                    columns={3}
                  />

                  <VisualOptionPicker
                    label="Corner roundness"
                    options={cornerOptions}
                    value={bio?.buttonRadius || "rounder"}
                    onChange={(value) => updateField("buttonRadius", value)}
                    columns={4}
                  />

                  <VisualOptionPicker
                    label="Button shadow"
                    options={shadowOptions}
                    value={bio?.buttonShadow || "none"}
                    onChange={(value) => updateField("buttonShadow", value)}
                    columns={4}
                  />

                  <ColorPicker
                    label="Button color"
                    value={bio?.buttonColor || "#FFFFFF"}
                    onChange={(value) => updateField("buttonColor", value)}
                  />

                  <ColorPicker
                    label="Button text color"
                    value={bio?.buttonTextColor || "#000000"}
                    onChange={(value) => updateField("buttonTextColor", value)}
                  />
                </div>
              </div>
            )}

            {/* Colors Section */}
            {activeSection === "colors" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Colors</h2>

                <div className="space-y-6">
                  <ColorPicker
                    label="Background"
                    value={bio?.bgColor || "#ECEEF1"}
                    onChange={(value) => updateField("bgColor", value)}
                  />

                  <ColorPicker
                    label="Card background"
                    value={bio?.cardBackgroundColor || "#ffffff"}
                    onChange={(value) => updateField("cardBackgroundColor", value)}
                  />

                  <ColorPicker
                    label="Title text"
                    value={bio?.usernameColor || "#000000"}
                    onChange={(value) => updateField("usernameColor", value)}
                  />

                  <ColorPicker
                    label="Button color"
                    value={bio?.buttonColor || "#ffffff"}
                    onChange={(value) => updateField("buttonColor", value)}
                  />

                  <ColorPicker
                    label="Button text"
                    value={bio?.buttonTextColor || "#000000"}
                    onChange={(value) => updateField("buttonTextColor", value)}
                  />
                </div>
              </div>
            )}

            {/* Footer Section */}
            {activeSection === "footer" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Footer</h2>

                <div className="space-y-6">
                  <ToggleSwitch
                    label="Hide Portyo footer"
                    checked={bio?.removeBranding ?? false}
                    onChange={(value) => updateField("removeBranding", value)}
                  />

                  <ToggleSwitch
                    label="Enable subscribe button"
                    checked={bio?.enableSubscribeButton ?? false}
                    onChange={(value) => updateField("enableSubscribeButton", value)}
                  />

                  <ToggleSwitch
                    label="Enable parallax effect"
                    checked={bio?.enableParallax ?? false}
                    onChange={(value) => updateField("enableParallax", value)}
                  />

                  {bio?.enableParallax && (
                    <div className="ml-2 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <RangeField
                        label="Intensidade"
                        value={bio?.parallaxIntensity ?? 50}
                        onChange={(value) => updateRangeField("parallaxIntensity", value)}
                        min={0}
                        max={100}
                      />
                      <RangeField
                        label="Profundidade"
                        value={bio?.parallaxDepth ?? 50}
                        onChange={(value) => updateRangeField("parallaxDepth", value)}
                        min={0}
                        max={100}
                      />
                      <SelectField
                        label="Eixo"
                        value={bio?.parallaxAxis || "y"}
                        onChange={(value) => updateField("parallaxAxis", value as Bio["parallaxAxis"])}
                        options={parallaxAxisOptions}
                      />
                    </div>
                  )}

                  <ToggleSwitch
                    label="Floating elements"
                    checked={bio?.floatingElements ?? false}
                    onChange={(value) => updateField("floatingElements", value)}
                  />

                  {bio?.floatingElements && (
                    <div className="ml-2 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <SelectField
                        label="Tipo"
                        value={bio?.floatingElementsType || "circles"}
                        onChange={(value) => updateField("floatingElementsType", value)}
                        options={floatingElementsOptions}
                      />
                      <ColorPicker
                        label="Cor"
                        value={bio?.floatingElementsColor || "#ffffff"}
                        onChange={(value) => updateField("floatingElementsColor", value)}
                      />
                      <RangeField
                        label="Densidade"
                        value={bio?.floatingElementsDensity ?? 12}
                        onChange={(value) => updateRangeField("floatingElementsDensity", value)}
                        min={4}
                        max={40}
                      />
                      <RangeField
                        label="Tamanho"
                        value={bio?.floatingElementsSize ?? 24}
                        onChange={(value) => updateRangeField("floatingElementsSize", value)}
                        min={8}
                        max={80}
                        suffix="px"
                      />
                      <RangeField
                        label="Velocidade"
                        value={bio?.floatingElementsSpeed ?? 12}
                        onChange={(value) => updateRangeField("floatingElementsSpeed", value)}
                        min={4}
                        max={40}
                        suffix="s"
                      />
                      <RangeField
                        label="Opacidade"
                        value={bio?.floatingElementsOpacity ?? 0.35}
                        onChange={(value) => updateRangeField("floatingElementsOpacity", value)}
                        min={0.05}
                        max={0.9}
                        step={0.05}
                      />
                      <RangeField
                        label="Blur"
                        value={bio?.floatingElementsBlur ?? 0}
                        onChange={(value) => updateRangeField("floatingElementsBlur", value)}
                        min={0}
                        max={20}
                        suffix="px"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="hidden lg:block sticky top-8 h-fit">
            <PreviewCard bio={bio} />
          </div>
        </div>
      </div>
    </div >
  );
}
