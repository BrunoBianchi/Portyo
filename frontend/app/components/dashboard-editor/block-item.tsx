import React, { memo } from "react";
import { type BioBlock } from "~/contexts/bio.context";
import type { QrCode } from "~/services/qrcode.service";
import { 
  DragHandleIcon, 
  HeadingIcon, 
  TextIcon, 
  ButtonIcon, 
  ImageIcon, 
  SocialsIcon, 
  VideoIcon, 
  DividerIcon, 
  DefaultIcon,
  TrashIcon,
  ChevronDownIcon,
  XIcon,
  PlusIcon,
  QrCodeIcon
} from "~/components/icons";


interface BlockItemProps {
  block: BioBlock;
  index: number;
  isExpanded: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  dragItem: { source: "palette" | "canvas"; type?: BioBlock["type"]; id?: string } | null;
  onToggleExpand: (id: string) => void;
  onRemove: (id: string) => void;
  onChange: (id: string, key: keyof BioBlock, value: any) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnter: (e: React.DragEvent, id: string) => void;
  availableQrCodes?: QrCode[];
  onCreateQrCode?: () => void;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

const BlockItem = memo(({
  block,
  index,
  isExpanded,
  isDragging,
  isDragOver,
  dragItem,
  onToggleExpand,
  onRemove,
  onChange,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragEnter,
  availableQrCodes = [],
  onCreateQrCode
}: BlockItemProps) => {
  
  const handleFieldChange = (key: keyof BioBlock, value: any) => {
    onChange(block.id, key, value);
  };

  return (
    <div className="group">
      <div
        className={`rounded-xl mb-2 overflow-hidden transition-all duration-300 ${
          isDragging
            ? "border-2 border-dashed border-primary/40 bg-primary/5 opacity-100" 
            : "border-2 border-transparent hover:border-primary/40 bg-white shadow-sm"
        }`}
        draggable
        onDragStart={(e) => onDragStart(e, block.id)}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop(e, index)}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => onDragEnter(e, block.id)}
      >
        {isDragging ? (
          <div className="h-16 flex items-center justify-center">
            <span className="text-sm font-medium text-primary/60">Drop here</span>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between gap-3 p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
            onClick={() => onToggleExpand(block.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleExpand(block.id);
              }
            }}
          >
          <div className="flex items-center gap-3">
            <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-1">
              <DragHandleIcon />
            </div>
            <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
              {/* Icon based on type */}
              {block.type === 'heading' && <HeadingIcon />}
              {block.type === 'text' && <TextIcon />}
              {block.type === 'button' && <ButtonIcon />}
              {block.type === 'image' && <ImageIcon />}
              {block.type === 'socials' && <SocialsIcon />}
              {block.type === 'video' && <VideoIcon />}
              {block.type === 'divider' && <DividerIcon />}
              {block.type === 'qrcode' && <QrCodeIcon />}
              {/* Add other icons as needed, defaulting to a generic one if missing */}
              {!['heading', 'text', 'button', 'image', 'socials', 'video', 'divider', 'qrcode'].includes(block.type) && (
                 <DefaultIcon />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">{block.title || block.type.charAt(0).toUpperCase() + block.type.slice(1)}</p>
              <p className="text-xs text-text-muted">{block.type.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(block.id);
              }}
              type="button"
              title="Remove block"
            >
              <TrashIcon />
            </button>
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDownIcon />
            </div>
          </div>
          </div>
        )}

        {isExpanded && !isDragging && (
          <div className="p-4 pt-0 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {block.type === "heading" && (
              <div className="space-y-3 pt-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                  <input
                    value={block.title || ""}
                    onChange={(event) => handleFieldChange("title", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Title"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Subtitle</label>
                  <textarea
                    value={block.body || ""}
                    onChange={(event) => handleFieldChange("body", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Subtitle"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={block.textColor || "#000000"}
                      onChange={(event) => handleFieldChange("textColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Animation</label>
                  <div className="flex gap-2">
                    <select
                      value={block.animation || "none"}
                      onChange={(event) => handleFieldChange("animation", event.target.value)}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="none">None</option>
                      <option value="bounce">Bounce</option>
                      <option value="pulse">Pulse</option>
                      <option value="shake">Shake</option>
                      <option value="wobble">Wobble</option>
                    </select>
                    {block.animation && block.animation !== "none" && (
                      <select
                        value={block.animationTrigger || "loop"}
                        onChange={(event) => handleFieldChange("animationTrigger", event.target.value)}
                        className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="loop">Loop</option>
                        <option value="once">Once</option>
                        <option value="hover">Hover</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}

            {block.type === "text" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Content</label>
                  <textarea
                    value={block.body || ""}
                    onChange={(event) => handleFieldChange("body", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Write your text"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={block.textColor || "#4b5563"}
                      onChange={(event) => handleFieldChange("textColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Animation</label>
                  <div className="flex gap-2">
                    <select
                      value={block.animation || "none"}
                      onChange={(event) => handleFieldChange("animation", event.target.value)}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="none">None</option>
                      <option value="bounce">Bounce</option>
                      <option value="pulse">Pulse</option>
                      <option value="shake">Shake</option>
                      <option value="wobble">Wobble</option>
                    </select>
                    {block.animation && block.animation !== "none" && (
                      <select
                        value={block.animationTrigger || "loop"}
                        onChange={(event) => handleFieldChange("animationTrigger", event.target.value)}
                        className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="loop">Loop</option>
                        <option value="once">Once</option>
                        <option value="hover">Hover</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}

            {block.type === "button" && (
              <div className="space-y-3 pt-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Label</label>
                  <input
                    value={block.title || ""}
                    onChange={(event) => handleFieldChange("title", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Button text"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">URL</label>
                  <input
                    value={block.href || ""}
                    onChange={(event) => handleFieldChange("href", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL (Optional)</label>
                  <input
                    value={block.buttonImage || ""}
                    onChange={(event) => handleFieldChange("buttonImage", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://... (icon or photo)"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Text Alignment</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => handleFieldChange("buttonTextAlign", align)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                          (block.buttonTextAlign || 'center') === align 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Style</label>
                    <select
                      value={block.buttonStyle || "solid"}
                      onChange={(event) => handleFieldChange("buttonStyle", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="solid">Solid</option>
                      <option value="outline">Outline</option>
                      <option value="ghost">Ghost</option>
                      <option value="hard-shadow">Retro (Hard Shadow)</option>
                      <option value="soft-shadow">Soft Shadow</option>
                      <option value="3d">3D</option>
                      <option value="glass">Glassmorphism</option>
                      <option value="gradient">Gradient</option>
                      <option value="neumorphism">Neumorphism</option>
                      <option value="clay">Claymorphism</option>
                      <option value="cyberpunk">Cyberpunk / Glitch</option>
                      <option value="pixel">Pixel Art (8-bit)</option>
                      <option value="neon">Neon Glow</option>
                      <option value="sketch">Sketch / Hand-Drawn</option>
                      <option value="gradient-border">Gradient Border</option>
                      <option value="minimal-underline">Minimal Underline</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Shape</label>
                    <select
                      value={block.buttonShape || "rounded"}
                      onChange={(event) => handleFieldChange("buttonShape", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="pill">Pill</option>
                      <option value="rounded">Rounded</option>
                      <option value="square">Square</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={block.accent || "#111827"}
                        onChange={(event) => handleFieldChange("accent", event.target.value)}
                        className="h-9 w-full rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={block.textColor || "#ffffff"}
                        onChange={(event) => handleFieldChange("textColor", event.target.value)}
                        className="h-9 w-full rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  {["hard-shadow", "soft-shadow", "3d", "gradient", "cyberpunk", "gradient-border", "neon", "pixel", "sketch", "neumorphism", "clay"].includes(block.buttonStyle || "") && (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Secondary / Shadow Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={block.buttonShadowColor || block.accent || "#111827"}
                          onChange={(event) => handleFieldChange("buttonShadowColor", event.target.value)}
                          className="h-9 w-full rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={block.isNsfw || false}
                        onChange={(event) => handleFieldChange("isNsfw", event.target.checked as any)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Sensitive Content (+18)
                    </label>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Animation</label>
                    <div className="flex gap-2">
                      <select
                        value={block.animation || "none"}
                        onChange={(event) => handleFieldChange("animation", event.target.value)}
                        className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="none">None</option>
                        <option value="bounce">Bounce</option>
                        <option value="pulse">Pulse</option>
                        <option value="shake">Shake</option>
                        <option value="wobble">Wobble</option>
                      </select>
                      {block.animation && block.animation !== "none" && (
                        <select
                          value={block.animationTrigger || "loop"}
                          onChange={(event) => handleFieldChange("animationTrigger", event.target.value)}
                          className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option value="loop">Loop</option>
                          <option value="once">Once</option>
                          <option value="hover">Hover</option>
                        </select>
                      )}
                    </div>
                  </div>                            </div>
              </div>
            )}

            {block.type === "socials" && (
              <div className="space-y-3 pt-3">
                <p className="text-xs text-gray-500">Add your social media links below.</p>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                    <select
                      value={block.socialsLayout || "row"}
                      onChange={(event) => handleFieldChange("socialsLayout", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="row">Inline (Row)</option>
                      <option value="column">List (Column)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Style</label>
                    <div className="flex items-center h-[38px]">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={block.socialsLabel || false}
                          onChange={(event) => handleFieldChange("socialsLabel", event.target.checked as any)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Show Text
                      </label>
                    </div>
                  </div>
                </div>

                {['instagram', 'twitter', 'linkedin', 'youtube', 'github'].map((platform) => (
                  <div key={platform}>
                    <label className="text-xs font-medium text-gray-700 mb-1 block capitalize">{platform}</label>
                    <input
                      value={block.socials?.[platform as keyof typeof block.socials] || ""}
                      onChange={(event) => {
                        const newSocials = { ...block.socials, [platform]: event.target.value };
                        handleFieldChange("socials", newSocials as any);
                      }}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder={`https://${platform}.com/...`}
                    />
                  </div>
                ))}
              </div>
            )}

            {block.type === "video" && (
              <div className="pt-3">
                <label className="text-xs font-medium text-gray-700 mb-1 block">YouTube URL</label>
                <input
                  value={block.mediaUrl || ""}
                  onChange={(event) => handleFieldChange("mediaUrl", event.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}

            {block.type === "image" && (
              <div className="pt-3">
                <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL</label>
                <input
                  value={block.mediaUrl || ""}
                  onChange={(event) => handleFieldChange("mediaUrl", event.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
            )}

            {block.type === "blog" && (
              <div className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                    <select
                      value={block.blogLayout || "carousel"}
                      onChange={(event) => handleFieldChange("blogLayout", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="carousel">Carousel</option>
                      <option value="list">List</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Card Style</label>
                    <select
                      value={block.blogCardStyle || "featured"}
                      onChange={(event) => handleFieldChange("blogCardStyle", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="featured">Featured</option>
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Background</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.blogBackgroundColor || "#ffffff"}
                        onChange={(e) => handleFieldChange("blogBackgroundColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.blogBackgroundColor || "#ffffff"}
                        onChange={(e) => handleFieldChange("blogBackgroundColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Title Color</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.blogTitleColor || "#1f2937"}
                        onChange={(e) => handleFieldChange("blogTitleColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.blogTitleColor || "#1f2937"}
                        onChange={(e) => handleFieldChange("blogTitleColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Text Color</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.blogTextColor || "#4b5563"}
                        onChange={(e) => handleFieldChange("blogTextColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.blogTextColor || "#4b5563"}
                        onChange={(e) => handleFieldChange("blogTextColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Date/Accent</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.blogDateColor || "#f59e0b"}
                        onChange={(e) => handleFieldChange("blogDateColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.blogDateColor || "#f59e0b"}
                        onChange={(e) => handleFieldChange("blogDateColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Tag Bg</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.blogTagBackgroundColor || "#f3f4f6"}
                        onChange={(e) => handleFieldChange("blogTagBackgroundColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.blogTagBackgroundColor || "#f3f4f6"}
                        onChange={(e) => handleFieldChange("blogTagBackgroundColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Tag Text</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.blogTagTextColor || "#4b5563"}
                        onChange={(e) => handleFieldChange("blogTagTextColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.blogTagTextColor || "#4b5563"}
                        onChange={(e) => handleFieldChange("blogTagTextColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Popup Configuration</label>
                  <div className="mb-3">
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Popup Style</label>
                    <select
                      value={block.blogPopupStyle || "classic"}
                      onChange={(event) => handleFieldChange("blogPopupStyle", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="classic">Classic (Default)</option>
                      <option value="modern">Modern (Split)</option>
                      <option value="simple">Simple (Minimal)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 mb-1 block">Background</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={block.blogPopupBackgroundColor || "#ffffff"}
                          onChange={(e) => handleFieldChange("blogPopupBackgroundColor", e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                        />
                        <input
                          type="text"
                          value={block.blogPopupBackgroundColor || "#ffffff"}
                          onChange={(e) => handleFieldChange("blogPopupBackgroundColor", e.target.value)}
                          className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 mb-1 block">Text Color</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={block.blogPopupTextColor || "#1f2937"}
                          onChange={(e) => handleFieldChange("blogPopupTextColor", e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                        />
                        <input
                          type="text"
                          value={block.blogPopupTextColor || "#1f2937"}
                          onChange={(e) => handleFieldChange("blogPopupTextColor", e.target.value)}
                          className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 mb-1 block">Overlay Color</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={block.blogPopupOverlayColor || "#000000"}
                          onChange={(e) => handleFieldChange("blogPopupOverlayColor", e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                        />
                        <input
                          type="text"
                          value={block.blogPopupOverlayColor || "#000000"}
                          onChange={(e) => handleFieldChange("blogPopupOverlayColor", e.target.value)}
                          className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Number of Posts: {block.blogPostCount || 3}</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={block.blogPostCount || 3}
                    onChange={(event) => handleFieldChange("blogPostCount", event.target.value as any)}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>5</span>
                  </div>
                </div>
              </div>
            )}

            {block.type === "product" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                  <select
                    value={block.productLayout || "grid"}
                    onChange={(event) => handleFieldChange("productLayout", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="carousel">Carousel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Card Style</label>
                  <select
                    value={block.productCardStyle || "default"}
                    onChange={(event) => handleFieldChange("productCardStyle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="default">Default</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Background</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.productBackgroundColor || "#ffffff"}
                        onChange={(e) => handleFieldChange("productBackgroundColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.productBackgroundColor || "#ffffff"}
                        onChange={(e) => handleFieldChange("productBackgroundColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Text Color</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.productTextColor || "#1f2937"}
                        onChange={(e) => handleFieldChange("productTextColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.productTextColor || "#1f2937"}
                        onChange={(e) => handleFieldChange("productTextColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 mb-1 block">Accent Color</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={block.productAccentColor || "#2563eb"}
                        onChange={(e) => handleFieldChange("productAccentColor", e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={block.productAccentColor || "#2563eb"}
                        onChange={(e) => handleFieldChange("productAccentColor", e.target.value)}
                        className="w-full min-w-0 rounded border border-gray-200 px-1.5 py-1 text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Button Text</label>
                  <input
                    type="text"
                    value={block.productButtonText || "View Product"}
                    onChange={(e) => handleFieldChange("productButtonText", e.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                    placeholder="e.g. Buy Now"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 block">Products</label>
                  {(block.products || []).map((product, index) => (
                    <div key={product.id} className="p-2 border border-gray-200 rounded-lg space-y-2">
                      <input
                        value={product.title}
                        onChange={(e) => {
                          const newProducts = [...(block.products || [])];
                          newProducts[index] = { ...product, title: e.target.value };
                          handleFieldChange("products", newProducts as any);
                        }}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                        placeholder="Product Title"
                      />
                      <div className="flex gap-2">
                        <input
                          value={product.price}
                          onChange={(e) => {
                            const newProducts = [...(block.products || [])];
                            newProducts[index] = { ...product, price: e.target.value };
                            handleFieldChange("products", newProducts as any);
                          }}
                          className="w-1/3 rounded border border-gray-200 px-2 py-1 text-xs"
                          placeholder="Price"
                        />
                        <input
                          value={product.url}
                          onChange={(e) => {
                            const newProducts = [...(block.products || [])];
                            newProducts[index] = { ...product, url: e.target.value };
                            handleFieldChange("products", newProducts as any);
                          }}
                          className="w-2/3 rounded border border-gray-200 px-2 py-1 text-xs"
                          placeholder="URL"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newProduct = { id: makeId(), title: "New Product", price: "$0.00", image: "https://placehold.co/300x300", url: "#" };
                      handleFieldChange("products", [...(block.products || []), newProduct] as any);
                    }}
                    className="w-full py-1.5 text-xs font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    + Add Product
                  </button>
                </div>
              </div>
            )}

            {block.type === "calendar" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                  <input
                    value={block.calendarTitle || ""}
                    onChange={(event) => handleFieldChange("calendarTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Book a Call"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Booking URL</label>
                  <input
                    value={block.calendarUrl || ""}
                    onChange={(event) => handleFieldChange("calendarUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://calendly.com/..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                    <input
                      type="color"
                      value={block.calendarColor || "#ffffff"}
                      onChange={(event) => handleFieldChange("calendarColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Text</label>
                    <input
                      type="color"
                      value={block.calendarTextColor || "#1f2937"}
                      onChange={(event) => handleFieldChange("calendarTextColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Accent</label>
                    <input
                      type="color"
                      value={block.calendarAccentColor || "#2563eb"}
                      onChange={(event) => handleFieldChange("calendarAccentColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {block.type === "map" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Location Name</label>
                  <input
                    value={block.mapTitle || ""}
                    onChange={(event) => handleFieldChange("mapTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Our Office"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Address</label>
                  <input
                    value={block.mapAddress || ""}
                    onChange={(event) => handleFieldChange("mapAddress", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. 123 Main St, City"
                  />
                </div>
              </div>
            )}

            {block.type === "featured" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Product Title</label>
                  <input
                    value={block.featuredTitle || ""}
                    onChange={(event) => handleFieldChange("featuredTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Product Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Price</label>
                    <input
                      value={block.featuredPrice || ""}
                      onChange={(event) => handleFieldChange("featuredPrice", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="$19.99"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL</label>
                    <input
                      value={block.featuredImage || ""}
                      onChange={(event) => handleFieldChange("featuredImage", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Product URL</label>
                  <input
                    value={block.featuredUrl || ""}
                    onChange={(event) => handleFieldChange("featuredUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                    <input
                      type="color"
                      value={block.featuredColor || "#1f4d36"}
                      onChange={(event) => handleFieldChange("featuredColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                    <input
                      type="color"
                      value={block.featuredTextColor || "#ffffff"}
                      onChange={(event) => handleFieldChange("featuredTextColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {block.type === "affiliate" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                  <input
                    value={block.affiliateTitle || ""}
                    onChange={(event) => handleFieldChange("affiliateTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Copy my coupon code"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Coupon Code</label>
                  <input
                    value={block.affiliateCode || ""}
                    onChange={(event) => handleFieldChange("affiliateCode", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="CODE123"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL</label>
                  <input
                    value={block.affiliateImage || ""}
                    onChange={(event) => handleFieldChange("affiliateImage", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Affiliate URL</label>
                  <input
                    value={block.affiliateUrl || ""}
                    onChange={(event) => handleFieldChange("affiliateUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                    <input
                      type="color"
                      value={block.affiliateColor || "#ffffff"}
                      onChange={(event) => handleFieldChange("affiliateColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                    <input
                      type="color"
                      value={block.affiliateTextColor || "#1f2937"}
                      onChange={(event) => handleFieldChange("affiliateTextColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {block.type === "event" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Event Title</label>
                  <input
                    value={block.eventTitle || ""}
                    onChange={(event) => handleFieldChange("eventTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Live Webinar"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={block.eventDate || ""}
                    onChange={(event) => handleFieldChange("eventDate", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Button Text</label>
                    <input
                      value={block.eventButtonText || ""}
                      onChange={(event) => handleFieldChange("eventButtonText", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Register"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Button URL</label>
                    <input
                      value={block.eventButtonUrl || ""}
                      onChange={(event) => handleFieldChange("eventButtonUrl", event.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                    <input
                      type="color"
                      value={block.eventColor || "#111827"}
                      onChange={(event) => handleFieldChange("eventColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                    <input
                      type="color"
                      value={block.eventTextColor || "#ffffff"}
                      onChange={(event) => handleFieldChange("eventTextColor", event.target.value)}
                      className="h-9 w-full rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {block.type === "spotify" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Spotify URL</label>
                  <input
                    value={block.spotifyUrl || ""}
                    onChange={(event) => handleFieldChange("spotifyUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://open.spotify.com/track/..."
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Supports tracks, albums, and playlists</p>
                </div>
                
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Compact Player</label>
                    <button 
                        onClick={() => handleFieldChange("spotifyCompact", !block.spotifyCompact)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${block.spotifyCompact ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.spotifyCompact ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>
              </div>
            )}

            {block.type === "instagram" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Instagram Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                    <input
                      value={block.instagramUsername || ""}
                      onChange={(event) => handleFieldChange("instagramUsername", event.target.value)}
                      className="w-full rounded-lg border border-border pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Display Type</label>
                  <select
                    value={block.instagramDisplayType || "grid"}
                    onChange={(event) => handleFieldChange("instagramDisplayType", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">Grid (3 Columns)</option>
                    <option value="list">List (Vertical)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Show Username</label>
                    <button 
                        onClick={() => handleFieldChange("instagramShowText", block.instagramShowText === false ? true : false)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${block.instagramShowText !== false ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.instagramShowText !== false ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>

                {block.instagramShowText !== false && (
                    <>
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Text Position</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => handleFieldChange("instagramTextPosition", "top")}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        block.instagramTextPosition === "top" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Top
                                </button>
                                <button
                                    onClick={() => handleFieldChange("instagramTextPosition", "bottom")}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        (block.instagramTextPosition || "bottom") === "bottom" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Bottom
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                            <input
                                type="color"
                                value={block.instagramTextColor || "#000000"}
                                onChange={(event) => handleFieldChange("instagramTextColor", event.target.value)}
                                className="h-9 w-full rounded cursor-pointer"
                            />
                        </div>
                    </>
                )}
              </div>
            )}

            {block.type === "youtube" && (
              <div className="pt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">YouTube Channel URL</label>
                  <input
                    value={block.youtubeUrl || ""}
                    onChange={(event) => handleFieldChange("youtubeUrl", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://youtube.com/@..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Display Type</label>
                  <select
                    value={block.youtubeDisplayType || "grid"}
                    onChange={(event) => handleFieldChange("youtubeDisplayType", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="grid">Grid (2 Columns)</option>
                    <option value="list">List (Vertical)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Show Channel Name</label>
                    <button 
                        onClick={() => handleFieldChange("youtubeShowText", block.youtubeShowText === false ? true : false)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${block.youtubeShowText !== false ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.youtubeShowText !== false ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>

                {block.youtubeShowText !== false && (
                    <>
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Text Position</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => handleFieldChange("youtubeTextPosition", "top")}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        block.youtubeTextPosition === "top" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Top
                                </button>
                                <button
                                    onClick={() => handleFieldChange("youtubeTextPosition", "bottom")}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        (block.youtubeTextPosition || "bottom") === "bottom" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Bottom
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                            <input
                                type="color"
                                value={block.youtubeTextColor || "#ff0000"}
                                onChange={(event) => handleFieldChange("youtubeTextColor", event.target.value)}
                                className="h-9 w-full rounded cursor-pointer"
                            />
                        </div>
                    </>
                )}
              </div>
            )}

            {block.type === "tour" && (
              <div className="pt-3 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Section Title</label>
                  <input
                    value={block.tourTitle || ""}
                    onChange={(event) => handleFieldChange("tourTitle", event.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="TOURS"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-700 block">Tour Dates</label>
                  
                  {(block.tours || []).map((tour, index) => (
                    <div key={tour.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 relative group">
                      <button 
                        onClick={() => {
                          const newTours = [...(block.tours || [])];
                          newTours.splice(index, 1);
                          handleFieldChange("tours", newTours);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon />
                      </button>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">Date</label>
                          <input
                            value={tour.date}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, date: e.target.value };
                              handleFieldChange("tours", newTours);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder="AUG 1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">Location</label>
                          <input
                            value={tour.location}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, location: e.target.value };
                              handleFieldChange("tours", newTours);
                            }}
                            className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="text-[10px] text-gray-500 uppercase font-bold">Image URL</label>
                        <input
                          value={tour.image || ""}
                          onChange={(e) => {
                            const newTours = [...(block.tours || [])];
                            newTours[index] = { ...tour, image: e.target.value };
                            handleFieldChange("tours", newTours);
                          }}
                          className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="mb-2">
                        <label className="text-[10px] text-gray-500 uppercase font-bold">Ticket Link</label>
                        <input
                          value={tour.ticketUrl || ""}
                          onChange={(e) => {
                            const newTours = [...(block.tours || [])];
                            newTours[index] = { ...tour, ticketUrl: e.target.value };
                            handleFieldChange("tours", newTours);
                          }}
                          className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={tour.sellingFast || false}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, sellingFast: e.target.checked, soldOut: e.target.checked ? false : tour.soldOut };
                              handleFieldChange("tours", newTours);
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-gray-600">Selling Fast</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={tour.soldOut || false}
                            onChange={(e) => {
                              const newTours = [...(block.tours || [])];
                              newTours[index] = { ...tour, soldOut: e.target.checked, sellingFast: e.target.checked ? false : tour.sellingFast };
                              handleFieldChange("tours", newTours);
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-gray-600">Sold Out</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newTours = [...(block.tours || [])];
                      newTours.push({
                        id: makeId(),
                        date: "TBA",
                        location: "City",
                        image: "",
                        ticketUrl: ""
                      });
                      handleFieldChange("tours", newTours);
                    }}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusIcon />
                    Add Tour Date
                  </button>
                </div>
              </div>
            )}

            {block.type === "qrcode" && (
              <div className="space-y-4 pt-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['single', 'multiple', 'grid'] as const).map((layout) => (
                      <button
                        key={layout}
                        onClick={() => handleFieldChange("qrCodeLayout", layout)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                          (block.qrCodeLayout || 'single') === layout 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {(block.qrCodeLayout === 'single' || !block.qrCodeLayout) ? (
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Select QR Code</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <select
                          value={block.qrCodeValue || ""}
                          onChange={(event) => handleFieldChange("qrCodeValue", event.target.value)}
                          className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          <option value="">Select a QR Code</option>
                          {availableQrCodes.map((qr) => (
                            <option key={qr.id} value={qr.value}>
                              {qr.value}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width={14} height={14} />
                      </div>
                      <button
                        onClick={onCreateQrCode}
                        className="flex items-center justify-center w-9 h-9 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        title="Create new QR Code"
                      >
                        <PlusIcon width={16} height={16} />
                      </button>
                    </div>
                    {!block.qrCodeValue && (
                      <p className="text-[10px] text-text-muted mt-1">Select an existing QR code or create a new one.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-700 block">QR Codes</label>
                    {(block.qrCodeItems || []).map((item, idx) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 relative group">
                        <button
                          onClick={() => {
                            const newItems = [...(block.qrCodeItems || [])];
                            newItems.splice(idx, 1);
                            handleFieldChange("qrCodeItems", newItems);
                          }}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon width={12} height={12} />
                        </button>
                        <input
                          value={item.label}
                          onChange={(e) => {
                            const newItems = [...(block.qrCodeItems || [])];
                            newItems[idx] = { ...newItems[idx], label: e.target.value };
                            handleFieldChange("qrCodeItems", newItems);
                          }}
                          className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-primary outline-none"
                          placeholder="Label"
                        />
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <select
                              value={item.value}
                              onChange={(e) => {
                                const newItems = [...(block.qrCodeItems || [])];
                                newItems[idx] = { ...newItems[idx], value: e.target.value };
                                handleFieldChange("qrCodeItems", newItems);
                              }}
                              className="w-full appearance-none rounded border border-gray-200 bg-white px-2 py-1.5 pr-6 text-xs focus:border-primary outline-none"
                            >
                              <option value="">Select QR Code</option>
                              {availableQrCodes.map((qr) => (
                                <option key={qr.id} value={qr.value}>
                                  {qr.value}
                                </option>
                              ))}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width={12} height={12} />
                          </div>
                          <button
                            onClick={onCreateQrCode}
                            className="flex items-center justify-center w-7 h-7 bg-white border border-gray-200 rounded text-gray-500 hover:text-primary hover:border-primary transition-colors"
                            title="Create new QR Code"
                          >
                            <PlusIcon width={14} height={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItems = [...(block.qrCodeItems || [])];
                        newItems.push({ id: makeId(), label: "New QR Code", value: "" });
                        handleFieldChange("qrCodeItems", newItems);
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon />
                      Add QR Code Item
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Foreground Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={block.qrCodeColor || "#000000"}
                        onChange={(event) => handleFieldChange("qrCodeColor", event.target.value)}
                        className="h-9 w-full rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={block.qrCodeBgColor || "#FFFFFF"}
                        onChange={(event) => handleFieldChange("qrCodeBgColor", event.target.value)}
                        className="h-9 w-full rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {block.type === "divider" && (
              <p className="text-xs text-text-muted pt-3">Simple dividing line.</p>
            )}

            <div className="pt-2 border-t border-gray-50 mt-3">
              <label className="text-xs font-medium text-gray-700 mb-2 block">Alignment</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleFieldChange("align", align)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      (block.align || 'center') === align 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

BlockItem.displayName = "BlockItem";

export default BlockItem;
