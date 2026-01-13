import React, { useState, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { createPortal } from 'react-dom';
import { Check, X, ChevronDown } from "lucide-react";
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
            /* 
            // Previous fetch implementation for reference:
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/cancel-subscription`, { ... });
            */

            // Axios throws on non-2xx, so we don't need manual ok check
            // but we might want to handle data structure if needed. 
            // However, the api service interceptor likely handles token.

            /* No data needed from response for success alert */

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
                {/* Backdrop - Clicking here closes the modal */}
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                    onClick={onClose}
                />

                {/* Content Container - Clicking here DOES NOT close the modal */}
                <div
                    className="relative w-full max-w-4xl text-left transition-all my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 md:-right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors z-50"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center mb-6 relative z-10">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-4 drop-shadow-sm font-sans tracking-tight">Unlock Full Power</h2>
                        {/* Billing Toggle */}
                        <div className="bg-white p-1 rounded-full shadow-lg inline-flex relative z-20 scale-90">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${billingCycle === 'monthly'
                                    ? 'bg-transparent text-gray-900'
                                    : 'text-gray-400 hover:text-gray-900'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annually')}
                                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${billingCycle === 'annually'
                                    ? 'bg-[#0f172a] text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-900'
                                    }`}
                            >
                                Annually (-25%)
                            </button>
                        </div>
                    </div>

                    <div className={`${forcePlan ? 'flex justify-center' : 'grid md:grid-cols-2'} gap-4 items-stretch px-4 md:px-0 max-w-4xl mx-auto w-full`}>
                        {/* Standard Card */}
                        {(!forcePlan || forcePlan === 'standard') && (
                            <div className={`bg-[#d0f224] rounded-[1.5rem] p-6 shadow-xl flex flex-col gap-4 relative border-4 border-transparent hover:scale-[1.01] transition-transform duration-300 ${forcePlan === 'standard' ? 'max-w-md w-full' : ''}`}>
                                <div className="absolute top-0 left-0">
                                    <span className="bg-black text-white text-[9px] font-bold px-3 py-1 rounded-br-xl rounded-tl-[1.2rem] uppercase tracking-wider shadow-md">Recommended</span>
                                </div>

                                <div className="text-center mt-3">
                                    <h3 className="text-2xl font-extrabold text-black tracking-tight">Standard</h3>
                                    <p className="text-black/70 text-xs mt-1 font-medium">For growing creators</p>
                                </div>
                                <div className="text-center py-1">
                                    <div className="flex items-baseline justify-center gap-0.5">
                                        <span className="text-5xl font-extrabold text-black tracking-tighter">
                                            ${billingCycle === 'monthly' ? '5.50' : '4.12'}
                                        </span>
                                        <span className="text-black/60 text-sm font-bold">/mo</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {['Create up to 2 bios', 'Branding removal', 'Custom domain', 'Email collection', '1% store fee', '150 emails/month'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <div className="p-0.5 rounded-full bg-black/10">
                                                <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                            </div>
                                            <span className="text-black text-[13px] font-bold">{feature}</span>
                                        </div>
                                    ))}

                                    {expandedStandard && (
                                        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                            {['Automation (2 per bio)', 'SEO settings', 'More customizations'].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2.5 mb-2">
                                                    <div className="p-0.5 rounded-full bg-black/10">
                                                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                                    </div>
                                                    <span className="text-black text-[13px] font-bold">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setExpandedStandard(!expandedStandard)}
                                        className="flex items-center gap-1 text-black/60 hover:text-black text-xs font-bold transition-colors mt-1"
                                    >
                                        {expandedStandard ? 'Show less' : 'Show more'}
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedStandard ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                <div className="mt-auto pt-4 flex flex-col gap-3">
                                    {currentPlan === 'standard' ? (
                                        <>
                                            <button disabled className="w-full bg-black/5 text-black font-bold py-3 px-4 rounded-xl cursor-default text-base">
                                                Current Plan
                                            </button>
                                            <button
                                                onClick={handleCancelSubscription}
                                                className="text-xs text-red-600 font-bold hover:underline"
                                            >
                                                Cancel Subscription
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade('standard')}
                                            className="w-full bg-black text-white hover:bg-gray-900 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-base"
                                        >
                                            {currentPlan === 'pro' ? 'Downgrade to Standard' : 'Start 7-Day Free Trial'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pro Card */}
                        {(!forcePlan || forcePlan === 'pro') && (
                            <div className={`bg-white rounded-[1.5rem] p-6 shadow-2xl flex flex-col gap-4 relative hover:scale-[1.01] transition-transform duration-300 ${forcePlan === 'pro' ? 'max-w-md w-full' : ''}`}>
                                <div className="text-center mt-3">
                                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pro</h3>
                                    <p className="text-gray-500 text-xs mt-1 font-medium">For serious business</p>
                                </div>
                                <div className="text-center py-1">
                                    <div className="flex items-baseline justify-center gap-0.5">
                                        <span className="text-5xl font-extrabold text-gray-900 tracking-tighter">
                                            ${billingCycle === 'monthly' ? '15' : '11.25'}
                                        </span>
                                        <span className="text-gray-400 text-sm font-bold">/mo</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {['Everything in Standard', 'Create up to 5 bios', 'Scheduler', 'Automation (4 per bio)', 'Email templates (4 per bio)', '0% store fee', '500 emails/month', 'Advanced Analytics'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <div className="p-0.5 rounded-full bg-[#d0f224]/30">
                                                <Check className="w-3 h-3 text-[#a3c20e]" strokeWidth={3} />
                                            </div>
                                            <span className="text-gray-600 text-[13px] font-medium">{feature}</span>
                                        </div>
                                    ))}

                                    {expandedPro && (
                                        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                            {['Prioritary Support', 'Unlimited Custom Domains'].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2.5 mb-2">
                                                    <div className="p-0.5 rounded-full bg-[#d0f224]/30">
                                                        <Check className="w-3 h-3 text-[#a3c20e]" strokeWidth={3} />
                                                    </div>
                                                    <span className="text-gray-600 text-[13px] font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setExpandedPro(!expandedPro)}
                                        className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors mt-1"
                                    >
                                        {expandedPro ? 'Show less' : 'Show more'}
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedPro ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                <div className="mt-auto pt-4 flex flex-col gap-3">
                                    {currentPlan === 'pro' ? (
                                        <>
                                            <button disabled className="w-full bg-gray-100 text-gray-500 font-bold py-3 px-4 rounded-xl cursor-default text-base">
                                                Current Plan
                                            </button>
                                            <button
                                                onClick={handleCancelSubscription}
                                                className="text-xs text-red-600 font-bold hover:underline"
                                            >
                                                Cancel Subscription
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade('pro')}
                                            className="w-full bg-[#0f172a] text-white hover:bg-black font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-base"
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
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm rounded-[1.5rem]">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Subscription?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to cancel? You will lose access to premium features at the end of your billing cycle.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirmation(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Keep Plan
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
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
