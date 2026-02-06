import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, BadgeCheck } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { BlockEditor } from "./block-editors";
import { BlockStyleSettings } from "./block-style-settings";

interface BlockEditorDrawerProps {
  block: BioBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: BioBlock) => void;
}

export const BlockEditorDrawer = React.memo(function BlockEditorDrawer({
  block,
  isOpen,
  onClose,
  onSave,
}: BlockEditorDrawerProps) {
  const { t } = useTranslation("dashboard");
  const [activeTab, setActiveTab] = React.useState<"content" | "style">("content");
  const [editedBlock, setEditedBlock] = React.useState<BioBlock | null>(null);

  // Initialize editedBlock when block changes
  React.useEffect(() => {
    if (block) {
      setEditedBlock(block);
      setActiveTab("content");
    }
  }, [block?.id]);

  const handleBlockChange = useCallback(
    (updates: Partial<BioBlock>) => {
      if (!editedBlock) return;
      setEditedBlock({ ...editedBlock, ...updates });
    },
    [editedBlock]
  );

  const handleSave = useCallback(() => {
    if (editedBlock) {
      onSave(editedBlock);
    }
    onClose();
  }, [editedBlock, onSave, onClose]);

  const blockTypeLabel = useMemo(() => {
    if (!block) return "";
    return t(`editor.blockTypes.${block.type}`, { defaultValue: block.type });
  }, [block, t]);

  if (!block || !editedBlock) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white border-l-2 border-black shadow-[-100px_0px_100px_rgba(0,0,0,0.2)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b-2 border-black flex items-center justify-between bg-[#F3F3F1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-mono font-bold text-lg">
                    {block.type[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tight">
                    {t("editor.editorPage.editDrawer.title", {
                      type: blockTypeLabel,
                    })}
                  </h3>
                  <p className="text-xs font-bold text-black/40 uppercase tracking-wider">
                    {t("editor.editorPage.editDrawer.subtitle")}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "content"
                    ? "bg-[#D2E823] text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                }`}
              >
                {t("editor.sections.content")}
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "style"
                    ? "bg-[#D2E823] text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                }`}
              >
                {t("editor.sections.design")}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
              {activeTab === "content" ? (
                <div className="space-y-5">
                  <BlockEditor block={editedBlock} onChange={handleBlockChange} />
                </div>
              ) : (
                <BlockStyleSettings
                  block={editedBlock}
                  onUpdate={handleBlockChange}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t-2 border-black bg-[#F3F3F1]">
              <button
                onClick={handleSave}
                className="w-full py-4 bg-[#D2E823] border-2 border-black rounded-xl font-black uppercase tracking-widest text-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 group"
              >
                <BadgeCheck className="w-5 h-5" strokeWidth={2.5} />
                {t("editor.editorPage.editDrawer.save")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
