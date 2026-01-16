import type { MetaFunction } from "react-router";
import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { Plus, TrendingUp, X, Loader2, Trash2, Sparkles, DollarSign, Image as ImageIcon } from "lucide-react";
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

interface MarketingProposal {
    id: string;
    slotId: string;
    companyId?: string;
    company?: {
        sufix: string;
        profileImage?: string;
    };
    guestName?: string;
    guestEmail?: string;
    proposedPrice: number; // numeric in DB string in JSON? Helper usually converts, assuming number
    status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'in_progress';
    message?: string;
    content: {
        title: string;
        description: string;
        imageUrl?: string;
        linkUrl: string;
    };
    createdAt: string;
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

    // Proposals State
    const [viewingProposalsFor, setViewingProposalsFor] = useState<MarketingSlot | null>(null);
    const [selectedSlotProposals, setSelectedSlotProposals] = useState<MarketingProposal[]>([]);
    const [isLoadingProposals, setIsLoadingProposals] = useState(false);
    const [processingProposalId, setProcessingProposalId] = useState<string | null>(null);
    const [sendingPaymentLinkId, setSendingPaymentLinkId] = useState<string | null>(null);

    // Stripe Status
    const [isStripeConnected, setIsStripeConnected] = useState(false);
    const [isLoadingStripe, setIsLoadingStripe] = useState(true);

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

        const fetchStripeStatus = async () => {
            if (!bio?.id) return;
            setIsLoadingStripe(true);
            try {
                const res = await api.get(`/stripe/status?bioId=${bio.id}`);
                setIsStripeConnected(res.data.connected);
            } catch (err) {
                console.error("Failed to fetch stripe status", err);
            } finally {
                setIsLoadingStripe(false);
            }
        };

        fetchSlots();
        fetchStripeStatus();
    }, [bio?.id, isStandard]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bio?.id) return;

        if (!isStripeConnected) {
            setCreateError("Please connect your Stripe account in the Integrations page first.");
            return;
        }

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
        if (deletingSlot.status !== 'available') {
            alert("This slot can't be deleted while a campaign is in progress.");
            setDeletingSlot(null);
            return;
        }

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

    const handleViewProposals = async (slot: MarketingSlot) => {
        setViewingProposalsFor(slot);
        setIsLoadingProposals(true);
        setSelectedSlotProposals([]);
        try {
            const res = await api.get(`/marketing/proposals/received?slotId=${slot.id}`);
            setSelectedSlotProposals(res.data);
        } catch (error) {
            console.error("Failed to fetch proposals", error);
        } finally {
            setIsLoadingProposals(false);
        }
    };

    const handleAcceptProposal = async (proposalId: string) => {
        if (!confirm("Are you sure you want to accept this proposal? This will reject all other pending proposals for this slot.")) return;

        if (!isStripeConnected) {
            alert("Please connect your Stripe account in the Integrations page first.");
            return;
        }
        setProcessingProposalId(proposalId);
        try {
            await api.put(`/marketing/proposals/${proposalId}/accept`);
            // Update local state
            setSelectedSlotProposals(prev => prev.map(p => {
                if (p.id === proposalId) return { ...p, status: 'accepted' }; // Or active? Backend sets active
                if (p.status === 'pending') return { ...p, status: 'rejected' };
                return p;
            }));
            // Update slot status in background or optimistic
            if (viewingProposalsFor) {
                setSlots(prev => prev.map(s => s.id === viewingProposalsFor.id ? { ...s, status: 'occupied' } : s));
            }
        } catch (error) {
            console.error("Failed to accept proposal", error);
            alert("Failed to accept proposal");
        } finally {
            setProcessingProposalId(null);
        }
    };

    const handleRejectProposal = async (proposalId: string) => {
        if (!confirm("Are you sure you want to reject this proposal?")) return;
        setProcessingProposalId(proposalId);
        try {
            await api.put(`/marketing/proposals/${proposalId}/reject`, {});
            setSelectedSlotProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'rejected' } : p));
        } catch (error) {
            console.error("Failed to reject proposal", error);
        } finally {
            setProcessingProposalId(null);
        }
    };

    const handleSendPaymentLink = async (proposalId: string) => {
        if (!viewingProposalsFor?.bioId) {
            alert("Error: Bio ID not found");
            return;
        }
        setSendingPaymentLinkId(proposalId);
        try {
            await api.post(`/marketing/proposals/${viewingProposalsFor.bioId}/generate-payment-link`, {
                proposalId
            });
            alert("Payment link sent successfully!");
        } catch (error: any) {
            console.error("Failed to send payment link", error);
            alert(error.response?.data?.error || "Failed to send payment link");
        } finally {
            setSendingPaymentLinkId(null);
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
                {!isLoadingStripe && !isStripeConnected && (
                    <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Connect Payouts</h3>
                                <p className="text-amber-800">You need to connect your Stripe account to receive payments from advertisers.</p>
                            </div>
                        </div>
                        <a
                            href="/dashboard/integrations"
                            className="px-6 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition whitespace-nowrap"
                        >
                            Connect Stripe
                        </a>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Marketing Slots</h1>
                        <p className="text-gray-500 mt-1">Create slots and receive proposals ({slots.length}/{maxSlots})</p>
                        <p className="text-xs text-gray-400 mt-1">A 5% platform fee applies to all accepted proposals.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={slots.length >= maxSlots || !isStripeConnected}
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
                                        onClick={() => {
                                            if (slot.status !== 'available') return;
                                            setDeletingSlot(slot);
                                        }}
                                        disabled={slot.status !== 'available'}
                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={slot.status !== 'available' ? "Campaign in progress" : "Delete slot"}
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
                                    <button
                                        onClick={() => handleViewProposals(slot)}
                                        className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
                                    >
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
                                            max="999999.99"
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
                                            max="999999.99"
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

                {/* Proposals Modal */}
                {viewingProposalsFor && typeof document !== "undefined" && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Proposals for "{viewingProposalsFor.slotName}"</h3>
                                    <p className="text-sm text-gray-500">
                                        ${viewingProposalsFor.priceMin} - ${viewingProposalsFor.priceMax} • {viewingProposalsFor.duration} days
                                    </p>
                                </div>
                                <button onClick={() => setViewingProposalsFor(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                                {isLoadingProposals ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                    </div>
                                ) : selectedSlotProposals.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>No proposals received yet.</p>
                                    </div>
                                ) : (
                                    selectedSlotProposals.map(proposal => (
                                        <div key={proposal.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition bg-gray-50/50">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {proposal.company?.sufix?.[0]?.toUpperCase() || proposal.guestName?.[0]?.toUpperCase() || 'G'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 leading-tight">
                                                            {proposal.company?.sufix ? `@${proposal.company.sufix}` : proposal.guestName || "Guest"}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(proposal.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-lg font-bold text-green-600">${proposal.proposedPrice}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        proposal.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                            proposal.status === 'active' || proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {proposal.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Proposal Content Preview */}
                                            <div className="bg-white border border-gray-100 rounded-lg p-3 mb-4 flex gap-3">
                                                {proposal.content.imageUrl ? (
                                                    <img src={proposal.content.imageUrl} alt="" className="w-16 h-16 rounded-md object-cover bg-gray-100" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <ImageIcon width={20} height={20} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-sm text-gray-900 truncate">{proposal.content.title}</h5>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{proposal.content.description}</p>
                                                    <a href={proposal.content.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block truncate max-w-full">
                                                        {proposal.content.linkUrl}
                                                    </a>
                                                </div>
                                            </div>

                                            {proposal.message && (
                                                <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg mb-4 italic">
                                                    "{proposal.message}"
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleAcceptProposal(proposal.id)}
                                                    disabled={processingProposalId === proposal.id || proposal.status !== 'pending' || viewingProposalsFor?.status !== 'available'}
                                                    className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                                                    title={proposal.status !== 'pending' ? "Proposal not pending" : viewingProposalsFor?.status !== 'available' ? "Campaign in progress" : "Accept"}
                                                >
                                                    {processingProposalId === proposal.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectProposal(proposal.id)}
                                                    disabled={processingProposalId === proposal.id || proposal.status !== 'pending' || viewingProposalsFor?.status !== 'available'}
                                                    className="flex-1 py-2 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 hover:text-red-600 transition disabled:opacity-50 text-sm"
                                                    title={proposal.status !== 'pending' ? "Proposal not pending" : viewingProposalsFor?.status !== 'available' ? "Campaign in progress" : "Reject"}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </AuthorizationGuard>
    );
}
