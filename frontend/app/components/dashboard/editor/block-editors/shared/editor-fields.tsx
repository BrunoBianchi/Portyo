import { memo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ColorPicker } from "../../ColorPicker";

// ────────────────────────────────────────────────────
// Shared styling constants
// ────────────────────────────────────────────────────

const inputBase =
  "w-full p-3.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all outline-none placeholder:text-black/20";

const labelBase =
  "block text-[10px] font-black uppercase tracking-wider mb-1.5 ml-0.5 text-black/40";

// ────────────────────────────────────────────────────
// EditorSection — collapsible section with icon + title
// ────────────────────────────────────────────────────

interface EditorSectionProps {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  noBorder?: boolean;
}

export const EditorSection = memo(function EditorSection({
  icon,
  title,
  children,
  defaultOpen = true,
  noBorder = false,
}: EditorSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={noBorder ? "" : "border-b border-gray-100 pb-5"}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-2 text-[11px] font-black text-black/50 uppercase tracking-wider">
          {icon}
          {title}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-black/30 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="space-y-3.5">{children}</div>}
    </div>
  );
});

// ────────────────────────────────────────────────────
// EditorInput — labeled text/number/email input
// ────────────────────────────────────────────────────

interface EditorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "email" | "tel" | "number" | "datetime-local";
  mono?: boolean;
  prefix?: string;
  className?: string;
}

export const EditorInput = memo(function EditorInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono = false,
  prefix,
  className,
}: EditorInputProps) {
  return (
    <div className={className}>
      <label className={labelBase}>{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30 font-bold text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} ${mono ? "font-mono" : ""} ${prefix ? "pl-8" : ""}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
});

// ────────────────────────────────────────────────────
// EditorTextarea — labeled multi-line input
// ────────────────────────────────────────────────────

interface EditorTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export const EditorTextarea = memo(function EditorTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: EditorTextareaProps) {
  return (
    <div>
      <label className={labelBase}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`${inputBase} resize-none`}
        placeholder={placeholder}
      />
      {hint && (
        <p className="text-[10px] text-black/30 font-medium mt-1 ml-0.5">
          {hint}
        </p>
      )}
    </div>
  );
});

// ────────────────────────────────────────────────────
// EditorSelect — labeled dropdown select
// ────────────────────────────────────────────────────

interface EditorSelectOption {
  value: string;
  label: string;
}

interface EditorSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: EditorSelectOption[];
  className?: string;
}

export const EditorSelect = memo(function EditorSelect({
  label,
  value,
  onChange,
  options,
  className,
}: EditorSelectProps) {
  return (
    <div className={className}>
      <label className={labelBase}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} cursor-pointer`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});

// ────────────────────────────────────────────────────
// EditorSlider — labeled range slider with value display
// ────────────────────────────────────────────────────

interface EditorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const EditorSlider = memo(function EditorSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
}: EditorSliderProps) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-black/40">
          {label}
        </label>
        <span className="text-[10px] font-mono text-black/30">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#D2E823]"
      />
    </div>
  );
});

// ────────────────────────────────────────────────────
// EditorToggle — checkbox toggle with label
// ────────────────────────────────────────────────────

interface EditorToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export const EditorToggle = memo(function EditorToggle({
  label,
  checked,
  onChange,
  id,
}: EditorToggleProps) {
  const toggleId = id || `toggle-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label
      htmlFor={toggleId}
      className="flex items-center gap-3 cursor-pointer group"
    >
      <div className="relative">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-black transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
      </div>
      <span className="text-sm font-medium text-gray-600 group-hover:text-black transition-colors">
        {label}
      </span>
    </label>
  );
});

// ────────────────────────────────────────────────────
// EditorColorField — labeled color picker
// ────────────────────────────────────────────────────

interface EditorColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const EditorColorField = memo(function EditorColorField({
  label,
  value,
  onChange,
  className,
}: EditorColorFieldProps) {
  return (
    <div className={className}>
      <ColorPicker label={label} value={value} onChange={onChange} />
    </div>
  );
});

// ────────────────────────────────────────────────────
// EditorVisualPicker — visual option picker (grid of cards)
// ────────────────────────────────────────────────────

interface EditorVisualPickerOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
}

interface EditorVisualPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: EditorVisualPickerOption[];
  columns?: 2 | 3 | 4;
}

export const EditorVisualPicker = memo(function EditorVisualPicker({
  label,
  value,
  onChange,
  options,
  columns = 3,
}: EditorVisualPickerProps) {
  const gridCols =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  return (
    <div>
      <label className={labelBase}>{label}</label>
      <div className={`grid ${gridCols} gap-2`}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-[11px] font-bold transition-all ${
                isActive
                  ? "border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              {opt.icon && <span className="text-base">{opt.icon}</span>}
              <span className="leading-tight text-center">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ────────────────────────────────────────────────────
// EditorImagePreview — image URL input with preview
// ────────────────────────────────────────────────────

interface EditorImagePreviewProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EditorImagePreview = memo(function EditorImagePreview({
  label,
  value,
  onChange,
  placeholder = "https://...",
}: EditorImagePreviewProps) {
  return (
    <div>
      <label className={labelBase}>{label}</label>
      {value && (
        <div className="rounded-xl overflow-hidden border-2 border-gray-200 mb-2">
          <img
            src={value}
            alt="Prévia"
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} font-mono`}
        placeholder={placeholder}
      />
    </div>
  );
});
