import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { PollSelector } from "../integration-selectors";
import BioContext, { type BioBlock } from "~/contexts/bio.context";

interface Props {
  block: BioBlock;
  onChange: (updates: Partial<BioBlock>) => void;
}

export function PollBlockEditor({ block, onChange }: Props) {
  const { t } = useTranslation("dashboard");
  const { bio } = useContext(BioContext);

  const effectiveBioId = block.bioId || bio?.id || null;

  const handlePollSelect = (poll: { id: string; title: string } | null) => {
    onChange({
      bioId: effectiveBioId || undefined,
      pollId: poll?.id,
      title: poll?.title,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          {t("editor.blockIntegration.polls.title", { defaultValue: "Select poll" })}
        </label>
        <PollSelector
          bioId={effectiveBioId}
          selectedPollId={block.pollId}
          onSelect={handlePollSelect}
        />
        <p className="text-xs text-gray-500">
          {t("editor.blockItem.poll.helper", { defaultValue: "Choose a poll to display in your bio" })}
        </p>
      </div>
    </div>
  );
}
