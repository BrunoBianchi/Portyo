import { Link, useNavigate } from "react-router";
import { Plus, FileText, Trash2, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useBio } from "~/contexts/bio.context";
import { useAuth } from "~/contexts/auth.context";
import { api } from "~/services/api";
import { PLAN_LIMITS, type PlanType } from "~/constants/plan-limits";
import { UpgradePopup } from "~/components/shared/upgrade-popup";

interface Form {
    id: string;
    title: string;
    updatedAt: string;
    fields: any[];
    submissions: number;
    views: number;
}

export default function DashboardFormsList() {
    const navigate = useNavigate();
    const { bio } = useBio();
    const { user } = useAuth();
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpgradePopupOpen, setIsUpgradePopupOpen] = useState(false);
    const [deletingForm, setDeletingForm] = useState<Form | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (bio?.id) {
            fetchForms();
        }
    }, [bio?.id]);

    const fetchForms = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/form/bios/${bio!.id}/forms`);
            setForms(response.data);
        } catch (err) {
            console.error("Failed to fetch forms", err);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewForm = async () => {
        if (!bio?.id) return;

        const plan = (user?.plan || 'free') as PlanType;
        const limit = PLAN_LIMITS[plan]?.formsPerBio || 1;

        if (forms.length >= limit) {
            setIsUpgradePopupOpen(true);
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post(`/form/bios/${bio.id}/forms`, {
                title: "Untitled Form",
                fields: []
            });
            navigate(`/dashboard/forms/${response.data.id}`);
        } catch (err: any) {
            console.error("Failed to create form", err);
            setError(err.response?.data?.error || "Failed to create form");
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteForm = (form: Form, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeletingForm(form);
    };

    const handleConfirmDelete = async () => {
        if (!deletingForm) return;
        try {
            setIsDeleting(true);
            await api.delete(`/form/forms/${deletingForm.id}`);
            setForms(prev => prev.filter(f => f.id !== deletingForm.id));
            setDeletingForm(null);
        } catch (err) {
            console.error("Failed to delete form", err);
            alert("Failed to delete form");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!bio) return null;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forms</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage your custom forms</p>
                </div>
                <button
                    onClick={createNewForm}
                    className="btn btn-primary gap-2"
                    disabled={isLoading}
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Form ({forms.length}/{
                        (() => {
                            const plan = (user?.plan || 'free') as PlanType;
                            return PLAN_LIMITS[plan]?.formsPerBio || 1;
                        })()
                    })</span>
                </button>
            </div>

            <UpgradePopup
                isOpen={isUpgradePopupOpen}
                onClose={() => setIsUpgradePopupOpen(false)}
            />

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
                    {error}
                </div>
            )}

            {isLoading && forms.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-50 h-48 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : forms.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No forms yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">Create your first form to start collecting data from your visitors.</p>
                    <button
                        onClick={createNewForm}
                        className="btn btn-primary"
                    >
                        Create your first form
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <Link
                            key={form.id}
                            to={`/dashboard/forms/${form.id}`}
                            className="group bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="relative">
                                    <button
                                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                                        onClick={(e) => deleteForm(form, e)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{form.title || "Untitled Form"}</h3>
                            <p className="text-sm text-gray-500 mb-6">Last updated: {new Date(form.updatedAt).toLocaleDateString()}</p>

                            <div className="mt-auto flex items-center justify-between text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-4">
                                    <span>{form.fields.length} Fields</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span>{form.submissions} Submissions</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/dashboard/forms/${form.id}/answers`);
                                    }}
                                    className="text-primary hover:underline font-bold"
                                >
                                    View Answers
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deletingForm && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Form?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-700">"{deletingForm.title || "Untitled Form"}"</span>? This action cannot be undone and will delete all collected answers.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingForm(null)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
