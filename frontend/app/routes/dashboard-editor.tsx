import {
  Eye, X, ChevronLeftIcon, ExternalLinkIcon,
  Sparkles, Undo2, Share2, Smartphone
} from 'lucide-react';
import { useContext, useEffect, useState, useCallback, memo, useRef } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import BioContext from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import { api } from "~/services/api";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";

// Hooks otimizados
import { useBlockEditor } from "~/hooks/use-block-editor";
import { useHtmlGenerator } from "~/hooks/use-html-generator";

// Componentes
import { EditorNav } from "~/components/dashboard/editor/editor-nav";
import { BlockEditorDrawer } from "~/components/dashboard/editor/block-editor-drawer";
import { LinksTab, SettingsTab } from "~/components/dashboard/editor/tabs";
import { PortyoAI } from "~/components/dashboard/portyo-ai";
import type { BioBlock } from "~/contexts/bio.context";

export const meta: MetaFunction = () => {
  return [
    { title: "Editor | Portyo" },
    { name: "description", content: "Customize your bio page, add links, and manage your content." },
  ];
};

// Memoized Header Component - Totalmente Responsivo
const EditorHeader = memo(function EditorHeader({
  activeTab,
  onTabChange,
  history,
  onUndo,
  onShare,
  bioSuffix,
  showMobilePreview,
  onToggleMobilePreview,
  onAIClick,
}: {
  activeTab: "links" | "settings";
  onTabChange: (tab: "links" | "settings") => void;
  history: BioBlock[][];
  onUndo: () => void;
  onShare: () => void;
  bioSuffix?: string;
  showMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  onAIClick: () => void;
}) {
  const { t } = useTranslation("dashboard");

  const tabLabels = {
    links: t("editor.tabs.links"),
    settings: t("editor.tabs.settings"),
  };

  return (
    <header className="bg-white border-b border-gray-200 z-30 relative shrink-0">
      {/* Row 1: Main Header - Desktop & Tablet */}
      <div className="hidden md:flex h-16 px-4 items-center justify-between">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-4 shrink-0 min-w-0 w-[140px] lg:w-[180px]">
          <Link
            to="/dashboard"
            className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>

          <div className="h-6 w-px bg-gray-200 shrink-0" />

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-gray-500 truncate">
              {t("top.editor")}
            </span>
            <span className="font-bold text-sm leading-none truncate">
              {tabLabels[activeTab]}
            </span>
          </div>
        </div>

        {/* Center: EditorNav - Flex grow para ocupar espaço disponível */}
        <div className="flex-1 flex justify-start px-2 lg:px-4 min-w-0 overflow-hidden">
          <EditorNav activeTab={activeTab} onChangeTab={onTabChange} />
        </div>

        {/* Right: Actions - Fixed width */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0 w-[140px] lg:w-[180px] justify-end">
          <AIButton onClick={onAIClick} />

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <UndoButton onClick={onUndo} disabled={history.length === 0} />
          <ShareButton onClick={onShare} />

          {bioSuffix && (
            <a
              href={`https://portyo.me/p/${bioSuffix}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              <span className="hidden xl:inline">{t("top.openPage")}</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Row 1: Mobile Header - Improved spacing */}
      <div className="md:hidden px-3 pt-2 pb-3">
        <div className="h-10 flex items-center">
          <Link
            to="/dashboard"
            className="p-2 -ml-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors shrink-0 touch-manipulation"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>

          <div className="flex-1 text-center px-2 min-w-0">
            <span className="text-sm font-semibold text-gray-600 truncate">{t("top.editor")}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onShare}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMobilePreview}
              className="p-2 bg-black text-white rounded-full shadow-lg touch-manipulation"
              title={t("editor.togglePreview")}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-2">
          <EditorNav activeTab={activeTab} onChangeTab={onTabChange} />
        </div>
      </div>
    </header>
  );
});

const AIButton = memo(function AIButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation("dashboard");

  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-black text-xs sm:text-sm font-bold rounded-full transition-all shadow-sm group shrink-0">
      <div className="relative">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8129D9]" />
        <span className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-[#FFC107] text-[8px] sm:text-[9px] font-black px-0.5 sm:px-1 rounded text-black shadow-sm transform scale-75 origin-bottom-left">
          {t("editorBadges.beta")}
        </span>
      </div>
      <span className="hidden lg:inline">{t("editor.askAI")}</span>
    </button>
  );
});

const UndoButton = memo(function UndoButton({
  onClick,
  disabled
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="hidden md:flex items-center gap-1.5 px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
      title={t("top.undoTitle")}
    >
      <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span className="hidden lg:inline">{t("top.undo")}</span>
    </button>
  );
});

const ShareButton = memo(function ShareButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation("dashboard");

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors shrink-0"
      title={t("top.share")}
    >
      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline lg:hidden xl:inline">{t("top.share")}</span>
    </button>
  );
});

// Memoized Preview Component
const PreviewPanel = memo(function PreviewPanel({
  html,
  isGenerating
}: {
  html: string | null;
  isGenerating: boolean;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <aside className="hidden lg:flex w-[45%] max-w-[540px] border-l-2 border-black bg-[#f5f5f5] flex-col items-center justify-center p-8 shrink-0 relative" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)', backgroundSize: '24px 24px' }}>
      <div className="relative w-full max-w-[380px] aspect-[9/19.5] bg-[#1A1A1A] rounded-[52px] border-[10px] border-[#1A1A1A] shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#1A1A1A] rounded-b-2xl z-20" />
        {isGenerating ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[#8129D9] rounded-full animate-spin" />
          </div>
        ) : (
          <iframe
            srcDoc={html || ""}
            className="w-full h-full bg-white scrollbar-hide"
            title={t("editor.editorPage.preview.iframeTitle")}
            sandbox="allow-same-origin allow-scripts"
          />
        )}
      </div>
      <div className="mt-8 flex items-center gap-2 text-xs font-bold text-black/40 uppercase tracking-widest">
        <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
        {isGenerating ? t("editorStatus.updating") : t("editor.editorPage.liveUpdate")}
      </div>
    </aside>
  );
});

// Mobile Preview Overlay
const MobilePreviewOverlay = memo(function MobilePreviewOverlay({
  isOpen,
  onClose,
  html,
  isGenerating,
}: {
  isOpen: boolean;
  onClose: () => void;
  html: string | null;
  isGenerating: boolean;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-[#F3F3F1] flex flex-col lg:hidden"
        >
          <div className="p-4 border-b-2 border-black flex items-center justify-between bg-white px-6">
            <span className="font-black text-lg tracking-tight">{t("editor.editorPage.preview.mobileHeader")}</span>
            <button onClick={onClose} className="p-2.5 hover:bg-black/5 rounded-full border border-transparent hover:border-black/10 transition-all touch-manipulation">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 p-4 sm:p-8 flex items-center justify-center overflow-hidden bg-[#f5f5f5]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)', backgroundSize: '24px 24px' }}>
            <div className="relative w-full max-w-[380px] aspect-[9/19.5] bg-[#1A1A1A] rounded-[52px] border-[10px] border-[#1A1A1A] shadow-2xl overflow-hidden">
              {isGenerating ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-[#8129D9] rounded-full animate-spin" />
                </div>
              ) : (
                <iframe
                  srcDoc={html || ""}
                  className="w-full h-full bg-white scrollbar-hide"
                  title={t("editor.editorPage.preview.mobileIframeTitle")}
                  sandbox="allow-same-origin allow-scripts"
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Main Component
export default function DashboardEditor() {
  const { bio, updateBio } = useContext(BioContext);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation("dashboard");

  const [activeTab, setActiveTab] = useState<"links" | "settings">("links");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BioBlock | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const lastSavedBlocksRef = useRef<string>("");
  const designSaveTimeoutRef = useRef<number | null>(null);

  // Block Editor Hook
  const {
    blocks,
    history,
    canUndo,
    addBlock,
    updateBlock: updateBlockInEditor,
    deleteBlock,
    reorderBlocks,
    undo,
    replaceBlock,
    setBlocks,
  } = useBlockEditor({
    initialBlocks: bio?.blocks || [],
    key: bio?.id
  });

  // Sync blocks with bio
  useEffect(() => {
    if (bio?.blocks) {
      const bioBlocksJson = JSON.stringify(bio.blocks);
      const currentBlocksJson = JSON.stringify(blocks);

      // If we have blocks from server, but local blocks are empty (or different on fresh load), sync them.
      // This fixes the issue where initial load was empty (summary) and full load (details) came later.
      if (bio.blocks.length > 0 && bioBlocksJson !== currentBlocksJson) {
        // Check if it's safe to sync (e.g. if local history is empty implies no user edits yet)
        // OR if local blocks are empty, definitely sync.
        if (blocks.length === 0 || history.length === 0) {
          setBlocks(bio.blocks);
        }
      }
    }
  }, [bio?.blocks, blocks.length, history.length, setBlocks]);

  // Track last saved blocks per bio
  useEffect(() => {
    if (!bio) return;
    lastSavedBlocksRef.current = JSON.stringify(bio.blocks || []);
  }, [bio?.id]);

  // HTML Generator Hook
  const { html, isGenerating } = useHtmlGenerator({
    blocks,
    bio,
    user,
    delay: 400,
  });

  // Auto-save blocks when they change
  useEffect(() => {
    if (!bio) return;

    const currentBlocksJson = JSON.stringify(blocks);
    if (!lastSavedBlocksRef.current) {
      lastSavedBlocksRef.current = JSON.stringify(bio.blocks || []);
    }

    if (currentBlocksJson === lastSavedBlocksRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        await updateBio(bio.id, { blocks, html: html || undefined });
        lastSavedBlocksRef.current = currentBlocksJson;
      } catch (error) {
        console.error("Failed to auto-save blocks", error);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [blocks, bio, updateBio, html]);

  // SEO State
  const [seoState, setSeoState] = useState({
    seoTitle: "",
    seoDescription: "",
    favicon: "",
    seoKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  });
  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [generatingSeoField, setGeneratingSeoField] = useState<string | null>(null);

  // Load SEO settings from bio
  useEffect(() => {
    if (bio) {
      setSeoState({
        seoTitle: bio.seoTitle || "",
        seoDescription: bio.seoDescription || "",
        favicon: bio.favicon || "",
        seoKeywords: bio.seoKeywords || "",
        ogTitle: bio.ogTitle || "",
        ogDescription: bio.ogDescription || "",
        ogImage: bio.ogImage || "",
      });
    }
  }, [bio]);

  const userPlan = user?.plan || 'free';
  const hasSeoAccess = userPlan === 'standard' || userPlan === 'pro';

  // Handlers
  const handleUndo = useCallback(() => {
    undo();
    toast.success(t("editor.undoSuccess"));
  }, [undo, t]);

  const handleCopyLink = useCallback(() => {
    if (!bio) return;
    navigator.clipboard.writeText(`https://portyo.me/p/${bio.sufix}`);
    toast.success(t("editor.linkCopied"));
  }, [bio, t]);

  const handleAddBlock = useCallback((type: BioBlock["type"], variation?: string) => {
    const newBlock = addBlock(type, undefined, variation);
    setEditingBlock(newBlock);
  }, [addBlock]);

  const handleUpdateBlocks = useCallback(async (newBlocks: BioBlock[]) => {
    reorderBlocks(newBlocks);
    if (bio) {
      await updateBio(bio.id, { blocks: newBlocks, html: html || undefined });
    }
  }, [reorderBlocks, bio, updateBio, html]);

  const handleSaveBlock = useCallback((block: BioBlock) => {
    replaceBlock(block.id, block);
    if (bio) {
      updateBio(bio.id, {
        blocks: blocks.map(b => b.id === block.id ? block : b),
        html: html || undefined
      });
    }
  }, [replaceBlock, blocks, bio, updateBio, html]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bio) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post(`/bios/${bio.id}/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.profileImage) {
        await updateBio(bio.id, { profileImage: response.data.profileImage });
        toast.success(t("editor.design.imageUploadSuccess"));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error(t("editor.design.imageUploadError"));
    } finally {
      setUploadingImage(false);
    }
  }, [bio, updateBio, t]);

  const handleDesignUpdate = useCallback((payload: Parameters<typeof updateBio>[1]) => {
    if (!bio) return;
    if (designSaveTimeoutRef.current) {
      window.clearTimeout(designSaveTimeoutRef.current);
    }
    designSaveTimeoutRef.current = window.setTimeout(() => {
      updateBio(bio.id, payload).catch((error) => {
        console.error("Design update failed:", error);
      });
    }, 350);
  }, [bio, updateBio]);

  useEffect(() => {
    return () => {
      if (designSaveTimeoutRef.current) {
        window.clearTimeout(designSaveTimeoutRef.current);
      }
    };
  }, []);

  const generateSeoWithAI = useCallback(async (field: string) => {
    if (!bio?.id) {
      toast.error(t("editor.errors.bioNotFound"));
      return;
    }

    setGeneratingSeoField(field);
    try {
      const response = await api.post(`/bio/generate-seo?bioId=${bio.id}`, {
        field,
        bioDescription: bio?.description || "",
        fullName: user?.fullname || "",
        profession: ""
      });

      const { content } = response.data;
      setSeoState(prev => ({ ...prev, [field]: content }));
      toast.success(t("editor.editorPage.settings.aiSuccess"));
    } catch (error: any) {
      console.error("Erro ao gerar conteúdo SEO:", error);
      toast.error(error.response?.data?.error || t("editor.editorPage.settings.aiError"));
    } finally {
      setGeneratingSeoField(null);
    }
  }, [bio, user, t]);

  const handleSaveSeo = useCallback(async () => {
    if (!bio) return;
    setIsSavingSeo(true);
    try {
      await updateBio(bio.id, seoState);
      toast.success(t("editor.editorPage.settings.saveSuccess"));
    } catch (error) {
      console.error("Erro ao salvar configurações SEO", error);
      toast.error(t("editor.editorPage.settings.saveError"));
    } finally {
      setIsSavingSeo(false);
    }
  }, [bio, seoState, updateBio, t]);

  const updateSeoField = useCallback((field: keyof typeof seoState, value: string) => {
    setSeoState(prev => ({ ...prev, [field]: value }));
  }, []);

  // AI Handlers
  const handleAIToggle = useCallback(() => {
    setShowAI(prev => !prev);
  }, []);

  const handleAIBlocksGenerated = useCallback((newBlocks: BioBlock[], replace: boolean) => {
    if (replace) {
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, ...newBlocks]);
    }
    toast.success(t("editor.ai.successGenerate", "Content generated!"));
  }, [setBlocks, blocks, t]);

  const handleAISettingsChange = useCallback((settings: Record<string, any>) => {
    if (!bio) return;
    handleDesignUpdate(settings);
  }, [bio, handleDesignUpdate]);

  const handleAIGlobalStylesChange = useCallback((styles: Partial<BioBlock>) => {
    if (!blocks.length) return;
    const updated = blocks.map(block => ({ ...block, ...styles }));
    setBlocks(updated);
  }, [blocks, setBlocks]);

  return (
    <AuthorizationGuard>
      <div className="h-screen flex flex-col bg-[#F3F3F1] overflow-hidden font-sans">
        <EditorHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          history={history}
          onUndo={handleUndo}
          onShare={handleCopyLink}
          bioSuffix={bio?.sufix}
          showMobilePreview={showMobilePreview}
          onToggleMobilePreview={() => setShowMobilePreview(!showMobilePreview)}
          onAIClick={handleAIToggle}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#F3F3F1]">
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 custom-scrollbar">
              <div className="max-w-xl lg:max-w-2xl mx-auto w-full pb-20 sm:pb-24">
                {activeTab === 'links' && (
                  <LinksTab
                    bio={bio}
                    user={user}
                    blocks={blocks}
                    onUpdateBlocks={handleUpdateBlocks}
                    onEditBlock={setEditingBlock}
                    onAddBlock={handleAddBlock}
                    onUpdateBio={handleDesignUpdate}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsTab
                    hasSeoAccess={hasSeoAccess}
                    seoTitle={seoState.seoTitle}
                    seoDescription={seoState.seoDescription}
                    favicon={seoState.favicon}
                    seoKeywords={seoState.seoKeywords}
                    ogTitle={seoState.ogTitle}
                    ogDescription={seoState.ogDescription}
                    ogImage={seoState.ogImage}
                    isSavingSeo={isSavingSeo}
                    generatingSeoField={generatingSeoField}
                    onSeoTitleChange={(v) => updateSeoField('seoTitle', v)}
                    onSeoDescriptionChange={(v) => updateSeoField('seoDescription', v)}
                    onFaviconChange={(v) => updateSeoField('favicon', v)}
                    onSeoKeywordsChange={(v) => updateSeoField('seoKeywords', v)}
                    onOgTitleChange={(v) => updateSeoField('ogTitle', v)}
                    onOgDescriptionChange={(v) => updateSeoField('ogDescription', v)}
                    onOgImageChange={(v) => updateSeoField('ogImage', v)}
                    onGenerateSeo={generateSeoWithAI}
                    onSaveSeo={handleSaveSeo}
                  />
                )}
              </div>
            </div>
          </main>

          {/* Desktop Preview */}
          <PreviewPanel html={html} isGenerating={isGenerating} />

          {/* Mobile Preview */}
          <MobilePreviewOverlay
            isOpen={showMobilePreview}
            onClose={() => setShowMobilePreview(false)}
            html={html}
            isGenerating={isGenerating}
          />
        </div>

        {/* Block Editor Drawer */}
        <BlockEditorDrawer
          block={editingBlock}
          isOpen={!!editingBlock}
          onClose={() => setEditingBlock(null)}
          onSave={handleSaveBlock}
        />
      </div>

      {/* AI Panel - Rendered outside overflow-hidden container */}
      {showAI && bio && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-[45]"
            onClick={() => setShowAI(false)}
          />
          <div className="fixed top-20 right-4 md:right-8 z-50 w-[calc(100%-2rem)] max-w-md">
            <PortyoAI
              bioId={bio.id}
              isOpen={showAI}
              onClose={() => setShowAI(false)}
              onBlocksGenerated={handleAIBlocksGenerated}
              onSettingsChange={handleAISettingsChange}
              onGlobalStylesChange={handleAIGlobalStylesChange}
            />
          </div>
        </>
      )}
    </AuthorizationGuard>
  );
}
