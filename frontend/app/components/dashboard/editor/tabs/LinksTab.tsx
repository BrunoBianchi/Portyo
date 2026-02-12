import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus, X, Search, Clock,
  Instagram, Twitter, Youtube, Linkedin, Github, Facebook, Twitch,
  Mail, Globe, Send, Music, Pin, MessageCircle, MessageSquare, Palette, AtSign, Phone, Camera, Dribbble,
} from "lucide-react";
import { LinkManager } from "../link-manager";
import { VerificationRequestModal } from "~/components/dashboard/verification-request-modal";
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
  onUpdateBio: (payload: Partial<Bio>) => void;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <Music className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  github: <Github className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
  threads: <AtSign className="w-4 h-4" />,
  twitch: <Twitch className="w-4 h-4" />,
  discord: <MessageSquare className="w-4 h-4" />,
  pinterest: <Pin className="w-4 h-4" />,
  snapchat: <Camera className="w-4 h-4" />,
  whatsapp: <Phone className="w-4 h-4" />,
  telegram: <Send className="w-4 h-4" />,
  spotify: <Music className="w-4 h-4" />,
  behance: <Palette className="w-4 h-4" />,
  dribbble: <Dribbble className="w-4 h-4" />,
};

const socialPlatforms = [
  { key: "instagram", label: "Instagram", color: "#E4405F" },
  { key: "tiktok", label: "TikTok", color: "#000000" },
  { key: "twitter", label: "X (Twitter)", color: "#000000" },
  { key: "youtube", label: "YouTube", color: "#FF0000" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { key: "github", label: "GitHub", color: "#111827" },
  { key: "facebook", label: "Facebook", color: "#1877F2" },
  { key: "email", label: "Email", color: "#EA4335" },
  { key: "website", label: "Website", color: "#2563EB" },
  { key: "threads", label: "Threads", color: "#000000" },
  { key: "twitch", label: "Twitch", color: "#9146FF" },
  { key: "discord", label: "Discord", color: "#5865F2" },
  { key: "pinterest", label: "Pinterest", color: "#E60023" },
  { key: "snapchat", label: "Snapchat", color: "#FFFC00" },
  { key: "whatsapp", label: "WhatsApp", color: "#25D366" },
  { key: "telegram", label: "Telegram", color: "#26A5E4" },
  { key: "spotify", label: "Spotify", color: "#1DB954" },
  { key: "behance", label: "Behance", color: "#1769FF" },
  { key: "dribbble", label: "Dribbble", color: "#EA4C89" },
] as const;

const socialPlaceholders: Record<string, string> = {
  instagram: "@seuusuario",
  tiktok: "@seuusuario",
  twitter: "@seuusuario",
  youtube: "https://youtube.com/@canal",
  linkedin: "https://linkedin.com/in/perfil",
  github: "seuusuario",
  facebook: "https://facebook.com/pagina",
  email: "seu@email.com",
  website: "https://seusite.com",
  threads: "@seuusuario",
  twitch: "seuusuario",
  discord: "https://discord.gg/convite",
  pinterest: "https://pinterest.com/perfil",
  snapchat: "@seuusuario",
  whatsapp: "+5511999999999",
  telegram: "@seuusuario",
  spotify: "https://open.spotify.com/...",
  behance: "https://behance.net/perfil",
  dribbble: "https://dribbble.com/perfil",
};

const ProfileHeader = memo(function ProfileHeader({
  bio,
  user,
  onUpdateBio,
}: {
  bio: Bio | null;
  user: User | null;
  onUpdateBio: (payload: Partial<Bio>) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(bio?.verificationStatus ?? "none");
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const editOverlayRef = useRef<HTMLDivElement>(null);

  const socials = bio?.socials || {};

  const handleAddPlatform = useCallback(
    (key: string) => {
      setShowDropdown(false);
      setSearchQuery("");
      setEditingPlatform(key);
      setEditValue("");
    },
    []
  );

  const handleSaveEdit = useCallback(() => {
    if (!editingPlatform) return;
    const newSocials = { ...socials, [editingPlatform]: editValue || undefined };
    if (!editValue) {
      delete (newSocials as Record<string, string | undefined>)[editingPlatform];
    }
    onUpdateBio({ socials: newSocials });
    setEditingPlatform(null);
    setEditValue("");
  }, [editingPlatform, editValue, socials, onUpdateBio]);

  const handleRemovePlatform = useCallback(
    (key: string) => {
      const newSocials = { ...socials };
      delete (newSocials as Record<string, string | undefined>)[key];
      onUpdateBio({ socials: newSocials });
    },
    [socials, onUpdateBio]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        dropdownMenuRef.current && !dropdownMenuRef.current.contains(target)
      ) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Close edit overlay on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (editOverlayRef.current && !editOverlayRef.current.contains(target)) {
        setEditingPlatform(null);
        setEditValue("");
      }
    };
    if (editingPlatform) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => editInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingPlatform]);

  const activePlatforms = socialPlatforms.filter(
    (p) => (socials as Record<string, string | undefined>)[p.key] !== undefined
  );

  const availablePlatforms = socialPlatforms.filter(
    (p) => (socials as Record<string, string | undefined>)[p.key] === undefined
  );

  const filteredAvailable = availablePlatforms.filter(
    (p) => p.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-white border-2 border-black rounded-[24px] p-6 mb-6 flex flex-col items-center text-center relative group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
        {/* 3-dot menu */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button className="p-2 hover:bg-black/5 rounded-full text-gray-400 hover:text-black transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>

        {/* Profile Image */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-[#f3f3f1] border-[3px] border-black shadow-sm overflow-hidden">
            <img
              src={
                bio?.profileImage ||
                `https://ui-avatars.com/api/?name=${bio?.sufix || user?.fullname || "Usuário"}&background=random`
              }
              alt={bio?.sufix}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Username + Verified Badge */}
        <h2 className="font-black text-xl mb-1 flex items-center gap-2 justify-center tracking-tight">
          @{bio?.sufix || "username"}
          {bio?.verified && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74Z" fill="#3b82f6"/>
              <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </h2>

        {/* Get Verified Tag */}
        {!bio?.verified && (
          <button
            onClick={() => setShowVerificationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all mb-3"
            style={{
              background: verificationStatus === "pending"
                ? "linear-gradient(135deg, #fffbeb, #fef3c7)"
                : "linear-gradient(135deg, #eff6ff, #dbeafe)",
              border: verificationStatus === "pending"
                ? "1.5px solid #f59e0b"
                : "1.5px solid #93c5fd",
              color: verificationStatus === "pending" ? "#b45309" : "#2563eb",
            }}
          >
            {verificationStatus === "pending" ? (
              <>
                <Clock className="w-3 h-3" />
                Em análise
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74Z" fill="#3b82f6"/>
                  <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Obter verificação
              </>
            )}
          </button>
        )}

        {/* Social icons row */}
        <div className="flex items-center gap-2 mb-6 flex-wrap justify-center relative">
          {activePlatforms.map((platform) => (
            <div key={platform.key} className="relative group/social">
              <button
                onClick={() => {
                  setEditingPlatform(platform.key);
                  setEditValue((socials as Record<string, string | undefined>)[platform.key] || "");
                }}
                className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: platform.color }}
                title={platform.label}
              >
                {platformIcons[platform.key]}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePlatform(platform.key);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/social:opacity-100 transition-opacity hover:bg-red-600"
                title="Remover"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {/* Add button */}
          <button
            ref={dropdownRef}
            onClick={() => { setShowDropdown(!showDropdown); setEditingPlatform(null); }}
            className="w-9 h-9 rounded-full bg-white border-2 border-black text-black hover:bg-[#C6F035] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
            title="Adicionar rede social"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>0 clicks</span>
          <span>0 views</span>
          <span>0% CTR</span>
        </div>
      </div>

      {/* Dropdown popup overlay — floats over content */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px]"
            onMouseDown={() => { setShowDropdown(false); setSearchQuery(""); }}
          />
          <div
            ref={dropdownMenuRef}
            className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(320px,90vw)] bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-sm font-black tracking-tight">Adicionar rede social</h3>
              <button
                onClick={() => { setShowDropdown(false); setSearchQuery(""); }}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-black transition-all"
                />
              </div>
            </div>

            {/* Platform grid */}
            <div className="max-h-[280px] overflow-y-auto px-3 pb-3">
              {filteredAvailable.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Nenhum resultado</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredAvailable.map((platform) => (
                    <button
                      key={platform.key}
                      type="button"
                      onClick={() => handleAddPlatform(platform.key)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platformIcons[platform.key]}
                      </div>
                      <span className="text-xs font-bold text-gray-700 truncate">{platform.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit URL popup overlay */}
      {editingPlatform && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px]"
            onMouseDown={() => { setEditingPlatform(null); setEditValue(""); }}
          />
          <div
            ref={editOverlayRef}
            className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(360px,90vw)] bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 animate-in fade-in zoom-in-95 duration-150"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: socialPlatforms.find((p) => p.key === editingPlatform)?.color || "#000" }}
              >
                {platformIcons[editingPlatform]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black tracking-tight">
                  {socialPlatforms.find((p) => p.key === editingPlatform)?.label}
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">Insira o link ou nome de usuário</p>
              </div>
              <button
                onClick={() => { setEditingPlatform(null); setEditValue(""); }}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input */}
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") { setEditingPlatform(null); setEditValue(""); }
              }}
              placeholder={socialPlaceholders[editingPlatform] || ""}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-black rounded-xl text-sm font-bold outline-none transition-all placeholder:text-gray-300 placeholder:font-medium mb-3"
            />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingPlatform(null); setEditValue(""); }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Verification Modal */}
      {showVerificationModal && bio && (
        <VerificationRequestModal
          bioId={bio.id}
          verified={bio.verified ?? false}
          verificationStatus={verificationStatus}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={() => {
            setVerificationStatus("pending");
          }}
        />
      )}
    </>
  );
});

export const LinksTab = memo(function LinksTab({
  bio,
  user,
  blocks,
  onUpdateBlocks,
  onEditBlock,
  onAddBlock,
  onUpdateBio,
}: LinksTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileHeader bio={bio} user={user} onUpdateBio={onUpdateBio} />
      <LinkManager
        blocks={blocks}
        onUpdateBlocks={onUpdateBlocks}
        onEditBlock={onEditBlock}
        onAddBlock={onAddBlock}
      />
    </div>
  );
});
