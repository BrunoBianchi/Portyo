import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { EditorInput, EditorTextarea } from "./shared/editor-fields";

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

export function ExperienceBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const experiences: Experience[] = (block.experiences as Experience[]) || [];
  const [editingId, setEditingId] = useState<string | null>(null);

  const update = useCallback(
    (newItems: Experience[]) => onChange({ experiences: newItems }),
    [onChange]
  );

  const add = useCallback(() => {
    const newItem: Experience = {
      id: makeId(),
      role: "",
      company: "",
      period: "",
      location: "",
      description: "",
    };
    update([...experiences, newItem]);
    setEditingId(newItem.id);
  }, [experiences, update]);

  const remove = useCallback(
    (id: string) => {
      update(experiences.filter((e) => e.id !== id));
      if (editingId === id) setEditingId(null);
    },
    [experiences, update, editingId]
  );

  const updateItem = useCallback(
    (id: string, field: keyof Experience, value: string) => {
      update(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    },
    [experiences, update]
  );

  const move = useCallback(
    (index: number, direction: -1 | 1) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= experiences.length) return;
      const arr = [...experiences];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      update(arr);
    },
    [experiences, update]
  );

  return (
    <div className="space-y-4">
      {/* Section title */}
      <EditorInput
        label={t("editor.editDrawer.fields.experienceSectionTitleLabel")}
        value={block.experienceTitle || ""}
        onChange={(v) => onChange({ experienceTitle: v })}
        placeholder={t("editor.editDrawer.fields.experienceSectionTitlePlaceholder")}
      />

      <div className="h-px bg-gray-100" />

      {/* Empty state */}
      {experiences.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-400">Nenhuma experiência</p>
          <p className="text-xs text-gray-300 mt-1">Adicione sua experiência profissional</p>
        </div>
      )}

      {/* Experience list */}
      {experiences.map((exp, index) => (
        <div
          key={exp.id}
          className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
        >
          {/* Header */}
          <button
            type="button"
            onClick={() => setEditingId(editingId === exp.id ? null : exp.id)}
            className="w-full flex items-center gap-2.5 p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-gray-500" />
            </div>

            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {exp.role || "Cargo não definido"}
              </p>
              <div className="flex items-center gap-2">
                {exp.company && (
                  <span className="text-[10px] text-gray-400 font-medium">{exp.company}</span>
                )}
                {exp.period && (
                  <span className="text-[10px] text-gray-400 font-medium">• {exp.period}</span>
                )}
              </div>
            </div>

            {/* Reorder */}
            <div className="flex gap-0.5 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); move(index, -1); }}
                disabled={index === 0}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); move(index, 1); }}
                disabled={index === experiences.length - 1}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(exp.id); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </button>

          {/* Edit form */}
          {editingId === exp.id && (
            <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-100 bg-gray-50/50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                    Cargo / Papel
                  </label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateItem(exp.id, "role", e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                    placeholder="Software Engineer"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateItem(exp.id, "company", e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                    placeholder="Nome da empresa"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                    Período
                  </label>
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => updateItem(exp.id, "period", e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                    placeholder="2020 - Presente"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateItem(exp.id, "location", e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20"
                    placeholder="São Paulo, BR"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-black/40">
                  Descrição
                </label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateItem(exp.id, "description", e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-sm focus:border-black outline-none transition-all placeholder:text-black/20 resize-none"
                  placeholder="Descreva suas atividades e conquistas..."
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add experience */}
      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-black rounded-xl text-sm font-bold text-gray-500 hover:text-black transition-all"
      >
        <Plus className="w-4 h-4" />
        Adicionar experiência
      </button>
    </div>
  );
}
