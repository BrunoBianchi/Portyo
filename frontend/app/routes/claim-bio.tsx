import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { AuthBackground } from "~/components/shared/auth-background";
import AuthContext from "~/contexts/auth.context";
import i18n from "~/i18n";
import { api } from "~/services/api";

type ClaimBioState = {
    suggestedSufix?: string;
};

const normalizeSufix = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/\./g, "-")
        .replace(/[^a-z0-9-_]/g, "");

export function meta({ params }: { params: { lang?: string } }) {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [{ title: i18n.t("auth.claimBio.metaTitle", { lng: lang }) }];
}

export default function ClaimBio() {
    const { user, loading, refreshUser, logout } = useContext(AuthContext);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
    const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

    const state = (location.state || {}) as ClaimBioState;
    const defaultSuggestion = useMemo(() => {
        if (state.suggestedSufix) return normalizeSufix(state.suggestedSufix);
        if (user?.email) return normalizeSufix(user.email.split("@")[0] || "");
        if (user?.fullname) return normalizeSufix(user.fullname);
        return "";
    }, [state.suggestedSufix, user?.email, user?.fullname]);

    const [bioSufix, setBioSufix] = useState(defaultSuggestion);
    const [bioError, setBioError] = useState<string | null>(null);
    const [bioLoading, setBioLoading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate(withLang("/login"));
            return;
        }

        if (!loading && user?.onboardingCompleted) {
            navigate(withLang("/dashboard"));
            return;
        }

        if (!loading && user && (user.sufix || (user.usage?.bios ?? 0) > 0)) {
            navigate(withLang("/onboarding"));
        }
    }, [loading, user, navigate]);

    useEffect(() => {
        if (!bioSufix && defaultSuggestion) {
            setBioSufix(defaultSuggestion);
        }
    }, [defaultSuggestion, bioSufix]);

    const handleCreateBio = async () => {
        if (!bioSufix.trim()) return;
        setBioLoading(true);
        setBioError(null);
        try {
            await api.post("/bio", { sufix: normalizeSufix(bioSufix) });
            const updatedUser = await refreshUser();
            const isVerified = updatedUser?.verified ?? user?.verified;
            if (!isVerified) {
                navigate(withLang("/verify-email"));
            } else {
                navigate(withLang("/onboarding"));
            }
        } catch (err: any) {
            console.error("Failed to create bio", err);
            setBioError(err.response?.data?.message || t("auth.claimBio.createError"));
        } finally {
            setBioLoading(false);
        }
    };

    if (loading || !user) return null;

    return (
        <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
            <AuthBackground />
            <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                <div className="bg-surface w-full max-w-[620px] rounded-[2.5rem] shadow-2xl border border-white/60 p-10 sm:p-12 text-center">
                    <h1 className="text-3xl font-bold text-[#1F1F1F]">{t("auth.claimBio.title")}</h1>
                    <p className="mt-2 text-base text-[#7A7A7A]">{t("auth.claimBio.subtitle")}</p>

                    <div className="mt-8 rounded-[1.5rem] border border-[#E8E1D9] bg-white/80 px-6 py-5 text-lg font-semibold text-[#1F1F1F] shadow-sm">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                            <span className="text-[#9A9A9A]">portyo.me/p/</span>
                            <input
                                value={bioSufix}
                                onChange={(e) => setBioSufix(e.target.value)}
                                className="bg-transparent text-[#1F1F1F] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-lg font-semibold min-w-[4ch] text-left"
                                autoFocus
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-[#8C8C8C]">
                        {t("auth.claimBio.urlHint")}
                    </p>

                    {bioError && (
                        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {bioError}
                        </div>
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            type="button"
                            onClick={async () => {
                                await logout();
                                navigate(withLang("/sign-up"));
                            }}
                            className="w-full sm:w-40 rounded-full border border-[#E8E1D9] bg-white px-6 py-3 text-base font-semibold text-[#1F1F1F] shadow-sm hover:bg-[#F3EFE9]"
                        >
                            {t("auth.claimBio.back")}
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateBio}
                            disabled={!bioSufix.trim() || bioLoading}
                            className="w-full sm:w-48 rounded-full bg-[#CBEA1A] px-6 py-3 text-base font-semibold text-[#1F1F1F] shadow-lg hover:bg-[#BADD18] disabled:opacity-60"
                        >
                            {bioLoading ? t("auth.claimBio.creating") : t("auth.claimBio.createAccount")}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
