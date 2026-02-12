import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, Search } from "lucide-react";
import type { BlockEditorProps } from "./index";

const platforms = [
  { key: "instagram", label: "Instagram", icon: "📷", placeholder: "@seuusuario", color: "#E4405F" },
  { key: "tiktok", label: "TikTok", icon: "🎵", placeholder: "@seuusuario", color: "#000000" },
  { key: "twitter", label: "X (Twitter)", icon: "𝕏", placeholder: "@seuusuario", color: "#000000" },
  { key: "youtube", label: "YouTube", icon: "▶️", placeholder: "https://youtube.com/@canal", color: "#FF0000" },
  { key: "linkedin", label: "LinkedIn", icon: "💼", placeholder: "https://linkedin.com/in/perfil", color: "#0A66C2" },
  { key: "github", label: "GitHub", icon: "🐙", placeholder: "seuusuario", color: "#111827" },
  { key: "facebook", label: "Facebook", icon: "👥", placeholder: "https://facebook.com/pagina", color: "#1877F2" },
  { key: "email", label: "Email", icon: "✉️", placeholder: "seu@email.com", color: "#EA4335" },
  { key: "website", label: "Website", icon: "🌐", placeholder: "https://seusite.com", color: "#2563EB" },
  { key: "threads", label: "Threads", icon: "🧵", placeholder: "@seuusuario", color: "#000000" },
  { key: "twitch", label: "Twitch", icon: "🎮", placeholder: "seuusuario", color: "#9146FF" },
  { key: "discord", label: "Discord", icon: "💬", placeholder: "https://discord.gg/convite", color: "#5865F2" },
  { key: "pinterest", label: "Pinterest", icon: "📌", placeholder: "https://pinterest.com/perfil", color: "#E60023" },
  { key: "snapchat", label: "Snapchat", icon: "👻", placeholder: "@seuusuario", color: "#FFFC00" },
  { key: "whatsapp", label: "WhatsApp", icon: "📱", placeholder: "+5511999999999", color: "#25D366" },
  { key: "telegram", label: "Telegram", icon: "✈️", placeholder: "@seuusuario", color: "#26A5E4" },
  { key: "spotify", label: "Spotify", icon: "🎧", placeholder: "https://open.spotify.com/...", color: "#1DB954" },
  { key: "behance", label: "Behance", icon: "🎨", placeholder: "https://behance.net/perfil", color: "#1769FF" },
  { key: "dribbble", label: "Dribbble", icon: "🏀", placeholder: "https://dribbble.com/perfil", color: "#EA4C89" },
];

export function SocialsBlockEditor({ block, onChange }: BlockEditorProps) {
  const { t } = useTranslation("dashboard");
  const socials = block.socials || {};
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (key: string, value: string) => {
      onChange({ socials: { ...socials, [key]: value } });
    },
    [socials, onChange]
  );

  const handleRemove = useCallback(
    (key: string) => {
      const newSocials = { ...socials };
      delete (newSocials as Record<string, string | undefined>)[key];
      onChange({ socials: newSocials });
    },
    [socials, onChange]
  );

  const handleAdd = useCallback(
    (key: string) => {
      onChange({ socials: { ...socials, [key]: "" } });
      setShowDropdown(false);
      setSearchQuery("");
    },
    [socials, onChange]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  const activePlatforms = platforms.filter(
    (p) => (socials as Record<string, string | undefined>)[p.key] !== undefined
  );

  const availablePlatforms = platforms.filter(
    (p) => (socials as Record<string, string | undefined>)[p.key] === undefined
  );

  const filteredAvailable = availablePlatforms.filter(
    (p) => p.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Active social links */}
      {activePlatforms.map((platform) => (
        <div
          key={platform.key}
          className="flex items-center gap-2.5 group animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm shrink-0 shadow-sm"
            style={{ backgroundColor: platform.color }}
            title={platform.label}
          >
            {platform.icon}
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-gray-500">
              {platform.label}
            </label>
            <input
              type="text"
              value={(socials as Record<string, string | undefined>)[platform.key] || ""}
              onChange={(e) => handleChange(platform.key, e.target.value)}
              className="w-full p-2.5 bg-white border-2 border-gray-200 focus:border-black rounded-xl font-medium text-sm focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all"
              placeholder={platform.placeholder}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemove(platform.key)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 mt-5"
            title="Remover"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Empty state */}
      {activePlatforms.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          <p className="font-medium">Nenhuma rede social adicionada</p>
          <p className="text-xs mt-1">Clique no botão abaixo para começar</p>
        </div>
      )}

      {/* Add platform button + dropdown */}
      {availablePlatforms.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-black rounded-xl text-sm font-bold text-gray-500 hover:text-black transition-all"
          >
            <Plus className="w-4 h-4" />
            Adicionar rede social
          </button>

          {showDropdown && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-black/10 transition-all"
                  />
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto p-1.5">
                {filteredAvailable.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-4">Nenhum resultado</p>
                ) : (
                  filteredAvailable.map((platform) => (
                    <button
                      key={platform.key}
                      type="button"
                      onClick={() => handleAdd(platform.key)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shadow-sm"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.icon}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{platform.label}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
