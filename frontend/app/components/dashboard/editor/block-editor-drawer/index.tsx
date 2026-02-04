import React, { useCallback, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, BadgeCheck, Type, Palette } from "lucide-react";
import type { BioBlock } from "~/contexts/bio.context";
import { BlockEditor } from "../block-editors";
import { BlockStyleSettings } from "../block-style-settings";

interface BlockEditorDrawerProps {
  block: BioBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: BioBlock) => void;
}

const DrawerHeader = memo(function DrawerHeader({
  block,
  onClose,
}: {
  block: BioBlock;
  onClose: () => void;
}) {
  const { t } = useTranslation("dashboard");

  const blockTypeLabel = useMemo(() => {
    return t(`editor.blockTypes.${block.type}`, { defaultValue: block.type });
  }, [block.type, t]);

  return (
    <div className="p-6 border-b-2 border-black flex items-center justify-between bg-[#F3F3F1]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="font-mono font-bold text-lg">
            {block.type[0].toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-black text-xl uppercase tracking-tight">
            {t("editor.editorPage.editDrawer.title", { type: blockTypeLabel })}
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
  );
});

const DrawerTabs = memo(function DrawerTabs({
  activeTab,
  onChangeTab,
}: {
  activeTab: "content" | "style";
  onChangeTab: (tab: "content" | "style") => void;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="flex border-b-2 border-black">
      <TabButton
        isActive={activeTab === "content"}
        onClick={() => onChangeTab("content")}
        icon={<Type className="w-4 h-4" />}
        label={t("editor.editDrawer.tabs.content")}
      />
      <TabButton
        isActive={activeTab === "style"}
        onClick={() => onChangeTab("style")}
        icon={<Palette className="w-4 h-4" />}
        label={t("editor.editDrawer.tabs.style")}
      />
    </div>
  );
});

const TabButton = memo(function TabButton({
  isActive,
  onClick,
  icon,
  label,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold text-sm transition-colors ${
        isActive
          ? "bg-white text-black border-b-2 border-[#8129D9]"
          : "bg-gray-50 text-black/50 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
});

const DrawerFooter = memo(function DrawerFooter({
  onSave,
}: {
  onSave: () => void;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="p-6 border-t-2 border-black bg-[#F3F3F1]">
      <button
        onClick={onSave}
        className="w-full py-4 bg-[#D2E823] border-2 border-black rounded-xl font-black uppercase tracking-widest text-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 group"
      >
        <BadgeCheck className="w-5 h-5" strokeWidth={2.5} />
        {t("editor.editorPage.editDrawer.save")}
      </button>
    </div>
  );
});

export const BlockEditorDrawer = memo(function BlockEditorDrawer({
  block,
  isOpen,
  onClose,
  onSave,
}: BlockEditorDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<"content" | "style">("content");
  const [localBlock, setLocalBlock] = React.useState<BioBlock | null>(block);

  // Reset local block and tab when drawer opens with new block
  React.useEffect(() => {
    if (block && isOpen) {
      setLocalBlock(block);
      setActiveTab("content");
    }
  }, [block?.id, isOpen]); // Only trigger on block id change

  const handleBlockChange = useCallback(
    (updates: Partial<BioBlock>) => {
      if (!localBlock) return;
      setLocalBlock({ ...localBlock, ...updates });
    },
    [localBlock]
  );

  const handleSave = useCallback(() => {
    if (localBlock) {
      onSave(localBlock);
      onClose();
    }
  }, [localBlock, onSave, onClose]);

  if (!localBlock) return null;

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col"
          >
            <DrawerHeader block={localBlock} onClose={onClose} />
            <DrawerTabs activeTab={activeTab} onChangeTab={setActiveTab} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
              {activeTab === "content" ? (
                <div className="space-y-5">
                  <BlockEditor block={localBlock} onChange={handleBlockChange} />
                </div>
              ) : (
                <BlockStyleSettings
                  block={localBlock}
                  onUpdate={handleBlockChange}
                />
              )}
            </div>

            <DrawerFooter onSave={handleSave} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
