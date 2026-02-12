import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Upload, User, Paintbrush, Image as ImageIcon, Type, Columns2, Palette, Sparkles, ChevronRight, Check, Play, Grid3X3, Footprints, Pencil, X, Smartphone, Eye } from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import { useContext } from "react";
import type { Bio } from "../types/bio";
import { blocksToHtml } from "~/services/html-generator";
import { VerificationRequestModal } from "~/components/dashboard/verification-request-modal";
import { AnimatePresence, motion } from "framer-motion";

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
  disabled,
  badge,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-[#c8e600] text-black">{badge}</span>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-12 h-7 rounded-full transition-colors ${disabled ? "cursor-not-allowed" : ""} ${checked ? "bg-gray-900" : "bg-gray-200"
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
  const { t } = useTranslation("dashboard");
  const bgColor = bio?.bgColor || "#ECEEF1";
  const buttonStyle = bio?.buttonStyle || "solid";
  const buttonRadius = bio?.buttonRadius || "rounder";
  const buttonColor = bio?.buttonColor || "#FFFFFF";
  const buttonTextColor = bio?.buttonTextColor || "#000000";
  const buttonShadow = bio?.buttonShadow || "none";

  const getShadowClass = () => {
    switch (buttonShadow) {
      case 'soft': return 'shadow-sm';
      case 'strong': return 'shadow-md';
      case 'hard': return 'shadow-lg';
      default: return '';
    }
  };

  const getButtonStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {};
    if (buttonStyle === 'solid') {
      base.backgroundColor = buttonColor;
      base.color = buttonTextColor;
    } else if (buttonStyle === 'outline') {
      base.backgroundColor = 'transparent';
      base.color = buttonColor;
      base.border = `2px solid ${buttonColor}`;
    } else if (buttonStyle === 'glass') {
      base.backgroundColor = `${buttonColor}33`;
      base.color = buttonTextColor;
      base.backdropFilter = 'blur(10px)';
    }
    return base;
  };

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
                    className={`w-full py-3 px-4 text-center text-sm font-medium ${getShadowClass()} ${buttonRadius === "square"
                        ? "rounded-none"
                        : buttonRadius === "round"
                          ? "rounded-lg"
                          : buttonRadius === "rounder"
                            ? "rounded-2xl"
                            : "rounded-full"
                      }`}
                    style={getButtonStyle()}
                  >
                    {t("design.previewCard.yourLinkHere")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400">
          {t("design.previewCard.joinOn", { username: bio?.sufix || "username" })}
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
  const { user, canAccessFeature } = useContext(AuthContext);
  const canUseFooter = canAccessFeature('standard');
  const { t } = useTranslation("dashboard");
  const [activeSection, setActiveSection] = useState("header");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [wallpaperPopup, setWallpaperPopup] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
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
      { key: "header", label: t("design.sections.header"), icon: Camera },
      { key: "theme", label: t("design.sections.theme"), icon: Paintbrush },
      { key: "wallpaper", label: t("design.sections.wallpaper"), icon: ImageIcon },
      { key: "text", label: t("design.sections.text"), icon: Type },
      { key: "buttons", label: t("design.sections.buttons"), icon: Columns2 },
      { key: "colors", label: t("design.sections.colors"), icon: Palette },
      { key: "footer", label: t("design.sections.footer"), icon: Footprints },
    ],
    [t]
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
      value: "solid", label: t("design.buttons.solid"), preview: (
        <div className="w-16 h-8 bg-gray-800 rounded-lg" />
      )
    },
    {
      value: "glass", label: t("design.buttons.glass"), preview: (
        <div className="w-16 h-8 bg-gray-300/50 backdrop-blur border border-gray-400 rounded-lg" />
      )
    },
    {
      value: "outline", label: t("design.buttons.outline"), preview: (
        <div className="w-16 h-8 bg-transparent border-2 border-gray-800 rounded-lg" />
      )
    },
  ];

  // Corner roundness options
  const cornerOptions = [
    {
      value: "square", label: t("design.buttons.square"), preview: (
        <div className="w-12 h-12 border-2 border-gray-300 rounded-none flex items-end justify-start p-1">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-400" />
        </div>
      )
    },
    {
      value: "round", label: t("design.buttons.round"), preview: (
        <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-end justify-start p-1">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-400 rounded-bl" />
        </div>
      )
    },
    {
      value: "rounder", label: t("design.buttons.rounder"), preview: (
        <div className="w-12 h-12 border-2 border-gray-800 bg-gray-50 rounded-2xl flex items-end justify-start p-1">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-400 rounded-bl-lg" />
        </div>
      )
    },
    {
      value: "full", label: t("design.buttons.full"), preview: (
        <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center">
          <div className="w-6 h-3 border-2 border-gray-400 rounded-full" />
        </div>
      )
    },
  ];

  // Button shadow options
  const shadowOptions = [
    { value: "none", label: t("design.buttons.shadowNone") },
    { value: "soft", label: t("design.buttons.shadowSoft") },
    { value: "strong", label: t("design.buttons.shadowStrong") },
    { value: "hard", label: t("design.buttons.shadowHard") },
  ];

  const parallaxAxisOptions = [
    { value: "y", label: t("design.footer.vertical") },
    { value: "x", label: t("design.footer.horizontal") },
    { value: "xy", label: t("design.footer.both") },
  ];

  const floatingElementsOptions = [
    { value: "circles", label: t("design.floatingTypes.circles") },
    { value: "hearts", label: t("design.floatingTypes.hearts") },
    { value: "fire", label: t("design.floatingTypes.fire") },
    { value: "stars", label: t("design.floatingTypes.stars") },
    { value: "sparkles", label: t("design.floatingTypes.sparkles") },
    { value: "music", label: t("design.floatingTypes.music") },
    { value: "leaves", label: t("design.floatingTypes.leaves") },
    { value: "snow", label: t("design.floatingTypes.snow") },
    { value: "bubbles", label: t("design.floatingTypes.bubbles") },
    { value: "confetti", label: t("design.floatingTypes.confetti") },
    { value: "diamonds", label: t("design.floatingTypes.diamonds") },
    { value: "petals", label: t("design.floatingTypes.petals") },
  ];

  // Wallpaper style options
  const wallpaperStyleOptions = [
    {
      value: "color", label: t("design.wallpaperStyles.fill"), preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg border-2 border-gray-300" />
      )
    },
    {
      value: "gradient", label: t("design.wallpaperStyles.gradient"), preview: (
        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg" />
      )
    },
    {
      value: "blur", label: t("design.wallpaperStyles.blur"), preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg blur-sm" />
      )
    },
    {
      value: "pattern", label: t("design.wallpaperStyles.pattern"), preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg grid grid-cols-3 gap-0.5 p-1">
          {[...Array(9)].map((_, i) => <div key={i} className="bg-gray-400 rounded-sm" />)}
        </div>
      )
    },
    {
      value: "image", label: t("design.wallpaperStyles.image"), preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <ImageIcon className="w-5 h-5 text-gray-400" />
        </div>
      )
    },
    {
      value: "video", label: t("design.wallpaperStyles.video"), preview: (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <Play className="w-5 h-5 text-gray-400" />
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-black text-gray-900">{t("design.pageTitle")}</h1>
          <button className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50 transition-colors touch-manipulation">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{t("design.enhance")}</span>
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr_320px] gap-4 lg:gap-8 min-h-[calc(100vh-140px)] lg:h-[calc(100vh-140px)]">
          {/* Sidebar - horizontal scroll on mobile, vertical on desktop */}
          <div className="bg-white border border-gray-200 rounded-2xl p-2 lg:p-4 lg:h-fit lg:sticky lg:top-8 shrink-0">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-hide">
              {sections.map((section) => {
                const Icon = section.icon;
                const active = activeSection === section.key;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-medium transition-all whitespace-nowrap touch-manipulation ${active
                      ? "bg-[#c8e600]/15 text-gray-900 lg:border-l-2 lg:border-[#c8e600] lg:-ml-0.5"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
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
                <h2 className="text-lg font-bold text-gray-900 mb-6">{t("design.header.title")}</h2>

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
                    {t("design.header.edit")}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                {/* Profile Image Layout */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">{t("design.header.profileImageLayout")}</span>
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
                      <span className="text-sm font-semibold text-gray-700">{t("design.header.classic")}</span>
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
                      <span className="text-sm font-semibold text-gray-700">{t("design.header.hero")}</span>
                      <div className="absolute top-2 right-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-gray-500" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Hero Transition Toggle — only visible when hero layout is selected */}
                {bio?.profileImageLayout === "hero" && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">{t("design.header.heroTransition")}</span>
                        <span className="text-xs text-gray-500">{t("design.header.heroTransitionDesc")}</span>
                      </div>
                      <button
                        onClick={() => updateField("heroTransition", bio?.heroTransition === false ? true : false)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          bio?.heroTransition !== false ? "bg-gray-900" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            bio?.heroTransition !== false ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* Nav Tab Colors */}
                <div className="mb-6">
                    <span className="text-sm font-semibold text-gray-900 block mb-3">{t("design.header.navigationTabs")}</span>
                    <span className="text-xs text-gray-500 block mb-3">{t("design.header.navigationTabsDesc")}</span>
                    <div className="grid grid-cols-2 gap-3">
                      <ColorPicker
                        label={t("design.header.tabBackground")}
                        value={bio?.navTabColor || "#000000"}
                        onChange={(value) => updateField("navTabColor", value)}
                      />
                      <ColorPicker
                        label={t("design.header.tabText")}
                        value={bio?.navTabTextColor || "#ffffff"}
                        onChange={(value) => updateField("navTabTextColor", value)}
                      />
                    </div>
                </div>

                {/* Title Input */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">{t("design.header.titleLabel")}</span>
                  <input
                    type="text"
                    value={`@${bio?.sufix || "username"}`}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:border-gray-300"
                  />
                </div>

                {/* Title Style */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">{t("design.header.titleStyle")}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateField("titleStyle", "text")}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${bio?.titleStyle !== "logo"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="text-2xl font-bold text-gray-700 mb-2">Aa</div>
                      <span className="text-sm font-semibold text-gray-700">{t("design.header.titleStyleText")}</span>
                    </button>
                    <button
                      onClick={() => updateField("titleStyle", "logo")}
                      className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${bio?.titleStyle === "logo"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm font-semibold text-gray-700">{t("design.header.titleStyleLogo")}</span>
                      <div className="absolute top-2 right-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-gray-500" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Size */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">{t("design.header.size")}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateField("profileImageSize", "small")}
                      className={`flex items-center justify-center py-2.5 rounded-xl border-2 transition-all hover:shadow-md ${(bio?.profileImageSize || "small") === "small"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <span className="text-sm font-semibold text-gray-700">{t("design.header.small")}</span>
                    </button>
                    <button
                      onClick={() => updateField("profileImageSize", "large")}
                      className={`relative flex items-center justify-center py-2.5 rounded-xl border-2 transition-all hover:shadow-md ${(bio?.profileImageSize || "small") === "large"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <span className="text-sm font-semibold text-gray-700">{t("design.header.large")}</span>
                      <div className="absolute top-2 right-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-gray-500" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Title Font */}
                <div className="mb-6">
                  <SelectField
                    label={t("design.header.titleFont")}
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
                    label={t("design.header.titleFontColor")}
                    value={bio?.usernameColor || "#000000"}
                    onChange={(value) => updateField("usernameColor", value)}
                  />
                </div>

                {/* Verification Section */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-2">{t("design.header.verification")}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("design.header.verificationDesc")}
                  </p>
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                  >
                    {bio?.verified ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74Z" fill="#3b82f6"/>
                          <path d="m9 12 2 2 4-4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {t("design.header.verified")}
                      </>
                    ) : bio?.verificationStatus === "pending" ? (
                      <>
                        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        {t("design.header.pending")}
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-[#c8e600] flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                        {t("design.header.getVerified")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Theme Section */}
            {activeSection === "theme" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">{t("design.theme.title")}</h2>

                <div className="flex gap-4 mb-6">
                  <button className="px-4 py-2 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
                    {t("design.theme.customizable")}
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600">
                    {t("design.theme.curated")}
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
                <h2 className="text-lg font-bold text-gray-900 mb-6">{t("design.wallpaper.title")}</h2>

                {/* Wallpaper Style Grid */}
                <div className="mb-6">
                  <span className="text-sm font-semibold text-gray-900 block mb-3">{t("design.wallpaper.wallpaperStyle")}</span>
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
                    label={t("design.wallpaper.backgroundColor")}
                    value={bio?.bgColor || "#ECEEF1"}
                    onChange={(value) => updateField("bgColor", value)}
                  />
                </div>

                {/* Secondary Color for Gradient */}
                {bio?.bgType === "gradient" && (
                  <div className="mt-4">
                    <ColorPicker
                      label={t("design.wallpaper.secondaryColor")}
                      value={bio?.bgSecondaryColor || "#000000"}
                      onChange={(value) => updateField("bgSecondaryColor", value)}
                    />
                  </div>
                )}

                {/* Image URL */}
                {bio?.bgType === "image" && (
                  <div className="mt-4">
                    <TextField
                      label={t("design.wallpaper.imageUrl")}
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
                      label={t("design.wallpaper.videoUrl")}
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
                          {t("design.wallpaper.settings", { type: wallpaperPopup })}
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
                            label={t("design.wallpaper.primaryColor")}
                            value={bio?.bgColor || "#FFFFFF"}
                            onChange={(value) => updateField("bgColor", value)}
                          />
                          <ColorPicker
                            label={t("design.wallpaper.secondaryColor")}
                            value={bio?.bgSecondaryColor || "#000000"}
                            onChange={(value) => updateField("bgSecondaryColor", value)}
                          />
                          <SelectField
                            label={t("design.wallpaper.direction")}
                            value={bio?.gradientDirection || "to-br"}
                            onChange={(value) => updateField("gradientDirection", value)}
                            options={[
                              { value: "to-r", label: t("design.wallpaper.dirLeftToRight") },
                              { value: "to-l", label: t("design.wallpaper.dirRightToLeft") },
                              { value: "to-b", label: t("design.wallpaper.dirTopToBottom") },
                              { value: "to-t", label: t("design.wallpaper.dirBottomToTop") },
                              { value: "to-br", label: t("design.wallpaper.dirDiagSE") },
                              { value: "to-bl", label: t("design.wallpaper.dirDiagSW") },
                              { value: "to-tr", label: t("design.wallpaper.dirDiagNE") },
                              { value: "to-tl", label: t("design.wallpaper.dirDiagNW") },
                            ]}
                          />
                        </div>
                      )}

                      {/* Blur Settings */}
                      {wallpaperPopup === "blur" && (
                        <div className="space-y-4">
                          <ColorPicker
                            label={t("design.wallpaper.backgroundColor")}
                            value={bio?.bgColor || "#FFFFFF"}
                            onChange={(value) => updateField("bgColor", value)}
                          />
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">{t("design.wallpaper.blurIntensity")}</label>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={bio?.blurIntensity || 10}
                              onChange={(e) => updateRangeField("blurIntensity", parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{t("design.wallpaper.none")}</span>
                              <span>{t("design.wallpaper.max")}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pattern Settings */}
                      {wallpaperPopup === "pattern" && (
                        <div className="space-y-4">
                          <ColorPicker
                            label={t("design.wallpaper.backgroundColor")}
                            value={bio?.bgColor || "#FFFFFF"}
                            onChange={(value) => updateField("bgColor", value)}
                          />
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-3">{t("design.wallpaper.patternType")}</label>
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
                            label={t("design.wallpaper.patternColor")}
                            value={bio?.patternColor || "#000000"}
                            onChange={(value) => updateField("patternColor", value)}
                          />
                        </div>
                      )}

                      {/* Image Settings */}
                      {wallpaperPopup === "image" && (
                        <div className="space-y-4">
                          <TextField
                            label={t("design.wallpaper.imageUrl")}
                            value={bio?.bgImage || ""}
                            onChange={(value) => updateField("bgImage", value || undefined)}
                            placeholder="https://..."
                          />
                          <SelectField
                            label={t("design.wallpaper.imageFit")}
                            value={bio?.bgImageFit || "cover"}
                            onChange={(value) => updateField("bgImageFit", value as Bio["bgImageFit"])}
                            options={[
                              { value: "cover", label: t("design.wallpaper.coverFill") },
                              { value: "contain", label: t("design.wallpaper.containFit") },
                              { value: "repeat", label: t("design.wallpaper.repeatTile") },
                            ]}
                          />
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">{t("design.wallpaper.overlayOpacity")}</label>
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
                            label={t("design.wallpaper.videoUrl")}
                            value={bio?.bgVideo || ""}
                            onChange={(value) => updateField("bgVideo", value || undefined)}
                            placeholder="https://..."
                          />
                          <ToggleSwitch
                            label={t("design.wallpaper.loopVideo")}
                            checked={bio?.bgVideoLoop !== false}
                            onChange={(value) => updateField("bgVideoLoop", value)}
                          />
                          <ToggleSwitch
                            label={t("design.wallpaper.muteAudio")}
                            checked={bio?.bgVideoMuted !== false}
                            onChange={(value) => updateField("bgVideoMuted", value)}
                          />
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">{t("design.wallpaper.overlayOpacity")}</label>
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
                        {t("design.wallpaper.apply")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text Section */}
            {activeSection === "text" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">{t("design.text.title")}</h2>

                <div className="space-y-6">
                  <SelectField
                    label={t("design.text.pageTextFont")}
                    value={bio?.font || "Inter"}
                    onChange={(value) => updateField("font", value)}
                    options={fontOptions}
                  />

                  <ColorPicker
                    label={t("design.text.pageTextColor")}
                    value={bio?.usernameColor || "#000000"}
                    onChange={(value) => updateField("usernameColor", value)}
                  />

                  <SelectField
                    label={t("design.text.titleFont")}
                    value={bio?.font || "Inter"}
                    onChange={(value) => updateField("font", value)}
                    options={fontOptions}
                  />

                  <ColorPicker
                    label={t("design.text.titleFontColor")}
                    value={bio?.usernameColor || "#000000"}
                    onChange={(value) => updateField("usernameColor", value)}
                  />
                </div>
              </div>
            )}

            {/* Buttons Section */}
            {activeSection === "buttons" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">{t("design.buttons.title")}</h2>

                <div className="space-y-8">
                  <VisualOptionPicker
                    label={t("design.buttons.buttonStyle")}
                    options={buttonStyleOptions}
                    value={bio?.buttonStyle || "solid"}
                    onChange={(value) => updateField("buttonStyle", value as Bio["buttonStyle"])}
                    columns={3}
                  />

                  <VisualOptionPicker
                    label={t("design.buttons.cornerRoundness")}
                    options={cornerOptions}
                    value={bio?.buttonRadius || "rounder"}
                    onChange={(value) => updateField("buttonRadius", value)}
                    columns={4}
                  />

                  <VisualOptionPicker
                    label={t("design.buttons.buttonShadow")}
                    options={shadowOptions}
                    value={bio?.buttonShadow || "none"}
                    onChange={(value) => updateField("buttonShadow", value)}
                    columns={4}
                  />

                  <ColorPicker
                    label={t("design.buttons.buttonColor")}
                    value={bio?.buttonColor || "#FFFFFF"}
                    onChange={(value) => updateField("buttonColor", value)}
                  />

                  <ColorPicker
                    label={t("design.buttons.buttonTextColor")}
                    value={bio?.buttonTextColor || "#000000"}
                    onChange={(value) => updateField("buttonTextColor", value)}
                  />
                </div>
              </div>
            )}

            {/* Colors Section */}
            {activeSection === "colors" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">{t("design.colors.title")}</h2>

                <div className="space-y-6">
                  <ColorPicker
                    label={t("design.colors.background")}
                    value={bio?.bgColor || "#ECEEF1"}
                    onChange={(value) => updateField("bgColor", value)}
                  />

                  <ColorPicker
                    label={t("design.colors.cardBackground")}
                    value={bio?.cardBackgroundColor || "#ffffff"}
                    onChange={(value) => updateField("cardBackgroundColor", value)}
                  />

                  <ColorPicker
                    label={t("design.colors.titleText")}
                    value={bio?.usernameColor || "#000000"}
                    onChange={(value) => updateField("usernameColor", value)}
                  />

                  <ColorPicker
                    label={t("design.colors.buttonColor")}
                    value={bio?.buttonColor || "#ffffff"}
                    onChange={(value) => updateField("buttonColor", value)}
                  />

                  <ColorPicker
                    label={t("design.colors.buttonText")}
                    value={bio?.buttonTextColor || "#000000"}
                    onChange={(value) => updateField("buttonTextColor", value)}
                  />
                </div>
              </div>
            )}

            {/* Footer Section */}
            {activeSection === "footer" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">{t("design.footer.title")}</h2>

                <div className="space-y-6">
                  <ToggleSwitch
                    label={t("design.footer.hidePortyoFooter")}
                    checked={bio?.removeBranding ?? false}
                    onChange={(value) => updateField("removeBranding", value)}
                    disabled={!canUseFooter}
                    badge={!canUseFooter ? "Standard" : undefined}
                  />

                  <ToggleSwitch
                    label={t("design.footer.enableSubscribeButton")}
                    checked={bio?.enableSubscribeButton ?? false}
                    onChange={(value) => updateField("enableSubscribeButton", value)}
                    disabled={!canUseFooter}
                    badge={!canUseFooter ? "Standard" : undefined}
                  />

                  <ToggleSwitch
                    label={t("design.footer.enableParallax")}
                    checked={bio?.enableParallax ?? false}
                    onChange={(value) => updateField("enableParallax", value)}
                    disabled={!canUseFooter}
                    badge={!canUseFooter ? "Standard" : undefined}
                  />

                  {bio?.enableParallax && (
                    <div className="ml-2 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <RangeField
                        label={t("design.footer.intensity")}
                        value={bio?.parallaxIntensity ?? 50}
                        onChange={(value) => updateRangeField("parallaxIntensity", value)}
                        min={0}
                        max={100}
                      />
                      <RangeField
                        label={t("design.footer.depth")}
                        value={bio?.parallaxDepth ?? 50}
                        onChange={(value) => updateRangeField("parallaxDepth", value)}
                        min={0}
                        max={100}
                      />
                      <SelectField
                        label={t("design.footer.axis")}
                        value={bio?.parallaxAxis || "y"}
                        onChange={(value) => updateField("parallaxAxis", value as Bio["parallaxAxis"])}
                        options={parallaxAxisOptions}
                      />
                    </div>
                  )}

                  <ToggleSwitch
                    label={t("design.footer.floatingElements")}
                    checked={bio?.floatingElements ?? false}
                    onChange={(value) => updateField("floatingElements", value)}
                    disabled={!canUseFooter}
                    badge={!canUseFooter ? "Standard" : undefined}
                  />

                  {bio?.floatingElements && (
                    <div className="ml-2 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <SelectField
                        label={t("design.footer.type")}
                        value={bio?.floatingElementsType || "circles"}
                        onChange={(value) => updateField("floatingElementsType", value)}
                        options={floatingElementsOptions}
                      />
                      <ColorPicker
                        label={t("design.footer.color")}
                        value={bio?.floatingElementsColor || "#ffffff"}
                        onChange={(value) => updateField("floatingElementsColor", value)}
                      />
                      <RangeField
                        label={t("design.footer.density")}
                        value={bio?.floatingElementsDensity ?? 12}
                        onChange={(value) => updateRangeField("floatingElementsDensity", value)}
                        min={4}
                        max={40}
                      />
                      <RangeField
                        label={t("design.footer.size")}
                        value={bio?.floatingElementsSize ?? 24}
                        onChange={(value) => updateRangeField("floatingElementsSize", value)}
                        min={8}
                        max={80}
                        suffix="px"
                      />
                      <RangeField
                        label={t("design.footer.speed")}
                        value={bio?.floatingElementsSpeed ?? 12}
                        onChange={(value) => updateRangeField("floatingElementsSpeed", value)}
                        min={4}
                        max={40}
                        suffix="s"
                      />
                      <RangeField
                        label={t("design.footer.opacity")}
                        value={bio?.floatingElementsOpacity ?? 0.35}
                        onChange={(value) => updateRangeField("floatingElementsOpacity", value)}
                        min={0.05}
                        max={0.9}
                        step={0.05}
                      />
                      <RangeField
                        label={t("design.footer.blur")}
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

        {/* Mobile Preview FAB */}
        <button
          onClick={() => setShowMobilePreview(true)}
          className="fixed bottom-6 right-6 z-40 lg:hidden w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors touch-manipulation"
          aria-label="Preview"
        >
          <Smartphone className="w-5 h-5" />
        </button>

        {/* Mobile Preview Overlay */}
        <AnimatePresence>
          {showMobilePreview && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 bg-[#F7F6F2] flex flex-col lg:hidden"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <span className="font-black text-lg tracking-tight">{t("design.preview")}</span>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="p-2.5 hover:bg-black/5 rounded-full transition-all touch-manipulation"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                <PreviewCard bio={bio} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showVerificationModal && bio && (
        <VerificationRequestModal
          bioId={bio.id}
          verified={bio.verified ?? false}
          verificationStatus={bio.verificationStatus ?? "none"}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={() => {
            setDraftBio((prev) => prev ? { ...prev, verificationStatus: "pending" } : prev);
          }}
        />
      )}
    </div >
  );
}
