import type { Route } from "./+types/sign-up";
import { Link, useLocation, useNavigate } from "react-router";
import { useContext, useMemo, useState } from "react";
import { AuthBackground } from "~/components/shared/auth-background";
import AuthContext from "~/contexts/auth.context";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import { api } from "~/services/api";

export function meta({ params }: Route.MetaArgs) {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [{ title: i18n.t("meta.signUp.title", { lng: lang }) }];
}

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTranslation();
    const location = useLocation();
    const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
    const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bioSufix, setBioSufix] = useState("");
    const [showBioModal, setShowBioModal] = useState(false);
    const [bioError, setBioError] = useState<string | null>(null);
    const [bioLoading, setBioLoading] = useState(false);
    const navigate = useNavigate()
    const { register, socialLogin, logout, user } = useContext(AuthContext);

    const suggestedSufix = useMemo(() => {
        if (!email) return "";
        const raw = email.split("@")[0] || "";
        return raw.replace(/\./g, "-").replace(/\s+/g, "-").toLowerCase();
    }, [email]);

    const hasUppercase = /[A-Z]/.test(password);
    const hasMinLength = password.length >= 8;
    const hasFullName = username.trim().length > 0;

    const isPasswordValid = hasUppercase && hasMinLength;
    const isFormValid = hasFullName && isPasswordValid && email.length > 0;

    const CheckIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4"><path d="M20 6 9 17l-5-5" /></svg>
    );

    const CircleIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle w-4 h-4"><circle cx="12" cy="12" r="10" /></svg>
    );


    const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await register(email, password, username);
            setBioSufix(suggestedSufix || username.replace(/\s+/g, "-").toLowerCase());
            setShowBioModal(true);
        } catch (e) {
            console.error("Registration failed", e);
            alert(t("auth.signup.createError"));
        }
    };

    const handleCreateBio = async () => {
        if (!bioSufix.trim()) return;
        setBioLoading(true);
        setBioError(null);
        try {
            await api.post("/bio", { sufix: bioSufix.trim() });
            if (!user?.verified) {
                navigate(withLang("/verify-email"));
            } else {
                navigate(withLang("/onboarding"));
            }
        } catch (err: any) {
            console.error("Failed to create bio", err);
            setBioError(err.response?.data?.message || t("auth.signup.createError"));
        } finally {
            setBioLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            "https://api.portyo.me/api/google/auth",
            "Google Login",
            `width=${width},height=${height},left=${left},top=${top}`
        );

        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== "https://api.portyo.me" && event.origin !== "http://localhost:3000") return;

            const data = event.data;
            if (data.token && data.user) {
                socialLogin(data.user, data.token);
                if (!data.user.onboardingCompleted) {
                    const hasBio = !!data.user.sufix || (data.user.usage?.bios ?? 0) > 0;
                    navigate(withLang(hasBio ? "/onboarding" : "/claim-bio"));
                } else {
                    navigate(withLang("/dashboard"));
                }
            }
            popup?.close();
            window.removeEventListener("message", handleMessage);
        };

        window.addEventListener("message", handleMessage);
    };

    return (
        <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
            <AuthBackground />
            <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                <div className="bg-surface w-full max-w-[480px] rounded-[2rem] shadow-xl p-8 md:p-10 relative border border-border">

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-3">
                            {t("auth.signup.titleStep1")}
                        </h1>
                        <p className="text-text-muted text-sm px-4">
                            {t("auth.signup.subtitleStep1")}
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleContinue}>
                        <>
                            <div>
                                <input
                                    type="text"
                                    value={username}
                                    placeholder={t("auth.signup.fullNamePlaceholder")}
                                    autoComplete="name"
                                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                                    required
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("auth.signup.emailPlaceholder")}
                                    autoComplete="email"
                                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("auth.signup.passwordPlaceholder")}
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-main hover:text-primary transition-colors"
                                >
                                    {showPassword ? t("auth.signup.hide") : t("auth.signup.show")}
                                </button>
                            </div>
                            <div className="mt-2 text-xs">
                                <p className="text-text-muted mb-2 font-medium">{t("auth.signup.requirementsTitle")}</p>
                                <ul className="space-y-1.5 pl-1">
                                    <li className={`flex items-center gap-2 ${hasFullName ? 'text-green-400' : 'text-text-muted'}`}>
                                        {hasFullName ? <CheckIcon /> : <CircleIcon />}
                                        <span>{t("auth.signup.requirements.fullName")}</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${hasUppercase ? 'text-green-400' : 'text-text-muted'}`}>
                                        {hasUppercase ? <CheckIcon /> : <CircleIcon />}
                                        <span>{t("auth.signup.requirements.uppercase")}</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-400' : 'text-text-muted'}`}>
                                        {hasMinLength ? <CheckIcon /> : <CircleIcon />}
                                        <span>{t("auth.signup.requirements.length")}</span>
                                    </li>
                                </ul>
                            </div>
                        </>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t("auth.signup.submit")}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <span className="relative bg-surface px-3 text-xs text-text-main font-semibold uppercase tracking-wider">{t("auth.signup.or")}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group"
                            >
                                <span className="font-bold text-lg group-hover:scale-110 transition-transform">G</span> <span className="ml-2 text-xs font-bold hidden sm:inline">{t("auth.signup.google")}</span>
                            </button>
                            <button className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group">
                                <span className="font-bold text-lg group-hover:scale-110 transition-transform"></span> <span className="ml-2 text-xs font-bold hidden sm:inline">{t("auth.signup.apple")}</span>
                            </button>
                            <button className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group">
                                <span className="font-bold text-lg group-hover:scale-110 transition-transform">f</span> <span className="ml-2 text-xs font-bold hidden sm:inline">{t("auth.signup.facebook")}</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-text-muted font-medium">
                            <>{t("auth.signup.haveAccount")} <Link to={withLang("/login")} className="font-bold text-text-main hover:underline ml-1">{t("auth.signup.signIn")}</Link></>
                        </p>
                    </div>
                </div>
            </main>

            {showBioModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
                    <div className="w-full max-w-[620px] rounded-[2.5rem] bg-[#FBF7F1] shadow-2xl border border-white/60 p-10 sm:p-12 text-center">
                        <h2 className="text-3xl font-bold text-[#1F1F1F]">Escolha seu usuário</h2>
                        <p className="mt-2 text-base text-[#7A7A7A]">Garanta seu espaço único no Portyo</p>

                        <div className="mt-8 rounded-[1.5rem] border border-[#E8E1D9] bg-white/80 px-6 py-5 text-lg font-semibold text-[#1F1F1F] shadow-sm">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                <span className="text-[#9A9A9A]">portyo.me/p/</span>
                                <input
                                    value={bioSufix}
                                    onChange={(e) => setBioSufix(e.target.value)}
                                    className="bg-transparent text-[#1F1F1F] outline-none text-lg font-semibold min-w-[4ch] text-left"
                                    autoFocus
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-[#8C8C8C]">
                            Este será o URL do seu perfil público. Você não poderá alterá-lo depois!
                        </p>

                        {bioError && (
                            <div className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {bioError}
                            </div>
                        )}

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowBioModal(false);
                                    logout();
                                }}
                                className="w-full sm:w-40 rounded-full border border-border bg-surface-card px-6 py-3 text-base font-semibold text-foreground shadow-sm hover:bg-muted"
                            >
                                Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateBio}
                                disabled={!bioSufix.trim() || bioLoading}
                                className="w-full sm:w-48 rounded-full bg-[#CBEA1A] px-6 py-3 text-base font-semibold text-[#1F1F1F] shadow-lg hover:bg-[#BADD18] disabled:opacity-60"
                            >
                                {bioLoading ? "Criando..." : "Criar conta"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
