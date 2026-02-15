import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, GripVertical, Plus, LayoutGrid, List, Rows3 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePortfolio } from "~/hooks/use-block-integration";
import { PortfolioSelector } from "./portfolio-selector";
import type { PortfolioItem } from "~/services/block-integration.service";

interface PortfolioGalleryConfig {
  itemIds: string[];
  layout: "grid" | "masonry" | "carousel";
  columns: 2 | 3 | 4;
  showTitles: boolean;
  showDescriptions: boolean;
}

interface PortfolioGallerySelectorProps {
  bioId: string | null;
  config: PortfolioGalleryConfig;
  onChange: (config: PortfolioGalleryConfig) => void;
  className?: string;
}

// Sortable portfolio item
function SortablePortfolioItem({
  item,
  onRemove,
}: {
  item: PortfolioItem;
  onRemove: () => void;
}) {
  const { t } = useTranslation("dashboard");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white rounded-lg border-2 ${
        isDragging ? "border-primary-500 shadow-lg" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </button>

      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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
        <p className="font-semibold text-sm truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-gray-500 truncate">{item.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
        title={t("editor.blockIntegration.portfolio.remove")}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function PortfolioGallerySelector({
  bioId,
  config,
  onChange,
  className = "",
}: PortfolioGallerySelectorProps) {
  const { t } = useTranslation("dashboard");
  const [showSelector, setShowSelector] = useState(false);
  const { items: portfolioItems, isLoading: isPortfolioLoading } = usePortfolio({
    bioId,
    enabled: Boolean(bioId),
  });
  const didInitializeSelectionRef = useRef(false);
  const hasSeenLoadingRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const portfolioItemsById = useMemo(
    () => new Map(portfolioItems.map((item) => [item.id, item])),
    [portfolioItems]
  );

  const selectedPortfolioItems = useMemo(
    () =>
      config.itemIds
        .map((id) => portfolioItemsById.get(id))
        .filter((item): item is PortfolioItem => Boolean(item)),
    [config.itemIds, portfolioItemsById]
  );

  const missingSelectedIds = useMemo(
    () => config.itemIds.filter((id) => !portfolioItemsById.has(id)),
    [config.itemIds, portfolioItemsById]
  );

  useEffect(() => {
    didInitializeSelectionRef.current = false;
    hasSeenLoadingRef.current = false;
  }, [bioId]);

  useEffect(() => {
    if (isPortfolioLoading) {
      hasSeenLoadingRef.current = true;
    }
  }, [isPortfolioLoading]);

  useEffect(() => {
    if (didInitializeSelectionRef.current) return;
    if (!bioId) return;
    if (!hasSeenLoadingRef.current && portfolioItems.length === 0) return;
    if (isPortfolioLoading) return;

    didInitializeSelectionRef.current = true;

    if (config.itemIds.length === 0 && portfolioItems.length > 0) {
      onChange({
        ...config,
        itemIds: portfolioItems.map((item) => item.id),
      });
    }
  }, [config, isPortfolioLoading, onChange, portfolioItems]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentSortableIds = selectedPortfolioItems.map((item) => item.id);
      const oldIndex = currentSortableIds.indexOf(active.id as string);
      const newIndex = currentSortableIds.indexOf(over.id as string);

      if (oldIndex < 0 || newIndex < 0) {
        return;
      }

      const reorderedResolvedIds = arrayMove(currentSortableIds, oldIndex, newIndex);
      const unresolvedIds = config.itemIds.filter((id) => !portfolioItemsById.has(id));

      onChange({
        ...config,
        itemIds: [...reorderedResolvedIds, ...unresolvedIds],
      });
    }
  };

  const handleSelect = (items: PortfolioItem[]) => {
    onChange({
      ...config,
      itemIds: items.map((i) => i.id),
    });
  };

  const handleRemove = (itemId: string) => {
    onChange({
      ...config,
      itemIds: config.itemIds.filter((id) => id !== itemId),
    });
  };

  const layoutIcons = {
    grid: LayoutGrid,
    masonry: Rows3,
    carousel: List,
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Layout Options */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          {t("editor.blockIntegration.portfolio.layout.label")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["grid", "masonry", "carousel"] as const).map((layout) => {
            const Icon = layoutIcons[layout];
            return (
              <button
                key={layout}
                type="button"
                onClick={() => onChange({ ...config, layout })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
                  config.layout === layout
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {t(`editor.blockIntegration.portfolio.layout.${layout}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Columns (only for grid/masonry) */}
      {config.layout !== "carousel" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            {t("editor.blockIntegration.portfolio.columns.label")}
          </p>
          <div className="flex gap-2">
            {([2, 3, 4] as const).map((cols) => (
              <button
                key={cols}
                type="button"
                onClick={() => onChange({ ...config, columns: cols })}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
                  config.columns === cols
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {cols} {t("editor.blockIntegration.portfolio.columns.suffix")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Display Options */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showTitles}
            onChange={(e) =>
              onChange({ ...config, showTitles: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            {t("editor.blockIntegration.portfolio.showTitles")}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showDescriptions}
            onChange={(e) =>
              onChange({ ...config, showDescriptions: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            {t("editor.blockIntegration.portfolio.showDescriptions")}
          </span>
        </label>
      </div>

      {/* Selected Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            {t("editor.blockIntegration.portfolio.selected")}
          </p>
          <span className="text-xs text-gray-500">
            {config.itemIds.length}{" "}
            {t("editor.blockIntegration.portfolio.items")}
          </span>
        </div>

        {config.itemIds.length === 0 ? (
          <div className="neo-card p-6 text-center">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">
              {t("editor.blockIntegration.portfolio.noSelection")}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedPortfolioItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {selectedPortfolioItems.map((item) => (
                  <SortablePortfolioItem
                    key={item.id}
                    item={item}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}

                {missingSelectedIds.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200"
                  >
                    <div className="p-1">
                      <GripVertical className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-500">
                        {t("editor.blockIntegration.portfolio.itemId", {
                          id: id.slice(0, 8),
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add Button */}
        <button
          type="button"
          onClick={() => setShowSelector(!showSelector)}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.portfolio.add")}
        </button>

        {/* Portfolio Selector Dropdown */}
        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <PortfolioSelector
                bioId={bioId}
                selectedItemIds={config.itemIds}
                onSelect={(items) => {
                  handleSelect(items);
                  if (items.length > config.itemIds.length) {
                    setShowSelector(false);
                  }
                }}
                multiSelect
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
