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
    TrendingUp
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (type: BioBlock['type']) => void;
}

export function AddBlockModal({ isOpen, onClose, onAdd }: AddBlockModalProps) {
    const { t } = useTranslation("dashboard");
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("suggested");

    const CATEGORIES = useMemo(() => [
        {
            id: "suggested",
            label: t("addBlock.categories.suggested", { defaultValue: "Sugestões" }),
            items: [
                { type: "button", label: t("addBlock.blocks.link", { defaultValue: "Link" }), description: t("addBlock.blocks.linkDesc", { defaultValue: "Adicione um botão de link" }), icon: LinkIcon, color: "#EF4444" },
                { type: "heading", label: t("addBlock.blocks.header", { defaultValue: "Título" }), description: t("addBlock.blocks.headerDesc", { defaultValue: "Destaque um título" }), icon: Type, color: "#3B82F6" },
                { type: "text", label: t("addBlock.blocks.text", { defaultValue: "Texto" }), description: t("addBlock.blocks.textDesc", { defaultValue: "Adicione um parágrafo" }), icon: Text, color: "#64748B" },
                { type: "image", label: t("addBlock.blocks.image", { defaultValue: "Imagem" }), description: t("addBlock.blocks.imageDesc", { defaultValue: "Mostre uma imagem" }), icon: ImageIcon, color: "#10B981" },
                { type: "socials", label: t("addBlock.blocks.socials", { defaultValue: "Redes Sociais" }), description: t("addBlock.blocks.socialsDesc", { defaultValue: "Liste seus perfis" }), icon: Share2, color: "#14B8A6" },
            ]
        },
        {
            id: "essentials",
            label: t("addBlock.categories.essentials", { defaultValue: "Essenciais" }),
            items: [
                { type: "button", label: t("addBlock.blocks.link", { defaultValue: "Link" }), description: t("addBlock.blocks.linkDesc", { defaultValue: "Adicione um botão de link" }), icon: LinkIcon, color: "#EF4444" },
                { type: "heading", label: t("addBlock.blocks.header", { defaultValue: "Título" }), description: t("addBlock.blocks.headerDesc", { defaultValue: "Destaque um título" }), icon: Type, color: "#3B82F6" },
                { type: "text", label: t("addBlock.blocks.text", { defaultValue: "Texto" }), description: t("addBlock.blocks.textDesc", { defaultValue: "Adicione um parágrafo" }), icon: Text, color: "#64748B" },
                { type: "divider", label: t("addBlock.blocks.divider", { defaultValue: "Divisor" }), description: t("addBlock.blocks.dividerDesc", { defaultValue: "Separe seções" }), icon: Minus, color: "#6B7280" },
                { type: "button_grid", label: t("addBlock.blocks.buttonGrid", { defaultValue: "Grid de Botões" }), description: t("addBlock.blocks.buttonGridDesc", { defaultValue: "Grade de links" }), icon: LayoutGrid, color: "#6366F1" },
            ]
        },
        {
            id: "media",
            label: t("addBlock.categories.media", { defaultValue: "Mídia" }),
            items: [
                { type: "image", label: t("addBlock.blocks.gallery", { defaultValue: "Imagem" }), description: t("addBlock.blocks.galleryDesc", { defaultValue: "Mostre imagens" }), icon: ImageIcon, color: "#EC4899" },
                { type: "video", label: t("addBlock.blocks.video", { defaultValue: "Vídeo" }), description: t("addBlock.blocks.videoDesc", { defaultValue: "Incorpore um vídeo" }), icon: Video, color: "#EF4444" },
                { type: "youtube", label: t("addBlock.blocks.youtube", { defaultValue: "YouTube" }), description: t("addBlock.blocks.youtubeDesc", { defaultValue: "Canal ou vídeos" }), icon: Youtube, color: "#DC2626" },
                { type: "spotify", label: t("addBlock.blocks.music", { defaultValue: "Spotify" }), description: t("addBlock.blocks.musicDesc", { defaultValue: "Música ou podcast" }), icon: Music, color: "#1DB954" },
                { type: "instagram", label: t("addBlock.blocks.instagram", { defaultValue: "Instagram" }), description: t("addBlock.blocks.instagramDesc", { defaultValue: "Feed do Instagram" }), icon: Instagram, color: "#E1306C" },
            ]
        },
        {
            id: "commerce",
            label: t("addBlock.categories.commerce", { defaultValue: "Comércio" }),
            items: [
                { type: "product", label: t("addBlock.blocks.product", { defaultValue: "Produtos" }), description: t("addBlock.blocks.productDesc", { defaultValue: "Catálogo de produtos" }), icon: ShoppingBag, color: "#F97316" },
                { type: "featured", label: t("addBlock.blocks.featured", { defaultValue: "Destaque" }), description: t("addBlock.blocks.featuredDesc", { defaultValue: "Item em destaque" }), icon: Star, color: "#F59E0B" },
                { type: "affiliate", label: t("addBlock.blocks.affiliate", { defaultValue: "Afiliado" }), description: t("addBlock.blocks.affiliateDesc", { defaultValue: "Cupom/afiliado" }), icon: Tag, color: "#22C55E" },
            ]
        },
        {
            id: "grow",
            label: t("addBlock.categories.grow", { defaultValue: "Crescer" }),
            items: [
                { type: "form", label: t("addBlock.blocks.form", { defaultValue: "Formulário" }), description: t("addBlock.blocks.formDesc", { defaultValue: "Capture contatos" }), icon: Contact, color: "#6366F1" },
                { type: "marketing", label: t("addBlock.blocks.marketing", { defaultValue: "Marketing" }), description: t("addBlock.blocks.marketingDesc", { defaultValue: "Bloco promocional" }), icon: TrendingUp, color: "#8B5CF6" },
                { type: "portfolio", label: t("addBlock.blocks.portfolio", { defaultValue: "Portfólio" }), description: t("addBlock.blocks.portfolioDesc", { defaultValue: "Seção de projetos" }), icon: Briefcase, color: "#F43F5E" },
                { type: "experience", label: t("addBlock.blocks.experience", { defaultValue: "Experiência" }), description: t("addBlock.blocks.experienceDesc", { defaultValue: "Histórico profissional" }), icon: Gem, color: "#38BDF8" },
                { type: "blog", label: t("addBlock.blocks.blog", { defaultValue: "Blog" }), description: t("addBlock.blocks.blogDesc", { defaultValue: "Feed do blog" }), icon: Newspaper, color: "#F97316" },
                { type: "calendar", label: t("addBlock.blocks.calendar", { defaultValue: "Agenda" }), description: t("addBlock.blocks.calendarDesc", { defaultValue: "Agendamentos" }), icon: Calendar, color: "#0EA5E9" },
                { type: "map", label: t("addBlock.blocks.map", { defaultValue: "Mapa" }), description: t("addBlock.blocks.mapDesc", { defaultValue: "Localização" }), icon: Map, color: "#84CC16" },
                { type: "event", label: t("addBlock.blocks.event", { defaultValue: "Evento" }), description: t("addBlock.blocks.eventDesc", { defaultValue: "Chamada para evento" }), icon: Ticket, color: "#22D3EE" },
                { type: "tour", label: t("addBlock.blocks.tour", { defaultValue: "Turnê" }), description: t("addBlock.blocks.tourDesc", { defaultValue: "Datas de turnê" }), icon: MapPin, color: "#F59E0B" },
                { type: "qrcode", label: t("addBlock.blocks.qrcode", { defaultValue: "QR Code" }), description: t("addBlock.blocks.qrcodeDesc", { defaultValue: "QR personalizado" }), icon: QrCode, color: "#F59E0B" },
                { type: "whatsapp", label: t("addBlock.blocks.whatsapp", { defaultValue: "WhatsApp" }), description: t("addBlock.blocks.whatsappDesc", { defaultValue: "Botão WhatsApp" }), icon: MessageCircle, color: "#25D366" },
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white md:rounded-[24px] w-full md:max-w-4xl h-full md:h-[80vh] flex flex-col shadow-2xl overflow-hidden relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>

                            {/* Header & Search */}
                            <div className="p-8 pb-4 shrink-0">
                                <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A] mb-6">{t("addBlock.title")}</h2>
                                <div className="relative max-w-2xl">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={t("addBlock.searchPlaceholder")}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-[#F3F3F5] hover:bg-[#EAEAEB] focus:bg-white border-2 border-transparent focus:border-black rounded-[16px] text-lg font-medium outline-none transition-all placeholder:text-gray-500"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                {/* Sidebar (Categories) - Desktop */}
                                <div className="w-64 p-4 pl-8 overflow-y-auto hidden md:block shrink-0">
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-2 mb-2">{t("addBlock.sidebar")}</h3>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeCategory === cat.id && !search
                                                    ? 'bg-[#EEEFF1] text-black'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Categories (Mobile) */}
                                <div className="md:hidden px-6 pb-2 overflow-x-auto flex gap-2 no-scrollbar shrink-0">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
                                            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border ${activeCategory === cat.id && !search
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-500 border-gray-200'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Content Grid */}
                                <div className="flex-1 overflow-y-auto p-4 pr-8 md:pl-4">
                                    {!search && (
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            {CATEGORIES.find(c => c.id === activeCategory)?.label}
                                        </h3>
                                    )}
                                    {search && (
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            {t("addBlock.searchPlaceholder")}
                                        </h3>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-20">
                                        {displayedItems.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    onAdd(item.type as BioBlock['type']);
                                                    onClose();
                                                }}
                                                className="flex flex-col items-start p-4 sm:p-5 bg-white border border-gray-200 hover:border-black rounded-[16px] sm:rounded-[20px] hover:shadow-lg transition-all group text-left h-full"
                                            >
                                                <div className="flex items-start justify-between w-full mb-4">
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                                                        style={{ backgroundColor: item.color }}
                                                    >
                                                        <item.icon className="w-5 h-5" strokeWidth={2.5} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-[#1A1A1A] text-lg block mb-1">{item.label}</span>
                                                    <span className="text-sm text-gray-500 font-medium leading-relaxed">{item.description}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {displayedItems.length === 0 && (
                                        <div className="text-center py-20">
                                            <p className="text-gray-400 font-medium">{t("addBlock.noResults", { query: search })}</p>
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
}
