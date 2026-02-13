import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  MapPin,
  Calendar,
  Ticket,
  AlertTriangle,
  Flame,
} from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorInput } from "./shared/editor-fields";
import { ImageUpload } from "../image-upload";

interface TourDate {
  id: string;
  date: string;
  location: string;
  venue: string;
  image?: string;
  ticketUrl?: string;
  soldOut?: boolean;
  sellingFast?: boolean;
}

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

export function TourBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const tours: TourDate[] = (block.tours as TourDate[]) || [];
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateTours = useCallback(
    (newTours: TourDate[]) => {
      onChange({ tours: newTours });
    },
    [onChange]
  );

  const addTour = useCallback(() => {
    const newTour: TourDate = {
      id: makeId(),
      date: "",
      location: "",
      venue: "",
      ticketUrl: "",
      soldOut: false,
      sellingFast: false,
    };
    updateTours([...tours, newTour]);
    setEditingId(newTour.id);
  }, [tours, updateTours]);

  const removeTour = useCallback(
    (id: string) => {
      updateTours(tours.filter((t) => t.id !== id));
      if (editingId === id) setEditingId(null);
    },
    [tours, updateTours, editingId]
  );

  const updateTour = useCallback(
    (id: string, field: keyof TourDate, value: string | boolean) => {
      updateTours(tours.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    },
    [tours, updateTours]
  );

  const moveTour = useCallback(
    (index: number, direction: -1 | 1) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= tours.length) return;
      const newTours = [...tours];
      [newTours[index], newTours[newIndex]] = [newTours[newIndex], newTours[index]];
      updateTours(newTours);
    },
    [tours, updateTours]
  );

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Sem data";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Tour title */}
      <EditorInput
        label={t("editor.editDrawer.fields.tourTitleLabel")}
        value={block.tourTitle || ""}
        onChange={(v) => onChange({ tourTitle: v })}
        placeholder={t("editor.editDrawer.fields.tourTitlePlaceholder")}
      />

      {/* Separator */}
      <div className="h-px bg-gray-100" />

      {/* Tour dates */}
      {tours.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-400">Nenhuma data adicionada</p>
          <p className="text-xs text-gray-300 mt-1">Adicione as datas da sua tour</p>
        </div>
      )}

      {tours.map((tour, index) => (
        <div
          key={tour.id}
          className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
        >
          {/* Tour header */}
          <button
            type="button"
            onClick={() => setEditingId(editingId === tour.id ? null : tour.id)}
            className="w-full flex items-center gap-2.5 p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex flex-col items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>

            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {tour.location || "Local não definido"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-medium">
                  {formatDateDisplay(tour.date)}
                </span>
                {tour.venue && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    • {tour.venue}
                  </span>
                )}
              </div>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-1 shrink-0">
              {tour.soldOut && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded-md uppercase">
                  Esgotado
                </span>
              )}
              {tour.sellingFast && !tour.soldOut && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-bold rounded-md uppercase">
                  Quase esgotado
                </span>
              )}
            </div>

            {/* Reorder */}
            <div className="flex gap-0.5 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveTour(index, -1); }}
                disabled={index === 0}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveTour(index, 1); }}
                disabled={index === tours.length - 1}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTour(tour.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </button>

          {/* Edit form */}
          {editingId === tour.id && (
            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-100 bg-gray-50/50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                  Data e hora
                </label>
                <input
                  type="datetime-local"
                  value={tour.date}
                  onChange={(e) => updateTour(tour.id, "date", e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                    Cidade / Local
                  </label>
                  <input
                    type="text"
                    value={tour.location}
                    onChange={(e) => updateTour(tour.id, "location", e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                    placeholder="São Paulo, BR"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                    Venue / Casa
                  </label>
                  <input
                    type="text"
                    value={tour.venue}
                    onChange={(e) => updateTour(tour.id, "venue", e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                    placeholder="Nome do espaço"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                  Link do ingresso
                </label>
                <input
                  type="text"
                  value={tour.ticketUrl || ""}
                  onChange={(e) => updateTour(tour.id, "ticketUrl", e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-mono font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                  Imagem
                </label>
                <ImageUpload
                  value={tour.image || ""}
                  onChange={(url) => updateTour(tour.id, "image", url)}
                  placeholder="Upload ou URL"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={tour.soldOut || false}
                      onChange={(e) => updateTour(tour.id, "soldOut", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-gray-200 rounded-full peer-checked:bg-red-500 transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow peer-checked:translate-x-3.5 transition-transform" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Esgotado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={tour.sellingFast || false}
                      onChange={(e) => updateTour(tour.id, "sellingFast", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-gray-200 rounded-full peer-checked:bg-amber-500 transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow peer-checked:translate-x-3.5 transition-transform" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Quase esgotando</span>
                </label>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add tour date */}
      <button
        type="button"
        onClick={addTour}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-black rounded-xl text-sm font-bold text-gray-500 hover:text-black transition-all"
      >
        <Plus className="w-4 h-4" />
        Adicionar data
      </button>
    </div>
  );
}
