import { useState, useCallback } from "react";

export const useUpgradePopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [forcedPlan, setForcedPlan] = useState<'standard' | 'pro' | undefined>(undefined);

    const showProFeaturePopup = useCallback(() => {
        setForcedPlan('pro');
        setIsOpen(true);
    }, []);

    const showStandardFeaturePopup = useCallback(() => {
        setForcedPlan('standard');
        setIsOpen(true);
    }, []);

    const closePopup = useCallback(() => {
        setIsOpen(false);
        setForcedPlan(undefined);
    }, []);

    return {
        isOpen,
        forcedPlan,
        showProFeaturePopup,
        showStandardFeaturePopup,
        closePopup,
        setIsOpen,
        setForcedPlan,
    };
};
