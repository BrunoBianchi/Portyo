import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { UpgradePopup } from "~/components/shared/upgrade-popup";
import { useAuth } from "~/contexts/auth.context";

const SESSION_KEY = "portyo:random-upsell:shown";
const COOLDOWN_KEY = "portyo:random-upsell:next-at";
const COOLDOWN_MS = 4 * 60 * 60 * 1000;

type PopupPlan = "standard" | "pro" | undefined;

function getRandomPlan(userPlan: "free" | "standard" | "pro" | undefined): PopupPlan {
    if (userPlan === "pro") return undefined;
    if (userPlan === "standard") return "pro";

    const options: PopupPlan[] = [undefined, "standard", "pro"];
    return options[Math.floor(Math.random() * options.length)];
}

export function RandomUpsellPopup() {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [forcePlan, setForcePlan] = useState<PopupPlan>(undefined);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (loading || !user) return;
        if (user.plan === "pro") return;
        if (!location.pathname.includes("/dashboard")) return;

        const alreadyShownThisSession = window.sessionStorage.getItem(SESSION_KEY);
        if (alreadyShownThisSession) return;

        const nextAt = Number(window.localStorage.getItem(COOLDOWN_KEY) || "0");
        if (nextAt > Date.now()) return;

        const shouldShow = Math.random() < 0.55;
        if (!shouldShow) return;

        const delayMs = 6000 + Math.floor(Math.random() * 6000);
        const selectedPlan = getRandomPlan(user.plan);

        const timer = window.setTimeout(() => {
            setForcePlan(selectedPlan);
            setIsOpen(true);
            window.sessionStorage.setItem(SESSION_KEY, "1");
            window.localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));
        }, delayMs);

        return () => window.clearTimeout(timer);
    }, [loading, user, location.pathname]);

    return (
        <UpgradePopup
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            forcePlan={forcePlan}
        />
    );
}
