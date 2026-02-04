import { useTranslation } from "react-i18next";
import { FormSelector } from "../integration-selectors";
import { BlockStyleSettings } from "../block-style-settings";
import type { BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function FormBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");

  const handleFormSelect = (form: { id: string; name: string } | null) => {
    onChange({
      formId: form?.id,
      formName: form?.name,
    });
  };

  return (
    <div className="space-y-6">
      {/* Form Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          {t("editor.blockIntegration.forms.title")}
        </label>
        <FormSelector
          bioId={block.bioId}
          selectedFormId={block.formId}
          onSelect={handleFormSelect}
        />
        <p className="text-xs text-gray-500">
          {t("editor.blockItem.form.helper")}
        </p>
      </div>

      {/* Style Settings */}
      <BlockStyleSettings
        block={block}
        onUpdate={onChange}
      />
    </div>
  );
}
