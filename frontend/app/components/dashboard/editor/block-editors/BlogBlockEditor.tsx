import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { BlogPostSelector } from "../integration-selectors";
import BioContext, { type BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
  bioId?: string;
}

const LAYOUTS: { id: string; label: string; icon: React.ReactNode }[] = [
  {
    id: "carousel",
    label: "Carrossel",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="8" height="12" rx="2" />
        <rect x="14" y="6" width="8" height="12" rx="2" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "grid",
    label: "Grid",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "list",
    label: "Lista",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "magazine",
    label: "Magazine",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="8" rx="1" />
        <rect x="3" y="14" width="8" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

const CARD_STYLES: { id: string; label: string; desc: string }[] = [
  { id: "featured", label: "Featured", desc: "Imagem + tags + resumo" },
  { id: "modern", label: "Modern", desc: "Borda lateral + data" },
  { id: "minimal", label: "Minimal", desc: "Texto limpo" },
  { id: "overlay", label: "Overlay", desc: "Texto sobre a imagem" },
  { id: "horizontal", label: "Horizontal", desc: "Imagem + texto lado a lado" },
];

const POPUP_STYLES: { id: string; label: string }[] = [
  { id: "classic", label: "Clássico" },
  { id: "modern", label: "Moderno" },
  { id: "simple", label: "Simples" },
];

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0"
        style={{ padding: 0 }}
      />
      <span className="text-xs text-gray-600 flex-1">{label}</span>
    </div>
  );
}

export function BlogBlockEditor({ block, onChange, bioId }: Props) {
  const { t } = useTranslation("dashboard");
  const { bio } = useContext(BioContext);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const effectiveBioId = bioId || block.bioId || bio?.id || null;

  const handlePostsSelect = (posts: { id: string }[]) => {
    onChange({ blogPostIds: posts.map((p) => p.id) });
  };

  const toggleSection = (key: string) => {
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  const currentLayout = block.blogLayout || "carousel";
  const currentCardStyle = block.blogCardStyle || "featured";

  return (
    <div className="space-y-5">
      {/* Blog Posts Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          {t("editor.blockIntegration.blog.title")}
        </label>
        <BlogPostSelector
          bioId={effectiveBioId}
          selectedPostIds={block.blogPostIds}
          onSelect={handlePostsSelect}
        />
      </div>

      {/* Layout Selection */}
      <div className="space-y-2">
        <span className="text-sm font-semibold text-gray-700 block">Layout</span>
        <div className="grid grid-cols-4 gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => onChange({ blogLayout: l.id as any })}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                currentLayout === l.id
                  ? "border-gray-900 bg-gray-50 text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {l.icon}
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Style */}
      <div className="space-y-2">
        <span className="text-sm font-semibold text-gray-700 block">Estilo do Card</span>
        <div className="grid grid-cols-1 gap-2">
          {CARD_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ blogCardStyle: s.id as any })}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                currentCardStyle === s.id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                currentCardStyle === s.id ? "border-gray-900 bg-gray-900" : "border-gray-300"
              }`} />
              <div>
                <span className="text-sm font-semibold text-gray-800 block">{s.label}</span>
                <span className="text-xs text-gray-500">{s.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Post Count */}
      <div className="space-y-2">
        <span className="text-sm font-semibold text-gray-700 block">Posts exibidos</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={12}
            value={block.blogPostCount || 6}
            onChange={(e) => onChange({ blogPostCount: Number(e.target.value) })}
            className="flex-1 accent-gray-900"
          />
          <span className="text-sm font-bold text-gray-800 w-6 text-center">
            {block.blogPostCount || 6}
          </span>
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <span className="text-sm font-semibold text-gray-700 block">Opções</span>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={block.blogShowImages !== false}
            onChange={(e) => onChange({ blogShowImages: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500 accent-gray-900"
          />
          <span className="text-sm text-gray-700">Mostrar imagens</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={block.blogShowDates !== false}
            onChange={(e) => onChange({ blogShowDates: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500 accent-gray-900"
          />
          <span className="text-sm text-gray-700">Mostrar datas</span>
        </label>
      </div>

      {/* Colors — collapsible */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("colors")}
          className="w-full flex items-center justify-between p-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>🎨 Cores do Card</span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${expandedSection === "colors" ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {expandedSection === "colors" && (
          <div className="p-3.5 pt-0 grid grid-cols-2 gap-3">
            <ColorInput
              label="Fundo"
              value={block.blogBackgroundColor || "#ffffff"}
              onChange={(v) => onChange({ blogBackgroundColor: v })}
            />
            <ColorInput
              label="Título"
              value={block.blogTitleColor || "#1f2937"}
              onChange={(v) => onChange({ blogTitleColor: v })}
            />
            <ColorInput
              label="Texto"
              value={block.blogTextColor || "#6b7280"}
              onChange={(v) => onChange({ blogTextColor: v })}
            />
            <ColorInput
              label="Data"
              value={block.blogDateColor || "#9ca3af"}
              onChange={(v) => onChange({ blogDateColor: v })}
            />
            <ColorInput
              label="Tag fundo"
              value={block.blogTagBackgroundColor || "#e5e7eb"}
              onChange={(v) => onChange({ blogTagBackgroundColor: v })}
            />
            <ColorInput
              label="Tag texto"
              value={block.blogTagTextColor || "#374151"}
              onChange={(v) => onChange({ blogTagTextColor: v })}
            />
          </div>
        )}
      </div>

      {/* Popup Settings — collapsible */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("popup")}
          className="w-full flex items-center justify-between p-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>📖 Popup de Leitura</span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${expandedSection === "popup" ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {expandedSection === "popup" && (
          <div className="p-3.5 pt-0 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {POPUP_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onChange({ blogPopupStyle: s.id as any })}
                  className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                    (block.blogPopupStyle || "classic") === s.id
                      ? "border-gray-900 bg-gray-50 text-gray-900"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorInput
                label="Fundo"
                value={block.blogPopupBackgroundColor || "#ffffff"}
                onChange={(v) => onChange({ blogPopupBackgroundColor: v })}
              />
              <ColorInput
                label="Texto"
                value={block.blogPopupTextColor || "#1f2937"}
                onChange={(v) => onChange({ blogPopupTextColor: v })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
