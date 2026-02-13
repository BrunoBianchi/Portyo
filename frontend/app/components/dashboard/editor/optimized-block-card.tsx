import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { GripVertical, PenLine, Trash2, Sparkles } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";

interface BlockCardProps {
  block: BioBlock;
  onEdit: () => void;
  onDelete: () => void;
  dragListeners?: any;
}

// Memoized component to prevent unnecessary re-renders
export const OptimizedBlockCard = React.memo(function BlockCard({
  block,
  onEdit,
  onDelete,
  dragListeners,
}: BlockCardProps) {
  const { t } = useTranslation("dashboard");

  // Memoize style computation
  const previewStyle = useMemo(
    () => ({
      backgroundColor: block.blockBackground || "#FFFFFF",
      borderRadius: `${block.blockBorderRadius ?? 12}px`,
      borderWidth: `${block.blockBorderWidth ?? 0}px`,
      borderColor: block.blockBorderColor || "#E5E7EB",
      borderStyle: "solid" as const,
      opacity: (block.blockOpacity ?? 100) / 100,
      boxShadow: getShadowStyle(block.blockShadow),
    }),
    [
      block.blockBackground,
      block.blockBorderRadius,
      block.blockBorderWidth,
      block.blockBorderColor,
      block.blockOpacity,
      block.blockShadow,
    ]
  );

  // Memoize computed values
  const hasCustomStyle = useMemo(
    () =>
      block.blockBackground ||
      block.blockBorderWidth ||
      block.blockShadow ||
      block.entranceAnimation,
    [block.blockBackground, block.blockBorderWidth, block.blockShadow, block.entranceAnimation]
  );

  const blockTypeLabel = useMemo(
    () => t(`editor.blockTypes.${block.type}`, { defaultValue: block.type }),
    [block.type, t]
  );

  const blockPreview = useMemo(() => getBlockPreview(block, t), [block, t]);

  // Memoized handlers
  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit();
    },
    [onEdit]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete]
  );

  return (
    <div
      onClick={onEdit}
      className="group relative bg-white border-2 border-gray-200 hover:border-[#8129D9] rounded-[16px] sm:rounded-[20px] transition-all cursor-pointer overflow-hidden"
    >
      {/* Style Preview Strip */}
      <div
        className="h-1.5 sm:h-2 w-full"
        style={{
          backgroundColor: block.blockBackground || "#F3F4F6",
          opacity: 0.5,
        }}
      />

      <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Drag Handle */}
        <div
          {...dragListeners}
          className="mt-1 p-1 hover:bg-gray-100 rounded cursor-move transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Preview Card */}
          <div className="p-2 sm:p-3 mb-2 sm:mb-3 border transition-all" style={previewStyle}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="p-1 sm:p-1.5 rounded-lg flex-shrink-0"
                style={{
                  backgroundColor: block.accent || "#F3F4F6",
                  color: block.textColor || "#1A1A1A",
                }}
              >
                <BlockIcon type={block.type} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-xs sm:text-sm truncate"
                  style={{ color: block.textColor || "#1A1A1A" }}
                >
                  {block.title || blockTypeLabel}
                </h3>
                <p
                  className="text-[10px] sm:text-xs truncate opacity-60"
                  style={{ color: block.textColor || "#6B7280" }}
                >
                  {blockPreview}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
              {hasCustomStyle && (
                <span className="flex items-center gap-0.5 sm:gap-1 text-[#8129D9]">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">
                    {t("editor.blockStyle.styled")}
                  </span>
                </span>
              )}
              {block.entranceAnimation && block.entranceAnimation !== "none" && (
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400" />
                  <span className="hidden sm:inline">
                    {t("editor.blockStyle.animation")}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEditClick}
                className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#8129D9] transition-colors"
              >
                <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-1 sm:p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Helper components
function BlockIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    button: "🔗",
    heading: "📝",
    text: "📄",
    image: "🖼️",
    video: "🎬",
    socials: "👥",
    youtube: "▶️",
    spotify: "🎵",
    instagram: "📷",
    whatsapp: "💬",
    qrcode: "🔲",
    tour: "🗓️",
    calendar: "📅",
    map: "🗺️",
    form: "📋",
    poll: "🗳️",
    portfolio: "💼",
    experience: "⭐",
    marketing: "📢",
    event: "🎉",
    featured: "🌟",
    affiliate: "🏷️",
    button_grid: "🔳",
    product: "🛍️",
    blog: "📰",
    divider: "➖",
  };

  return <span className="text-lg">{icons[type] || "📦"}</span>;
}

function getBlockPreview(block: BioBlock, t: any): string {
  switch (block.type) {
    case "button":
      return block.href
        ? new URL(block.href).hostname.replace("www.", "")
        : t("editor.preview.noUrl");
    case "heading":
    case "text":
      return block.body?.substring(0, 40) || "";
    case "image":
    case "video":
      return block.mediaUrl
        ? t("editor.preview.mediaAttached")
        : t("editor.preview.noMedia");
    case "socials": {
      const count = Object.values(block.socials || {}).filter(Boolean).length;
      return count
        ? t("editor.preview.links", { count })
        : t("editor.preview.noLinks");
    }
    case "qrcode":
      return block.qrCodeValue
        ? t("editor.preview.qrConfigured")
        : t("editor.preview.noQrValue");
    case "whatsapp":
      return block.whatsappNumber || t("editor.preview.noWhatsappNumber");
    case "spotify":
      return block.spotifyUrl
        ? t("editor.preview.spotifyConfigured")
        : t("editor.preview.noSpotify");
    case "youtube":
      return block.youtubeUrl
        ? t("editor.preview.youtubeConfigured")
        : t("editor.preview.noYoutube");
    case "instagram":
      return block.instagramUsername
        ? `@${block.instagramUsername}`
        : t("editor.preview.noInstagram");
    case "map":
      return block.mapTitle || block.mapAddress || t("editor.preview.mapFallback");
    case "calendar":
      return t("editor.preview.calendarFallback");
    case "tour":
      return block.tourTitle || t("editor.preview.tourFallback");
    case "event":
      return block.eventTitle || t("editor.preview.eventFallback");
    case "form":
      return block.formId
        ? t("editor.preview.formSelected")
        : t("editor.preview.noFormSelected");
    case "poll":
      return block.pollId
        ? t("editor.preview.pollSelected", { defaultValue: "Poll selected" })
        : t("editor.preview.noPollSelected", { defaultValue: "No poll selected" });
    case "portfolio":
      return block.portfolioTitle || t("editor.preview.portfolioFallback");
    case "experience": {
      const count = block.experiences?.length || 0;
      return count
        ? t("editor.preview.experienceCount", { count })
        : t("editor.preview.noExperience");
    }
    case "marketing":
      return block.marketingId
        ? t("editor.preview.slotConnected")
        : t("editor.preview.noSlotSelected");
    case "product":
      return block.products?.length
        ? t("editor.preview.productsCount", { count: block.products.length })
        : t("editor.preview.noProducts");
    case "featured":
      return block.featuredTitle || t("editor.preview.featuredFallback");
    case "affiliate":
      return block.affiliateCode
        ? `${block.affiliateTitle || ""} (${block.affiliateCode})`
        : t("editor.preview.affiliateFallback");
    case "blog":
      return t("editor.preview.blogFallback");
    case "divider":
      return t("editor.preview.dividerFallback");
    case "button_grid": {
      const count = block.gridItems?.length || 0;
      return count
        ? t("editor.preview.gridItemsCount", { count })
        : t("editor.preview.emptyGrid");
    }
    default:
      return "";
  }
}

function getShadowStyle(shadow?: string): string {
  switch (shadow) {
    case "sm":
      return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    case "md":
      return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    case "lg":
      return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    case "xl":
      return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    case "2xl":
      return "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    case "glow":
      return "0 0 20px rgba(129, 41, 217, 0.4)";
    default:
      return "none";
  }
}
