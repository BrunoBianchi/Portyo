import React, { useState, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { createPortal } from 'react-dom';
import { Check, X, ChevronDown, Rocket } from "lucide-react";
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
                    className="relative w-full max-w-5xl text-left transition-all my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 md:-right-4 p-3 bg-white hover:bg-gray-100 rounded-full text-black transition-colors z-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <X className="w-6 h-6" strokeWidth={2.5} />
                    </button>

                    <div className="flex flex-col items-center mb-10 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C6F035] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 animate-bounce">
                            <Rocket className="w-4 h-4 text-black" strokeWidth={2.5} />
                            <span className="text-xs font-black uppercase tracking-wider text-black">Upgrade your Plan</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-6 leading-tight drop-shadow-md" style={{ fontFamily: 'var(--font-display)' }}>
                            Unlock Full Power
                        </h2>

                        {/* Billing Toggle */}
                        <div className="bg-white p-1.5 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black inline-flex relative z-20">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-black transition-all duration-300 ${billingCycle === 'monthly'
                                    ? 'bg-black text-white'
                                    : 'text-gray-500 hover:text-black'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annually')}
                                className={`px-6 py-2 rounded-full text-sm font-black transition-all duration-300 flex items-center gap-2 ${billingCycle === 'annually'
                                    ? 'bg-[#C6F035] text-black border-2 border-black shadow-sm'
                                    : 'text-gray-500 hover:text-black'
                                    }`}
                            >
                                Annually <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded ml-1">-25%</span>
                            </button>
                        </div>
                    </div>

                    <div className={`${forcePlan ? 'flex justify-center' : 'grid md:grid-cols-2'} gap-8 items-stretch px-4 md:px-0 max-w-4xl mx-auto w-full`}>
                        {/* Standard Card */}
                        {(!forcePlan || forcePlan === 'standard') && (
                            <div className={`bg-white rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 relative border-4 border-black hover:-translate-y-2 transition-transform duration-300 ${forcePlan === 'standard' ? 'max-w-md w-full' : ''}`}>
                                <div className="absolute top-0 right-8 -translate-y-1/2">
                                    <span className="bg-[#C6F035] text-black border-2 border-black text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Recommended</span>
                                </div>

                                <div className="text-center mt-2">
                                    <h3 className="text-3xl font-black text-black tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Standard</h3>
                                    <p className="text-gray-500 text-sm mt-1 font-bold">For growing creators</p>
                                </div>
                                <div className="text-center py-4 border-y-2 border-dashed border-gray-200">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-6xl font-black text-black tracking-tighter">
                                            ${billingCycle === 'monthly' ? '5.50' : '4.12'}
                                        </span>
                                        <span className="text-gray-400 text-base font-bold uppercase tracking-wide">/mo</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold mt-1">Billed ${billingCycle === 'monthly' ? '5.50' : '49.00'} {billingCycle}</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {['Create up to 2 bios', 'Branding removal', 'Custom domain', 'Email collection', '1% store fee', '150 emails/month'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                            </div>
                                            <span className="text-black text-sm font-bold">{feature}</span>
                                        </div>
                                    ))}

                                    {expandedStandard && (
                                        <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-3 pt-3">
                                            {['Automation (2 per bio)', 'SEO settings', 'More customizations'].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                                    </div>
                                                    <span className="text-black text-sm font-bold">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setExpandedStandard(!expandedStandard)}
                                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-black text-xs font-black uppercase tracking-wider transition-colors mt-2"
                                    >
                                        {expandedStandard ? 'Show less' : 'Show all features'}
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedStandard ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                <div className="mt-auto pt-4 flex flex-col gap-3">
                                    {currentPlan === 'standard' ? (
                                        <>
                                            <button disabled className="w-full bg-gray-100 border-2 border-gray-200 text-gray-400 font-black py-4 px-6 rounded-full cursor-not-allowed text-lg">
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
                                            onClick={() => handleUpgrade('standard')}
                                            className="w-full bg-[#1A1A1A] text-white hover:bg-black font-black py-4 px-6 rounded-full transition-all cursor-pointer text-lg shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                                        >
                                            {currentPlan === 'pro' ? 'Downgrade to Standard' : 'Start 7-Day Free Trial'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pro Card */}
                        {(!forcePlan || forcePlan === 'pro') && (
                            <div className={`bg-white rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 relative border-4 border-black hover:-translate-y-2 transition-transform duration-300 ${forcePlan === 'pro' ? 'max-w-md w-full' : ''}`}>
                                <div className="text-center mt-2">
                                    <h3 className="text-3xl font-black text-black tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>Pro</h3>
                                    <p className="text-gray-500 text-sm mt-1 font-bold">For serious business</p>
                                </div>
                                <div className="text-center py-4 border-y-2 border-dashed border-gray-200">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-6xl font-black text-black tracking-tighter">
                                            ${billingCycle === 'monthly' ? '15' : '11.25'}
                                        </span>
                                        <span className="text-gray-400 text-base font-bold uppercase tracking-wide">/mo</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold mt-1">Billed ${billingCycle === 'monthly' ? '15.00' : '135.00'} {billingCycle}</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {['Everything in Standard', 'Create up to 5 bios', 'Scheduler', 'Automation (4 per bio)', 'Email templates (4 per bio)', '0% store fee', '500 emails/month', 'Advanced Analytics'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#C6F035] border border-black flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                                            </div>
                                            <span className="text-black text-sm font-bold">{feature}</span>
                                        </div>
                                    ))}

                                    {expandedPro && (
                                        <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-3 pt-3">
                                            {['Prioritary Support', 'Unlimited Custom Domains'].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#C6F035] border border-black flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                                                    </div>
                                                    <span className="text-black text-sm font-bold">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setExpandedPro(!expandedPro)}
                                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-black text-xs font-black uppercase tracking-wider transition-colors mt-2"
                                    >
                                        {expandedPro ? 'Show less' : 'Show all features'}
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedPro ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                <div className="mt-auto pt-4 flex flex-col gap-3">
                                    {currentPlan === 'pro' ? (
                                        <>
                                            <button disabled className="w-full bg-gray-100 border-2 border-gray-200 text-gray-400 font-black py-4 px-6 rounded-full cursor-not-allowed text-lg">
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
                                            className="w-full bg-[#C6F035] text-black border-2 border-black hover:bg-[#d4f568] font-black py-4 px-6 rounded-full transition-all cursor-pointer text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
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
