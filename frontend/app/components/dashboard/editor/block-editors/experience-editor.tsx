import { useTranslation } from "react-i18next";
import type { BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function ExperienceBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.experienceSectionTitleLabel")}
        </label>
        <input
          type="text"
          value={block.experienceTitle || ""}
          onChange={(e) => onChange({ experienceTitle: e.target.value })}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-medium text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20"
          placeholder={t("editor.editDrawer.fields.experienceSectionTitlePlaceholder")}
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 ml-1">
          {t("editor.editDrawer.fields.experiencesLabel")}
        </label>
        <textarea
          value={JSON.stringify(block.experiences || [], null, 2)}
          onChange={(e) => {
            try {
              const experiences = JSON.parse(e.target.value);
              onChange({ experiences });
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={8}
          className="w-full p-4 bg-white border-2 border-black rounded-xl font-mono text-xs focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none placeholder:text-black/20 resize-none"
          placeholder={t("editor.editDrawer.fields.experiencesPlaceholder")}
        />
      </div>
    </div>
  );
}
