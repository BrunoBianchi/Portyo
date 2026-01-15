import type { MetaFunction } from "react-router";
import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { Plus, TrendingUp, X, Loader2, Trash2, Sparkles, DollarSign } from "lucide-react";
import { api } from "~/services/api";
import BioContext from "~/contexts/bio.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import AuthContext from "~/contexts/auth.context";

export const meta: MetaFunction = () => {
    return [
        { title: "Marketing | Portyo" },
        { name: "description", content: "Create advertising slots and manage proposals." },
    ];
};

interface MarketingSlot {
    id: string;
    bioId: string;
    slotName: string;
    priceMin: number;
    priceMax: number;
    duration: number;
    acceptOtherPrices: boolean;
    status: 'available' | 'occupied' | 'pending_approval';
    totalProposals: number;
    totalRevenue: number;
}

export default function DashboardMarketing() {
    const { bio } = useContext(BioContext);
    const { user } = useContext(AuthContext);
    const userPlan = user?.plan || 'free';
    const isPro = userPlan === 'pro';
    const isStandard = userPlan === 'standard' || isPro;

    const [slots, setSlots] = useState<MarketingSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [deletingSlot, setDeletingSlot] = useState<MarketingSlot | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        slotName: "",
        priceMin: "",
        priceMax: "",
        duration: "30",
        acceptOtherPrices: false
    });

    const maxSlots = isPro ? 5 : isStandard ? 2 : 0;

    useEffect(() => {
        const fetchSlots = async () => {
            if (!bio?.id || !isStandard) return;
            setIsLoading(true);
            try {
                const res = await api.get("/marketing/slots/");
                setSlots(res.data);
            } catch (error) {
                console.error("Failed to fetch slots", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlots();
    }, [bio?.id, isStandard]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bio?.id) return;

        setCreateError(null);
        setIsCreating(true);
        try {
            const res = await api.post("/marketing/slots/", {
                bioId: bio.id,
                slotName: formData.slotName,
                priceMin: parseFloat(formData.priceMin),
                priceMax: parseFloat(formData.priceMax),
                duration: parseInt(formData.duration),
                acceptOtherPrices: formData.acceptOtherPrices
            });

            setSlots([...slots, res.data]);
            setIsCreateModalOpen(false);
            setFormData({ slotName: "", priceMin: "", priceMax: "", duration: "30", acceptOtherPrices: false });
        } catch (error: any) {
            console.error("Failed to create slot", error);
            console.error("Error response:", error.response?.data);
            setCreateError(error.response?.data?.message || "Failed to create slot");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingSlot) return;

        setIsDeleting(true);
        try {
            await api.delete(`/marketing/slots/${deletingSlot.id}`);
            setSlots(slots.filter(s => s.id !== deletingSlot.id));
            setDeletingSlot(null);
        } catch (error: any) {
            console.error("Failed to delete slot", error);
            alert(error.response?.data?.message || "Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isStandard) {
        return (
            <AuthorizationGuard>
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-12 text-center text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Unlock Marketing Slots</h2>
                        <p className="text-lg mb-8 opacity-90">
                            Create advertising slots and earn money from companies who want to advertise on your bio!
                        </p>
                        <a
                            href="/dashboard/settings"
                            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition"
                        >
                            Upgrade to Standard or Pro
                        </a>
                    </div>
                </div>
            </AuthorizationGuard>
        );
    }

    return (
        <AuthorizationGuard>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Marketing Slots</h1>
                        <p className="text-gray-500 mt-1">Create slots and receive proposals ({slots.length}/{maxSlots})</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={slots.length >= maxSlots}
                        className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" /> New Slot
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : slots.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                        <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Slots Yet</h3>
                        <p className="text-gray-500 mb-6">Create your first advertising slot!</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition"
                        >
                            Create First Slot
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {slots.map((slot) => (
                            <div key={slot.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{slot.slotName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <DollarSign className="w-4 h-4" />
                                            <span>${slot.priceMin} - ${slot.priceMax}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{slot.duration} days</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDeletingSlot(slot)}
                                        disabled={slot.status === 'occupied'}
                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100 my-4">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${slot.status === 'available' ? 'bg-green-100 text-green-700' :
                                            slot.status === 'occupied' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {slot.status === 'available' ? 'Available' : slot.status === 'occupied' ? 'Occupied' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Proposals</p>
                                        <p className="text-2xl font-bold text-gray-900">{slot.totalProposals}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Revenue</p>
                                        <p className="text-2xl font-bold text-green-600">${slot.totalRevenue}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm">
                                        View Proposals
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {isCreateModalOpen && typeof document !== "undefined" && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Create Marketing Slot</h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                {createError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{createError}</div>}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot Name *</label>
                                    <input
                                        required
                                        value={formData.slotName}
                                        onChange={(e) => setFormData({ ...formData, slotName: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/10 outline-none"
                                        placeholder="Main Banner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($) *</label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.priceMin}
                                            onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/10 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($) *</label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.priceMax}
                                            onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/10 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/10 outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="acceptOther"
                                        checked={formData.acceptOtherPrices}
                                        onChange={(e) => setFormData({ ...formData, acceptOtherPrices: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="acceptOther" className="text-sm text-gray-700">Accept proposals outside price range</label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full bg-black text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Slot"}
                                </button>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Delete Modal */}
                {deletingSlot && typeof document !== "undefined" && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Slot?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                This will permanently delete "{deletingSlot.slotName}". This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingSlot(null)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </AuthorizationGuard>
    );
}
