import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, ChevronDown, Plus, ExternalLink, BarChart2, Eye, MousePointerClick } from "lucide-react";
import { Link } from "react-router";
import { useQRCodes } from "~/hooks/use-block-integration";
import type { QRCodeItem } from "~/services/block-integration.service";

interface QRCodeSelectorProps {
  bioId: string | null;
  selectedIds?: string[];
  onSelect: (items: QRCodeItem[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function QRCodeSelector({
  bioId,
  selectedIds = [],
  onSelect,
  multiSelect = false,
  className = "",
}: QRCodeSelectorProps) {
  const { qrcodes, isLoading, error } = useQRCodes({ bioId });
  const [isOpen, setIsOpen] = useState(false);

  const selectedItems = qrcodes.filter((q) => selectedIds.includes(q.id));

  const toggleItem = (item: QRCodeItem) => {
    if (multiSelect) {
      const isSelected = selectedIds.includes(item.id);
      const newSelection = isSelected
        ? selectedItems.filter((i) => i.id !== item.id)
        : [...selectedItems, item];
      onSelect(newSelection);
    } else {
      onSelect(selectedIds.includes(item.id) ? [] : [item]);
      setIsOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`neo-card p-3 ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
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
        <p className="text-sm text-red-600">Erro ao carregar QR codes</p>
      </div>
    );
  }

  if (qrcodes.length === 0) {
    return (
      <div className={`border-2 border-dashed border-gray-200 rounded-xl p-4 text-center ${className}`}>
        <QrCode className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-3">
          Nenhum QR code criado
        </p>
        <Link
          to="/dashboard/qrcode"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <Plus className="w-4 h-4" />
          Criar QR Code
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
                <QrCode className="w-5 h-5 text-gray-600" />
              </div>
              <p className="font-semibold text-sm">
                Selecionar QR Code
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {selectedItems.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-primary-100 px-3 py-1.5 rounded-lg"
                >
                  <QrCode className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium truncate max-w-[140px]">
                    {item.value}
                  </span>
                </div>
              ))}
              {selectedItems.length > 2 && (
                <span className="text-sm text-gray-500">
                  +{selectedItems.length - 2}
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
              className="absolute z-50 top-full left-0 right-0 mt-2 neo-card max-h-72 overflow-hidden flex flex-col"
            >
              {/* List */}
              <div className="flex-1 overflow-y-auto p-2">
                {qrcodes.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? "bg-primary-50 border border-primary-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 ${
                          isSelected
                            ? "bg-primary-600 border-primary-600"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.value}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <MousePointerClick className="w-3 h-3" />
                            {item.clicks} cliques
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Eye className="w-3 h-3" />
                            {item.views} views
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 p-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {selectedItems.length} selecionado(s)
                </span>
                <Link
                  to="/dashboard/qrcode"
                  className="flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-700 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  Gerenciar
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
