
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
    Zap,
    Plus,
    MoreHorizontal,
    Play,
    Pause,
    Edit,
    Trash2,
    Loader2,
    BarChart2,
    Activity
} from "lucide-react";
import { useBio } from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import {
    getAutomationsByBio,
    createAutomation,
    activateAutomation,
    deactivateAutomation,
    deleteAutomation,
    type Automation
} from "~/services/automation.service";
import type { Route } from "../+types/root";
import { DeleteConfirmationModal } from "~/components/delete-confirmation-modal";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Automations | Portyo" },
        { name: "description", content: "Manage your email automation workflows" },
    ];
}

export default function DashboardAutomationList() {
    const { bio } = useBio();
    const navigate = useNavigate();
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });
    const [isDeleting, setIsDeleting] = useState(false);

    // Load automations
    const loadAutomations = async () => {
        if (!bio?.id) return;
        try {
            setLoading(true);
            const data = await getAutomationsByBio(bio.id);
            setAutomations(data);
        } catch (error) {
            console.error("Failed to load automations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAutomations();
    }, [bio?.id]);

    const handleCreate = async () => {
        if (!bio?.id) return;
        setCreating(true);
        try {
            // Create a default "New Automation"
            const newAutomation = await createAutomation(
                bio.id,
                "Untitled Automation",
                [
                    { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'New Subscriber', eventType: 'newsletter_subscribe' } },
                    { id: '2', type: 'action', position: { x: 250, y: 250 }, data: { label: 'Welcome Email', subject: 'Welcome!', content: 'Thanks for subscribing!' } }
                ],
                [{ id: 'e1-2', source: '1', target: '2' }]
            );
            navigate(`/dashboard/automation/${newAutomation.id}`);
        } catch (error) {
            console.error("Failed to create automation:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (id: string, currentState: boolean) => {
        setTogglingId(id);
        try {
            if (currentState) {
                await deactivateAutomation(id);
            } else {
                await activateAutomation(id);
            }
            // Refresh list to get updated state
            await loadAutomations();
        } catch (error) {
            console.error("Failed to toggle automation:", error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;

        setIsDeleting(true);
        try {
            await deleteAutomation(deleteModal.id);
            setAutomations(prev => prev.filter(a => a.id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null });
        } catch (error) {
            console.error("Failed to delete automation:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AuthorizationGuard minPlan="standard">
            <div className="flex-1 p-8 bg-gray-50 min-h-screen">
                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, id: null })}
                    onConfirm={handleConfirmDelete}
                    title="Delete Automation"
                    description="Are you sure you want to delete this automation? This action cannot be undone and the automation will stop running immediately."
                    isDeleting={isDeleting}
                />

                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
                            <p className="text-gray-500 mt-1">Create and manage your automated workflows</p>
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-gray-200"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create Automation
                        </button>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    ) : automations.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No automations yet</h3>
                            <p className="text-gray-500 max-w-sm mt-2 mb-6">
                                Create your first automation to automatically welcome subscribers, send sequences, and more.
                            </p>
                            <button
                                onClick={handleCreate}
                                disabled={creating}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Create Automation
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {automations.map((automation) => (
                                <div
                                    key={automation.id}
                                    className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all flex items-center gap-6"
                                >
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${automation.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                                        }`}>
                                        <Zap className="w-6 h-6" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 pointer-events-none">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">
                                                {automation.name}
                                            </h3>
                                            <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${automation.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {automation.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Activity className="w-4 h-4" />
                                                <span>{automation.executionCount || 0} runs</span>
                                            </div>
                                            <span>•</span>
                                            <span>Updated {new Date(automation.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggle(automation.id, automation.isActive)}
                                            disabled={togglingId === automation.id}
                                            className={`h-10 px-4 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors ${automation.isActive
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                        >
                                            {togglingId === automation.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : automation.isActive ? (
                                                <>
                                                    <Pause className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Pause</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Activate</span>
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            to={`/dashboard/automation/${automation.id}`}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                            title="Edit Automation"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>

                                        <button
                                            onClick={(e) => handleDeleteClick(automation.id, e)}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthorizationGuard>
    );
}
