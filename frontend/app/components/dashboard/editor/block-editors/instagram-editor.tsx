import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";
import { ColorPicker } from "../ColorPicker";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function InstagramBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      {/* Username */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.instagramUsernameLabel")}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 font-bold">@</span>
          <input
            type="text"
            value={block.instagramUsername || ""}
            onChange={(e) => onChange({ instagramUsername: e.target.value })}
            className="w-full p-4 pl-8 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
            placeholder={t("editor.editDrawer.fields.instagramPlaceholder")}
          />
        </div>
      </div>

      {/* Display Type */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          Tipo de exibição
        </label>
        <select
          value={block.instagramDisplayType || "grid"}
          onChange={(e) => onChange({ instagramDisplayType: e.target.value })}
          className="w-full p-3 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
        >
          <option value="grid">Grade</option>
          <option value="list">Lista</option>
        </select>
      </div>

      {/* Show Username Toggle */}
      <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-xl">
        <label className="text-xs font-black uppercase tracking-wider">
          Mostrar nome de usuário
        </label>
        <button
          type="button"
          onClick={() => onChange({ instagramShowText: block.instagramShowText === false ? true : false })}
          className={`w-12 h-6 rounded-full relative transition-colors ${block.instagramShowText !== false ? "bg-[#D2E823] border-2 border-black" : "bg-gray-200 border-2 border-gray-300"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white border border-black rounded-full transition-transform ${block.instagramShowText !== false ? "left-6" : "left-0.5"}`} />
        </button>
      </div>

      {/* Text Position & Color (when text is shown) */}
      {block.instagramShowText !== false && (
        <>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
              Posição do texto
            </label>
            <div className="flex bg-gray-100 border-2 border-black rounded-xl p-1">
              <button
                type="button"
                onClick={() => onChange({ instagramTextPosition: "top" })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  block.instagramTextPosition === "top"
                    ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black"
                    : "text-black/50 hover:text-black"
                }`}
              >
                Topo
              </button>
              <button
                type="button"
                onClick={() => onChange({ instagramTextPosition: "bottom" })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  (block.instagramTextPosition || "bottom") === "bottom"
                    ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black"
                    : "text-black/50 hover:text-black"
                }`}
              >
                Abaixo
              </button>
            </div>
          </div>

          <ColorPicker
            label="Cor do texto"
            value={block.instagramTextColor || "#000000"}
            onChange={(val) => onChange({ instagramTextColor: val })}
          />
        </>
      )}
    </div>
  );
}
