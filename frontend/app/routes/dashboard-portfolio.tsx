import { useState, useEffect, useContext, useRef, useMemo } from "react";
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
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";
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
            className={`bg-white rounded-[24px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 group flex flex-col overflow-hidden ${isDragging ? 'z-50 ring-4 ring-[#8129D9]/20' : ''}`}
        >
            <div className="p-3">
                {/* Image */}
                <div className="aspect-square relative bg-[#F3F3F1] rounded-2xl overflow-hidden border-2 border-black/5">
                    {item.images && item.images.length > 0 ? (
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-[#F3F3F1]">
                            <ImageIcon className="w-12 h-12 opacity-50" />
                        </div>
                    )}
                    {item.images && item.images.length > 1 && (
                        <div className="absolute top-3 left-3">
                            <span className="pl-2 pr-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-md bg-black/80 text-white border border-white/20 shadow-lg flex items-center gap-1.5">
                                <ImageIcon className="w-3 h-3" />
                                {t("dashboard.portfolio.photos", { count: item.images.length })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-5 pb-5 pt-2 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="font-black text-[#1A1A1A] text-lg mb-1 truncate tracking-tight" style={{ fontFamily: 'var(--font-display)' }} title={item.title}>{item.title}</h3>
                    {item.category ? (
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {item.category.name}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("dashboard.portfolio.uncategorized")}</p>
                    )}
                </div>

                <div className="mt-auto flex items-end justify-end gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start when clicking delete
                            setDeleteConfirm(item);
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on pointer down
                        className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all cursor-pointer font-bold"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start when clicking edit
                            openEditModal(item);
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on pointer down
                        className="h-10 px-5 bg-[#1A1A1A] text-white rounded-full text-sm font-bold border-2 border-black hover:bg-white hover:text-black transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer"
                    >
                        <Edit2 className="w-4 h-4" />
                        {t("dashboard.portfolio.edit")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function PortfolioDashboard() {
    const { bio } = useContext(BioContext);
    const { t } = useTranslation("dashboard");
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

    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const isMobile = useIsMobile();
    const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:portfolio-tour-done" });

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

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isMobile]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:portfolio-tour-done");
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour(portfolioTourSteps);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isMobile, startTour]);

    const portfolioTourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"portfolio-header\"]",
            popover: { title: t("dashboard.tours.portfolio.steps.header"), description: t("dashboard.tours.portfolio.steps.header"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"portfolio-add\"]",
            popover: { title: t("dashboard.tours.portfolio.steps.add"), description: t("dashboard.tours.portfolio.steps.add"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"portfolio-filters\"]",
            popover: { title: t("dashboard.tours.portfolio.steps.filters"), description: t("dashboard.tours.portfolio.steps.filters"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"portfolio-grid\"]",
            popover: { title: t("dashboard.tours.portfolio.steps.grid"), description: t("dashboard.tours.portfolio.steps.grid"), side: "top", align: "start" },
        },
        {
            element: "[data-tour=\"portfolio-card\"]",
            popover: { title: t("dashboard.tours.portfolio.steps.card"), description: t("dashboard.tours.portfolio.steps.card"), side: "top", align: "start" },
        },
        {
            element: "[data-tour=\"portfolio-add-placeholder\"]",
            popover: { title: t("dashboard.tours.portfolio.steps.addPlaceholder"), description: t("dashboard.tours.portfolio.steps.addPlaceholder"), side: "top", align: "start" },
        },
    ], [t]);


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
                <p className="text-white/70">{t("dashboard.portfolio.selectPage")}</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" data-tour="portfolio-header">
                <div>
                    <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.portfolio.title")}</h1>
                    <p className="text-gray-500 font-medium mt-1 text-lg">{t("dashboard.portfolio.subtitle")}</p>
                </div>
                <button
                    data-tour="portfolio-add"
                    onClick={openCreateModal}
                    className="px-8 py-4 bg-[#1A1A1A] text-white rounded-full font-black text-lg hover:bg-black hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                    <Plus className="w-6 h-6" strokeWidth={3} /> {t("dashboard.portfolio.addProject")}
                </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-3 mb-8 flex-wrap" data-tour="portfolio-filters">
                <button
                    onClick={() => setActiveFilter(null)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${activeFilter === null
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(198,240,53,1)]'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
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
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all group relative cursor-pointer select-none border-2 ${activeFilter === category.id
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(198,240,53,1)]'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                            }`}
                    >
                        {category.name}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold shadow-sm border border-black"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-4 py-2.5 rounded-full text-sm font-bold bg-[#F3F3F1] text-gray-400 hover:bg-gray-200 transition-all border-2 border-dashed border-gray-300 hover:border-black hover:text-black flex items-center gap-1.5"
                >
                    <FolderPlus className="w-4 h-4" />
                    {t("dashboard.portfolio.addCategory")}
                </button>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-[#8129D9]" />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-[32px] flex flex-col items-center justify-center gap-6 p-12 text-center bg-white" data-tour="portfolio-grid">
                    <div className="w-20 h-20 rounded-full bg-[#F3F3F1] flex items-center justify-center text-gray-400 border-2 border-gray-100">
                        <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="max-w-md">
                        <h3 className="font-black text-[#1A1A1A] text-2xl mb-2 tracking-tight">
                            {activeFilter ? t("dashboard.portfolio.emptyCategoryTitle") : t("dashboard.portfolio.emptyTitle")}
                        </h3>
                        <p className="text-gray-500 font-medium">
                            {activeFilter ? t("dashboard.portfolio.emptyCategorySubtitle") : t("dashboard.portfolio.emptySubtitle")}
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="mt-2 px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold hover:bg-black transition-all hover:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Plus className="w-5 h-5 inline mr-2" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-tour="portfolio-grid">
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
                            className="border-2 border-dashed border-gray-300 rounded-[24px] flex flex-col items-center justify-center gap-4 p-6 hover:border-[#8129D9] hover:bg-[#8129D9]/5 transition-all group h-full min-h-[320px] bg-white"
                        >
                            <div className="w-20 h-20 rounded-full bg-[#F3F3F1] flex items-center justify-center text-gray-400 group-hover:bg-[#8129D9] group-hover:text-white group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-all duration-300 border-2 border-gray-100 group-hover:border-black">
                                <Plus className="w-8 h-8" strokeWidth={3} />
                            </div>
                            <div className="text-center">
                                <p className="font-black text-[#1A1A1A] text-lg mb-1">{t("dashboard.portfolio.addNewProject")}</p>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{t("dashboard.portfolio.showcaseWork")}</p>
                            </div>
                        </button>
                    </div>
                </DndContext>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto border-4 border-black box-border">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                {editingItem ? t("dashboard.portfolio.editProject") : t("dashboard.portfolio.newProject")}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-black"
                            >
                                <X className="w-6 h-6 text-black" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
                                    {t("dashboard.portfolio.titleLabel")}
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t("dashboard.portfolio.titlePlaceholder")}
                                    className="w-full px-4 py-3 bg-[#F3F3F1] rounded-xl border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold text-[#1A1A1A] placeholder:text-gray-400"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
                                    {t("dashboard.portfolio.categoryLabel")}
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#F3F3F1] rounded-xl border-2 border-transparent focus:border-black focus:bg-white outline-none transition-all font-bold text-[#1A1A1A]"
                                >
                                    <option value="">{t("dashboard.portfolio.noCategory")}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
                                    {t("dashboard.portfolio.imagesLabel")}
                                </label>

                                {/* Image Preview Grid with Drag & Drop */}
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {formData.images.map((img, index) => (
                                            <div
                                                key={index}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDragLeave={handleDragLeave}
                                                className={`relative aspect-square rounded-xl overflow-hidden group/img cursor-move transition-all border-2 border-gray-200 ${draggedIndex === index ? 'opacity-50 scale-95' : ''
                                                    } ${dragOverIndex === index ? 'ring-4 ring-[#8129D9]/20' : ''
                                                    }`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />

                                                {/* Drag Handle */}
                                                <div className="absolute top-1 left-1 p-1 bg-black/60 rounded-md text-white opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm">
                                                    <GripVertical className="w-3 h-3" />
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage(index);
                                                    }}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 shadow-sm"
                                                >
                                                    ×
                                                </button>

                                                {/* Cover Badge */}
                                                {index === 0 && (
                                                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black text-white text-[10px] rounded-md font-bold shadow-sm">
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
                                    className="w-full py-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-black disabled:opacity-50 font-bold"
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
                                <p className="text-xs text-gray-400 mt-2 font-medium">{t("dashboard.portfolio.reorderHint")}</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-2">
                                    {t("dashboard.portfolio.descriptionLabel")}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t("dashboard.portfolio.descriptionPlaceholder")}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-[#F3F3F1] rounded-xl border-2 border-transparent focus:border-black focus:bg-white outline-none resize-none transition-all font-bold text-[#1A1A1A] placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-3.5 rounded-full border-2 border-gray-200 font-bold text-gray-500 hover:border-black hover:text-black hover:bg-white transition-all"
                            >
                                {t("dashboard.portfolio.cancel")}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formData.title.trim()}
                                className="flex-1 px-4 py-3.5 rounded-full bg-[#1A1A1A] text-white font-black hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
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
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 border-4 border-black">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.portfolio.newCategory")}</h3>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder={t("dashboard.portfolio.categoryPlaceholder")}
                            className="w-full px-4 py-3 bg-[#F3F3F1] rounded-xl border-2 border-transparent focus:border-black focus:bg-white outline-none mb-6 font-bold text-[#1A1A1A]"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 font-bold text-gray-500 hover:border-black hover:text-black transition-colors"
                            >
                                {t("dashboard.portfolio.cancel")}
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                disabled={savingCategory || !newCategoryName.trim()}
                                className="flex-1 px-4 py-3 rounded-full bg-[#1A1A1A] text-white font-black hover:bg-black transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 border-4 border-black">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-black text-[#1A1A1A] text-center mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.portfolio.deleteTitle")}</h3>
                        <p className="text-gray-500 text-center mb-8 font-medium">
                            {t("dashboard.portfolio.deleteConfirm", { title: deleteConfirm.title })}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 font-bold text-gray-500 hover:border-black hover:text-black transition-colors"
                            >
                                {t("dashboard.portfolio.cancel")}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 px-4 py-3 rounded-full bg-red-600 text-white font-black hover:bg-red-700 transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
