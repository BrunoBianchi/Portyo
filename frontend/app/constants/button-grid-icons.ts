export const BUTTON_GRID_ICON_OPTIONS = [
  { value: "Link2", label: "Link", fallback: "🔗" },
  { value: "Globe", label: "Site", fallback: "🌐" },
  { value: "ExternalLink", label: "Abrir", fallback: "↗️" },
  { value: "ShoppingBag", label: "Loja", fallback: "🛍️" },
  { value: "CreditCard", label: "Pagamento", fallback: "💳" },
  { value: "Ticket", label: "Ingressos", fallback: "🎫" },
  { value: "Gift", label: "Oferta", fallback: "🎁" },
  { value: "Mail", label: "Email", fallback: "✉️" },
  { value: "Phone", label: "Telefone", fallback: "📞" },
  { value: "MessageCircle", label: "Mensagem", fallback: "💬" },
  { value: "Calendar", label: "Agenda", fallback: "📅" },
  { value: "MapPin", label: "Local", fallback: "📍" },
  { value: "Instagram", label: "Instagram", fallback: "📸" },
  { value: "Youtube", label: "YouTube", fallback: "▶️" },
  { value: "Twitter", label: "X / Twitter", fallback: "🐦" },
  { value: "Linkedin", label: "LinkedIn", fallback: "💼" },
  { value: "Github", label: "GitHub", fallback: "🐙" },
  { value: "Twitch", label: "Twitch", fallback: "🎮" },
  { value: "Music", label: "Música", fallback: "🎵" },
  { value: "Headphones", label: "Podcast", fallback: "🎧" },
  { value: "Camera", label: "Fotos", fallback: "📷" },
  { value: "Video", label: "Vídeo", fallback: "🎬" },
  { value: "Play", label: "Play", fallback: "▶️" },
  { value: "BookOpen", label: "Conteúdo", fallback: "📖" },
  { value: "Briefcase", label: "Serviços", fallback: "💼" },
  { value: "Megaphone", label: "Anúncios", fallback: "📣" },
  { value: "Download", label: "Download", fallback: "⬇️" },
  { value: "Heart", label: "Favoritos", fallback: "❤️" },
  { value: "Star", label: "Destaque", fallback: "⭐" },
  { value: "Sparkles", label: "Especial", fallback: "✨" },
] as const;

export const BUTTON_GRID_ICON_FALLBACKS: Record<string, string> =
  BUTTON_GRID_ICON_OPTIONS.reduce<Record<string, string>>((acc, item) => {
    acc[item.value] = item.fallback;
    return acc;
  }, {});