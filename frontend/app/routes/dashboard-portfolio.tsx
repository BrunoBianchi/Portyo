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
    FolderPlus
} from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";

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

export default function PortfolioDashboard() {
    const { bio } = useContext(BioContext);
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

    useEffect(() => {
        if (bio?.id) {
            fetchData();
        }
    }, [bio?.id]);

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
            alert("Failed to upload images");
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
            alert("Failed to save project");
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
            alert("Failed to delete project");
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
            alert("Failed to create category");
        } finally {
            setSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!bio?.id) return;
        if (!confirm('Delete this category? Projects in this category will remain but become uncategorized.')) return;

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
                <p className="text-gray-500">Select a page first</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
                    <p className="text-gray-500 mt-1">Showcase your projects and work.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200"
                >
                    <Plus className="w-5 h-5" /> Add Project
                </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => setActiveFilter(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === null
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setActiveFilter(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all group relative ${activeFilter === category.id
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {category.name}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold"
                        >
                            ×
                        </button>
                    </button>
                ))}
                <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-3 py-2 rounded-full text-sm font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all border-2 border-dashed border-gray-200 flex items-center gap-1.5"
                >
                    <FolderPlus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-base mb-0.5">
                            {activeFilter ? 'No projects in this category' : 'No projects yet'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {activeFilter ? 'Add projects to this category' : 'Add your first project to the portfolio'}
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="mt-2 px-5 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4 inline mr-1.5" />
                        Add Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden"
                        >
                            <div className="p-2">
                                {/* Image */}
                                <div className="aspect-square relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                    {item.images && item.images.length > 0 ? (
                                        <img
                                            src={item.images[0]}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50/50">
                                            <ImageIcon className="w-12 h-12 opacity-20" />
                                        </div>
                                    )}
                                    {item.images && item.images.length > 1 && (
                                        <div className="absolute top-3 left-3">
                                            <span className="pl-2 pr-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-xl bg-white/80 border border-gray-100 shadow-sm flex items-center gap-1.5 text-gray-600">
                                                <ImageIcon className="w-3 h-3" />
                                                {item.images.length} photos
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-4 pb-4 pt-1 flex flex-col flex-1">
                                <div className="mb-3">
                                    <h3 className="font-bold text-gray-900 text-base mb-0.5 truncate tracking-tight" title={item.title}>{item.title}</h3>
                                    {item.category ? (
                                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {item.category.name}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-400 font-medium">Uncategorized</p>
                                    )}
                                </div>

                                <div className="mt-auto flex items-end justify-end gap-1.5">
                                    <button
                                        onClick={() => setDeleteConfirm(item)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="h-9 px-4 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Placeholder */}
                    <button
                        onClick={openCreateModal}
                        className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 p-6 hover:border-black/20 hover:bg-gray-50/50 transition-all group h-full min-h-[280px]"
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 border border-gray-100">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900 text-base mb-0.5">Add New Project</p>
                            <p className="text-xs text-gray-500">Showcase your work</p>
                        </div>
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingItem ? 'Edit Project' : 'New Project'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Project name"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                                >
                                    <option value="">No category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Images
                                </label>

                                {/* Image Preview Grid */}
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group/img">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    ×
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded font-medium">
                                                        Cover
                                                    </span>
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
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-primary disabled:opacity-50"
                                >
                                    {uploadingImage ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload Images
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-400 mt-2">First image will be used as cover. You can upload multiple images.</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your project..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
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
                                        Save
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
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">New Category</h3>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none mb-4"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                disabled={savingCategory || !newCategoryName.trim()}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                                {savingCategory ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Project</h3>
                        <p className="text-gray-600 text-center mb-6">
                            Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-md"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
