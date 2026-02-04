import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { sanitizeHtml } from "~/utils/security";
import type { Route } from "../+types/root";
import { useParams, useNavigate } from "react-router";
import {
    ArrowLeft, Save, Eye, Smartphone, Monitor, Trash2, GripVertical,
    Type, Image as ImageIcon, MousePointer, Minus, Share2, Mail,
    ChevronDown, ChevronRight, Heading1, Columns, AlignLeft, AlignCenter, AlignRight, X, Loader2
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";
import { generateEmailHtml, type EmailBlock } from "~/services/email-html-generator";
import { useTranslation } from "react-i18next";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Edit Template | Portyo" },
    ];
}


// Draggable Sortable Item Component
function SortableItem({ block, isSelected, onClick, onDelete, fontFamily }: any) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const renderBlockPreview = () => {
        const blockStyle = block.style || {};
        const align = block.align || 'left';

        switch (block.type) {
            case 'heading':
                return (
                    <div style={{ textAlign: align, padding: '16px 20px' }}>
                        <div style={{
                            fontSize: block.level === 'h1' ? '28px' : block.level === 'h2' ? '22px' : '18px',
                            fontWeight: 'bold',
                            color: blockStyle.color || '#000000',
                            fontFamily
                        }}>
                            {block.content || t("dashboard.templatesEditor.defaults.heading")}
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div style={{
                        textAlign: align,
                        padding: blockStyle.padding || '12px 20px',
                        color: blockStyle.color || '#374151',
                        fontSize: blockStyle.fontSize || '16px',
                        lineHeight: blockStyle.lineHeight || '1.6',
                        fontFamily
                    }}>
                        {block.content ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }} /> : <span className="text-gray-400 italic">{t("dashboard.templatesEditor.defaults.addText")}</span>}
                    </div>
                );

            case 'image':
                return (
                    <div style={{ padding: blockStyle.padding || '16px 20px', textAlign: align }}>
                        {block.content ? (
                            <img
                                src={block.content}
                                alt="preview"
                                style={{
                                    maxWidth: '100%',
                                    width: blockStyle.width || '100%',
                                    borderRadius: blockStyle.borderRadius || '0px',
                                    display: 'inline-block'
                                }}
                            />
                        ) : (
                            <div className="h-32 bg-gray-50 flex flex-col items-center justify-center rounded-xl border-4 border-black border-dashed text-gray-400">
                                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-xs font-bold">{t("dashboard.templatesEditor.defaults.addImage")}</span>
                            </div>
                        )}
                    </div>
                );

            case 'button':
                return (
                    <div style={{ padding: blockStyle.padding || '20px', textAlign: align }}>
                        <span style={{
                            display: 'inline-block',
                            backgroundColor: blockStyle.backgroundColor || '#000000',
                            color: blockStyle.color || '#ffffff',
                            padding: `${blockStyle.vPadding || '14px'} ${blockStyle.hPadding || '28px'}`,
                            borderRadius: blockStyle.borderRadius || '8px',
                            fontSize: blockStyle.fontSize || '16px',
                            fontWeight: '600',
                            fontFamily
                        }}>
                            {block.content || t("dashboard.templatesEditor.defaults.buttonLabel")}
                        </span>
                    </div>
                );

            case 'spacer':
                return (
                    <div className="flex items-center justify-center py-2 text-gray-400">
                        <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                        <span className="px-3 text-[10px] font-bold bg-white border border-gray-200 rounded">{blockStyle.height || '32px'}</span>
                        <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                    </div>
                );

            case 'divider':
                return (
                    <div style={{ padding: blockStyle.padding || '20px' }}>
                        <div style={{
                            height: 0,
                            borderTop: `${blockStyle.borderWidth || '1px'} ${blockStyle.borderStyle || 'solid'} ${blockStyle.borderColor || '#e5e7eb'}`
                        }}></div>
                    </div>
                );

            case 'social':
                const socials = block.socials || {};
                const hasSocials = Object.values(socials).some(v => v);
                return (
                    <div style={{ padding: blockStyle.padding || '24px 20px', textAlign: align }}>
                        {hasSocials ? (
                            <div className="flex gap-2 justify-center">
                                {Object.entries(socials).filter(([_, v]) => v).map(([platform]) => (
                                    <div key={platform} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                                        {platform.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm font-medium">{t("dashboard.templatesEditor.defaults.addSocial")}</div>
                        )}
                    </div>
                );

            case 'footer':
                return (
                    <div style={{ padding: blockStyle.padding || '32px 20px', textAlign: 'center', backgroundColor: blockStyle.backgroundColor || 'transparent' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: blockStyle.color || '#6b7280', fontFamily }}>
                            {block.content || t("dashboard.templatesEditor.defaults.footerText")}
                        </p>
                        <a href="#" style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'underline' }}>{t("dashboard.templatesEditor.defaults.unsubscribe")}</a>
                    </div>
                );

            case 'columns':
                return (
                    <div className="p-4">
                        <div className={`grid gap-3 ${block.columnCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            {Array.from({ length: block.columnCount || 2 }).map((_, i) => (
                                <div key={i} className="h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-bold">
                                    {t("dashboard.templatesEditor.defaults.column", { index: i + 1 })}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative rounded-xl transition-all duration-200 cursor-pointer mb-2 ${isSelected
                ? 'ring-4 ring-black ring-offset-2 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                : 'hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-transparent border-2 border-transparent hover:border-black'
                }`}
            onClick={(e) => onClick(e, block.id)}
        >
            {/* Drag Handle */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 group-hover:opacity-100 cursor-move p-2 text-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg z-20 border-2 border-black transition-all" {...attributes} {...listeners}>
                <GripVertical className="w-4 h-4" />
            </div>

            {/* Delete Button */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 z-20 transition-all">
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                    className="p-1.5 bg-[#E94E77] text-white rounded-lg hover:bg-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                </button>
            </div>

            {/* Block Preview */}
            <div className="pointer-events-none overflow-hidden rounded-xl">
                {renderBlockPreview()}
            </div>
        </div>
    );
}

export default function DashboardTemplateEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bio } = useContext(BioContext);
    const { t } = useTranslation();

    const [templateName, setTemplateName] = useState(t("dashboard.templatesEditor.defaultName"));
    const [blocks, setBlocks] = useState<EmailBlock[]>([]);
    const [globalStyles, setGlobalStyles] = useState({
        backgroundColor: '#f3f4f6',
        contentBackgroundColor: '#ffffff',
        width: 600,
        fontFamily: 'Arial, sans-serif',
        borderRadius: 12,
        contentPadding: 24
    });
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

    // Load Template
    useEffect(() => {
        if (bio?.id && id) {
            api.get(`/templates/${bio.id}/${id}`)
                .then(res => {
                    setTemplateName(res.data.name);
                    const loadedBlocks = res.data.content || [];
                    if (res.data.meta) {
                        setGlobalStyles(s => ({ ...s, ...res.data.meta }));
                    }
                    setBlocks(loadedBlocks);
                })
                .catch(() => navigate('/dashboard/templates'))
                .finally(() => setLoading(false));
        }
    }, [bio?.id, id, navigate]);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const blockPalette = useMemo(() => ([
        {
            category: t("dashboard.templatesEditor.palette.content"),
            items: [
                { type: 'heading', label: t("dashboard.templatesEditor.blocks.heading"), icon: Heading1, description: t("dashboard.templatesEditor.blocks.headingDesc") },
                { type: 'text', label: t("dashboard.templatesEditor.blocks.text"), icon: Type, description: t("dashboard.templatesEditor.blocks.textDesc") },
                { type: 'image', label: t("dashboard.templatesEditor.blocks.image"), icon: ImageIcon, description: t("dashboard.templatesEditor.blocks.imageDesc") },
                { type: 'button', label: t("dashboard.templatesEditor.blocks.button"), icon: MousePointer, description: t("dashboard.templatesEditor.blocks.buttonDesc") },
            ]
        },
        {
            category: t("dashboard.templatesEditor.palette.layout"),
            items: [
                { type: 'spacer', label: t("dashboard.templatesEditor.blocks.spacer"), icon: Minus, description: t("dashboard.templatesEditor.blocks.spacerDesc") },
                { type: 'divider', label: t("dashboard.templatesEditor.blocks.divider"), icon: Minus, description: t("dashboard.templatesEditor.blocks.dividerDesc") },
                { type: 'columns', label: t("dashboard.templatesEditor.blocks.columns"), icon: Columns, description: t("dashboard.templatesEditor.blocks.columnsDesc") },
            ]
        },
        {
            category: t("dashboard.templatesEditor.palette.social"),
            items: [
                { type: 'social', label: t("dashboard.templatesEditor.blocks.social"), icon: Share2, description: t("dashboard.templatesEditor.blocks.socialDesc") },
                { type: 'footer', label: t("dashboard.templatesEditor.blocks.footer"), icon: Mail, description: t("dashboard.templatesEditor.blocks.footerDesc") },
            ]
        }
    ]), [t]);

    useEffect(() => {
        setExpandedCategories(blockPalette.map(group => group.category));
    }, [blockPalette]);

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }, []);

    const addBlock = useCallback((type: EmailBlock['type']) => {
        const newBlock: EmailBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'heading' ? 'Your Heading Here' : type === 'text' ? 'Write your content here...' : type === 'button' ? 'Click Me' : type === 'footer' ? 'You received this email because you subscribed.' : '',
            style: type === 'spacer' ? { height: '32px' } : type === 'divider' ? { borderColor: '#e5e7eb', borderWidth: '1px' } : {},
            align: 'center',
            level: type === 'heading' ? 'h1' : undefined,
            columnCount: type === 'columns' ? 2 : undefined,
            socials: type === 'social' ? {} : undefined
        };
        setBlocks(prev => [...prev, newBlock]);
        setSelectedBlockId(newBlock.id);
    }, []);

    const updateBlock = useCallback((id: string, updates: Partial<EmailBlock>) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    }, []);

    const deleteBlock = useCallback((id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    }, [selectedBlockId]);

    const handleSave = async () => {
        if (!bio?.id || !id) return;
        setSaving(true);
        const html = generateEmailHtml(blocks, globalStyles);
        try {
            await api.put(`/templates/${bio.id}/${id}`, {
                name: templateName,
                content: blocks,
                html,
                meta: globalStyles
            });
        } catch (error) {
            alert(t("dashboard.templatesEditor.saveError"));
        } finally {
            setSaving(false);
        }
    };

    const selectedBlock = useMemo(() => blocks.find(b => b.id === selectedBlockId), [blocks, selectedBlockId]);

    const toggleCategory = useCallback((cat: string) => {
        setExpandedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    }, []);

    // Render Properties Panel
    const renderProperties = () => {
        if (!selectedBlock) return null;

        const blockStyle = selectedBlock.style || {};

        return (
            <div className="space-y-6">
                {/* Alignment */}
                {['heading', 'text', 'image', 'button', 'social'].includes(selectedBlock.type) && (
                    <div>
                        <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.alignment")}</label>
                        <div className="flex bg-white border-2 border-black rounded-xl overflow-hidden p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {(['left', 'center', 'right'] as const).map((align) => (
                                <button
                                    key={align}
                                    onClick={() => updateBlock(selectedBlock.id, { align })}
                                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all ${selectedBlock.align === align ? 'bg-[#d2e823] text-black font-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
                                >
                                    {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                    {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                    {align === 'right' && <AlignRight className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Heading Properties */}
                {selectedBlock.type === 'heading' && (
                    <>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.headingLevel")}</label>
                            <div className="flex bg-white border-2 border-black rounded-xl overflow-hidden p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {(['h1', 'h2', 'h3'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => updateBlock(selectedBlock.id, { level })}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${selectedBlock.level === level ? 'bg-[#d2e823] text-black font-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        {level.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.text")}</label>
                            <input
                                type="text"
                                value={selectedBlock.content || ''}
                                onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                                className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
                                placeholder={t("dashboard.templatesEditor.placeholders.heading")}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.color")}</label>
                            <div className="flex items-center gap-2 border-2 border-black rounded-xl p-2 bg-white">
                                <input type="color" value={blockStyle.color as string || '#000000'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, color: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                                <input type="text" value={blockStyle.color as string || '#000000'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, color: e.target.value } })} className="flex-1 text-xs font-black text-[#1A1A1A] border-0 focus:ring-0 outline-none bg-transparent uppercase" />
                            </div>
                        </div>
                    </>
                )}

                {/* Text Properties */}
                {selectedBlock.type === 'text' && (
                    <>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.content")}</label>
                            <textarea
                                rows={4}
                                value={selectedBlock.content || ''}
                                onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                                className="w-full text-sm font-medium border-2 border-black rounded-xl p-3 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white resize-none"
                                placeholder={t("dashboard.templatesEditor.placeholders.text")}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.fontSize")}</label>
                                <input type="text" value={blockStyle.fontSize as string || '16px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, fontSize: e.target.value } })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-2.5 bg-white" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.color")}</label>
                                <div className="flex items-center gap-2 border-2 border-black rounded-xl p-1.5 bg-white">
                                    <input type="color" value={blockStyle.color as string || '#374151'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, color: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                    <span className="text-xs text-[#1A1A1A] font-black">{blockStyle.color || '#374151'}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Image Properties */}
                {selectedBlock.type === 'image' && (
                    <>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.imageUrl")}</label>
                            <input type="text" value={selectedBlock.content || ''} onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 bg-white" placeholder={t("dashboard.templatesEditor.placeholders.url")} />
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.linkUrl")}</label>
                            <input type="text" value={selectedBlock.url || ''} onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 bg-white" placeholder={t("dashboard.templatesEditor.placeholders.url")} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.width")}</label>
                                <input type="text" value={blockStyle.width as string || '100%'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, width: e.target.value } })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-2.5 bg-white" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.radius")}</label>
                                <input type="text" value={blockStyle.borderRadius as string || '0px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, borderRadius: e.target.value } })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-2.5 bg-white" />
                            </div>
                        </div>
                    </>
                )}

                {/* Button Properties */}
                {selectedBlock.type === 'button' && (
                    <>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.label")}</label>
                            <input type="text" value={selectedBlock.content || ''} onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.url")}</label>
                            <input type="text" value={selectedBlock.url || ''} onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 bg-white" placeholder={t("dashboard.templatesEditor.placeholders.url")} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.background")}</label>
                                <div className="flex items-center gap-2 border-2 border-black rounded-xl p-1.5 bg-white">
                                    <input type="color" value={blockStyle.backgroundColor as string || '#000000'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, backgroundColor: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                    <span className="text-xs text-[#1A1A1A] font-black font-mono">{blockStyle.backgroundColor || '#000'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.textColor")}</label>
                                <div className="flex items-center gap-2 border-2 border-black rounded-xl p-1.5 bg-white">
                                    <input type="color" value={blockStyle.color as string || '#ffffff'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, color: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                    <span className="text-xs text-[#1A1A1A] font-black font-mono">{blockStyle.color || '#fff'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.borderRadius")}</label>
                            <input type="text" value={blockStyle.borderRadius as string || '8px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, borderRadius: e.target.value } })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-2.5 bg-white" />
                        </div>
                    </>
                )}

                {/* Spacer Properties */}
                {selectedBlock.type === 'spacer' && (
                    <div>
                        <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.height")}</label>
                        <input type="text" value={blockStyle.height as string || '32px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, height: e.target.value } })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 bg-white" />
                    </div>
                )}

                {/* Divider Properties */}
                {selectedBlock.type === 'divider' && (
                    <>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.color")}</label>
                            <div className="flex items-center gap-2 border-2 border-black rounded-xl p-2 bg-white">
                                <input type="color" value={blockStyle.borderColor as string || '#e5e7eb'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, borderColor: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                                <input type="text" value={blockStyle.borderColor as string || '#e5e7eb'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, borderColor: e.target.value } })} className="flex-1 text-xs font-black font-mono text-[#1A1A1A] border-0 focus:ring-0 outline-none bg-transparent uppercase" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.thickness")}</label>
                            <input type="text" value={blockStyle.borderWidth as string || '1px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, borderWidth: e.target.value } })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-2.5 bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.style")}</label>
                            <select value={blockStyle.borderStyle as string || 'solid'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, borderStyle: e.target.value } })} className="w-full text-sm font-bold border-2 border-black rounded-xl p-2.5 bg-white">
                                <option value="solid">{t("dashboard.templatesEditor.borderStyles.solid")}</option>
                                <option value="dashed">{t("dashboard.templatesEditor.borderStyles.dashed")}</option>
                                <option value="dotted">{t("dashboard.templatesEditor.borderStyles.dotted")}</option>
                            </select>
                        </div>
                    </>
                )}

                {/* Social Properties */}
                {selectedBlock.type === 'social' && (
                    <div className="space-y-3">
                        {(['instagram', 'twitter', 'linkedin', 'facebook', 'youtube', 'tiktok'] as const).map((platform) => (
                            <div key={platform}>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block capitalize">{platform}</label>
                                <input
                                    type="text"
                                    value={selectedBlock.socials?.[platform] || ''}
                                    onChange={(e) => updateBlock(selectedBlock.id, { socials: { ...selectedBlock.socials, [platform]: e.target.value } })}
                                    className="w-full text-sm font-medium border-2 border-black rounded-xl p-2.5 bg-white"
                                    placeholder={t("dashboard.templatesEditor.placeholders.socialUrl", { platform })}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Properties */}
                {selectedBlock.type === 'footer' && (
                    <>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.text")}</label>
                            <textarea
                                rows={3}
                                value={selectedBlock.content || ''}
                                onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                                className="w-full text-sm font-medium border-2 border-black rounded-xl p-3 resize-none bg-white"
                                placeholder={t("dashboard.templatesEditor.placeholders.footer")}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.textColor")}</label>
                            <div className="flex items-center gap-2 border-2 border-black rounded-xl p-2 bg-white">
                                <input type="color" value={blockStyle.color as string || '#6b7280'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, color: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                                <input type="text" value={blockStyle.color as string || '#6b7280'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...blockStyle, color: e.target.value } })} className="flex-1 text-xs font-black font-mono text-[#1A1A1A] border-0 focus:ring-0 outline-none bg-transparent uppercase" />
                            </div>
                        </div>
                    </>
                )}

                {/* Columns Properties */}
                {selectedBlock.type === 'columns' && (
                    <div>
                        <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.properties.columns")}</label>
                        <div className="flex bg-white border-2 border-black rounded-xl overflow-hidden p-1">
                            {([2, 3] as const).map((num) => (
                                <button
                                    key={num}
                                    onClick={() => updateBlock(selectedBlock.id, { columnCount: num })}
                                    className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${selectedBlock.columnCount === num ? 'bg-[#C6F035] text-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
                                >
                                    {t("dashboard.templatesEditor.columnsLabel", { count: num })}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#C6F035] stroke-black stroke-[3px]" />
                    <span className="text-sm text-black font-black uppercase tracking-wider">{t("dashboard.templatesEditor.loading")}</span>
                </div>
            </div>
        );
    }

    // Preview Mode
    if (previewMode) {
        const html = generateEmailHtml(blocks, globalStyles);
        return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col">
                <div className="bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="font-black text-xl text-[#1A1A1A]">{t("dashboard.templatesEditor.preview")}</h2>
                        <div className="flex items-center gap-1 bg-[#F3F3F1] border-2 border-black rounded-xl p-1">
                            <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}><Monitor className="w-4 h-4" /></button>
                            <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}><Smartphone className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <button onClick={() => setPreviewMode(false)} className="p-2 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all"><X className="w-6 h-6 stroke-[3px]" /></button>
                </div>
                <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
                    <div className={`transition-all duration-300 ${previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[700px]'}`}>
                        <div className="bg-white rounded-[24px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <iframe
                                srcDoc={html}
                                className="w-full bg-white"
                                style={{ height: '800px' }}
                                title={t("dashboard.templatesEditor.previewTitle")}
                                sandbox="allow-same-origin"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthorizationGuard minPlan="pro">
            <div className="h-screen flex flex-col bg-[#F3F3F1] overflow-hidden font-sans">
                {/* Top Bar */}
                <header className="h-20 bg-white border-b-4 border-black flex items-center justify-between px-6 shrink-0 z-30 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard/templates')} className="p-2.5 hover:bg-black hover:text-white border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <ArrowLeft className="w-5 h-5 stroke-[3px]" />
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2" />
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="font-black text-[#1A1A1A] text-xl focus:outline-none bg-transparent placeholder-gray-300 w-80 hover:bg-gray-50 rounded-lg px-2 py-1 transition-all border border-transparent focus:border-black focus:border-dashed"
                            placeholder={t("dashboard.templatesEditor.defaultName")}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setPreviewMode(true)} className="flex items-center gap-2 px-5 py-2.5 text-black border-2 border-black hover:bg-gray-100 rounded-xl font-bold text-sm transition-all">
                            <Eye className="w-5 h-5 stroke-[2.5px]" />
                            <span>{t("dashboard.templatesEditor.preview")}</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#C6F035] text-black border-2 border-black rounded-xl font-black text-sm hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 stroke-[3px]" />}
                            {t("dashboard.templatesEditor.save")}
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar - Blocks */}
                    <aside className="w-80 bg-white border-r-4 border-black flex flex-col shrink-0 z-20">
                        <div className="p-5 border-b-4 border-black bg-gray-50">
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                                <GripVertical className="w-4 h-4" />
                                {t("dashboard.templatesEditor.addBlocks")}
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {blockPalette.map((group) => (
                                <div key={group.category}>
                                    <button
                                        onClick={() => toggleCategory(group.category)}
                                        className="w-full flex items-center justify-between text-xs font-black text-gray-500 uppercase tracking-wider mb-3 hover:text-black transition-colors"
                                    >
                                        {group.category}
                                        {expandedCategories.includes(group.category) ? <ChevronDown className="w-4 h-4 stroke-[3px]" /> : <ChevronRight className="w-4 h-4 stroke-[3px]" />}
                                    </button>
                                    {expandedCategories.includes(group.category) && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <button
                                                        key={item.type}
                                                        onClick={() => addBlock(item.type as EmailBlock['type'])}
                                                        className="group flex flex-col items-center gap-3 p-4 bg-white hover:bg-[#F3F3F1] rounded-[16px] border-2 border-black transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-[#d2e823] border-2 border-black flex items-center justify-center text-black group-hover:scale-110 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                            <Icon className="w-5 h-5 stroke-[2.5px]" />
                                                        </div>
                                                        <span className="text-xs font-bold text-[#1A1A1A]">{item.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Variables Helper */}
                        <div className="p-5 border-t-4 border-black bg-gray-50">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">{t("dashboard.templatesEditor.variables")}</h3>
                            <div className="flex flex-wrap gap-2">
                                {['{{name}}', '{{email}}', '{{bio_name}}'].map(v => (
                                    <button key={v} className="px-2.5 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold font-mono text-black hover:bg-[#d2e823] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none" onClick={() => navigator.clipboard.writeText(v)}>
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Canvas */}
                    <main className="flex-1 bg-[#F3F3F1] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] p-8 overflow-y-auto flex justify-center" onClick={() => setSelectedBlockId(null)}>
                        <div
                            className="transition-all duration-300 min-h-[800px] relative shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)]"
                            style={{
                                width: `${globalStyles.width}px`,
                                backgroundColor: globalStyles.backgroundColor,
                                padding: `${globalStyles.contentPadding}px`,
                                border: '4px solid black',
                                borderRadius: '24px',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="min-h-[600px] border-2 border-dashed border-gray-300"
                                style={{
                                    backgroundColor: globalStyles.contentBackgroundColor,
                                    borderRadius: `${globalStyles.borderRadius}px`,
                                    fontFamily: globalStyles.fontFamily
                                }}
                            >
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={blocks.map(b => b.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="p-4 min-h-full">
                                            {blocks.length === 0 ? (
                                                <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 rounded-xl bg-gray-50 m-4">
                                                    <div className="w-20 h-20 bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                                                        <Mail className="w-8 h-8 text-black" />
                                                    </div>
                                                    <h3 className="font-black text-black text-lg mb-2">{t("dashboard.templatesEditor.emptyTitle")}</h3>
                                                    <p className="text-center max-w-[240px] text-sm font-medium text-gray-500">{t("dashboard.templatesEditor.emptySubtitle")}</p>
                                                </div>
                                            ) : (
                                                blocks.map(block => (
                                                    <SortableItem
                                                        key={block.id}
                                                        block={block}
                                                        isSelected={selectedBlockId === block.id}
                                                        onClick={(e: any, id: string) => { e.stopPropagation(); setSelectedBlockId(id); }}
                                                        onDelete={deleteBlock}
                                                        fontFamily={globalStyles.fontFamily}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    </main>

                    {/* Right Sidebar - Properties */}
                    <aside className={`w-80 bg-white border-l-4 border-black flex flex-col shrink-0 shadow-[-4px_0px_20px_0px_rgba(0,0,0,0.05)] transition-all duration-300 z-20 ${selectedBlock ? 'translate-x-0' : 'translate-x-full hidden'}`}>
                        <div className="p-5 border-b-4 border-black bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-[#1A1A1A] capitalize flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-[#d2e823] border border-black" />
                                    {t("dashboard.templatesEditor.properties.title", { type: selectedBlock?.type })}
                                </span>
                            </div>
                            <button onClick={() => setSelectedBlockId(null)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-black transition-all">
                                <X className="w-5 h-5 stroke-[3px]" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            {renderProperties()}
                        </div>
                    </aside>

                    {/* Settings Panel (when no block selected) */}
                    {!selectedBlock && (
                        <aside className="w-80 bg-white border-l-4 border-black flex flex-col shrink-0 z-20">
                            <div className="p-5 border-b-4 border-black bg-gray-50">
                                <h3 className="font-black text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                                    <Type className="w-4 h-4" />
                                    {t("dashboard.templatesEditor.settings.title")}
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                <div>
                                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.settings.width")}</label>
                                    <input
                                        type="number"
                                        value={globalStyles.width}
                                        onChange={(e) => setGlobalStyles(s => ({ ...s, width: parseInt(e.target.value) || 600 }))}
                                        className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.settings.backgroundColor")}</label>
                                    <div className="flex items-center gap-2 border-2 border-black rounded-xl p-2 bg-white">
                                        <input type="color" value={globalStyles.backgroundColor} onChange={(e) => setGlobalStyles(s => ({ ...s, backgroundColor: e.target.value }))} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                                        <input type="text" value={globalStyles.backgroundColor} onChange={(e) => setGlobalStyles(s => ({ ...s, backgroundColor: e.target.value }))} className="flex-1 text-xs font-black font-mono text-[#1A1A1A] border-0 focus:ring-0 outline-none bg-transparent uppercase" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.settings.contentBackground")}</label>
                                    <div className="flex items-center gap-2 border-2 border-black rounded-xl p-2 bg-white">
                                        <input type="color" value={globalStyles.contentBackgroundColor} onChange={(e) => setGlobalStyles(s => ({ ...s, contentBackgroundColor: e.target.value }))} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                                        <input type="text" value={globalStyles.contentBackgroundColor} onChange={(e) => setGlobalStyles(s => ({ ...s, contentBackgroundColor: e.target.value }))} className="flex-1 text-xs font-black font-mono text-[#1A1A1A] border-0 focus:ring-0 outline-none bg-transparent uppercase" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.settings.borderRadius")}</label>
                                    <input
                                        type="number"
                                        value={globalStyles.borderRadius}
                                        onChange={(e) => setGlobalStyles(s => ({ ...s, borderRadius: parseInt(e.target.value) || 0 }))}
                                        className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-2 block">{t("dashboard.templatesEditor.settings.fontFamily")}</label>
                                    <div className="relative">
                                        <select
                                            value={globalStyles.fontFamily}
                                            onChange={(e) => setGlobalStyles(s => ({ ...s, fontFamily: e.target.value }))}
                                            className="w-full text-sm font-bold border-2 border-black rounded-xl p-3 bg-white appearance-none cursor-pointer"
                                        >
                                            <option value="Arial, sans-serif">Arial</option>
                                            <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                                            <option value="Georgia, serif">Georgia</option>
                                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                            <option value="Verdana, sans-serif">Verdana</option>
                                            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                                            <option value="'Courier New', Courier, monospace">Courier New</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black stroke-[3px] pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                </div>
            </div>
        </AuthorizationGuard>
    );
}
