import { Crown, X } from "lucide-react";
import { useAuth } from "~/contexts/auth.context";

interface UpgradePromptProps {
    feature: string;
    requiredPlan?: 'standard' | 'pro';
    onClose?: () => void;
}

/**
 * Modal component that prompts users to upgrade their plan
 * to access premium features.
 */
export function UpgradePrompt({ feature, requiredPlan = 'pro', onClose }: UpgradePromptProps) {
    const { user } = useAuth();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200 border-4 border-black shadow-2xl">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-black border-2 border-transparent hover:border-black"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="w-20 h-20 bg-[#F3F3F1] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Crown className="w-10 h-10 text-black" strokeWidth={2.5} />
                </div>

                <h2 className="text-3xl font-black text-center text-[#1A1A1A] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Upgrade to {requiredPlan === 'pro' ? 'PRO' : 'Standard'}
                </h2>

                <p className="text-gray-500 text-center mb-8 font-medium text-lg leading-relaxed">
                    <span className="font-bold text-black border-b-2 border-[#C6F035]">{feature}</span> is a premium feature available for {requiredPlan === 'pro' ? 'PRO' : 'Standard'} users.
                </p>

                <div className="space-y-4">
                    <a
                        href="/pricing"
                        className="block w-full py-4 px-6 bg-[#1A1A1A] text-white rounded-full font-black text-center text-lg hover:bg-black hover:scale-105 transition-all shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        Upgrade Now
                    </a>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="block w-full py-4 px-6 bg-white border-2 border-gray-200 text-gray-500 rounded-full font-bold text-center hover:border-black hover:text-black transition-colors"
                        >
                            Maybe Later
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
