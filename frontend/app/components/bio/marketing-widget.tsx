import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '~/services/api';

// Icons
const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

interface MarketingWidgetProps {
    slotId: string;
    bioId: string;
}

export const MarketingWidget: React.FC<MarketingWidgetProps> = ({ slotId, bioId }) => {
    const [slot, setSlot] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [proposal, setProposal] = useState({
        name: '',
        email: '',
        company: '',
        link: '',
        bidAmount: '',
        message: '',
        duration: '',
        imageUrl: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch specific slot details
        api.get(`/public/marketing/slots/${slotId}`)
            .then(res => {
                setSlot(res.data);
            })
            .catch(err => console.error("Failed to fetch slot", err))
            .finally(() => setLoading(false));
    }, [slotId]);

    // Track impression when an ad is displayed
    useEffect(() => {
        if (slot && slot.activeProposal) {
            const proposalId = slot.activeProposal.id || slot.activeProposalId;
            if (proposalId) {
                api.post('/public/marketing/impressions', { proposalId }).catch(err => console.error("Track impression error", err));
            }
        }
    }, [slot]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await api.post(`/public/marketing/proposals`, {
                slotId,
                bioId,
                ...proposal,
                bidAmount: Number(proposal.bidAmount),
                duration: Number(proposal.duration)
            });
            setSubmitSuccess(true);
        } catch (err: any) {
            console.error("Proposal error", err);
            setError(err.response?.data?.message || "Failed to send proposal");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null; // Or skeleton
    if (!slot) return null; // Slot not found or disabled

    // If slot has an ACTIVE proposal, show the AD
    if (slot.activeProposal) {
        return (
            <a
                href={slot.activeProposal.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full overflow-hidden rounded-3xl relative aspect-[3/1] group transition-transform hover:scale-[1.02]"
                onClick={() => {
                    const proposalId = slot.activeProposal.id || slot.activeProposalId;
                    if (proposalId) api.post('/public/marketing/clicks', { proposalId }).catch(console.error);
                }}
            >
                <img src={slot.activeProposal.imageUrl || "https://placehold.co/600x200"} alt="Advertisement" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Sponsored
                </div>
            </a>
        );
    }

    // Otherwise, show "Advertise Here" placeholder with Enhanced Design
    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="w-full p-8 rounded-3xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50/80 to-white hover:border-purple-500 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center gap-4 text-center min-h-[180px] relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-grid-purple-500/[0.05] [mask-image:linear-gradient(0deg,white,transparent)]" />

                <div className="relative w-14 h-14 rounded-2xl bg-white shadow-sm border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <TrendingUpIcon />
                </div>

                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">Advertise Here</h3>
                    <p className="text-sm text-gray-500 max-w-[200px] mx-auto leading-relaxed">Promote your brand to this audience directly.</p>
                </div>

                <div className="relative mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100/80 text-purple-700 text-xs font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    {slot.acceptOtherPrices ? `Starting at $${slot.priceMin}` : `Price: $${slot.priceMin}`}
                </div>
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-in scale-95 duration-200 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <XIcon />
                        </button>

                        <div className="p-8">
                            <div className="mb-8 text-center">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <TrendingUpIcon />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Send Proposal</h2>
                                <p className="text-gray-500 text-sm mt-2">Submit your ad for <span className="font-semibold text-gray-700">"{slot.slotName}"</span>.</p>
                            </div>

                            {submitSuccess ? (
                                <div className="text-center py-8 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Proposal Sent!</h3>
                                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">We've sent a confirmation email. You'll be notified when the owner responds.</p>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Your Name</label>
                                            <input required type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 px-4 py-2.5 transition-all"
                                                value={proposal.name} onChange={e => setProposal({ ...proposal, name: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                                            <input required type="email" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 px-4 py-2.5 transition-all"
                                                value={proposal.email} onChange={e => setProposal({ ...proposal, email: e.target.value })}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Company / Brand</label>
                                        <input required type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 px-4 py-2.5 transition-all"
                                            value={proposal.company} onChange={e => setProposal({ ...proposal, company: e.target.value })}
                                            placeholder="Acme Inc."
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Link to Promote</label>
                                        <input required type="url" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 px-4 py-2.5 transition-all"
                                            value={proposal.link} onChange={e => setProposal({ ...proposal, link: e.target.value })}
                                            placeholder="https://mysite.com"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Ad Image URL</label>
                                        <div className="relative">
                                            <input required type="url" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pl-4 pr-10 py-2.5 transition-all"
                                                value={proposal.imageUrl} onChange={e => setProposal({ ...proposal, imageUrl: e.target.value })}
                                                placeholder="https://..."
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <ImageIcon />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Direct link to your banner image.</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                                    {slot.acceptOtherPrices ? "Your Offer ($)" : "Fixed Price ($)"}
                                                </label>
                                                <input
                                                    required
                                                    type="number"
                                                    min={slot.priceMin}
                                                    disabled={!slot.acceptOtherPrices}
                                                    className={`w-full rounded-xl border-gray-200 text-sm px-4 py-2.5 transition-all font-medium ${!slot.acceptOtherPrices
                                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed border-transparent"
                                                            : "bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                        }`}
                                                    value={!slot.acceptOtherPrices ? slot.priceMin : proposal.bidAmount}
                                                    onChange={e => setProposal({ ...proposal, bidAmount: e.target.value })}
                                                    placeholder={`Min $${slot.priceMin}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Duration (Days)</label>
                                                <input required type="number" min="1" max="365" className="w-full rounded-xl border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 px-4 py-2.5 transition-all"
                                                    value={proposal.duration} onChange={e => setProposal({ ...proposal, duration: e.target.value })}
                                                    placeholder={slot.duration ? `${slot.duration}` : "e.g. 30"}
                                                />
                                            </div>
                                        </div>
                                        {!slot.acceptOtherPrices && (
                                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                                This slot has a fixed price and duration.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Message (Optional)</label>
                                        <textarea className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 px-4 py-2.5 transition-all resize-none"
                                            rows={2}
                                            value={proposal.message} onChange={e => setProposal({ ...proposal, message: e.target.value })}
                                            placeholder="Any special instructions..."
                                        />
                                    </div>

                                    {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                        {error}
                                    </div>}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 transform active:scale-[0.98]"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending Proposal...
                                            </>
                                        ) : "Submit Proposal"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
