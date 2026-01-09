import { useState, useEffect, useContext } from "react";
import type { Route } from "../+types/root";
import { useParams, useNavigate } from "react-router";
import {
    ArrowLeft, Save, Eye, Smartphone, Monitor, Trash2, GripVertical,
    Type, Image as ImageIcon, MousePointer, MoreHorizontal, Move,
    Settings, ExternalLink, AlignLeft, AlignCenter, AlignRight
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
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

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Edit Template | Portyo" },
    ];
}

// Draggable Sortable Item Component
function SortableItem({ block, isSelected, onClick, onDelete }: any) {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative border-2 rounded-lg p-0 mb-3 transition-colors cursor-pointer bg-transparent ${isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-transparent hover:border-blue-300'
                }`}
            onClick={(e) => onClick(e, block.id)}
        >
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-move p-2 text-gray-400 hover:text-gray-600 bg-white shadow-sm rounded-md z-10 border border-gray-100" {...attributes} {...listeners}>
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-2 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                    className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors shadow-sm border border-red-100"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="pointer-events-none">
                {/* Render Block Preview - Simplified for Editor */}
                {block.type === 'text' && (
                    <div style={{
                        textAlign: block.align,
                        padding: block.style?.padding || '10px',
                        color: block.style?.color || '#000000',
                        fontSize: block.style?.fontSize || '16px',
                        lineHeight: block.style?.lineHeight || '1.5',
                        fontFamily: 'inherit' // Inherits from editor or set specifically
                    }}>
                        {block.content ? <div dangerouslySetInnerHTML={{ __html: block.content }} /> : <span className="text-gray-400 italic">Empty Text Block</span>}
                    </div>
                )}
                {block.type === 'image' && (
                    <div style={{ padding: block.style?.padding || '10px', textAlign: block.align }}>
                        {block.url || block.content ? (
                            <img
                                src={block.content || block.url}
                                alt="preview"
                                style={{
                                    maxWidth: '100%',
                                    width: block.style?.width || '100%',
                                    borderRadius: block.style?.borderRadius || '0px',
                                    display: 'inline-block'
                                }}
                            />
                        ) : (
                            <div className="h-24 bg-gray-50 flex items-center justify-center rounded border border-dashed border-gray-300 text-gray-400">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                )}
                {block.type === 'button' && (
                    <div style={{ padding: block.style?.padding || '20px', textAlign: block.align }}>
                        <span style={{
                            display: 'inline-block',
                            backgroundColor: block.style?.backgroundColor || '#000000',
                            color: block.style?.color || '#ffffff',
                            padding: `${block.style?.vPadding || '12px'} ${block.style?.hPadding || '24px'}`,
                            borderRadius: block.style?.borderRadius || '4px',
                            fontSize: block.style?.fontSize || '16px',
                            fontWeight: 'bold',
                            borderWidth: block.style?.borderWidth || '0px',
                            borderColor: block.style?.borderColor || 'transparent',
                            borderStyle: 'solid',
                            width: block.style?.width === '100%' ? '100%' : 'auto',
                            textAlign: 'center'
                        }}>
                            {block.content || 'Button'}
                        </span>
                    </div>
                )}
                {block.type === 'spacer' && (
                    <div style={{ height: block.style?.height || '20px' }} className="w-full bg-gray-50/50 flex items-center justify-center text-[10px] text-gray-300 border border-dashed border-gray-200">
                        Spacer {block.style?.height || '20px'}
                    </div>
                )}
            </div>
        </div>
    );
}

// Sidebar Tab Button
const TabButton = ({ active, onClick, children }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
        {children}
    </button>
);

export default function DashboardTemplateEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bio } = useContext(BioContext);

    const [templateName, setTemplateName] = useState("Untitled Template");
    const [blocks, setBlocks] = useState<EmailBlock[]>([]);
    const [globalStyles, setGlobalStyles] = useState({
        backgroundColor: '#f8fafc',
        contentBackgroundColor: '#ffffff',
        width: 600,
        fontFamily: 'sans-serif'
    });
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'blocks' | 'global'>('blocks');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Load Template
    useEffect(() => {
        if (bio?.id && id) {
            api.get(`/templates/${bio.id}/${id}`)
                .then(res => {
                    setTemplateName(res.data.name);
                    const loadedBlocks = res.data.content || [];
                    // Try to extract global styles if saved (implementation detail: usually would be part of content or separate field, here simplifying assuming standard block structure or migration)
                    // For now, defaulting styles, in future could save styles in a special "settings" object or wrapper
                    if (res.data.meta) { // Assuming we might add meta later, or handling migration
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
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addBlock = (type: EmailBlock['type']) => {
        const newBlock: EmailBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'text' ? 'New Text' : type === 'button' ? 'Click Me' : '',
            style: type === 'spacer' ? { height: '32px' } : {},
            align: 'left'
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
        setActiveTab('blocks'); // Switch to blocks/properties tab
    };

    const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const handleSave = async () => {
        if (!bio?.id || !id) return;
        setSaving(true);

        // Generate HTML
        const html = generateEmailHtml(blocks, globalStyles);

        try {
            await api.put(`/templates/${bio.id}/${id}`, {
                name: templateName,
                content: blocks,
                html,
                meta: globalStyles // Pass global styles to be saved (might need backend update to store 'meta' or shove into content wrapper)
            });
            // maybe content toast success
        } catch (error) {
            alert("Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    // If a block is selected, show properties, otherwise show blocks list/global settings
    const SidePanelContent = () => {
        if (selectedBlock) {
            return (
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedBlockId(null)} className="p-1 hover:bg-gray-200 rounded"><ArrowLeft className="w-4 h-4 text-gray-500" /></button>
                            <span className="font-semibold text-xs capitalize text-gray-700">{selectedBlock.type} Properties</span>
                        </div>
                    </div>

                    <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">

                        {/* Common: Alignment */}
                        {(selectedBlock.type === 'text' || selectedBlock.type === 'button' || selectedBlock.type === 'image') && (
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Alignment</label>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {['left', 'center', 'right'].map((align) => (
                                        <button
                                            key={align}
                                            onClick={() => updateBlock(selectedBlock.id, { align: align as any })}
                                            className={`flex-1 py-1 rounded-md flex items-center justify-center transition-all ${selectedBlock.align === align ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                                            {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                                            {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Text Properties */}
                        {selectedBlock.type === 'text' && (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Content</label>
                                    <textarea
                                        rows={4}
                                        value={selectedBlock.content}
                                        onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                                        className="w-full text-xs border-gray-200 rounded-lg focus:ring-primary/20 focus:border-primary p-2.5 bg-gray-50/50 focus:bg-white transition-colors"
                                        placeholder="Write your text here..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Font Size</label>
                                        <input type="text" value={selectedBlock.style?.fontSize as string || '16px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, fontSize: e.target.value } })} className="w-full text-xs border-gray-200 rounded-lg p-2" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Color</label>
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 pr-2 bg-white">
                                            <input type="color" value={selectedBlock.style?.color as string || '#000000'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, color: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                            <span className="text-xs text-gray-500 font-mono">{selectedBlock.style?.color || '#000000'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Padding</label>
                                        <input type="text" value={selectedBlock.style?.padding as string || '10px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, padding: e.target.value } })} className="w-full text-xs border-gray-200 rounded-lg p-2" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Line Height</label>
                                        <input type="text" value={selectedBlock.style?.lineHeight as string || '1.5'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, lineHeight: e.target.value } })} className="w-full text-xs border-gray-200 rounded-lg p-2" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Button Properties */}
                        {selectedBlock.type === 'button' && (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Label</label>
                                    <input type="text" value={selectedBlock.content} onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })} className="w-full text-xs border-gray-200 rounded-lg p-2" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">URL</label>
                                    <input type="text" value={selectedBlock.url || ''} onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })} className="w-full text-xs border-gray-200 rounded-lg p-2" placeholder="https://" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Background</label>
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 pr-2 bg-white">
                                            <input type="color" value={selectedBlock.style?.backgroundColor as string || '#000000'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, backgroundColor: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                            <span className="text-xs text-gray-500 font-mono">{selectedBlock.style?.backgroundColor || '#000'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Text Color</label>
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 pr-2 bg-white">
                                            <input type="color" value={selectedBlock.style?.color as string || '#ffffff'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, color: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                                            <span className="text-xs text-gray-500 font-mono">{selectedBlock.style?.color || '#fff'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Radius</label>
                                        <input type="text" value={selectedBlock.style?.borderRadius as string || '4px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, borderRadius: e.target.value } })} className="w-full text-xs border-gray-200 rounded-lg p-2" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Padding (V/H)</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="V" value={selectedBlock.style?.vPadding as string || '12px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, vPadding: e.target.value } })} className="w-1/2 text-xs border-gray-200 rounded-lg p-2" />
                                            <input type="text" placeholder="H" value={selectedBlock.style?.hPadding as string || '24px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, hPadding: e.target.value } })} className="w-1/2 text-xs border-gray-200 rounded-lg p-2" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedBlock.style?.width === '100%'}
                                            onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, width: e.target.checked ? '100%' : 'auto' } })}
                                            className="rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5"
                                        />
                                        <span className="text-xs text-gray-600 font-medium">Full Width Button</span>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Image Properties */}
                        {selectedBlock.type === 'image' && (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Image URL</label>
                                    <input type="text" value={selectedBlock.content || selectedBlock.url || ''} onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value, url: e.target.value })} className="w-full text-xs border-gray-200 rounded-lg p-2" placeholder="https://" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Link URL (Optional)</label>
                                    <input type="text" value={selectedBlock.url || ''} onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })} className="w-full text-xs border-gray-200 rounded-lg p-2" placeholder="https://" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Width</label>
                                        <input type="text" value={selectedBlock.style?.width as string || '100%'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, width: e.target.value } })} className="w-full text-xs border-gray-200 rounded-lg p-2" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Radius</label>
                                        <input type="text" value={selectedBlock.style?.borderRadius as string || '0px'} onChange={(e) => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, borderRadius: e.target.value } })} className="w-full text-xs border-gray-200 rounded-lg p-2" />
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full">
                <div className="flex border-b bg-gray-50/50">
                    <TabButton active={activeTab === 'blocks'} onClick={() => setActiveTab('blocks')}>Blocks</TabButton>
                    <TabButton active={activeTab === 'global'} onClick={() => setActiveTab('global')}>Settings</TabButton>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {activeTab === 'blocks' ? (
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => addBlock('text')} className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-gray-200 rounded-lg transition-all group shadow-sm hover:shadow active:scale-95">
                                <Type className="w-5 h-5 text-gray-400 group-hover:text-current" />
                                <span className="text-[11px] font-bold text-gray-600 group-hover:text-current">Text</span>
                            </button>
                            <button onClick={() => addBlock('image')} className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-gray-200 rounded-lg transition-all group shadow-sm hover:shadow active:scale-95">
                                <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-current" />
                                <span className="text-[11px] font-bold text-gray-600 group-hover:text-current">Image</span>
                            </button>
                            <button onClick={() => addBlock('button')} className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-gray-200 rounded-lg transition-all group shadow-sm hover:shadow active:scale-95">
                                <MousePointer className="w-5 h-5 text-gray-400 group-hover:text-current" />
                                <span className="text-[11px] font-bold text-gray-600 group-hover:text-current">Button</span>
                            </button>
                            <button onClick={() => addBlock('spacer')} className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-gray-200 rounded-lg transition-all group shadow-sm hover:shadow active:scale-95">
                                <Move className="w-5 h-5 text-gray-400 group-hover:text-current rotate-90" />
                                <span className="text-[11px] font-bold text-gray-600 group-hover:text-current">Spacer</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Email Width (px)</label>
                                <input
                                    type="number"
                                    value={globalStyles.width}
                                    onChange={(e) => setGlobalStyles(s => ({ ...s, width: parseInt(e.target.value) }))}
                                    className="w-full text-sm border-gray-200 rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Page Background</label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 pr-3">
                                    <input type="color" value={globalStyles.backgroundColor} onChange={(e) => setGlobalStyles(s => ({ ...s, backgroundColor: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                                    <span className="text-xs text-gray-500">{globalStyles.backgroundColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Content Background</label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 pr-3">
                                    <input type="color" value={globalStyles.contentBackgroundColor} onChange={(e) => setGlobalStyles(s => ({ ...s, contentBackgroundColor: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                                    <span className="text-xs text-gray-500">{globalStyles.contentBackgroundColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Font Family</label>
                                <select
                                    value={globalStyles.fontFamily}
                                    onChange={(e) => setGlobalStyles(s => ({ ...s, fontFamily: e.target.value }))}
                                    className="w-full text-sm border-gray-200 rounded-lg p-2 bg-white"
                                >
                                    <option value="sans-serif">Sans Serif</option>
                                    <option value="serif">Serif</option>
                                    <option value="monospace">Monospace</option>
                                    <option value="Arial, sans-serif">Arial</option>
                                    <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                                    <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                    <option value="'Courier New', Courier, monospace">Courier New</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Variables Helper (Always Visible at bottom of tools) */}
                <div className="p-5 border-t bg-gray-50/30">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Variables Helper</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {['{{name}}', '{{email}}'].map(v => (
                            <button key={v} className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-500 hover:border-primary hover:text-primary transition-colors shadow-sm" onClick={() => navigator.clipboard.writeText(v)}>
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    if (previewMode) {
        const html = generateEmailHtml(blocks, globalStyles);
        return (
            <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
                <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                    <h2 className="font-bold text-lg">Preview</h2>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1 mr-4">
                            <button className="p-1.5 bg-white rounded shadow-sm text-gray-800"><Monitor className="w-4 h-4" /></button>
                            <button className="p-1.5 text-gray-500 hover:text-gray-800"><Smartphone className="w-4 h-4" /></button>
                        </div>
                        <button onClick={() => setPreviewMode(false)} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">Close Preview</button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-gray-200/50">
                    <div className="shadow-2xl transition-all duration-300 w-full" style={{ maxWidth: `${globalStyles.width}px` }}>
                        <iframe
                            srcDoc={html}
                            className="w-full bg-white h-[800px] rounded-lg"
                            title="Email Preview"
                            sandbox="allow-same-origin"
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <AuthorizationGuard minPlan="pro">
            <div className="h-screen flex flex-col bg-gray-100 overflow-hidden font-sans">

                {/* Top Bar */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard/templates')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-px bg-gray-200" />
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="font-bold text-gray-900 text-lg focus:outline-none focus:ring-0 bg-transparent p-0 placeholder-gray-300 w-64 hover:bg-gray-50 rounded px-2 -ml-2 transition-colors truncate"
                            placeholder="Untitled Template"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setPreviewMode(true)} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold text-sm transition-colors border border-transparent hover:border-gray-200">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Preview</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        >
                            {saving ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Save className="w-4 h-4" />}
                            Save Template
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">

                    {/* Left Sidebar - Canvas Area is implicitly center, but we use Flex to put Sidebar on Left or Right. 
                        Design choice: Properties on Left (or Tools on Left) and Canvas Center.
                        Let's put Sidebar (Tools/Properties) on the LEFT for a more standard "Builder" feel, 
                        and Canvas in the center.
                     */}

                    <aside className="w-80 bg-white border-r flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                        <SidePanelContent />
                    </aside>

                    {/* Canvas */}
                    <main className="flex-1 bg-gray-100/50 p-8 overflow-y-auto flex justify-center relative">
                        {/* Background Click to deselect */}
                        <div className="absolute inset-0" onClick={() => setSelectedBlockId(null)} />

                        <div
                            className="bg-white shadow-xl transition-all duration-300 min-h-[800px] flex flex-col relative z-0"
                            style={{
                                width: `${globalStyles.width}px`,
                                backgroundColor: globalStyles.contentBackgroundColor,
                                fontFamily: globalStyles.fontFamily
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent deselecting when clicking canvas body
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
                                    <div className="p-0 min-h-full">
                                        {blocks.length === 0 ? (
                                            <div className="h-[600px] flex flex-col items-center justify-center text-gray-400 p-8 m-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
                                                    <Plus className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-base mb-1">Start Building</h3>
                                                <p className="text-center max-w-[240px] text-xs text-gray-400">Drag blocks from the sidebar to create your email.</p>
                                            </div>
                                        ) : (
                                            blocks.map(block => (
                                                <SortableItem
                                                    key={block.id}
                                                    block={block}
                                                    isSelected={selectedBlockId === block.id}
                                                    onClick={(e: Event, id: string) => { e.stopPropagation(); setSelectedBlockId(id); }}
                                                    onDelete={deleteBlock}
                                                />
                                            ))
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </main>

                </div>
            </div>
        </AuthorizationGuard>
    );
}

// Icon for empty
function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    )
}
