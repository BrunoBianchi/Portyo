import { useTranslation } from "react-i18next";
import { type BioBlock } from "~/contexts/bio.context";
import {
    X,
    Search,
    Link as LinkIcon,
    Image as ImageIcon,
    Video,
    Music,
    Type,
    Text,
    LayoutGrid,
    MapPin,
    ShoppingBag,
    Share2,
    Calendar,
    Contact,
    Star,
    Minus,
    QrCode,
    Instagram,
    Youtube,
    MessageCircle,
    Briefcase,
    Newspaper,
    Tag,
    Ticket,
    Map,
    Gem,
    TrendingUp,
    ChevronRight,
    ChevronDown,
    Lightbulb,
    Store,
    Heart,
    Play,
    Users,
    CalendarDays,
    FileText,
    MoreHorizontal,
    DollarSign
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface AddBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (type: BioBlock['type'], variation?: string) => void;
}

export function AddBlockModal({ isOpen, onClose, onAdd }: AddBlockModalProps) {
    const { t } = useTranslation("dashboard");
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("suggested");
    const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

    // Toggle block expansion
    const toggleBlockExpansion = (blockType: string) => {
        setExpandedBlocks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(blockType)) {
                newSet.delete(blockType);
            } else {
                newSet.add(blockType);
            }
            return newSet;
        });
    };

    // Quick action items that appear at the top as cards
    const QUICK_ACTIONS = [
        { type: "button_grid", label: "Coleção", icon: LayoutGrid },
        { type: "button", label: "Link", icon: LinkIcon },
        { type: "product", label: "Produto", icon: Tag },
        { type: "form", label: "Formulário", icon: FileText },
    ];

    // Block variations - each block can have multiple variations
    const BLOCK_VARIATIONS: { [key: string]: Array<{ type: string; label: string; description: string; icon: any; color: string; variation: string }> } = {
        instagram: [
            { type: "instagram", label: "Replique seu Instagram grid e adicione links", description: "Exiba seu Instagram e adicione links aos produtos, eventos e artigos para que seguidores possam navegar e comprar no seu grid do Instagram.", icon: LayoutGrid, color: "#E1306C", variation: "grid-shop" },
            { type: "instagram", label: "Compartilhe visualmente seus últimos Posts ou Reels", description: "Exiba seus Posts ou Reels em galeria para enviar visitantes diretamente ao seu perfil para explorar e seguir seu conteúdo social.", icon: ImageIcon, color: "#E1306C", variation: "visual-gallery" },
            { type: "instagram", label: "Adicione seu perfil do Instagram como um link simples", description: "Direcione visitantes ao seu perfil do Instagram com um link clássico do Linktree listado na sua página, depois reordene para ajustar.", icon: LinkIcon, color: "#E1306C", variation: "simple-link" },
        ],
        youtube: [
            { type: "youtube", label: "Canal completo do YouTube", description: "Mostre seu canal completo com últimos vídeos publicados e estatísticas do canal.", icon: Play, color: "#DC2626", variation: "full-channel" },
            { type: "youtube", label: "Vídeo único em destaque", description: "Destaque um vídeo específico do YouTube com player incorporado.", icon: Video, color: "#DC2626", variation: "single-video" },
            { type: "youtube", label: "Playlist completa", description: "Compartilhe uma playlist completa do YouTube para navegação sequencial.", icon: LayoutGrid, color: "#DC2626", variation: "playlist" },
        ],
        spotify: [
            { type: "spotify", label: "Perfil completo do artista", description: "Compartilhe seu perfil completo do Spotify com todas suas músicas e playlists.", icon: Users, color: "#1DB954", variation: "artist-profile" },
            { type: "spotify", label: "Faixa única em destaque", description: "Destaque uma música específica com player incorporado do Spotify.", icon: Music, color: "#1DB954", variation: "single-track" },
            { type: "spotify", label: "Playlist personalizada", description: "Compartilhe uma playlist específica do Spotify com suas músicas favoritas.", icon: LayoutGrid, color: "#1DB954", variation: "playlist" },
            { type: "spotify", label: "Álbum completo", description: "Mostre um álbum completo com todas as faixas disponíveis.", icon: LayoutGrid, color: "#1DB954", variation: "album" },
        ],
        socials: [
            { type: "socials", label: "Grid de ícones das redes sociais", description: "Ícones clicáveis e coloridos de todas suas redes sociais em formato de grade.", icon: LayoutGrid, color: "#14B8A6", variation: "icon-grid" },
            { type: "socials", label: "Lista vertical detalhada", description: "Lista vertical com descrições e informações detalhadas de cada rede social.", icon: Text, color: "#14B8A6", variation: "detailed-list" },
            { type: "socials", label: "Botões flutuantes fixos", description: "Botões flutuantes fixados no canto da tela para acesso rápido às redes.", icon: Share2, color: "#14B8A6", variation: "floating-buttons" },
        ],
        whatsapp: [
            { type: "whatsapp", label: "Botão de contato direto", description: "Abra uma conversa do WhatsApp diretamente com um clique no botão.", icon: MessageCircle, color: "#25D366", variation: "direct-button" },
            { type: "whatsapp", label: "Formulário com mensagem pré-preenchida", description: "Formulário de contato que abre o WhatsApp com mensagem pré-configurada.", icon: Contact, color: "#25D366", variation: "pre-filled-form" },
        ],
    };

    const CATEGORIES = useMemo(() => [
        {
            id: "suggested",
            label: t("addBlock.categories.suggested", { defaultValue: "Sugeridos" }),
            icon: Lightbulb,
            items: [
                { type: "instagram", label: "Instagram", description: "Exiba seus posts e reels", icon: Instagram, color: "#E1306C" },
                { type: "youtube", label: "YouTube", description: "Compartilhe vídeos do YouTube", icon: Youtube, color: "#DC2626" },
                { type: "spotify", label: "Spotify", description: "Compartilhe suas músicas favoritas", icon: Music, color: "#1DB954" },
                { type: "socials", label: "Redes Sociais", description: "Liste todos os seus perfis", icon: Share2, color: "#14B8A6" },
                { type: "whatsapp", label: "WhatsApp", description: "Botão de contato direto", icon: MessageCircle, color: "#25D366" },
            ]
        },
        {
            id: "commerce",
            label: t("addBlock.categories.commerce", { defaultValue: "Comércio" }),
            icon: Store,
            items: [
                { type: "product", label: "Produtos", description: "Catálogo de produtos", icon: ShoppingBag, color: "#F97316" },
                { type: "featured", label: "Destaque", description: "Item em destaque", icon: Star, color: "#F59E0B" },
                { type: "affiliate", label: "Afiliado", description: "Link de cupom/afiliado", icon: Tag, color: "#22C55E" },
                { type: "sponsored_links", label: "Links Patrocinados", description: "Ganhe com links de empresas", icon: DollarSign, color: "#10B981" },
            ]
        },
        {
            id: "social",
            label: t("addBlock.categories.social", { defaultValue: "Social" }),
            icon: Heart,
            items: [
                { type: "socials", label: "Redes Sociais", description: "Liste seus perfis", icon: Share2, color: "#14B8A6" },
                { type: "instagram", label: "Instagram", description: "Feed do Instagram", icon: Instagram, color: "#E1306C" },
                { type: "whatsapp", label: "WhatsApp", description: "Botão WhatsApp", icon: MessageCircle, color: "#25D366" },
            ]
        },
        {
            id: "media",
            label: t("addBlock.categories.media", { defaultValue: "Mídia" }),
            icon: Play,
            items: [
                { type: "image", label: "Imagem", description: "Adicione uma imagem", icon: ImageIcon, color: "#EC4899" },
                { type: "video", label: "Vídeo", description: "Incorpore um vídeo", icon: Video, color: "#EF4444" },
                { type: "youtube", label: "YouTube", description: "Canal ou vídeos", icon: Youtube, color: "#DC2626" },
                { type: "spotify", label: "Spotify", description: "Música ou podcast", icon: Music, color: "#1DB954" },
            ]
        },
        {
            id: "contact",
            label: t("addBlock.categories.contact", { defaultValue: "Contato" }),
            icon: Users,
            items: [
                { type: "form", label: "Formulário", description: "Capture contatos", icon: Contact, color: "#6366F1" },
                { type: "calendar", label: "Agenda", description: "Agendamentos", icon: Calendar, color: "#0EA5E9" },
                { type: "map", label: "Mapa", description: "Localização", icon: Map, color: "#84CC16" },
                { type: "qrcode", label: "QR Code", description: "QR personalizado", icon: QrCode, color: "#F59E0B" },
            ]
        },
        {
            id: "events",
            label: t("addBlock.categories.events", { defaultValue: "Eventos" }),
            icon: CalendarDays,
            items: [
                { type: "event", label: "Evento", description: "Chamada para evento", icon: Ticket, color: "#22D3EE" },
                { type: "tour", label: "Turnê", description: "Datas de turnê", icon: MapPin, color: "#F59E0B" },
                { type: "calendar", label: "Agenda", description: "Agendamentos", icon: Calendar, color: "#0EA5E9" },
            ]
        },
        {
            id: "text",
            label: t("addBlock.categories.text", { defaultValue: "Texto" }),
            icon: FileText,
            items: [
                { type: "heading", label: "Título", description: "Destaque um título", icon: Type, color: "#3B82F6" },
                { type: "text", label: "Texto", description: "Adicione um parágrafo", icon: Text, color: "#64748B" },
                { type: "divider", label: "Divisor", description: "Separe seções", icon: Minus, color: "#6B7280" },
                { type: "button", label: "Link", description: "Adicione um botão de link", icon: LinkIcon, color: "#EF4444" },
                { type: "button_grid", label: "Grid de Botões", description: "Grade de links", icon: LayoutGrid, color: "#6366F1" },
            ]
        },
        {
            id: "all",
            label: t("addBlock.categories.all", { defaultValue: "Ver todos" }),
            icon: MoreHorizontal,
            items: [
                { type: "button", label: "Link", description: "Adicione um botão de link", icon: LinkIcon, color: "#EF4444" },
                { type: "heading", label: "Título", description: "Destaque um título", icon: Type, color: "#3B82F6" },
                { type: "text", label: "Texto", description: "Adicione um parágrafo", icon: Text, color: "#64748B" },
                { type: "image", label: "Imagem", description: "Mostre uma imagem", icon: ImageIcon, color: "#10B981" },
                { type: "video", label: "Vídeo", description: "Incorpore um vídeo", icon: Video, color: "#EF4444" },
                { type: "divider", label: "Divisor", description: "Separe seções", icon: Minus, color: "#6B7280" },
                { type: "button_grid", label: "Grid de Botões", description: "Grade de links", icon: LayoutGrid, color: "#6366F1" },
                { type: "socials", label: "Redes Sociais", description: "Liste seus perfis", icon: Share2, color: "#14B8A6" },
                { type: "instagram", label: "Instagram", description: "Feed do Instagram", icon: Instagram, color: "#E1306C" },
                { type: "youtube", label: "YouTube", description: "Canal ou vídeos", icon: Youtube, color: "#DC2626" },
                { type: "spotify", label: "Spotify", description: "Música ou podcast", icon: Music, color: "#1DB954" },
                { type: "product", label: "Produtos", description: "Catálogo de produtos", icon: ShoppingBag, color: "#F97316" },
                { type: "featured", label: "Destaque", description: "Item em destaque", icon: Star, color: "#F59E0B" },
                { type: "affiliate", label: "Afiliado", description: "Cupom/afiliado", icon: Tag, color: "#22C55E" },
                { type: "form", label: "Formulário", description: "Capture contatos", icon: Contact, color: "#6366F1" },
                { type: "marketing", label: "Marketing", description: "Bloco promocional", icon: TrendingUp, color: "#8B5CF6" },
                { type: "portfolio", label: "Portfólio", description: "Seção de projetos", icon: Briefcase, color: "#F43F5E" },
                { type: "experience", label: "Experiência", description: "Histórico profissional", icon: Gem, color: "#38BDF8" },
                { type: "blog", label: "Blog", description: "Feed do blog", icon: Newspaper, color: "#F97316" },
                { type: "calendar", label: "Agenda", description: "Agendamentos", icon: Calendar, color: "#0EA5E9" },
                { type: "map", label: "Mapa", description: "Localização", icon: Map, color: "#84CC16" },
                { type: "event", label: "Evento", description: "Chamada para evento", icon: Ticket, color: "#22D3EE" },
                { type: "tour", label: "Turnê", description: "Datas de turnê", icon: MapPin, color: "#F59E0B" },
                { type: "qrcode", label: "QR Code", description: "QR personalizado", icon: QrCode, color: "#F59E0B" },
                { type: "whatsapp", label: "WhatsApp", description: "Botão WhatsApp", icon: MessageCircle, color: "#25D366" },
                { type: "sponsored_links", label: "Links Patrocinados", description: "Ganhe com links de empresas", icon: DollarSign, color: "#10B981" },
            ]
        }
    ], [t]);

    // Filter logic
    const displayedItems = useMemo(() => {
        if (search.trim()) {
            return CATEGORIES.flatMap(c => c.items).filter((item, index, self) =>
                index === self.findIndex((t) => t.type === item.type && t.label === item.label) &&
                (item.label.toLowerCase().includes(search.toLowerCase()) ||
                    item.description.toLowerCase().includes(search.toLowerCase()))
            );
        }
        return CATEGORIES.find(c => c.id === activeCategory)?.items || [];
    }, [search, activeCategory, CATEGORIES]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Reset expanded blocks when closing modal or changing category
    useEffect(() => {
        if (!isOpen) {
            setExpandedBlocks(new Set());
        }
    }, [isOpen]);

    useEffect(() => {
        setExpandedBlocks(new Set());
    }, [activeCategory, search]);

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Adicionar</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="px-6 py-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cole ou pesquise um link"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-100 hover:bg-gray-200/70 focus:bg-white border-2 border-transparent focus:border-[#c8e600] rounded-xl text-base font-medium outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                {/* Sidebar (Categories) */}
                                <div className="w-52 border-r border-gray-100 overflow-y-auto hidden md:block shrink-0">
                                    <div className="py-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                                                className={`w-full text-left px-5 py-3.5 font-medium text-sm transition-all flex items-center gap-3 ${activeCategory === cat.id && !search
                                                    ? 'bg-[#c8e600]/15 text-gray-900 border-l-2 border-[#c8e600]'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'
                                                    }`}
                                            >
                                                <cat.icon className="w-4 h-4" />
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Categories (Mobile) */}
                                <div className="md:hidden px-4 py-3 overflow-x-auto flex gap-2 no-scrollbar shrink-0 border-b border-gray-100">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                                            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${activeCategory === cat.id && !search
                                                ? 'bg-[#c8e600] text-gray-900'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto">
                                    {/* Quick Actions (only on suggested) */}
                                    {activeCategory === "suggested" && !search && (
                                        <div className="p-6 grid grid-cols-4 gap-3">
                                            {QUICK_ACTIONS.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        onAdd(item.type as BioBlock['type']);
                                                        onClose();
                                                    }}
                                                    className="flex flex-col items-center p-4 bg-gray-50 hover:bg-[#c8e600]/10 border border-gray-100 hover:border-[#c8e600]/30 rounded-xl transition-all group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-[#c8e600]/20 flex items-center justify-center mb-2 group-hover:bg-[#c8e600]/30 transition-colors">
                                                        <item.icon className="w-5 h-5 text-[#9eb800]" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Section Title */}
                                    <div className="px-6 py-3 sticky top-0 bg-white z-10 border-b border-gray-50">
                                        <h3 className="text-sm font-semibold text-gray-400">
                                            {search ? `Resultados para "${search}"` : CATEGORIES.find(c => c.id === activeCategory)?.label}
                                        </h3>
                                    </div>

                                    {/* Block Items List */}
                                    <div className="px-4 pb-6">
                                        {displayedItems.map((item, idx) => {
                                            const hasVariations = BLOCK_VARIATIONS[item.type];
                                            const isExpanded = expandedBlocks.has(item.type);

                                            return (
                                                <div key={idx} className="mb-2">
                                                    {/* Main Block Button */}
                                                    <button
                                                        onClick={() => {
                                                            if (hasVariations) {
                                                                toggleBlockExpansion(item.type);
                                                            } else {
                                                                onAdd(item.type as BioBlock['type']);
                                                                onClose();
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all group text-left"
                                                    >
                                                        {/* Icon */}
                                                        <div
                                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                                                            style={{ backgroundColor: `${item.color}15` }}
                                                        >
                                                            <item.icon className="w-6 h-6" style={{ color: item.color }} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-semibold text-gray-900 block">{item.label}</span>
                                                            <span className="text-sm text-gray-500">{item.description}</span>
                                                        </div>

                                                        {/* Chevron */}
                                                        {hasVariations ? (
                                                            <ChevronDown 
                                                                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                                            />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#c8e600] group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                        )}
                                                    </button>

                                                    {/* Variations Dropdown */}
                                                    {hasVariations && isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="ml-2 md:ml-4 mt-2 space-y-1.5"
                                                        >
                                                            {BLOCK_VARIATIONS[item.type].map((variation, vIdx) => (
                                                                <button
                                                                    key={vIdx}
                                                                    onClick={() => {
                                                                        onAdd(variation.type as BioBlock['type'], variation.variation);
                                                                        onClose();
                                                                    }}
                                                                    className="w-full flex items-start md:items-center gap-2.5 md:gap-3 p-2.5 md:p-3 bg-white hover:bg-gradient-to-r hover:from-[#c8e600]/5 hover:to-transparent border border-gray-100 hover:border-[#c8e600]/30 rounded-lg transition-all group text-left"
                                                                >
                                                                    {/* Visual Icon with colored background */}
                                                                    <div 
                                                                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-105"
                                                                        style={{ backgroundColor: `${variation.color}15` }}
                                                                    >
                                                                        <variation.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: variation.color }} />
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="flex-1 min-w-0 pr-2">
                                                                        <h4 className="font-semibold text-gray-900 text-xs md:text-sm mb-0.5 md:mb-1 leading-tight">
                                                                            {variation.label}
                                                                        </h4>
                                                                        <p className="text-[10px] md:text-xs text-gray-500 leading-snug line-clamp-2">
                                                                            {variation.description}
                                                                        </p>
                                                                    </div>

                                                                    {/* Radio-like indicator */}
                                                                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-gray-300 group-hover:border-[#c8e600] flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 md:mt-0">
                                                                        <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-[#c8e600] transition-colors" />
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {displayedItems.length === 0 && (
                                        <div className="text-center py-20">
                                            <p className="text-gray-400 font-medium">Nenhum resultado para "{search}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
}
