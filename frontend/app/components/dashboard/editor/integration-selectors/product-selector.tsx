import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronDown, Plus, ExternalLink, Package } from "lucide-react";
import { Link } from "react-router";
import { useProducts } from "~/hooks/use-block-integration";
import type { Product } from "~/services/block-integration.service";

interface ProductSelectorProps {
  bioId: string | null;
  selectedProductIds?: string[];
  onSelect: (products: Product[]) => void;
  multiSelect?: boolean;
  maxSelection?: number;
  className?: string;
}

export function ProductSelector({
  bioId,
  selectedProductIds = [],
  onSelect,
  multiSelect = false,
  maxSelection,
  className = "",
}: ProductSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { products, isLoading, error } = useProducts({ bioId });
  const [isOpen, setIsOpen] = useState(false);

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const toggleProduct = (product: Product) => {
    if (multiSelect) {
      const isSelected = selectedProductIds.includes(product.id);
      let newSelection: Product[];
      
      if (isSelected) {
        newSelection = selectedProducts.filter((p) => p.id !== product.id);
      } else {
        if (maxSelection && selectedProducts.length >= maxSelection) {
          return;
        }
        newSelection = [...selectedProducts, product];
      }
      
      onSelect(newSelection);
    } else {
      onSelect(selectedProductIds.includes(product.id) ? [] : [product]);
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
          {t("editor.blockIntegration.products.error")}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`neo-card p-4 text-center ${className}`}>
        <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-3">
          {t("editor.blockIntegration.products.empty")}
        </p>
        <Link
          to="/dashboard/products"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.products.create")}
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
          {selectedProducts.length === 0 ? (
            <>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
              </div>
              <p className="font-semibold text-sm">
                {t("editor.blockIntegration.products.select")}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {selectedProducts.slice(0, 2).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 bg-primary-100 px-3 py-1.5 rounded-lg"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-primary-600" />
                  )}
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {product.name}
                  </span>
                  <span className="text-xs text-primary-700">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ))}
              {selectedProducts.length > 2 && (
                <span className="text-sm text-gray-500">
                  +{selectedProducts.length - 2}
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
              {/* Products List */}
              <div className="overflow-auto flex-1 p-2">
                <div className="grid grid-cols-1 gap-2">
                  {products.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product)}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isSelected
                            ? "bg-primary-100 border-2 border-primary-500"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        }`}
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-lg font-bold text-primary-600">
                            {formatPrice(product.price)}
                          </p>
                          {product.category && (
                            <span className="text-xs text-gray-500">
                              {product.category}
                            </span>
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
                {multiSelect && selectedProducts.length > 0 && (
                  <span className="text-xs text-gray-500 px-2">
                    {selectedProducts.length} {t("editor.blockIntegration.products.selected")}
                  </span>
                )}
                <Link
                  to="/dashboard/products"
                  className="flex items-center justify-center gap-2 ml-auto px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("editor.blockIntegration.products.manage")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
