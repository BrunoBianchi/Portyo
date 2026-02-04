import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Upload, User, Share2, Trash2, Instagram, Music2, Twitter, Youtube, Linkedin, Github, Facebook } from "lucide-react";
import type { Bio } from "~/types/bio";

interface DesignTabProps {
  bio: Bio | null;
  uploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSocialChange: (platform: string, value: string) => void;
}

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-purple-500 via-pink-500 to-orange-400", hasAt: true },
  { id: "tiktok", name: "TikTok", icon: Music2, color: "bg-black", hasAt: true },
  { id: "twitter", name: "X / Twitter", icon: Twitter, color: "bg-black", hasAt: true },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "bg-red-600", hasAt: false, placeholder: "youtube.com/canal/..." },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-600", hasAt: false, placeholder: "linkedin.com/in/..." },
  { id: "github", name: "GitHub", icon: Github, color: "bg-gray-800", hasAt: true },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-500", hasAt: false, placeholder: "facebook.com/..." },
];

const ProfileImageSection = memo(function ProfileImageSection({
  bio,
  uploadingImage,
  onImageUpload,
}: {
  bio: Bio | null;
  uploadingImage: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="bg-white border-2 border-black rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
        <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
        {t("editor.design.profileImage")}
      </h3>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-black overflow-hidden bg-gray-100">
            {bio?.profileImage ? (
              <img
                src={bio.profileImage}
                alt={t("editor.profileImage")}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8129D9] to-[#7221C4]">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            )}
          </div>
          {uploadingImage && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <label className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#8129D9] text-white rounded-lg sm:rounded-xl font-bold cursor-pointer hover:bg-[#7221C4] transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">{t("editor.design.uploadImage")}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageUpload}
            />
          </label>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2">{t("editor.design.imageHint")}</p>
        </div>
      </div>
    </div>
  );
});

const SocialInput = memo(function SocialInput({
  platform,
  value,
  onChange,
}: {
  platform: (typeof platforms)[0];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation("dashboard");
  const Icon = platform.icon;

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const displayValue = platform.hasAt
    ? value?.replace(`https://${platform.id}.com/`, "").replace("@", "")
    : value;

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-transparent focus-within:border-black focus-within:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${platform.color.startsWith("from") ? `bg-gradient-to-br ${platform.color}` : platform.color
          }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
          {platform.name}
        </label>
        <div className="flex items-center gap-2">
          {platform.hasAt && <span className="text-gray-400 text-sm font-bold">@</span>}
          <input
            type="text"
            value={displayValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={platform.placeholder || t("editor.design.socialPlaceholder")}
            className="flex-1 bg-transparent font-bold text-sm outline-none placeholder:text-gray-300 min-w-0 text-black"
          />
        </div>
      </div>
      {value && (
        <button
          onClick={handleClear}
          className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

const SocialLinksSection = memo(function SocialLinksSection({
  bio,
  onSocialChange,
}: {
  bio: Bio | null;
  onSocialChange: (platform: string, value: string) => void;
}) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="bg-white border-2 border-black rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-lg mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#D2E823] border-2 border-black flex items-center justify-center">
          <Share2 className="w-4 h-4 text-black" />
        </div>
        {t("editor.design.socialLinks")}
      </h3>

      <div className="space-y-2 bg-[#F3F3F1] p-2 rounded-2xl border-2 border-transparent">
        {platforms.map((platform) => (
          <SocialInput
            key={platform.id}
            platform={platform}
            value={bio?.socials?.[platform.id as keyof typeof bio.socials] || ""}
            onChange={(value) => onSocialChange(platform.id, value)}
          />
        ))}
      </div>
    </div>
  );
});

export const DesignTab = memo(function DesignTab({
  bio,
  uploadingImage,
  onImageUpload,
  onSocialChange,
}: DesignTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-16 sm:pb-20">
      <ProfileImageSection
        bio={bio}
        uploadingImage={uploadingImage}
        onImageUpload={onImageUpload}
      />
      <SocialLinksSection bio={bio} onSocialChange={onSocialChange} />
    </div>
  );
});
