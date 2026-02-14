import React, { useState, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { createPortal } from 'react-dom';
import { Check, X, ChevronDown, Rocket, Star, ArrowRight } from "lucide-react";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";

interface UpgradePopupProps {
    isOpen: boolean;
    onClose: () => void;
    forcePlan?: 'standard' | 'pro';
}

export function UpgradePopup({ isOpen, onClose, forcePlan }: UpgradePopupProps) {
    const { user } = useContext(AuthContext);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
    const [expandedStandard, setExpandedStandard] = useState(false);

    const [expandedPro, setExpandedPro] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const currentPlan = user?.plan || 'free';

    const handleCancelSubscription = () => {
        setShowCancelConfirmation(true);
    };

    const confirmCancel = async () => {
        try {
            const token = cookies['@App:token'];
            if (!token) return;

            const response = await api.post('/stripe/cancel-subscription');

            alert("Subscription canceled. You will retain access until the end of your current period.");
            setShowCancelConfirmation(false);
            onClose();
        } catch (error: any) {
            console.error("Cancellation error:", error);
            alert(`Failed to cancel: ${error.message}`);
        }
    };

    const [cookies] = useCookies(['@App:token']);

    const handleUpgrade = async (plan: 'standard' | 'pro') => {
        try {
            const token = cookies['@App:token'];
            if (!token) {
                alert("Please log in to upgrade.");
                return;
            }

            const response = await api.post('/stripe/create-checkout-session', {
                plan,
                interval: billingCycle
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error("No checkout URL received");
            }

        } catch (error: any) {
            console.error("Upgrade error:", error);
            alert(`Upgrade failed: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                    onClick={onClose}
                />

                {/* Content Container */}
                <div
                    className="relative w-full max-w-6xl text-left transition-all my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 md:-right-4 p-3 bg-white hover:bg-gray-100 rounded-full text-black transition-colors z-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <X className="w-6 h-6" strokeWidth={2.5} />
                    </button>

                    <div className="flex flex-col items-center mb-12 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C6F035] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 animate-bounce">
                            <Rocket className="w-4 h-4 text-black" strokeWidth={2.5} />
                            <span className="text-xs font-black uppercase tracking-wider text-black">Upgrade your Plan</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white text-center mb-6 leading-tight tracking-tighter drop-shadow-md" style={{ fontFamily: 'var(--font-display)' }}>
                            Unlock Full Power
                        </h2>

                        {/* Billing Toggle */}
                        <div className="relative inline-flex bg-white border-4 border-[#1A1A1A] p-1.5 shadow-[8px_8px_0px_0px_#1A1A1A]">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`relative z-10 px-8 py-3 text-sm font-black uppercase tracking-wider transition-all duration-300 ${billingCycle === 'monthly'
                                    ? 'text-white'
                                    : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annually')}
                                className={`relative z-10 px-8 py-3 text-sm font-black uppercase tracking-wider transition-all duration-300 ${billingCycle === 'annually'
                                    ? 'text-white'
                                    : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                                    }`}
                            >
                                Annually
                            </button>

                            <div
                                className="absolute top-1.5 bottom-1.5 bg-[#1A1A1A] transition-all duration-300 ease-out"
                                style={{
                                    left: billingCycle === 'monthly' ? '6px' : 'calc(50% + 3px)',
                                    width: 'calc(50% - 9px)'
                                }}
                            />

                            <div className="absolute -right-20 top-1/2 -translate-y-1/2 hidden md:block">
                                <span className="bg-[#D2E823] text-[#1A1A1A] text-[10px] font-black px-2 py-1 border-2 border-[#1A1A1A] -rotate-12 inline-block">
                                    SAVE 25%
                                </span>
                                <ArrowRight className="w-5 h-5 text-[#1A1A1A] inline-block ml-2 -rotate-12" strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    <div className={`${forcePlan ? 'flex justify-center' : 'grid md:grid-cols-2'} gap-8 items-stretch px-4 md:px-0 max-w-5xl mx-auto w-full`}>
                        {/* Standard Card */}
                        {(!forcePlan || forcePlan === 'standard') && (
                            <div className={`relative flex flex-col h-full bg-white border-4 border-[#1A1A1A] p-8 transition-transform duration-300 hover:-translate-y-2 shadow-[8px_8px_0px_0px_#1A1A1A] ${forcePlan === 'standard' ? 'max-w-xl w-full' : ''}`}>
                                <div className="mb-8 border-b-4 border-[#1A1A1A] pb-8">
                                    <h3 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Standard</h3>
                                    <p className="text-[#1A1A1A]/70 font-medium mt-2 min-h-[40px]">For growing creators</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-6xl font-black text-[#1A1A1A] tracking-tighter">
                                            ${billingCycle === 'monthly' ? '5.50' : '4.12'}
                                        </span>
                                        <span className="text-xl font-bold text-[#1A1A1A]/50">/mo</span>
                                    </div>
                                    {billingCycle === 'annually' && (
                                        <p className="text-sm font-bold text-[#0047FF] mt-2 uppercase tracking-wide">Billed annually (save 25%)</p>
                                    )}
                                </div>

                                <div className="space-y-4 flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]/40 mb-4">Features</p>
                                    {['Create up to 2 bios', 'Branding removal', 'Custom domain', 'Email collection', '1% store fee', '150 emails/month'].map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 p-0.5 border-2 border-[#1A1A1A] bg-white">
                                                <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={4} />
                                            </div>
                                            <span className="text-sm font-bold text-[#1A1A1A] leading-tight">{feature}</span>
                                        </div>
                                    ))}

                                    {expandedStandard && (
                                        <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-4 pt-4">
                                            {['Automation (2 per bio)', 'SEO settings', 'More customizations'].map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="mt-1 p-0.5 border-2 border-[#1A1A1A] bg-white">
                                                        <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={4} />
                                                    </div>
                                                    <span className="text-sm font-medium text-[#1A1A1A]/80 leading-tight">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setExpandedStandard(!expandedStandard)}
                                        className="flex items-center gap-2 text-sm font-black underline decoration-2 underline-offset-4 hover:text-[#0047FF] transition-colors pt-4"
                                    >
                                        {expandedStandard ? 'Show less' : 'Show more features'}
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedStandard ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                <div className="mt-auto pt-8 flex flex-col gap-3">
                                    {currentPlan === 'standard' ? (
                                        <>
                                            <button disabled className="w-full py-4 text-lg font-black uppercase tracking-wider border-4 border-[#1A1A1A]/20 bg-[#F3F3F1] text-[#1A1A1A]/40 cursor-not-allowed">
                                                Current Plan
                                            </button>
                                            <button
                                                onClick={handleCancelSubscription}
                                                className="text-xs text-red-600 font-bold hover:underline py-2"
                                            >
                                                Cancel Subscription
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleUpgrade('standard')}
                                                className="w-full py-4 text-lg font-black uppercase tracking-wider border-4 border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#F3F3F1] shadow-[6px_6px_0px_0px_#1A1A1A] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1"
                                            >
                                                {currentPlan === 'pro' ? 'Downgrade to Standard' : 'Start 7-Day Free Trial'}
                                            </button>
                                            {currentPlan !== 'pro' && (
                                                <p className="text-[11px] text-gray-500 font-bold text-center">
                                                    Automatic billing after 7 days. Cancel anytime. We’ll remind you 1 day before billing.
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pro Card */}
                        {(!forcePlan || forcePlan === 'pro') && (
                            <div className={`relative flex flex-col h-full bg-white border-4 border-[#1A1A1A] p-8 transition-transform duration-300 hover:-translate-y-2 shadow-[12px_12px_0px_0px_#D2E823] ${forcePlan === 'pro' ? 'max-w-xl w-full' : ''}`}>
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#D2E823] text-[#1A1A1A] text-sm font-black uppercase tracking-widest py-2 px-6 border-4 border-[#1A1A1A] flex items-center gap-2 whitespace-nowrap z-10">
                                    <Star className="w-4 h-4 fill-[#1A1A1A]" />
                                    MOST POPULAR
                                </div>

                                <div className="mb-8 border-b-4 border-[#1A1A1A] pb-8 pt-6">
                                    <h3 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Pro</h3>
                                    <p className="text-[#1A1A1A]/70 font-medium mt-2 min-h-[40px]">For pro business</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-6xl font-black text-[#1A1A1A] tracking-tighter">
                                            ${billingCycle === 'monthly' ? '15' : '11.25'}
                                        </span>
                                        <span className="text-xl font-bold text-[#1A1A1A]/50">/mo</span>
                                    </div>
                                    {billingCycle === 'annually' && (
                                        <p className="text-sm font-bold text-[#0047FF] mt-2 uppercase tracking-wide">Billed annually (save 25%)</p>
                                    )}
                                </div>

                                <div className="space-y-4 flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]/40 mb-4">Features</p>
                                    {['Everything in Standard', 'Create up to 5 bios', 'Scheduler', 'Automation (4 per bio)', 'Email templates (4 per bio)', '0% store fee', '500 emails/month', 'Advanced Analytics'].map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 p-0.5 border-2 border-[#1A1A1A] bg-[#D2E823]">
                                                <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={4} />
                                            </div>
                                            <span className="text-sm font-bold text-[#1A1A1A] leading-tight">{feature}</span>
                                        </div>
                                    ))}

                                    {expandedPro && (
                                        <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-4 pt-4">
                                            {['Prioritary Support', 'Unlimited Custom Domains'].map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="mt-1 p-0.5 border-2 border-[#1A1A1A] bg-[#D2E823]">
                                                        <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={4} />
                                                    </div>
                                                    <span className="text-sm font-medium text-[#1A1A1A]/80 leading-tight">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setExpandedPro(!expandedPro)}
                                        className="flex items-center gap-2 text-sm font-black underline decoration-2 underline-offset-4 hover:text-[#0047FF] transition-colors pt-4"
                                    >
                                        {expandedPro ? 'Show less' : 'Show more features'}
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedPro ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                <div className="mt-auto pt-8 flex flex-col gap-3">
                                    {currentPlan === 'pro' ? (
                                        <>
                                            <button disabled className="w-full py-4 text-lg font-black uppercase tracking-wider border-4 border-[#1A1A1A]/20 bg-[#F3F3F1] text-[#1A1A1A]/40 cursor-not-allowed">
                                                Current Plan
                                            </button>
                                            <button
                                                onClick={handleCancelSubscription}
                                                className="text-xs text-red-600 font-bold hover:underline py-2"
                                            >
                                                Cancel Subscription
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade('pro')}
                                            className="w-full py-4 text-lg font-black uppercase tracking-wider border-4 border-[#1A1A1A] bg-[#1A1A1A] text-[#D2E823] shadow-[6px_6px_0px_0px_#D2E823] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1"
                                        >
                                            Upgrade to Pro
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cancel Confirmation Modal */}
                {showCancelConfirmation && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md rounded-[1.5rem]">
                        <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 border-4 border-black text-center">
                            <h3 className="text-2xl font-black text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>Cancel Subscription?</h3>
                            <p className="text-gray-500 font-medium text-sm mb-6 leading-relaxed">
                                Are you sure you want to cancel? You will lose access to premium features at the end of your billing cycle.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirmation(false)}
                                    className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-full hover:border-black hover:text-black transition-colors"
                                >
                                    Keep Plan
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-black rounded-full hover:bg-red-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    Confirm Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
