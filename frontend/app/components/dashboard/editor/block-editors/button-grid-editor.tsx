import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, GripVertical, ChevronUp, ChevronDown, Link2, Type, Image } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";

interface GridItem {
  id: string;
  title: string;
  url: string;
  image?: string;
  icon?: string;
}

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

export function ButtonGridBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const items: GridItem[] = (block.gridItems as GridItem[]) || [];
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateItems = useCallback(
    (newItems: GridItem[]) => {
      onChange({ gridItems: newItems });
    },
    [onChange]
  );

  const addItem = useCallback(() => {
    const newItem: GridItem = {
      id: makeId(),
      title: "",
      url: "",
      image: "",
      icon: "",
    };
    updateItems([...items, newItem]);
    setEditingId(newItem.id);
  }, [items, updateItems]);

  const removeItem = useCallback(
    (id: string) => {
      updateItems(items.filter((i) => i.id !== id));
      if (editingId === id) setEditingId(null);
    },
    [items, updateItems, editingId]
  );

  const updateItem = useCallback(
    (id: string, field: keyof GridItem, value: string) => {
      updateItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    },
    [items, updateItems]
  );

  const moveItem = useCallback(
    (index: number, direction: -1 | 1) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= items.length) return;
      const newItems = [...items];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      updateItems(newItems);
    },
    [items, updateItems]
  );

  return (
    <div className="space-y-4">
      {/* Item list */}
      {items.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Type className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-400">Nenhum botão adicionado</p>
          <p className="text-xs text-gray-300 mt-1">Clique no botão abaixo para começar</p>
        </div>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
        >
          {/* Item header — click to expand */}
          <button
            type="button"
            onClick={() => setEditingId(editingId === item.id ? null : item.id)}
            className="w-full flex items-center gap-2.5 p-3 hover:bg-gray-50 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />

            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-sm">{item.icon || "🔗"}</span>
              </div>
            )}

            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {item.title || "Sem título"}
              </p>
              {item.url && (
                <p className="text-[10px] text-gray-400 font-mono truncate">{item.url}</p>
              )}
            </div>

            {/* Reorder buttons */}
            <div className="flex gap-0.5 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveItem(index, -1); }}
                disabled={index === 0}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveItem(index, 1); }}
                disabled={index === items.length - 1}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </button>

          {/* Expanded edit form */}
          {editingId === item.id && (
            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-100 bg-gray-50/50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                  Título
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, "title", e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                  placeholder="Título do botão"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                  URL
                </label>
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateItem(item.id, "url", e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-mono font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                    Ícone (emoji)
                  </label>
                  <input
                    type="text"
                    value={item.icon || ""}
                    onChange={(e) => updateItem(item.id, "icon", e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                    placeholder="🔗"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                    Imagem URL
                  </label>
                  <input
                    type="text"
                    value={item.image || ""}
                    onChange={(e) => updateItem(item.id, "image", e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-mono font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={addItem}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-black rounded-xl text-sm font-bold text-gray-500 hover:text-black transition-all"
      >
        <Plus className="w-4 h-4" />
        Adicionar botão
      </button>
    </div>
  );
}
