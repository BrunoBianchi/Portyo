import { useState, useEffect, useContext, useRef } from "react";
import {
    Briefcase,
    Plus,
    Edit2,
    Trash2,
    X,
    Image as ImageIcon,
    Loader2,
    Save,
    Upload,
    ChevronLeft,
    ChevronRight,
    Tag,
    FolderPlus,
    GripVertical
} from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useTranslation } from "react-i18next";
import { useJoyrideSettings } from "~/utils/joyride";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DropAnimation,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Category {
    id: string;
    name: string;
    order: number;
}

interface PortfolioItem {
    id: string;
    title: string;
    description: string | null;
    images: string[];
    categoryId: string | null;
    category: Category | null;
    order: number;
    createdAt: string;
}

interface SortablePortfolioItemProps {
    item: PortfolioItem;
    index: number;
    t: any;
    setDeleteConfirm: (item: PortfolioItem) => void;
    openEditModal: (item: PortfolioItem) => void;
}

const SortablePortfolioItem = ({ item, index, t, setDeleteConfirm, openEditModal }: SortablePortfolioItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        touchAction: 'none'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            data-tour={index === 0 ? "portfolio-card" : undefined}
            className={`bg-surface-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden ${isDragging ? 'z-50 ring-2 ring-primary ring-offset-2' : ''}`}
        >
            <div className="p-2">
                {/* Image */}
                <div className="aspect-square relative bg-muted rounded-2xl overflow-hidden border border-border">
                    {item.images && item.images.length > 0 ? (
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-muted/50">
                            <ImageIcon className="w-12 h-12 opacity-20" />
                        </div>
                    )}
                    {item.images && item.images.length > 1 && (
                        <div className="absolute top-3 left-3">
                            <span className="pl-2 pr-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl bg-surface-card/80 border border-border shadow-sm flex items-center gap-1.5 text-muted-foreground">
                                <ImageIcon className="w-3 h-3" />
                                {t("dashboard.portfolio.photos", { count: item.images.length })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 pb-4 pt-1 flex flex-col flex-1">
                <div className="mb-3">
                    <h3 className="font-bold text-foreground text-base mb-0.5 truncate tracking-tight" style={{ fontFamily: 'var(--font-display)' }} title={item.title}>{item.title}</h3>
                    {item.category ? (
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {item.category.name}
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground font-medium">{t("dashboard.portfolio.uncategorized")}</p>
                    )}
                </div>

                <div className="mt-auto flex items-end justify-end gap-1.5">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start when clicking delete
                            setDeleteConfirm(item);
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on pointer down
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-destructive/10 transition-all cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start when clicking edit
                            openEditModal(item);
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on pointer down
                        className="h-9 px-4 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                        {t("dashboard.portfolio.edit")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function PortfolioDashboard() {
    const { bio } = useContext(BioContext);
    const { t } = useTranslation();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        images: [] as string[],
        categoryId: '' as string
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Category modal
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [savingCategory, setSavingCategory] = useState(false);

    // Delete modal
    const [deleteConfirm, setDeleteConfirm] = useState<PortfolioItem | null>(null);

    // Drag and drop state for images
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const [tourRun, setTourRun] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const { isMobile, styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStartMain = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEndMain = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update order in backend
                // Re-calculate orders based on new index
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order: index
                }));

                api.put(`/portfolio/${bio!.id}/reorder`, { items: updates })
                    .catch(err => {
                        console.error("Failed to save order", err);
                        // Revert on error? For now just log
                        alert(t("dashboard.portfolio.saveOrderError"));
                    });

                return newItems;
            });
        }
        setActiveId(null);
    };

    const handleDragCancelMain = () => {
        setActiveId(null);
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    useEffect(() => {
        if (bio?.id) {
            fetchData();
        }
    }, [bio?.id]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:portfolio-tour-done");
        if (!hasSeenTour) {
            setTourRun(true);
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isMobile]);

    const portfolioTourSteps: Step[] = [
        {
            target: "[data-tour=\"portfolio-header\"]",
            content: t("dashboard.tours.portfolio.steps.header"),
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "[data-tour=\"portfolio-add\"]",
            content: t("dashboard.tours.portfolio.steps.add"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"portfolio-filters\"]",
            content: t("dashboard.tours.portfolio.steps.filters"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"portfolio-grid\"]",
            content: t("dashboard.tours.portfolio.steps.grid"),
            placement: "top",
        },
        {
            target: "[data-tour=\"portfolio-card\"]",
            content: t("dashboard.tours.portfolio.steps.card"),
            placement: "top",
        },
        {
            target: "[data-tour=\"portfolio-add-placeholder\"]",
            content: t("dashboard.tours.portfolio.steps.addPlaceholder"),
            placement: "top",
        },
    ];

    const handlePortfolioTourCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;

        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
            const delta = action === ACTIONS.PREV ? -1 : 1;
            setTourStepIndex(index + delta);
            return;
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setTourRun(false);
            setTourStepIndex(0);
            if (typeof window !== "undefined") {
                window.localStorage.setItem("portyo:portfolio-tour-done", "true");
            }
        }
    };

    const fetchData = async () => {
        if (!bio?.id) return;
        try {
            setLoading(true);
            const [itemsRes, categoriesRes] = await Promise.all([
                api.get(`/portfolio/${bio.id}`),
                api.get(`/portfolio/categories/${bio.id}`)
            ]);
            setItems(itemsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Failed to fetch portfolio data:", error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({ title: '', description: '', images: [], categoryId: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: PortfolioItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            images: item.images || [],
            categoryId: item.categoryId || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ title: '', description: '', images: [], categoryId: '' });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !bio?.id) return;

        const files = Array.from(e.target.files);
        setUploadingImage(true);

        try {
            const uploadPromises = files.map(async (file) => {
                const formDataUpload = new FormData();
                formDataUpload.append('image', file);
                const res = await api.post(`/portfolio/${bio.id}/upload`, formDataUpload);
                return res.data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));
        } catch (error) {
            console.error("Failed to upload images:", error);
            alert(t("dashboard.portfolio.uploadError"));
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Drag and drop handlers for image reordering
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const newImages = [...formData.images];
            const [removed] = newImages.splice(draggedIndex, 1);
            newImages.splice(dragOverIndex, 0, removed);
            setFormData(prev => ({ ...prev, images: newImages }));
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const moveImageToPosition = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const newImages = [...formData.images];
        const [removed] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, removed);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSave = async () => {
        if (!bio?.id || !formData.title.trim()) return;

        try {
            setSaving(true);

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                images: formData.images,
                categoryId: formData.categoryId || null
            };

            if (editingItem) {
                const res = await api.put(`/portfolio/${bio.id}/${editingItem.id}`, payload);
                setItems(items.map(i => i.id === editingItem.id ? res.data : i));
            } else {
                const res = await api.post(`/portfolio/${bio.id}`, payload);
                setItems([...items, res.data]);
            }

            closeModal();
        } catch (error) {
            console.error("Failed to save portfolio item:", error);
            alert(t("dashboard.portfolio.saveError"));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!bio?.id || !deleteConfirm) return;

        try {
            setSaving(true);
            await api.delete(`/portfolio/${bio.id}/${deleteConfirm.id}`);
            setItems(items.filter(i => i.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Failed to delete portfolio item:", error);
            alert(t("dashboard.portfolio.deleteError"));
        } finally {
            setSaving(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!bio?.id || !newCategoryName.trim()) return;

        try {
            setSavingCategory(true);
            const res = await api.post(`/portfolio/categories/${bio.id}`, {
                name: newCategoryName.trim()
            });
            setCategories([...categories, res.data]);
            setNewCategoryName('');
            setIsCategoryModalOpen(false);
        } catch (error) {
            console.error("Failed to create category:", error);
            alert(t("dashboard.portfolio.categoryCreateError"));
        } finally {
            setSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!bio?.id) return;
        if (!confirm(t("dashboard.portfolio.categoryDeleteConfirm"))) return;

        try {
            await api.delete(`/portfolio/categories/${bio.id}/${categoryId}`);
            setCategories(categories.filter(c => c.id !== categoryId));
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    const filteredItems = activeFilter
        ? items.filter(item => item.categoryId === activeFilter)
        : items;

    if (!bio) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">{t("dashboard.portfolio.selectPage")}</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Joyride
                steps={portfolioTourSteps}
                run={tourRun && !isMobile}
                stepIndex={tourStepIndex}
                continuous
                showSkipButton
                spotlightClicks
                scrollToFirstStep
                callback={handlePortfolioTourCallback}
                scrollOffset={joyrideProps.scrollOffset}
                spotlightPadding={joyrideProps.spotlightPadding}
                disableScrollParentFix={joyrideProps.disableScrollParentFix}
                locale={{
                    back: t("dashboard.tours.common.back"),
                    close: t("dashboard.tours.common.close"),
                    last: t("dashboard.tours.common.last"),
                    next: t("dashboard.tours.common.next"),
                    skip: t("dashboard.tours.common.skip"),
                }}
                styles={joyrideStyles}
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" data-tour="portfolio-header">
                <div>
                    <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.portfolio.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("dashboard.portfolio.subtitle")}</p>
                </div>
                <button
                    data-tour="portfolio-add"
                    onClick={openCreateModal}
                    className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200"
                >
                    <Plus className="w-5 h-5" /> {t("dashboard.portfolio.addProject")}
                </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap" data-tour="portfolio-filters">
                <button
                    onClick={() => setActiveFilter(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === null
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-gray-200'
                        }`}
                >
                    {t("dashboard.portfolio.filterAll")}
                </button>
                {categories.map(category => (
                    <div
                        key={category.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveFilter(category.id)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setActiveFilter(category.id);
                            }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all group relative cursor-pointer select-none ${activeFilter === category.id
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-gray-200'
                            }`}
                    >
                        {category.name}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive/100 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-3 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted transition-all border-2 border-dashed border-border flex items-center gap-1.5"
                >
                    <FolderPlus className="w-4 h-4" />
                    {t("dashboard.portfolio.addCategory")}
                </button>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-3 p-12 text-center" data-tour="portfolio-grid">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-foreground text-base mb-0.5">
                            {activeFilter ? t("dashboard.portfolio.emptyCategoryTitle") : t("dashboard.portfolio.emptyTitle")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {activeFilter ? t("dashboard.portfolio.emptyCategorySubtitle") : t("dashboard.portfolio.emptySubtitle")}
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="mt-2 px-5 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4 inline mr-1.5" />
                        {t("dashboard.portfolio.addProject")}
                    </button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStartMain}
                    onDragEnd={handleDragEndMain}
                    onDragCancel={handleDragCancelMain}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-tour="portfolio-grid">
                        <SortableContext
                            items={filteredItems.map(i => i.id)}
                            strategy={rectSortingStrategy}
                            disabled={!!activeFilter} // Disable drag sorting if filtered by category (handled simpler for now)
                        >
                            {filteredItems.map((item, index) => (
                                <SortablePortfolioItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    t={t}
                                    setDeleteConfirm={setDeleteConfirm}
                                    openEditModal={openEditModal}
                                />
                            ))}
                        </SortableContext>

                        {/* Drag Overlay */}
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeId ? (
                                <SortablePortfolioItem
                                    item={items.find(i => i.id === activeId)!}
                                    index={0}
                                    t={t}
                                    setDeleteConfirm={() => { }}
                                    openEditModal={() => { }}
                                />
                            ) : null}
                        </DragOverlay>

                        {/* Add New Placeholder - Not draggable */}
                        <button
                            data-tour="portfolio-add-placeholder"
                            onClick={openCreateModal}
                            className="border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-3 p-6 hover:border-black/20 hover:bg-muted/50 transition-all group h-full min-h-[280px]"
                        >
                            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-surface-card group-hover:text-black group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 border border-border">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-foreground text-base mb-0.5">{t("dashboard.portfolio.addNewProject")}</p>
                                <p className="text-xs text-muted-foreground">{t("dashboard.portfolio.showcaseWork")}</p>
                            </div>
                        </button>
                    </div>
                </DndContext>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                                {editingItem ? t("dashboard.portfolio.editProject") : t("dashboard.portfolio.newProject")}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-muted rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("dashboard.portfolio.titleLabel")}
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t("dashboard.portfolio.titlePlaceholder")}
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("dashboard.portfolio.categoryLabel")}
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-surface-card"
                                >
                                    <option value="">{t("dashboard.portfolio.noCategory")}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("dashboard.portfolio.imagesLabel")}
                                </label>

                                {/* Image Preview Grid with Drag & Drop */}
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {formData.images.map((img, index) => (
                                            <div
                                                key={index}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDragLeave={handleDragLeave}
                                                className={`relative aspect-square rounded-lg overflow-hidden group/img cursor-move transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : ''
                                                    } ${dragOverIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
                                                    }`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />

                                                {/* Drag Handle */}
                                                <div className="absolute top-1 left-1 p-1 bg-black/50 rounded text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    <GripVertical className="w-3 h-3" />
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage(index);
                                                    }}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-destructive/100 text-white rounded-full text-xs opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                                                >
                                                    ×
                                                </button>

                                                {/* Cover Badge */}
                                                {index === 0 && (
                                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded font-bold">
                                                        {t("dashboard.portfolio.cover")}
                                                    </span>
                                                )}

                                                {/* Set as Cover Button (for non-first images) */}
                                                {index !== 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveImageToPosition(index, 0);
                                                        }}
                                                        className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded font-medium opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/80"
                                                    >
                                                        {t("dashboard.portfolio.setAsCover")}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Button */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="w-full py-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary disabled:opacity-50"
                                >
                                    {uploadingImage ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t("dashboard.portfolio.uploading")}
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            {t("dashboard.portfolio.uploadImages")}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-muted-foreground mt-2">{t("dashboard.portfolio.reorderHint")}</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t("dashboard.portfolio.descriptionLabel")}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t("dashboard.portfolio.descriptionPlaceholder")}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 rounded-xl border border-border font-semibold text-gray-700 hover:bg-muted transition-colors"
                            >
                                {t("dashboard.portfolio.cancel")}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formData.title.trim()}
                                className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {t("dashboard.portfolio.saveProject")}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.portfolio.newCategory")}</h3>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-2 hover:bg-muted rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder={t("dashboard.portfolio.categoryPlaceholder")}
                            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none mb-4"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium text-gray-700 hover:bg-muted transition-colors"
                            >
                                {t("dashboard.portfolio.cancel")}
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                disabled={savingCategory || !newCategoryName.trim()}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                                {savingCategory ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("dashboard.portfolio.create")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground text-center mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.portfolio.deleteTitle")}</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            {t("dashboard.portfolio.deleteConfirm", { title: deleteConfirm.title })}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-3 rounded-xl border border-border font-semibold text-gray-700 hover:bg-muted transition-colors"
                            >
                                {t("dashboard.portfolio.cancel")}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-md"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("dashboard.portfolio.delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
