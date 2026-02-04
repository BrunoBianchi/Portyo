import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Instagram, Plus } from "lucide-react";
import { LinkManager } from "../link-manager";
import type { BioBlock } from "~/contexts/bio.context";
import type { Bio } from "~/types/bio";
import type { User } from "~/types/user";

interface LinksTabProps {
  bio: Bio | null;
  user: User | null;
  blocks: BioBlock[];
  onUpdateBlocks: (blocks: BioBlock[]) => void;
  onEditBlock: (block: BioBlock) => void;
  onAddBlock: (type: BioBlock["type"]) => void;
}

const ProfileHeader = memo(function ProfileHeader({
  bio,
  user,
}: {
  bio: Bio | null;
  user: User | null;
}) {
  return (
    <div className="bg-white border-2 border-black rounded-[24px] p-6 mb-6 flex flex-col items-center text-center relative overflow-hidden group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-black/5 rounded-full text-gray-400 hover:text-black transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full bg-[#f3f3f1] border-[3px] border-black shadow-sm overflow-hidden">
          <img
            src={
              bio?.profileImage ||
              `https://ui-avatars.com/api/?name=${bio?.sufix || user?.fullname || "Usuário"
              }&background=random`
            }
            alt={bio?.sufix}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <h2 className="font-black text-xl mb-1 flex items-center gap-2 justify-center tracking-tight">
        @{bio?.sufix || "username"}
      </h2>

      <div className="flex items-center gap-2 mb-6">
        <SocialButton icon={<Instagram className="w-4 h-4" />} />
        <SocialButton icon={<Plus className="w-4 h-4" />} />
      </div>

      <div className="flex items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <span>0 clicks</span>
        <span>0 views</span>
        <span>0% CTR</span>
      </div>
    </div>
  );
});

const SocialButton = memo(function SocialButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2 rounded-full bg-white border-2 border-black text-black hover:bg-[#C6F035] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
      {icon}
    </button>
  );
});

export const LinksTab = memo(function LinksTab({
  bio,
  user,
  blocks,
  onUpdateBlocks,
  onEditBlock,
  onAddBlock,
}: LinksTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileHeader bio={bio} user={user} />
      <LinkManager
        blocks={blocks}
        onUpdateBlocks={onUpdateBlocks}
        onEditBlock={onEditBlock}
        onAddBlock={onAddBlock}
      />
    </div>
  );
});
