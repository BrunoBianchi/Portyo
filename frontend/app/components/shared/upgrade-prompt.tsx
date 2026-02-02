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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-card rounded-2xl max-w-md w-full p-8 relative animate-in fade-in duration-200">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-muted-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-center text-foreground mb-2">
                    Upgrade to {requiredPlan === 'pro' ? 'PRO' : 'Standard'}
                </h2>

                <p className="text-muted-foreground text-center mb-6">
                    <span className="font-semibold">{feature}</span> is a premium feature available for {requiredPlan === 'pro' ? 'PRO' : 'Standard'} users.
                </p>

                <div className="space-y-3">
                    <a
                        href="/pricing"
                        className="block w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-center hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
                    >
                        Upgrade Now
                    </a>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="block w-full py-3 px-4 bg-muted text-gray-700 rounded-xl font-medium text-center hover:bg-gray-200 transition-colors"
                        >
                            Maybe Later
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
