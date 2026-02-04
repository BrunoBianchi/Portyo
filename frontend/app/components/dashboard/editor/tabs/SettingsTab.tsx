import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Search, Save, Loader2, Wand2, Crown, Sparkles, Globe, Share2 } from "lucide-react";
import { ImageUpload } from "../image-upload";

interface SettingsTabProps {
  hasSeoAccess: boolean;
  seoTitle: string;
  seoDescription: string;
  favicon: string;
  seoKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  isSavingSeo: boolean;
  generatingSeoField: string | null;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onFaviconChange: (value: string) => void;
  onSeoKeywordsChange: (value: string) => void;
  onOgTitleChange: (value: string) => void;
  onOgDescriptionChange: (value: string) => void;
  onOgImageChange: (value: string) => void;
  onGenerateSeo: (field: string) => void;
  onSaveSeo: () => void;
}

const AIGenerateButton = memo(function AIGenerateButton({
  field,
  generatingField,
  onGenerate,
}: {
  field: string;
  generatingField: string | null;
  onGenerate: () => void;
}) {
  const { t } = useTranslation("dashboard");
  const isGenerating = generatingField === field;

  return (
    <button
      type="button"
      onClick={onGenerate}
      disabled={isGenerating}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#8129D9] bg-[#8129D9]/10 hover:bg-[#8129D9]/20 rounded-lg transition-colors disabled:opacity-50"
    >
      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
      {t("editor.editorPage.settings.aiGenerate")}
    </button>
  );
});

const UpgradePrompt = memo(function UpgradePrompt() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="bg-[#1A1A1A] text-white border-2 border-black rounded-[24px] p-8 sm:p-12 text-center shadow-[4px_4px_0px_0px_rgba(198,240,53,1)]">
      <div className="w-20 h-20 bg-[#C6F035] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
        <Crown className="w-10 h-10 text-black fill-current" />
      </div>
      <h3 className="font-black text-2xl sm:text-3xl mb-4 tracking-tighter">{t("editor.editorPage.settings.upgradeTitle")}</h3>
      <p className="text-gray-300 font-medium max-w-md mx-auto mb-8 text-lg">
        {t("editor.editorPage.settings.upgradeSubtitle")}
      </p>
      <Link
        to="/dashboard/pricing"
        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-black text-lg hover:bg-[#C6F035] transition-all border-2 border-transparent shadow-lg hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        {t("editor.editorPage.settings.upgradeCta")}
      </Link>
    </div>
  );
});

const SeoForm = memo(function SeoForm({
  seoTitle,
  seoDescription,
  favicon,
  seoKeywords,
  ogTitle,
  ogDescription,
  ogImage,
  isSavingSeo,
  generatingSeoField,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onFaviconChange,
  onSeoKeywordsChange,
  onOgTitleChange,
  onOgDescriptionChange,
  onOgImageChange,
  onGenerateSeo,
  onSaveSeo,
}: Omit<SettingsTabProps, "hasSeoAccess">) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      {/* Basic SEO Section */}
      <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#EFF6FF] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Globe className="w-6 h-6 text-[#1A1A1A]" />
          </div>
          <div>
            <h3 className="font-black text-xl text-[#1A1A1A]">{t("editor.editorPage.settings.basicSeo")}</h3>
            <p className="text-sm font-medium text-gray-500">{t("editor.editorPage.settings.basicSeoSubtitle")}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* SEO Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                {t("editor.editorPage.settings.pageTitle")}
              </label>
              <AIGenerateButton
                field="seoTitle"
                generatingField={generatingSeoField}
                onGenerate={() => onGenerateSeo("seoTitle")}
              />
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] focus:border-black rounded-xl font-bold text-sm outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-300 text-black"
              placeholder={t("editor.editorPage.settings.pageTitlePlaceholder")}
            />
            <p className="mt-2 text-xs font-bold text-gray-400 flex justify-end">
              <span className={seoTitle.length > 60 ? "text-red-500" : "text-[#1A1A1A]"}>
                {seoTitle.length}
              </span>
              /60
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                {t("editor.editorPage.settings.metaDescription")}
              </label>
              <AIGenerateButton
                field="seoDescription"
                generatingField={generatingSeoField}
                onGenerate={() => onGenerateSeo("seoDescription")}
              />
            </div>
            <textarea
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] focus:border-black rounded-xl font-bold text-sm outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-300 text-black resize-none"
              placeholder={t("editor.editorPage.settings.metaDescriptionPlaceholder")}
            />
            <p className="mt-2 text-xs font-bold text-gray-400 flex justify-end">
              <span className={seoDescription.length > 160 ? "text-red-500" : "text-[#1A1A1A]"}>
                {seoDescription.length}
              </span>
              /160
            </p>
          </div>

          {/* Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                {t("editor.editorPage.settings.keywords")}
              </label>
              <AIGenerateButton
                field="seoKeywords"
                generatingField={generatingSeoField}
                onGenerate={() => onGenerateSeo("seoKeywords")}
              />
            </div>
            <input
              type="text"
              value={seoKeywords}
              onChange={(e) => onSeoKeywordsChange(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] focus:border-black rounded-xl font-bold text-sm outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-300 text-black"
              placeholder="portfolio, links, profissional..."
            />
            <p className="mt-2 text-xs font-semibold text-gray-400">{t("editor.editorPage.settings.keywordsHint")}</p>
          </div>

          {/* Favicon */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2 block">
              {t("editor.editorPage.settings.favicon")}
            </label>
            <p className="text-xs font-medium text-gray-400 mb-4">{t("editor.editorPage.settings.faviconHint")}</p>
            <ImageUpload value={favicon} onChange={onFaviconChange} endpoint="/user/upload-favicon" className="max-w-xs" />
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#F3E8FF] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Share2 className="w-6 h-6 text-[#1A1A1A]" />
          </div>
          <div>
            <h3 className="font-black text-xl text-[#1A1A1A]">{t("editor.editorPage.settings.socialMedia")}</h3>
            <p className="text-sm font-medium text-gray-500">{t("editor.editorPage.settings.socialMediaSubtitle")}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* OG Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                  {t("editor.editorPage.settings.socialTitle")}
                </label>
                <AIGenerateButton
                  field="ogTitle"
                  generatingField={generatingSeoField}
                  onGenerate={() => onGenerateSeo("ogTitle")}
                />
              </div>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => onOgTitleChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] focus:border-black rounded-xl font-bold text-sm outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-300 text-black"
                placeholder={t("editor.editorPage.settings.socialTitlePlaceholder")}
              />
            </div>

            {/* OG Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                  {t("editor.editorPage.settings.socialDescription")}
                </label>
                <AIGenerateButton
                  field="ogDescription"
                  generatingField={generatingSeoField}
                  onGenerate={() => onGenerateSeo("ogDescription")}
                />
              </div>
              <textarea
                value={ogDescription}
                onChange={(e) => onOgDescriptionChange(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] focus:border-black rounded-xl font-bold text-sm outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-300 text-black resize-none"
                placeholder={t("editor.editorPage.settings.socialDescriptionPlaceholder")}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2 block">
              {t("editor.editorPage.settings.socialImage")}
            </label>
            <p className="text-xs font-medium text-gray-400 mb-4">{t("editor.editorPage.settings.socialImageHint")}</p>
            <ImageUpload value={ogImage} onChange={onOgImageChange} endpoint="/user/upload-og-image" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onSaveSeo}
          disabled={isSavingSeo}
          className="px-8 py-4 bg-[#1A1A1A] text-white rounded-full font-black text-lg hover:bg-black hover:text-[#C6F035] transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {isSavingSeo ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("editor.editorPage.settings.saving")}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {t("editor.editorPage.settings.saveChanges")}
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export const SettingsTab = memo(function SettingsTab(props: SettingsTabProps) {
  const { hasSeoAccess } = props;
  const { t } = useTranslation("dashboard");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-black text-3xl sm:text-4xl flex items-center gap-3 tracking-tighter text-[#1A1A1A]">
              <Search className="w-8 h-8 text-black" strokeWidth={3} />
              {t("editor.editorPage.settings.seoTitle")}
            </h2>
            <p className="text-gray-500 font-bold text-sm mt-1">{t("editor.editorPage.settings.seoSubtitle")}</p>
          </div>
        </div>

        {hasSeoAccess ? <SeoForm {...props} /> : <UpgradePrompt />}
      </div>
    </div>
  );
});
