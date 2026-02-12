import { useTranslation } from "react-i18next";
import type { BlockEditorProps } from "./index";
import { EditorInput } from "./shared/editor-fields";

export function ButtonBlockEditor({ block, onChange }: BlockEditorProps) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-4">
      <EditorInput
        label={t("editor.editDrawer.fields.titleLabel")}
        value={block.title || ""}
        onChange={(v) => onChange({ title: v })}
        placeholder={t("editor.editDrawer.fields.titlePlaceholder")}
      />
      <EditorInput
        label={t("editor.editDrawer.fields.urlLabel")}
        value={block.href || ""}
        onChange={(v) => onChange({ href: v })}
        placeholder={t("editor.editDrawer.fields.urlPlaceholder")}
        prefix="https://"
      />
    </div>
  );
}
