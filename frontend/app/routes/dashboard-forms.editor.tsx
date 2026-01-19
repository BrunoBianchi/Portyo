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
    Menu,
    ChevronLeft,
    ChevronRight,
    Settings as SettingsIcon,
    Palette,
    ListChecks
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
            className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-primary hover:shadow-sm transition-all ${isDragging ? "opacity-50" : ""}`}
        >
            <div className="p-2 bg-gray-50 rounded-md text-gray-500">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
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
            className={`flex-1 bg-white rounded-xl border-2 border-dashed transition-colors min-h-[500px] p-8 shadow-sm ${isOver ? "border-primary bg-primary/5" : "border-gray-200"}`}
        >
            {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                    <Plus className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="text-lg font-medium">{t("dashboard.formsEditor.emptyTitle")}</p>
                    <p className="text-sm">{t("dashboard.formsEditor.emptySubtitle")}</p>
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
        opacity: isDragging ? 0.6 : 1
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
            className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${selectedFieldId === field.id
                ? "border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm"
                : "border-gray-200 hover:border-primary/50 hover:shadow-sm"
                }`}
        >
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-100">
                <button
                    onClick={(e) => onRemove(field.id, e)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <div
                    ref={setActivatorNodeRef}
                    {...listeners}
                    className="p-1.5 text-gray-400 cursor-grab active:cursor-grabbing"
                    title="Reorder"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            </div>

            <div className="mb-2 pointer-events-none">
                <label className="block text-sm font-bold text-gray-900 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.placeholder && <p className="text-xs text-gray-500 mb-2">{field.placeholder}</p>}
            </div>

            <div className="pointer-events-none opacity-60">
                {field.type === "textarea" ? (
                    <div className="w-full h-24 bg-gray-50 rounded-lg border border-gray-200" />
                ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-gray-300 bg-gray-50" />
                        <span className="text-sm text-gray-500">{t("dashboard.formsEditor.preview.matchesLabel")}</span>
                    </div>
                ) : field.type === "multichoice" ? (
                    <div className="space-y-2">
                        {(field.options || [t("dashboard.formsEditor.defaults.option", { index: 1 }), t("dashboard.formsEditor.defaults.option", { index: 2 }), t("dashboard.formsEditor.defaults.option", { index: 3 })]).slice(0, 3).map((opt) => (
                            <div key={opt} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-gray-300 bg-gray-50" />
                                <span className="text-sm text-gray-500">{opt}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-10 bg-gray-50 rounded-lg border border-gray-200" />
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
                setFields(response.data.fields || []);
                setFormTitle(response.data.title || "Untitled Form");
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
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <div className="flex flex-col h-screen bg-white overflow-hidden relative">
                {/* Header Bar - Mobile & Desktop */}
                <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/dashboard/forms")}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors"
                            title={t("dashboard.formsEditor.backToForms")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-gray-100 hidden md:block"></div>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="text-base font-bold bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300 w-40 md:w-64 focus:ring-0 p-0"
                                placeholder={t("dashboard.formsEditor.defaultName")}
                            />
                            <p className="text-[10px] text-gray-500 md:hidden">{t("dashboard.formsEditor.editorMode")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMobileToolboxOpen(true)}
                            className="md:hidden p-2 bg-gray-50 text-gray-600 rounded-lg"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        <button
                            onClick={saveForm}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span className="hidden md:inline">{isSaving ? t("dashboard.formsEditor.saving") : t("dashboard.formsEditor.save")}</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* Toolbox Sidebar - Desktop (Collapsible) */}
                    <aside className={`hidden md:flex flex-col border-r border-gray-100 bg-white transition-all duration-300 ${isToolboxOpen ? 'w-64' : 'w-0 opacity-0 overflow-hidden'}`}>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("dashboard.formsEditor.toolbox.title")}</h3>
                            <div className="space-y-3">
                                {toolboxItems.map((item) => (
                                    <DraggableToolboxItem key={item.type} {...item} />
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Toolbox Overlay */}
                    {isMobileToolboxOpen && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileToolboxOpen(false)} />
                            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900">{t("dashboard.formsEditor.addField")}</h3>
                                    <button onClick={() => setIsMobileToolboxOpen(false)} className="p-2 text-gray-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {toolboxItems.map((item) => (
                                        <DraggableToolboxItem key={item.type} {...item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Canvas Area */}
                    <main
                        className="flex-1 bg-gray-50/30 overflow-y-auto p-4 md:p-12"
                        onClick={() => setSelectedFieldId(null)}
                    >
                        <div className="max-w-2xl mx-auto min-h-full">
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
                        <aside className="fixed md:relative inset-y-0 right-0 w-full md:w-80 bg-white border-l border-gray-100 shadow-2xl md:shadow-none z-40 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Edit className="w-4 h-4 text-primary" />
                                    {t("dashboard.formsEditor.editField")}
                                </h3>
                                <button
                                    onClick={() => setSelectedFieldId(null)}
                                    className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("dashboard.formsEditor.displayLabel")}</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        placeholder={t("dashboard.formsEditor.placeholders.label")}
                                    />
                                </div>

                                {selectedField.type !== 'checkbox' && selectedField.type !== 'multichoice' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("dashboard.formsEditor.placeholderLabel")}</label>
                                        <input
                                            type="text"
                                            value={selectedField.placeholder || ""}
                                            onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                            placeholder={t("dashboard.formsEditor.placeholders.placeholder")}
                                        />
                                    </div>
                                )}

                                {selectedField.type === 'multichoice' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("dashboard.formsEditor.options")}</label>
                                        <div className="space-y-2">
                                            {(selectedField.options || []).map((opt, index) => (
                                                <div key={`${selectedField.id}-opt-${index}`} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const next = [...(selectedField.options || [])];
                                                            next[index] = e.target.value;
                                                            updateField(selectedField.id, { options: next });
                                                        }}
                                                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                        placeholder={t("dashboard.formsEditor.optionPlaceholder", { index: index + 1 })}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const next = (selectedField.options || []).filter((_, i) => i !== index);
                                                            updateField(selectedField.id, { options: next });
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                                        title={t("dashboard.formsEditor.removeOption")}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const next = [...(selectedField.options || [])];
                                                    next.push(t("dashboard.formsEditor.optionPlaceholder", { index: next.length + 1 }));
                                                    updateField(selectedField.id, { options: next });
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                                {t("dashboard.formsEditor.addOption")}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="required_field" className="text-sm font-bold text-gray-700">{t("dashboard.formsEditor.required")}</label>
                                        <input
                                            type="checkbox"
                                            id="required_field"
                                            checked={selectedField.required}
                                            onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                            className="w-5 h-5 text-primary rounded-lg border-gray-300 focus:ring-primary cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500">{t("dashboard.formsEditor.requiredHint")}</p>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => removeField(selectedField.id)}
                                        className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-bold transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t("dashboard.formsEditor.deleteField")}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                                <button
                                    onClick={() => setSelectedFieldId(null)}
                                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
                                >
                                    {t("dashboard.formsEditor.doneEditing")}
                                </button>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            <DragOverlay modifiers={[restrictToWindowEdges]}>
                {activeDragItem ? (
                    <div className="flex items-center gap-3 p-3 bg-white border border-primary/50 shadow-xl rounded-lg cursor-grabbing w-64 transform scale-105">
                        <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{activeDragItem.label}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
