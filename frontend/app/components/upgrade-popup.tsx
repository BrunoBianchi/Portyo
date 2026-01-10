import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, ChevronDown } from "lucide-react";

interface UpgradePopupProps {
    isOpen: boolean;
    onClose: () => void;
    forcePlan?: 'standard' | 'pro';
}

export function UpgradePopup({ isOpen, onClose, forcePlan }: UpgradePopupProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
    const [expandedStandard, setExpandedStandard] = useState(false);
    const [expandedPro, setExpandedPro] = useState(false);

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
                                            ${billingCycle === 'monthly' ? '10' : '7.50'}
                                        </span>
                                        <span className="text-black/60 text-sm font-bold">/mo</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {['Create up to 3 bios', 'Branding removal', 'Custom domain', 'Scheduler', 'Email collection', '0% store fee'].map((feature, i) => (
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

                                <div className="mt-auto pt-4">
                                    <button className="w-full bg-black text-white hover:bg-gray-900 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-base">
                                        Start 7-Day Free Trial
                                    </button>
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
                                            ${billingCycle === 'monthly' ? '25' : '18.75'}
                                        </span>
                                        <span className="text-gray-400 text-sm font-bold">/mo</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {['Everything in Standard', 'Create up to 6 bios', 'Automation (4 per bio)', 'Email templates (4 per bio)', 'Advanced Analytics'].map((feature, i) => (
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

                                <div className="mt-auto pt-4">
                                    <button className="w-full bg-[#0f172a] text-white hover:bg-black font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-base">
                                        Upgrade to Pro
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
