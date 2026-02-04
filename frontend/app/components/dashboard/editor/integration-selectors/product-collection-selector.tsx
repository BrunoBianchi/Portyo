import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ShoppingBag, X, GripVertical, Plus } from "lucide-react";
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
import { ProductSelector } from "./product-selector";
import type { Product } from "~/services/block-integration.service";

interface ProductCollectionConfig {
  productIds: string[];
  layout: "grid" | "list" | "carousel";
  showPrices: boolean;
  showDescriptions: boolean;
}

interface ProductCollectionSelectorProps {
  bioId: string | null;
  config: ProductCollectionConfig;
  onChange: (config: ProductCollectionConfig) => void;
  className?: string;
}

// Sortable product item
function SortableProductItem({
  product,
  onRemove,
}: {
  product: Product;
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
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
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

      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingBag className="w-5 h-5 text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <p className="text-sm font-bold text-primary-600">
          {formatPrice(product.price)}
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
        title={t("editor.blockIntegration.products.remove")}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ProductCollectionSelector({
  bioId,
  config,
  onChange,
  className = "",
}: ProductCollectionSelectorProps) {
  const { t } = useTranslation("dashboard");
  const [showSelector, setShowSelector] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = config.productIds.indexOf(active.id as string);
      const newIndex = config.productIds.indexOf(over.id as string);
      
      onChange({
        ...config,
        productIds: arrayMove(config.productIds, oldIndex, newIndex),
      });
    }
  };

  const handleSelect = (products: Product[]) => {
    onChange({
      ...config,
      productIds: products.map((p) => p.id),
    });
  };

  const handleRemove = (productId: string) => {
    onChange({
      ...config,
      productIds: config.productIds.filter((id) => id !== productId),
    });
  };

  // We need to fetch products to display the selected ones
  // For now, we'll just show IDs if we don't have the product data
  // In a real implementation, you might want to pass the full products array

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Layout Options */}
      <div className="grid grid-cols-3 gap-2">
        {(["grid", "list", "carousel"] as const).map((layout) => (
          <button
            key={layout}
            type="button"
            onClick={() => onChange({ ...config, layout })}
            className={`p-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
              config.layout === layout
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {t(`editor.blockIntegration.products.layout.${layout}`)}
          </button>
        ))}
      </div>

      {/* Display Options */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showPrices}
            onChange={(e) =>
              onChange({ ...config, showPrices: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            {t("editor.blockIntegration.products.showPrices")}
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
            {t("editor.blockIntegration.products.showDescriptions")}
          </span>
        </label>
      </div>

      {/* Selected Products */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            {t("editor.blockIntegration.products.selected")}
          </p>
          <span className="text-xs text-gray-500">
            {config.productIds.length}{" "}
            {t("editor.blockIntegration.products.items")}
          </span>
        </div>

        {config.productIds.length === 0 ? (
          <div className="neo-card p-6 text-center">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">
              {t("editor.blockIntegration.products.noSelection")}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={config.productIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {/* Here we would render SortableProductItem for each selected product
                    But we need the full product data. For now, we'll just show IDs */}
                {config.productIds.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200"
                  >
                    <div className="p-1">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-500">
                        {t("editor.blockIntegration.products.productId", { id: id.slice(0, 8) })}
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
          {t("editor.blockIntegration.products.add")}
        </button>

        {/* Product Selector Dropdown */}
        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ProductSelector
                bioId={bioId}
                selectedProductIds={config.productIds}
                onSelect={(products) => {
                  handleSelect(products);
                  if (products.length > config.productIds.length) {
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
