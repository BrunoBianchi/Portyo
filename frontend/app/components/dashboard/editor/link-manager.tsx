import { useState } from "react";
import { type BioBlock } from "~/contexts/bio.context";
import { useTranslation } from "react-i18next";
import {
    Plus,
    GripVertical,
    Trash2,
    MoreHorizontal,
    Image as ImageIcon,
    Link as LinkIcon,
    Twitter,
    Youtube,
    Music,
    MapPin,
    Type,
    LayoutGrid,
    Sparkles,
    PenLine,
    Palette,
    Box,
    Text,
    MousePointerClick,
    Grid3X3,
    Share2,
    Video,
    Minus,
    QrCode,
    Calendar,
    ShoppingBag,
    Star,
    Tag,
    Ticket,
    Map,
    FormInput,
    Briefcase,
    TrendingUp,
    MessageCircle,
    Instagram,
    Newspaper,
    ShoppingCart,
    Gem
} from "lucide-react";
import { motion } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { AddBlockModal } from "~/components/dashboard/editor/add-block-modal";

interface LinkManagerProps {
    blocks: BioBlock[];
    onUpdateBlocks: (blocks: BioBlock[]) => void;
    onEditBlock: (block: BioBlock) => void;
    onAddBlock: (type: BioBlock['type']) => void;
}

const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    button: MousePointerClick,
    heading: Type,
    text: Text,
    image: ImageIcon,
    socials: Share2,
    video: Video,
    divider: Minus,
    qrcode: QrCode,
    spotify: Music,
    youtube: Youtube,
    instagram: Instagram,
    tour: MapPin,
    blog: Newspaper,
    marketing: TrendingUp,
    whatsapp: MessageCircle,
    calendar: Calendar,
    map: Map,
    form: FormInput,
    portfolio: Briefcase,
    product: ShoppingBag,
    featured: Star,
    affiliate: Tag,
    event: Ticket,
    button_grid: Grid3X3,
    experience: Gem,
};

export function LinkManager({ blocks, onUpdateBlocks, onEditBlock, onAddBlock }: LinkManagerProps) {
    const { t } = useTranslation("dashboard");
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = blocks.findIndex((block) => block.id === active.id);
            const newIndex = blocks.findIndex((block) => block.id === over.id);
            onUpdateBlocks(arrayMove(blocks, oldIndex, newIndex));
        }

        setActiveId(null);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t("editor.confirmDelete"))) {
            onUpdateBlocks(blocks.filter(b => b.id !== id));
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 pb-16 sm:pb-20">
            {/* Big Add Button (Bold/Black Style) */}
            <motion.button
                onClick={() => setIsAddModalOpen(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[#1A1A1A] hover:bg-black text-white hover:text-[#C6F035] rounded-full font-black text-lg shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 border-2 border-black"
            >
                <Plus className="w-6 h-6" strokeWidth={3} />
                {t("editor.addLink")}
            </motion.button>

            <AddBlockModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={onAddBlock}
            />

            {/* Blocks List */}
            <div className="space-y-3 sm:space-y-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={blocks.map(b => b.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {blocks.map((block) => (
                            <SortableItem
                                key={block.id}
                                block={block}
                                onEdit={() => onEditBlock(block)}
                                onDelete={(e) => handleDelete(block.id, e)}
                            />
                        ))}
                    </SortableContext>
                    <DragOverlay>
                        {activeId ? (
                            <div className="opacity-90 scale-105 cursor-grabbing">
                                <BlockCard block={blocks.find(b => b.id === activeId)!} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {blocks.length === 0 && (
                    <div className="text-center py-12 sm:py-16 border-2 border-dashed border-black/10 rounded-[20px] sm:rounded-[24px] bg-white group hover:border-[#C6F035] transition-colors">
                        <div className="w-16 h-16 bg-[#F3F3F1] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#C6F035] transition-colors">
                            <Plus className="w-6 h-6 text-black/40 group-hover:text-black" />
                        </div>
                        <p className="text-black font-bold text-lg">{t("dashboard.editor.empty.body")}</p>
                        <p className="text-gray-400 font-medium text-sm mt-1">Toque no botão preto para começar</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sortable Wrapper
function SortableItem({ block, onEdit, onDelete }: { block: BioBlock, onEdit: () => void, onDelete: (e: any) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <BlockCard
                block={block}
                onEdit={onEdit}
                onDelete={onDelete}
                dragListeners={listeners}
            />
        </div>
    );
}

// Get translated block type label
function getBlockTypeLabel(type: string, t: any): string {
    return t(`editor.blockTypes.${type}`, { defaultValue: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ') });
}

// Fallback translations if i18n is not loaded
const PREVIEW_FALLBACKS: Record<string, string> = {
    'editor.preview.noUrl': 'No URL configured',
    'editor.preview.mediaAttached': 'Media attached',
    'editor.preview.noMedia': 'No media selected',
    'editor.preview.links': '{{count}} links',
    'editor.preview.noLinks': 'No links added',
    'editor.preview.qrConfigured': 'QR code configured',
    'editor.preview.noQrValue': 'No QR content set',
    'editor.preview.noWhatsappNumber': 'No phone number',
    'editor.preview.spotifyConfigured': 'Spotify link set',
    'editor.preview.noSpotify': 'No Spotify URL',
    'editor.preview.youtubeConfigured': 'YouTube channel set',
    'editor.preview.noYoutube': 'No YouTube URL',
    'editor.preview.noInstagram': 'No username set',
    'editor.preview.mapFallback': 'Location map',
    'editor.preview.calendarFallback': 'Booking calendar',
    'editor.preview.tourFallback': 'Tour dates',
    'editor.preview.eventFallback': 'Upcoming event',
    'editor.preview.formSelected': 'Form connected',
    'editor.preview.noFormSelected': 'No form selected',
    'editor.preview.portfolioFallback': 'Portfolio',
    'editor.preview.experienceCount': '{{count}} experiences',
    'editor.preview.noExperience': 'No experiences added',
    'editor.preview.slotConnected': 'Marketing slot active',
    'editor.preview.noSlotSelected': 'No slot selected',
    'editor.preview.productsCount': '{{count}} products',
    'editor.preview.noProducts': 'No products added',
    'editor.preview.featuredFallback': 'Featured item',
    'editor.preview.affiliateFallback': 'Affiliate offer',
    'editor.preview.blogFallback': 'Blog feed',
    'editor.preview.dividerFallback': 'Visual separator',
    'editor.preview.gridItemsCount': '{{count}} items in grid',
    'editor.preview.emptyGrid': 'Grade vazia',
};

// Safe translation helper
function safeT(t: any, key: string, options?: any): string {
    const translated = t(key, options);
    // If translation returns the key itself, use fallback
    if (translated === key) {
        let fallback = PREVIEW_FALLBACKS[key] || key;
        // Replace interpolation variables
        if (options) {
            Object.entries(options).forEach(([k, v]) => {
                fallback = fallback.replace(`{{${k}}}`, String(v));
            });
        }
        return fallback;
    }
    return translated;
}

// Get preview text for block based on type
function getBlockPreview(block: BioBlock, t: any): string {
    switch (block.type) {
        case 'button':
            return block.href ? new URL(block.href).hostname.replace('www.', '') : safeT(t, "editor.preview.noUrl");
        case 'heading':
        case 'text':
            return block.body?.substring(0, 40) || '';
        case 'image':
        case 'video':
            return block.mediaUrl ? safeT(t, "editor.preview.mediaAttached") : safeT(t, "editor.preview.noMedia");
        case 'socials': {
            const count = Object.values(block.socials || {}).filter(Boolean).length;
            const socialsVariationText = block.socialsVariation ? ` - ${block.socialsVariation === 'icon-grid' ? 'Grid' : block.socialsVariation === 'detailed-list' ? 'Lista' : 'Flutuante'}` : '';
            return count ? safeT(t, "editor.preview.links", { count }) + socialsVariationText : safeT(t, "editor.preview.noLinks");
        }
        case 'qrcode':
            return block.qrCodeValue ? safeT(t, "editor.preview.qrConfigured") : safeT(t, "editor.preview.noQrValue");
        case 'whatsapp':
            const whatsappVariationText = block.whatsappVariation ? ` - ${block.whatsappVariation === 'direct-button' ? 'Direto' : 'Formulário'}` : '';
            return (block.whatsappNumber || safeT(t, "editor.preview.noWhatsappNumber")) + whatsappVariationText;
        case 'spotify':
            const spotifyVariationText = block.spotifyVariation ? ` - ${block.spotifyVariation === 'artist-profile' ? 'Perfil' : block.spotifyVariation === 'single-track' ? 'Faixa' : block.spotifyVariation === 'playlist' ? 'Playlist' : 'Álbum'}` : '';
            return block.spotifyUrl ? safeT(t, "editor.preview.spotifyConfigured") + spotifyVariationText : safeT(t, "editor.preview.noSpotify");
        case 'youtube':
            const youtubeVariationText = block.youtubeVariation ? ` - ${block.youtubeVariation === 'full-channel' ? 'Canal' : block.youtubeVariation === 'single-video' ? 'Vídeo' : 'Playlist'}` : '';
            return block.youtubeUrl ? safeT(t, "editor.preview.youtubeConfigured") + youtubeVariationText : safeT(t, "editor.preview.noYoutube");
        case 'instagram':
            const instagramVariationText = block.instagramVariation ? ` - ${block.instagramVariation === 'grid-shop' ? 'Grid' : block.instagramVariation === 'visual-gallery' ? 'Galeria' : 'Link'}` : '';
            return block.instagramUsername ? `@${block.instagramUsername}${instagramVariationText}` : safeT(t, "editor.preview.noInstagram");
        case 'map':
            return block.mapTitle || block.mapAddress || safeT(t, "editor.preview.mapFallback");
        case 'calendar':
            return safeT(t, "editor.preview.calendarFallback");
        case 'tour':
            return block.tourTitle || safeT(t, "editor.preview.tourFallback");
        case 'event':
            return block.eventTitle || safeT(t, "editor.preview.eventFallback");
        case 'form':
            return block.formId ? safeT(t, "editor.preview.formSelected") : safeT(t, "editor.preview.noFormSelected");
        case 'portfolio':
            return block.portfolioTitle || safeT(t, "editor.preview.portfolioFallback");
        case 'experience': {
            const count = block.experiences?.length || 0;
            return count ? safeT(t, "editor.preview.experienceCount", { count }) : safeT(t, "editor.preview.noExperience");
        }
        case 'marketing':
            return block.marketingId ? safeT(t, "editor.preview.slotConnected") : safeT(t, "editor.preview.noSlotSelected");
        case 'product':
            return block.products?.length ? safeT(t, "editor.preview.productsCount", { count: block.products.length }) : safeT(t, "editor.preview.noProducts");
        case 'featured':
            return block.featuredTitle || safeT(t, "editor.preview.featuredFallback");
        case 'affiliate':
            return block.affiliateCode ? `${block.affiliateTitle || ''} (${block.affiliateCode})` : safeT(t, "editor.preview.affiliateFallback");
        case 'blog':
            return safeT(t, "editor.preview.blogFallback");
        case 'divider':
            return safeT(t, "editor.preview.dividerFallback");
        case 'button_grid': {
            const count = block.gridItems?.length || 0;
            return count ? safeT(t, "editor.preview.gridItemsCount", { count }) : safeT(t, "editor.preview.emptyGrid");
        }
        default:
            return '';
    }
}

// Card Component (Bold/Linktree Style)
function BlockCard({ block, onEdit, onDelete, dragListeners }: { block: BioBlock, onEdit?: () => void, onDelete?: (e: any) => void, dragListeners?: any }) {
    const Icon = BLOCK_ICONS[block.type as keyof typeof BLOCK_ICONS] || BLOCK_ICONS.divider;
    const { t } = useTranslation("dashboard");

    // Build preview style based on block settings
    const previewStyle: React.CSSProperties = {
        backgroundColor: block.blockBackground || '#FFFFFF',
        borderRadius: `${block.blockBorderRadius ?? 8}px`,
        borderWidth: `${block.blockBorderWidth ?? 0}px`,
        borderColor: block.blockBorderColor || '#E5E7EB',
        borderStyle: 'solid',
        opacity: (block.blockOpacity ?? 100) / 100,
        boxShadow: getShadowStyle(block.blockShadow),
    };

    const hasCustomStyle = block.blockBackground ||
        block.blockBorderWidth ||
        block.blockShadow ||
        block.entranceAnimation;

    return (
        <div
            onClick={onEdit}
            className="group relative bg-white border-2 border-[#E5E5E5] hover:border-black rounded-[20px] transition-all cursor-pointer overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
        >
            {/* Style Preview Strip (Top) */}
            <div
                className="h-1.5 w-full"
                style={{
                    backgroundColor: block.blockBackground || '#F3F4F6',
                    opacity: 0.5,
                }}
            />

            <div className="flex items-center gap-3 p-4">
                {/* Drag Handle */}
                <div
                    {...dragListeners}
                    className="p-1.5 hover:bg-gray-100 rounded cursor-move transition-colors shrink-0 text-gray-300 hover:text-black"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F3F3F1] flex items-center justify-center shrink-0 border border-gray-200">
                        <Icon className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-[#1A1A1A] truncate">
                            {block.title || getBlockTypeLabel(block.type, t)}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                                {block.type}
                            </span>
                            <p className="text-xs truncate text-gray-400 flex-1">
                                {block.href || getBlockPreview(block, t)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                        }}
                        className="p-2 hover:bg-black hover:text-white rounded-lg text-gray-400 transition-colors"
                    >
                        <PenLine className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 hover:bg-red-500 hover:text-white rounded-lg text-gray-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper function to convert shadow name to CSS shadow
function getShadowStyle(shadow?: string): string {
    switch (shadow) {
        case 'sm': return '2px 2px 0px 0px rgba(0,0,0,1)';
        case 'md': return '4px 4px 0px 0px rgba(0,0,0,1)';
        case 'lg': return '6px 6px 0px 0px rgba(0,0,0,1)';
        case 'xl': return '8px 8px 0px 0px rgba(0,0,0,1)';
        case '2xl': return '10px 10px 0px 0px rgba(0,0,0,1)';
        case 'glow': return '0 0 10px rgba(198, 240, 53, 0.8)'; // Lime Glow
        default: return 'none';
    }
}

// Ensure PenLine is imported
