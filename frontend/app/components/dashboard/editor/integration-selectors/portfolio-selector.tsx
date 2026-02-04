import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, ChevronDown, Plus, ExternalLink, FolderOpen } from "lucide-react";
import { Link } from "react-router";
import { usePortfolio } from "~/hooks/use-block-integration";
import type { PortfolioItem } from "~/services/block-integration.service";

interface PortfolioSelectorProps {
  bioId: string | null;
  selectedItemIds?: string[];
  onSelect: (items: PortfolioItem[]) => void;
  multiSelect?: boolean;
  maxSelection?: number;
  className?: string;
}

export function PortfolioSelector({
  bioId,
  selectedItemIds = [],
  onSelect,
  multiSelect = false,
  maxSelection,
  className = "",
}: PortfolioSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { items, categories, isLoading, error } = usePortfolio({ bioId });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = selectedCategory
    ? items.filter((i) => i.categoryId === selectedCategory)
    : items;

  const selectedItems = items.filter((i) => selectedItemIds.includes(i.id));

  const toggleItem = (item: PortfolioItem) => {
    if (multiSelect) {
      const isSelected = selectedItemIds.includes(item.id);
      let newSelection: PortfolioItem[];
      
      if (isSelected) {
        newSelection = selectedItems.filter((i) => i.id !== item.id);
      } else {
        if (maxSelection && selectedItems.length >= maxSelection) {
          return;
        }
        newSelection = [...selectedItems, item];
      }
      
      onSelect(newSelection);
    } else {
      onSelect(selectedItemIds.includes(item.id) ? [] : [item]);
      setIsOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`neo-card p-3 ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`neo-card p-3 border-red-500 ${className}`}>
        <p className="text-sm text-red-600">
          {t("editor.blockIntegration.portfolio.error")}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`neo-card p-4 text-center ${className}`}>
        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-3">
          {t("editor.blockIntegration.portfolio.empty")}
        </p>
        <Link
          to="/dashboard/portfolio"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.portfolio.create")}
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neo-input w-full flex items-center justify-between gap-3 p-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selectedItems.length === 0 ? (
            <>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-gray-600" />
              </div>
              <p className="font-semibold text-sm">
                {t("editor.blockIntegration.portfolio.select")}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {selectedItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-primary-100 px-3 py-1.5 rounded-lg"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-primary-600" />
                  )}
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {item.title}
                  </span>
                </div>
              ))}
              {selectedItems.length > 3 && (
                <span className="text-sm text-gray-500">
                  +{selectedItems.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 neo-card max-h-80 overflow-hidden flex flex-col"
            >
              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="border-b border-gray-200 p-2">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                        selectedCategory === null
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {t("editor.blockIntegration.portfolio.allCategories")}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          selectedCategory === cat.id
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="overflow-auto flex-1 p-2">
                <div className="grid grid-cols-1 gap-2">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isSelected
                            ? "bg-primary-100 border-2 border-primary-500"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        }`}
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {multiSelect ? (
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "bg-primary-600"
                                : "border-2 border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        ) : (
                          isSelected && (
                            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-2 flex items-center justify-between">
                {multiSelect && selectedItems.length > 0 && (
                  <span className="text-xs text-gray-500 px-2">
                    {selectedItems.length} {t("editor.blockIntegration.portfolio.selected")}
                  </span>
                )}
                <Link
                  to="/dashboard/portfolio"
                  className="flex items-center justify-center gap-2 ml-auto px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("editor.blockIntegration.portfolio.manage")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
