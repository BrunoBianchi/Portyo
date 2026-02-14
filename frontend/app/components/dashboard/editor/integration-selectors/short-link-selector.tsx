import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, ChevronDown, Plus, ExternalLink, MousePointerClick } from "lucide-react";
import { Link } from "react-router";
import { useShortLinks } from "~/hooks/use-block-integration";
import type { ShortLinkItem } from "~/services/block-integration.service";

interface ShortLinkSelectorProps {
  bioId: string | null;
  selectedIds?: string[];
  onSelect: (items: ShortLinkItem[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function ShortLinkSelector({
  bioId,
  selectedIds = [],
  onSelect,
  multiSelect = false,
  className = "",
}: ShortLinkSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { shortLinks, isLoading, error } = useShortLinks({ bioId });
  const [isOpen, setIsOpen] = useState(false);

  const activeShortLinks = useMemo(
    () => shortLinks.filter((item) => item.isActive),
    [shortLinks]
  );

  const selectedItems = activeShortLinks.filter((item) => selectedIds.includes(item.id));

  const toggleItem = (item: ShortLinkItem) => {
    if (multiSelect) {
      const isSelected = selectedIds.includes(item.id);
      const nextSelection = isSelected
        ? selectedItems.filter((selected) => selected.id !== item.id)
        : [...selectedItems, item];
      onSelect(nextSelection);
      return;
    }

    onSelect(selectedIds.includes(item.id) ? [] : [item]);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`neo-card p-3 ${className}`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`neo-card p-3 border-red-500 ${className}`}>
        <p className="text-sm text-red-600">
          {t("editor.blockIntegration.shortLinks.error", { defaultValue: "Failed to load short links" })}
        </p>
      </div>
    );
  }

  if (activeShortLinks.length === 0) {
    return (
      <div className={`border-2 border-dashed border-gray-200 rounded-xl p-4 text-center ${className}`}>
        <LinkIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-3">
          {t("editor.blockIntegration.shortLinks.empty", { defaultValue: "No short links created yet" })}
        </p>
        <Link
          to="/dashboard/link-shortener"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.shortLinks.create", { defaultValue: "Create short link" })}
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="neo-input w-full flex items-center justify-between gap-3 p-3 text-left bg-white"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selectedItems.length === 0 ? (
            <>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-5 h-5 text-gray-600" />
              </div>
              <p className="font-semibold text-sm">
                {t("editor.blockIntegration.shortLinks.select", { defaultValue: "Select short link" })}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              {selectedItems.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-primary-100 px-3 py-1.5 rounded-lg"
                >
                  <LinkIcon className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium truncate max-w-[160px]">/{item.slug}</span>
                </div>
              ))}
              {selectedItems.length > 2 && (
                <span className="text-sm text-gray-500">+{selectedItems.length - 2}</span>
              )}
            </div>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 neo-card max-h-72 overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-2">
                {activeShortLinks.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        isSelected ? "bg-primary-50 border border-primary-200" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? "bg-primary-600 border-primary-600" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 truncate">/{item.slug} → {item.destinationUrl}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                          <MousePointerClick className="w-3 h-3" />
                          <span>{item.clicks} {t("editor.blockIntegration.shortLinks.clicks", { defaultValue: "clicks" })}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 p-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {selectedItems.length} {t("editor.blockIntegration.shortLinks.selected", { defaultValue: "selected" })}
                </span>
                <Link
                  to="/dashboard/link-shortener"
                  className="flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-700 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t("editor.blockIntegration.shortLinks.manage", { defaultValue: "Manage" })}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
