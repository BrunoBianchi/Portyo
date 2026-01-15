import { useState, useEffect, useContext } from "react";
import {
    Briefcase,
    Plus,
    Edit2,
    Trash2,
    X,
    GripVertical,
    Image as ImageIcon,
    Loader2,
    Save
} from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";

interface PortfolioItem {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    order: number;
    createdAt: string;
}

export default function PortfolioDashboard() {
    const { bio } = useContext(BioContext);
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', image: '' });

    // Delete modal
    const [deleteConfirm, setDeleteConfirm] = useState<PortfolioItem | null>(null);

    useEffect(() => {
        if (bio?.id) {
            fetchItems();
        }
    }, [bio?.id]);

    const fetchItems = async () => {
        if (!bio?.id) return;
        try {
            setLoading(true);
            const res = await api.get(`/portfolio/${bio.id}`);
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch portfolio items:", error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({ title: '', description: '', image: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: PortfolioItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            image: item.image || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ title: '', description: '', image: '' });
    };

    const handleSave = async () => {
        if (!bio?.id || !formData.title.trim()) return;

        try {
            setSaving(true);

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                image: formData.image.trim() || null
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
            alert("Erro ao salvar item");
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
            alert("Erro ao deletar item");
        } finally {
            setSaving(false);
        }
    };

    if (!bio) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Selecione uma página primeiro</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Portfólio</h1>
                        <p className="text-gray-500 text-sm">Mostre seus projetos e trabalhos</p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar Projeto
                </button>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum projeto ainda</h3>
                    <p className="text-gray-500 text-sm mb-6">Adicione seus primeiros projetos ao portfólio</p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Projeto
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                        >
                            {/* Image */}
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}

                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="p-2.5 bg-white rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(item)}
                                        className="p-2.5 bg-white rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                                {item.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingItem ? 'Editar Projeto' : 'Novo Projeto'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Nome do projeto"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL da Imagem
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                                {formData.image && (
                                    <div className="mt-2 aspect-video bg-gray-100 rounded-xl overflow-hidden">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descreva o projeto..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formData.title.trim()}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Salvar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Deletar Projeto</h3>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja deletar "{deleteConfirm.title}"? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Deletar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
