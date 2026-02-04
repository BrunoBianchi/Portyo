import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, ChevronDown, Plus, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useMarketingSlots } from "~/hooks/use-block-integration";
import type { MarketingSlot } from "~/services/block-integration.service";

interface MarketingSlotSelectorProps {
  bioId: string | null;
  selectedSlotId?: string;
  onSelect: (slot: MarketingSlot | null) => void;
  className?: string;
}

export function MarketingSlotSelector({
  bioId,
  selectedSlotId,
  onSelect,
  className = "",
}: MarketingSlotSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { slots, isLoading, error } = useMarketingSlots({ bioId });
  const [isOpen, setIsOpen] = useState(false);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const formatPrice = (price?: number) => {
    if (price === undefined) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
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
          {t("editor.blockIntegration.marketing.error")}
        </p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={`neo-card p-4 text-center ${className}`}>
        <Megaphone className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-3">
          {t("editor.blockIntegration.marketing.empty")}
        </p>
        <Link
          to="/dashboard/marketing"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.marketing.create")}
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
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            selectedSlot ? "bg-primary-100" : "bg-gray-100"
          }`}>
            <Sparkles className={`w-5 h-5 ${selectedSlot ? "text-primary-600" : "text-gray-600"}`} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {selectedSlot?.name || t("editor.blockIntegration.marketing.select")}
            </p>
            {selectedSlot && selectedSlot.price !== undefined && (
              <p className="text-xs text-primary-600 font-semibold">
                {formatPrice(selectedSlot.price)}
              </p>
            )}
          </div>
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
              className="absolute z-50 top-full left-0 right-0 mt-2 neo-card max-h-64 overflow-auto"
            >
              <div className="p-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      onSelect(slot.id === selectedSlotId ? null : slot);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      slot.id === selectedSlotId
                        ? "bg-primary-100 border-2 border-primary-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {slot.name}
                      </p>
                      {slot.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {slot.description}
                        </p>
                      )}
                    </div>
                    {slot.price !== undefined && (
                      <span className="text-sm font-bold text-primary-600 flex-shrink-0">
                        {formatPrice(slot.price)}
                      </span>
                    )}
                    {slot.id === selectedSlotId && (
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
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 p-2">
                <Link
                  to="/dashboard/marketing"
                  className="flex items-center justify-center gap-2 w-full p-3 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("editor.blockIntegration.marketing.manage")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
