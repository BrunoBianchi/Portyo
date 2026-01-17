import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '~/services/api';

// Add Google Fonts support
const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&family=Montserrat:wght@700;900&family=Outfit:wght@600;800&display=swap";


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
        // Log font performance/load if needed, but mainly just ensure it exists
        if (!document.getElementById('marketing-fonts')) {
            const link = document.createElement('link');
            link.id = 'marketing-fonts';
            link.rel = 'stylesheet';
            link.href = GOOGLE_FONTS_URL;
            document.head.appendChild(link);
        }
    }, []);

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
            const resolvedBidAmount = slot?.acceptOtherPrices
                ? Number(proposal.bidAmount)
                : Number(slot?.priceMin ?? proposal.bidAmount);
            const resolvedDuration = slot?.acceptOtherPrices
                ? Number(proposal.duration)
                : Number(slot?.duration ?? proposal.duration);

            await api.post(`/public/marketing/proposals`, {
                slotId,
                bioId,
                ...proposal,
                bidAmount: resolvedBidAmount,
                duration: resolvedDuration
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

    const shouldRenderProposal = !!slot?.activeProposal && ['active', 'in_progress'].includes(slot.activeProposal.status);

    // If slot has an ACTIVE or IN-PROGRESS proposal, show the AD
    if (shouldRenderProposal) {
        const content = slot.activeProposal.content || {};
        const items = content.items || [];
        const bgColor = content.backgroundColor || '#ffffff';
        const txtColor = content.textColor || '#000000';

        // Fallback for legacy content structure
        if (items.length === 0) {
            if (content.imageUrl) items.push({ id: 'img', type: 'image', content: content.imageUrl });
            if (content.title) items.push({ id: 'head', type: 'headline', content: content.title });
            if (content.description) items.push({ id: 'txt', type: 'text', content: content.description });
            if (content.buttonText) items.push({ id: 'btn', type: 'button', content: content.buttonText });
        }

        return (
            <a
                href={slot.activeProposal.link || content.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full overflow-hidden relative flex flex-col transition-all duration-500 shadow-sm group ${content.animation === 'pulse' ? 'hover:animate-pulse' : content.animation === 'bounce' ? 'hover:-translate-y-2' : 'hover:scale-[1.02]'}`}
                style={{
                    backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
                    color: txtColor,
                    borderColor: content.borderColor || (bgColor === 'transparent' ? 'rgba(0,0,0,0.1)' : 'transparent'),
                    borderWidth: `${content.borderWidth || (bgColor === 'transparent' ? 1 : 0)}px`,
                    borderStyle: (content.borderWidth || bgColor === 'transparent') ? 'solid' : 'none',
                    borderRadius: `${content.borderRadius || 24}px`,
                    textAlign: content.alignment || 'center',
                    boxShadow: content.boxShadow || 'none',
                    padding: `${content.padding || 24}px`,
                    fontFamily: content.fontFamily || 'Inter, sans-serif',
                    maxWidth: '516px',
                    maxHeight: '350px'
                }}
                onClick={() => {
                    const proposalId = slot.activeProposal.id || slot.activeProposalId;
                    if (proposalId) api.post('/public/marketing/clicks', { proposalId }).catch(console.error);
                }}
            >
                {
                    items.map((item: any, idx: number) => {
                        const itemAlign = item.style?.alignment || content.alignment || 'center';
                        const itemColor = item.style?.color || txtColor;

                        return (
                            <div
                                key={item.id || idx}
                                className={`last:mb-0 w-full flex flex-col ${itemAlign === 'left' ? 'items-start' : itemAlign === 'right' ? 'items-end' : 'items-center'}`}
                                style={{
                                    marginBottom: `${content.gap || 16}px`,
                                    textAlign: itemAlign as any
                                }}
                            >
                                {item.type === 'image' && item.content && (
                                    <img
                                        src={item.content}
                                        alt="Advertisement"
                                        className="w-full h-48 object-cover shadow-sm"
                                        style={{ borderRadius: `${Math.max(0, (content.borderRadius || 24) - 8)}px` }}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                )}
                                {item.type === 'headline' && (
                                    <h3 className="text-xl font-bold leading-tight" style={{ color: itemColor }}>{item.content}</h3>
                                )}
                                {item.type === 'price' && (
                                    <div
                                        className="text-4xl font-black tracking-tighter my-2 py-2 px-4 rounded-xl inline-block"
                                        style={{
                                            backgroundColor: itemColor + '0a',
                                            color: itemColor,
                                        }}
                                    >
                                        {item.content}
                                    </div>
                                )}
                                {item.type === 'text' && (
                                    <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap" style={{ color: itemColor }}>{item.content}</p>
                                )}
                                {item.type === 'button' && (
                                    <span
                                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full font-bold text-sm min-w-[120px] transition-transform group-hover:bg-black/10"
                                        style={{
                                            backgroundColor: item.props?.buttonColor || content.buttonColor || txtColor,
                                            color: item.props?.buttonTextColor || content.buttonTextColor || (bgColor === 'transparent' ? '#ffffff' : bgColor)
                                        }}
                                    >
                                        {item.content}
                                    </span>
                                )}
                                {item.type === 'spacer' && <div className="h-4"></div>}
                                {item.type === 'divider' && <hr className="w-full my-4 border-current opacity-20" style={{ borderColor: itemColor }} />}
                                {item.type === 'badge' && (
                                    <span
                                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2"
                                        style={{
                                            backgroundColor: itemColor,
                                            color: bgColor === 'transparent' ? '#ffffff' : bgColor,
                                            opacity: 0.8
                                        }}
                                    >
                                        {item.content}
                                    </span>
                                )}
                                {item.type === 'social' && (
                                    <div className={`flex gap-3 mt-2 ${itemAlign === 'left' ? 'justify-start' : itemAlign === 'right' ? 'justify-end' : 'justify-center'}`} style={{ color: itemColor }}>
                                        {item.props?.twitter && (
                                            <a href={item.props.twitter} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                            </a>
                                        )}
                                        {item.props?.instagram && (
                                            <a href={item.props.instagram} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                }

                < div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-current opacity-60" >
                    Ad
                </div >
            </a >
        );
    }

    // Otherwise, show "Advertise Here" placeholder with Enhanced Design
    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="w-full p-8 rounded-3xl border-[3px] border-dashed border-gray-900/60 bg-white hover:bg-gray-50 hover:border-gray-900 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center gap-4 text-center min-h-[180px] relative overflow-hidden"
            >
                <div className="relative w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-900 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <TrendingUpIcon />
                </div>

                <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-black transition-colors">Advertise Here</h3>
                    <p className="text-sm text-gray-500 max-w-[200px] mx-auto leading-relaxed">Promote your brand to this audience directly.</p>
                </div>

                <div className="relative mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-900 text-xs font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {slot.acceptOtherPrices ? `Starting at $${slot.priceMin}` : `Price: $${slot.priceMin}`}
                </div>
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-in scale-95 duration-200 relative border border-gray-100">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <XIcon />
                        </button>

                        <div className="p-8">
                            <div className="mb-8 text-center pt-2">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Send Proposal</h2>
                                <p className="text-gray-500 text-sm mt-2">Submit your ad for <span className="font-semibold text-gray-900">"{slot.slotName}"</span>.</p>
                            </div>

                            {submitSuccess ? (
                                <div className="text-center py-8 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="w-20 h-20 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Proposal Sent!</h3>
                                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">We've sent a confirmation email. You'll be notified when the owner responds.</p>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Your Name</label>
                                            <input required type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-900 px-4 py-3 transition-all placeholder:text-gray-400 font-medium"
                                                value={proposal.name} onChange={e => setProposal({ ...proposal, name: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Email</label>
                                            <input required type="email" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-900 px-4 py-3 transition-all placeholder:text-gray-400 font-medium"
                                                value={proposal.email} onChange={e => setProposal({ ...proposal, email: e.target.value })}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Company / Brand</label>
                                        <input required type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-900 px-4 py-3 transition-all placeholder:text-gray-400 font-medium"
                                            value={proposal.company} onChange={e => setProposal({ ...proposal, company: e.target.value })}
                                            placeholder="Acme Inc."
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Link to Promote</label>
                                        <input required type="url" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-900 px-4 py-3 transition-all placeholder:text-gray-400 font-medium"
                                            value={proposal.link} onChange={e => setProposal({ ...proposal, link: e.target.value })}
                                            placeholder="https://mysite.com"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Ad Image URL</label>
                                        <div className="relative">
                                            <input required type="url" className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-900 pl-4 pr-10 py-3 transition-all placeholder:text-gray-400 font-medium"
                                                value={proposal.imageUrl} onChange={e => setProposal({ ...proposal, imageUrl: e.target.value })}
                                                placeholder="https://..."
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <ImageIcon />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium">Direct link to your banner image.</p>
                                    </div>

                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                                                    {slot.acceptOtherPrices ? "Your Offer ($)" : "Fixed Price ($)"}
                                                </label>
                                                <input
                                                    required
                                                    type="number"
                                                    min={slot.priceMin}
                                                    max="999999.99"
                                                    disabled={!slot.acceptOtherPrices}
                                                    className={`w-full rounded-xl border-gray-200 text-sm px-4 py-2.5 transition-all font-bold ${!slot.acceptOtherPrices
                                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-transparent"
                                                        : "bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-900"
                                                        }`}
                                                    value={!slot.acceptOtherPrices ? slot.priceMin : proposal.bidAmount}
                                                    onChange={e => setProposal({ ...proposal, bidAmount: e.target.value })}
                                                    placeholder={`Min $${slot.priceMin}`}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Duration (Days)</label>
                                                <input required type="number" min="1" max="365" className="w-full rounded-xl border-gray-200 bg-white text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-900 px-4 py-2.5 transition-all font-medium"
                                                    disabled={!slot.acceptOtherPrices && !!slot.duration}
                                                    value={!slot.acceptOtherPrices && slot.duration ? slot.duration : proposal.duration}
                                                    onChange={e => setProposal({ ...proposal, duration: e.target.value })}
                                                    placeholder={slot.duration ? `${slot.duration}` : "e.g. 30"}
                                                />
                                            </div>
                                        </div>
                                        {!slot.acceptOtherPrices && (
                                            <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                                                This slot has a fixed price and duration.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">Message (Optional)</label>
                                        <textarea className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-900 px-4 py-3 transition-all resize-none font-medium placeholder:text-gray-400"
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
                                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 transform active:scale-[0.98]"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : "Submit Proposal"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
                ,
                document.body
            )}
        </>
    );
};
