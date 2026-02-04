import { useState, useEffect } from "react";
import type { MetaFunction } from "react-router";
import { useParams, useNavigate } from "react-router";
import { useBio } from "~/contexts/bio.context";
import { api } from "~/services/api";
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    type DragEndEvent,
    type DragStartEvent,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Type,
    Mail,
    Smartphone,
    CheckSquare,
    AlignLeft,
    GripVertical,
    Trash2,
    Plus,
    ArrowLeft,
    X,
    Edit,
    Save,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ListChecks,
    Sparkles,
    Settings
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
    return [
        { title: "Form Editor | Portyo" },
        { name: "description", content: "Create custom forms for your bio page." },
    ];
};

type FormFieldType = "text" | "email" | "phone" | "textarea" | "checkbox" | "multichoice";

interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
}


function DraggableToolboxItem({ type, label, icon: Icon }: { type: FormFieldType; label: string; icon: any }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `toolbox-${type}`,
        data: {
            type,
            isToolboxItem: true,
            label
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex items-center gap-3 p-4 bg-white border-2 border-black rounded-[12px] cursor-grab hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${isDragging ? "opacity-50" : ""}`}
        >
            <div className="p-2 bg-[#d2e823] rounded-md border-2 border-black text-black">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-[#1A1A1A]">{label}</span>
        </div>
    );
}

function FormCanvas({ fields, onRemove, selectedFieldId, onSelect, isToolboxDragging }: {
    fields: FormField[];
    onRemove: (id: string, e?: React.MouseEvent) => void;
    selectedFieldId: string | null;
    onSelect: (id: string) => void;
    isToolboxDragging: boolean;
}) {
    const { t } = useTranslation();
    const { setNodeRef, isOver } = useDroppable({
        id: "form-canvas",
        disabled: !isToolboxDragging,
    });

    const fieldIds = fields.map((field) => field.id);

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 bg-white rounded-[24px] border-4 transition-colors min-h-[600px] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isOver ? "border-[#d2e823] bg-[#d2e823]/10" : "border-black"}`}
        >
            {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center min-h-[500px]">
                    <div className="w-20 h-20 bg-[#F3F3F1] rounded-full flex items-center justify-center mb-6 border-4 border-black border-dashed">
                        <Plus className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">{t("dashboard.formsEditor.emptyTitle")}</h3>
                    <p className="text-gray-500 font-medium max-w-sm">{t("dashboard.formsEditor.emptySubtitle")}</p>
                </div>
            ) : (
                <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {fields.map((field) => (
                            <SortableField
                                key={field.id}
                                field={field}
                                onRemove={onRemove}
                                selectedFieldId={selectedFieldId}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                </SortableContext>
            )}
        </div>
    );
}

function SortableField({ field, onRemove, selectedFieldId, onSelect }: {
    field: FormField;
    onRemove: (id: string, e?: React.MouseEvent) => void;
    selectedFieldId: string | null;
    onSelect: (id: string) => void;
}) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 999 : 'auto'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(field.id);
            }}
            className={`group relative p-6 rounded-[16px] border-2 transition-all cursor-pointer ${selectedFieldId === field.id
                ? "border-black bg-[#d2e823]/10 ring-2 ring-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "border-black bg-white hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px]"
                }`}
        >
            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                    onClick={(e) => onRemove(field.id, e)}
                    className="p-2 text-red-600 bg-white border-2 border-black rounded-lg hover:bg-red-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <Trash2 className="w-4 h-4 stroke-[2.5px]" />
                </button>
                <div
                    ref={setActivatorNodeRef}
                    {...listeners}
                    className="p-2 text-black bg-white border-2 border-black rounded-lg cursor-grab active:cursor-grabbing hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    title="Reorder"
                >
                    <GripVertical className="w-4 h-4 stroke-[2.5px]" />
                </div>
            </div>

            <div className="mb-3 pointer-events-none">
                <label className="block text-base font-black text-[#1A1A1A] mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.placeholder && <p className="text-sm text-gray-500 font-medium">{field.placeholder}</p>}
            </div>

            <div className="pointer-events-none opacity-80">
                {field.type === "textarea" ? (
                    <div className="w-full h-24 bg-[#F3F3F1] rounded-xl border-2 border-dashed border-gray-300" />
                ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md border-2 border-black bg-white" />
                        <span className="text-sm font-bold text-gray-600">{t("dashboard.formsEditor.preview.matchesLabel")}</span>
                    </div>
                ) : field.type === "multichoice" ? (
                    <div className="space-y-2">
                        {(field.options || [t("dashboard.formsEditor.defaults.option", { index: 1 }), t("dashboard.formsEditor.defaults.option", { index: 2 }), t("dashboard.formsEditor.defaults.option", { index: 3 })]).slice(0, 3).map((opt) => (
                            <div key={opt} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-black bg-white" />
                                <span className="text-sm font-bold text-gray-600">{opt}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-12 bg-[#F3F3F1] rounded-xl border-2 border-dashed border-gray-300" />
                )}
            </div>
        </div>
    );
}

export default function DashboardFormsEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bio } = useBio();
    const { t } = useTranslation();
    const [fields, setFields] = useState<FormField[]>([]);
    const [formTitle, setFormTitle] = useState(t("dashboard.formsEditor.defaultName"));
    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isToolboxOpen, setIsToolboxOpen] = useState(true); // Open by default on desktop
    const [isMobileToolboxOpen, setIsMobileToolboxOpen] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const toolboxItems = [
        { type: "text", label: t("dashboard.formsEditor.toolbox.text"), icon: Type },
        { type: "email", label: t("dashboard.formsEditor.toolbox.email"), icon: Mail },
        { type: "phone", label: t("dashboard.formsEditor.toolbox.phone"), icon: Smartphone },
        { type: "textarea", label: t("dashboard.formsEditor.toolbox.textarea"), icon: AlignLeft },
        { type: "checkbox", label: t("dashboard.formsEditor.toolbox.checkbox"), icon: CheckSquare },
        { type: "multichoice", label: t("dashboard.formsEditor.toolbox.multichoice"), icon: ListChecks },
    ] as const;

    // Load form data
    useEffect(() => {
        if (!id) return;

        const fetchForm = async () => {
            try {
                const response = await api.get(`/form/forms/${id}`);
                // Ensure we handle the response correctly
                const formData = response.data;
                setFields(Array.isArray(formData.fields) ? formData.fields : []);
                setFormTitle(formData.title || "Untitled Form");
            } catch (err) {
                console.error("Failed to load form", err);
                navigate("/dashboard/forms");
            } finally {
                setIsLoading(false);
            }
        };

        fetchForm();
    }, [id]);

    const saveForm = async () => {
        if (!id) return;

        try {
            setIsSaving(true);
            await api.patch(`/form/forms/${id}`, {
                title: formTitle,
                fields
            });
            // Show success toast/message in future
        } catch (err) {
            console.error("Failed to save form", err);
            alert(t("dashboard.formsEditor.saveError"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragItem(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        if (active.data.current?.isToolboxItem && over) {
            const type = active.data.current.type as FormFieldType;
            const label = active.data.current.label;

            const newField: FormField = {
                id: crypto.randomUUID(),
                type,
                label,
                required: false,
                placeholder: "",
                options: type === "multichoice" ? [t("dashboard.formsEditor.defaults.option", { index: 1 }), t("dashboard.formsEditor.defaults.option", { index: 2 }), t("dashboard.formsEditor.defaults.option", { index: 3 })] : undefined
            };

            setFields((prev) => [...prev, newField]);
            setSelectedFieldId(newField.id);
        }

        if (!active.data.current?.isToolboxItem) {
            setFields((prev) => {
                const oldIndex = prev.findIndex((field) => field.id === active.id);
                const newIndex = prev.findIndex((field) => field.id === over.id);

                if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const removeField = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setFields((prev) => prev.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields((prev) => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const selectedField = fields.find(f => f.id === selectedFieldId);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F3F3F1]">
                <Loader2 className="w-10 h-10 animate-spin text-[#d2e823] stroke-black stroke-[3px]" />
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-screen bg-[#F3F3F1] overflow-hidden relative">
                {/* Header Bar - Mobile & Desktop */}
                <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between px-4 md:px-8 shrink-0 z-30 shadow-sm relative">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/dashboard/forms")}
                            className="p-2.5 hover:bg-[#F3F3F1] rounded-[12px] border-2 border-transparent hover:border-black transition-all group"
                            title={t("dashboard.formsEditor.backToForms")}
                        >
                            <ArrowLeft className="w-5 h-5 text-black stroke-[3px] group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="text-xl font-black bg-transparent border-none outline-none text-[#1A1A1A] placeholder:text-gray-300 w-40 md:w-96 focus:ring-0 p-0 tracking-tight"
                                style={{ fontFamily: 'var(--font-display)' }}
                                placeholder={t("dashboard.formsEditor.defaultName")}
                            />
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider md:hidden">{t("dashboard.formsEditor.editorMode")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileToolboxOpen(true)}
                            className="md:hidden p-3 bg-white border-2 border-black rounded-[12px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <Plus className="w-5 h-5 stroke-[3px]" />
                        </button>

                        <button
                            onClick={saveForm}
                            disabled={isSaving}
                            className="flex items-center gap-3 px-6 py-3 bg-[#C6F035] hover:bg-[#d6ed42] text-black border-2 border-black rounded-[14px] text-base font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 stroke-[2.5px]" />}
                            <span className="hidden md:inline">{isSaving ? t("dashboard.formsEditor.saving") : t("dashboard.formsEditor.save")}</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Toolbox Sidebar - Desktop (Collapsible) */}
                    <aside className={`hidden md:flex flex-col border-r-4 border-black bg-white transition-all duration-300 ${isToolboxOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
                        <div className="p-8 space-y-6 overflow-y-auto">
                            <h3 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#C6F035] rounded-full border border-black"></span>
                                {t("dashboard.formsEditor.toolbox.title")}
                            </h3>
                            <div className="space-y-4">
                                {toolboxItems.map((item) => (
                                    <DraggableToolboxItem key={item.type} {...item} />
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Toolbox Overlay */}
                    {isMobileToolboxOpen && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileToolboxOpen(false)} />
                            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col p-6 border-r-4 border-black">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-black" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.formsEditor.addField")}</h3>
                                    <button onClick={() => setIsMobileToolboxOpen(false)} className="p-2 border-2 border-transparent hover:border-black rounded-lg transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {toolboxItems.map((item) => (
                                        <DraggableToolboxItem key={item.type} {...item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Canvas Area */}
                    <main
                        className="flex-1 bg-[#F3F3F1] overflow-y-auto p-4 md:p-12 relative"
                        onClick={() => setSelectedFieldId(null)}
                    >
                        {/* Dot pattern background */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                        <div className="max-w-3xl mx-auto min-h-full relative z-10">
                            <FormCanvas
                                fields={fields}
                                onRemove={removeField}
                                selectedFieldId={selectedFieldId}
                                isToolboxDragging={!!activeDragItem?.isToolboxItem}
                                onSelect={(id) => {
                                    setSelectedFieldId(id);
                                    // In a real responsive app, we might close the toolbox
                                    setIsMobileToolboxOpen(false);
                                }}
                            />
                        </div>
                    </main>

                    {/* Property Editor Sidebar - Desktop & Tablet */}
                    {selectedField && (
                        <aside className="fixed md:relative inset-y-0 right-0 w-full md:w-96 bg-white border-l-4 border-black shadow-2xl md:shadow-none z-40 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between shrink-0 bg-white">
                                <h3 className="font-black text-xl text-black flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                                    <div className="p-2 bg-[#d2e823] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Edit className="w-4 h-4 text-black" />
                                    </div>
                                    {t("dashboard.formsEditor.editField")}
                                </h3>
                                <button
                                    onClick={() => setSelectedFieldId(null)}
                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X className="w-6 h-6 stroke-[2.5px]" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t("dashboard.formsEditor.displayLabel")}</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                        className="w-full px-5 py-4 bg-white border-2 border-black rounded-[14px] text-base font-bold outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                                        placeholder={t("dashboard.formsEditor.placeholders.label")}
                                    />
                                </div>

                                {selectedField.type !== 'checkbox' && selectedField.type !== 'multichoice' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t("dashboard.formsEditor.placeholderLabel")}</label>
                                        <input
                                            type="text"
                                            value={selectedField.placeholder || ""}
                                            onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                            className="w-full px-5 py-4 bg-white border-2 border-black rounded-[14px] text-base font-bold outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                                            placeholder={t("dashboard.formsEditor.placeholders.placeholder")}
                                        />
                                    </div>
                                )}

                                {selectedField.type === 'multichoice' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t("dashboard.formsEditor.options")}</label>
                                        <div className="space-y-3">
                                            {(selectedField.options || []).map((opt, index) => (
                                                <div key={`${selectedField.id}-opt-${index}`} className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full border-2 border-black bg-white flex items-center justify-center text-xs font-bold">{index + 1}</div>
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const next = [...(selectedField.options || [])];
                                                            next[index] = e.target.value;
                                                            updateField(selectedField.id, { options: next });
                                                        }}
                                                        className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-[12px] text-sm font-bold focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                                                        placeholder={t("dashboard.formsEditor.optionPlaceholder", { index: index + 1 })}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const next = (selectedField.options || []).filter((_, i) => i !== index);
                                                            updateField(selectedField.id, { options: next });
                                                        }}
                                                        className="p-3 text-red-500 hover:text-white hover:bg-red-500 border-2 border-transparent hover:border-black rounded-[12px] transition-all"
                                                        title={t("dashboard.formsEditor.removeOption")}
                                                    >
                                                        <Trash2 className="w-4 h-4 stroke-[2.5px]" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const next = [...(selectedField.options || [])];
                                                    next.push(t("dashboard.formsEditor.optionPlaceholder", { index: next.length + 1 }));
                                                    updateField(selectedField.id, { options: next });
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-black/30 rounded-[14px] text-sm font-bold text-black/60 hover:border-black hover:bg-[#d2e823]/20 hover:text-black transition-all"
                                            >
                                                <Plus className="w-4 h-4 stroke-[3px]" />
                                                {t("dashboard.formsEditor.addOption")}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 bg-gray-50 rounded-[20px] border-2 border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="required_field" className="text-base font-black text-[#1A1A1A]">{t("dashboard.formsEditor.required")}</label>
                                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                            <input
                                                type="checkbox"
                                                id="required_field"
                                                checked={selectedField.required}
                                                onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                                className="peer absolute w-0 h-0 opacity-0"
                                            />
                                            <label
                                                htmlFor="required_field"
                                                className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer border-2 border-black peer-checked:bg-[#C6F035] transition-colors"
                                            >
                                                <span className={`block h-full w-1/2 bg-white border-r-2 border-black rounded-full shadow-[1px_0px_0px_0px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-in-out ${selectedField.required ? 'translate-x-full border-l-2 border-r-0' : 'translate-x-0'}`}></span>
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">{t("dashboard.formsEditor.requiredHint")}</p>
                                </div>

                                <div className="pt-8 mt-4 border-t-2 border-gray-100">
                                    <button
                                        onClick={() => removeField(selectedField.id)}
                                        className="w-full flex items-center justify-center gap-3 p-4 text-white bg-red-600 border-2 border-black hover:bg-red-500 rounded-[16px] text-base font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                    >
                                        <Trash2 className="w-5 h-5 stroke-[2.5px]" />
                                        {t("dashboard.formsEditor.deleteField")}
                                    </button>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            <DragOverlay modifiers={[restrictToWindowEdges]}>
                {activeDragItem ? (
                    <div className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-[12px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-grabbing w-64 transform scale-105 rotate-2">
                        <div className="p-2 bg-[#d2e823] rounded-md border-2 border-black text-black">
                            <Plus className="w-4 h-4 stroke-[3px]" />
                        </div>
                        <span className="text-lg font-black text-[#1A1A1A]">{activeDragItem.label}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
