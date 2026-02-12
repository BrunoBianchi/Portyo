import type { Route } from "./+types/sign-up";
import { Link, useLocation, useNavigate } from "react-router";
import { useContext, useState } from "react";
import { AuthBackground } from "~/components/shared/auth-background";
import AuthContext from "~/contexts/auth.context";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import { AuthLayoutBold } from "~/components/auth/auth-layout-bold";

export function meta({ params }: Route.MetaArgs) {
    const lang = params?.lang === "pt" ? "pt" : "en";
    const title = i18n.t("meta.signUp.title", { lng: lang, defaultValue: lang === "pt" ? "Criar Conta | Portyo" : "Sign Up | Portyo" });
    const description = lang === "pt"
        ? "Crie sua conta gratuita no Portyo. Comece a criar sua bio page profissional e monetize seu público."
        : "Create your free Portyo account. Start building your professional bio page and monetize your audience.";
    return [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, follow" },
    ];
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
    const [signupError, setSignupError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate()
    const { register, socialLogin, logout, user } = useContext(AuthContext);

    const hasUppercase = /[A-Z]/.test(password);
    const hasMinLength = password.length >= 8;
    const hasFullName = username.trim().length > 0;

    const isPasswordValid = hasUppercase && hasMinLength;
    const isFormValid = hasFullName && isPasswordValid && email.length > 0;

    const CheckIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 6 9 17l-5-5" /></svg>
    );

    const CircleIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /></svg>
    );


    const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        setSignupError(null);
        setIsSubmitting(true);
        try {
            // Register and auto-create bio with suggested sufix
            const suggestedSufix = email.split("@")[0]?.replace(/\./g, "-").replace(/\s+/g, "-").toLowerCase()
                || username.replace(/\s+/g, "-").toLowerCase();
            await register(email, password, username, suggestedSufix);

            // Navigate to email verification before onboarding
            navigate(withLang("/verify-email"));
        } catch (e: any) {
            console.error("Registration failed", e);
            const message = e?.response?.data?.message || e?.response?.data?.error || t("auth.signup.createError");
            setSignupError(message);
        } finally {
            setIsSubmitting(false);
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
        <AuthLayoutBold
            title={t("auth.signup.titleStep1", "Crie sua Portyo")}
            subtitle={t("auth.signup.subtitleStep1", "Comece grátis, sem cartão de crédito.")}
        >
            <form className="space-y-6" onSubmit={handleContinue}>
                {signupError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                        <p className="text-sm text-red-600 font-medium">{signupError}</p>
                    </div>
                )}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2 pl-1">
                            {t("auth.signup.fullNamePlaceholder", "Nome de usuário")}
                        </label>
                        <input
                            type="text"
                            value={username}
                            placeholder="ex: portyo"
                            autoComplete="username"
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-6 py-4 rounded-xl bg-[#F3F3F1] border-2 border-transparent focus:bg-white focus:border-[#1A1A1A] outline-none transition-all font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2 pl-1">
                            {t("auth.signup.emailPlaceholder", "Email")}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ex: bruno@portyo.me"
                            autoComplete="email"
                            className="w-full px-6 py-4 rounded-xl bg-[#F3F3F1] border-2 border-transparent focus:bg-white focus:border-[#1A1A1A] outline-none transition-all font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2 pl-1">
                            {t("auth.signup.passwordPlaceholder", "Senha")}
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            autoComplete="new-password"
                            className="w-full px-6 py-4 rounded-xl bg-[#F3F3F1] border-2 border-transparent focus:bg-white focus:border-[#1A1A1A] outline-none transition-all font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[3.2rem] text-sm font-bold text-[#1A1A1A] hover:opacity-70 transition-opacity"
                        >
                            {showPassword ? t("auth.signup.hide") : t("auth.signup.show")}
                        </button>
                    </div>

                    <div className="pt-2 pl-1">
                        <p className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wider mb-3">Requisitos da senha:</p>
                        <ul className="space-y-2">
                            <li className={`flex items-center gap-2 text-sm font-bold transition-colors ${hasFullName ? 'text-[#022C22]' : 'text-[#1A1A1A]/30'}`}>
                                {hasFullName ? <CheckIcon /> : <CircleIcon />}
                                <span>{t("auth.signup.requirements.fullName", "Nome de usuário preenchido")}</span>
                            </li>
                            <li className={`flex items-center gap-2 text-sm font-bold transition-colors ${hasUppercase ? 'text-[#022C22]' : 'text-[#1A1A1A]/30'}`}>
                                {hasUppercase ? <CheckIcon /> : <CircleIcon />}
                                <span>{t("auth.signup.requirements.uppercase", "Pelo menos 1 letra maiúscula")}</span>
                            </li>
                            <li className={`flex items-center gap-2 text-sm font-bold transition-colors ${hasMinLength ? 'text-[#022C22]' : 'text-[#1A1A1A]/30'}`}>
                                {hasMinLength ? <CheckIcon /> : <CircleIcon />}
                                <span>{t("auth.signup.requirements.length", "Mínimo de 8 caracteres")}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="w-full bg-[#1A1A1A] text-white font-display font-bold text-lg py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#1A1A1A]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? t("auth.signup.submitting", "Criando...") : t("auth.signup.submit", "Criar conta")}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#1A1A1A]/10"></div>
                    </div>
                    <span className="relative bg-white px-4 text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-widest">
                        {t("auth.signup.or", "OU")}
                    </span>
                </div>

                <div className="flex gap-4 justify-center">
                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex-1 flex items-center justify-center p-4 border-2 border-[#1A1A1A]/10 rounded-2xl hover:bg-[#F3F3F1] hover:border-[#1A1A1A] transition-all group"
                        title="Google"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </button>

                    {/* Apple */}
                    <button type="button" className="flex-1 flex items-center justify-center p-4 border-2 border-[#1A1A1A]/10 rounded-2xl hover:bg-[#F3F3F1] hover:border-[#1A1A1A] transition-all group" title="Apple">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1A1A1A]" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.36-.16-.7-.33-1.1-.33-.35 0-.69.16-1.07.35-1.06.49-2.17.56-3.12-.41-2.12-2.17-3-6.3.36-9.03 1.39-1.12 3.12-1 4.31-.03.22.18.44.33.64.33.19 0 .41-.14.63-.33 1.34-1.14 3.73-.86 4.88.54-2.61 1.25-2.17 4.79.46 5.86-.53 1.12-1.06 2.07-1.57 2.58-.52.5-1.29.56-1.34.07zm-1.78-14.7c.48-1.55 1.76-2.58 3.03-2.58.12 1.39-.46 2.86-1.52 3.65-1.06.77-2.47 1.01-3.08.97-.05-1.28.61-2.82 1.57-2.04z" />
                        </svg>
                    </button>

                    {/* Facebook */}
                    <button type="button" className="flex-1 flex items-center justify-center p-4 border-2 border-[#1A1A1A]/10 rounded-2xl hover:bg-[#F3F3F1] hover:border-[#1A1A1A] transition-all group" title="Facebook">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1877F2]" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="text-center pt-8">
                <p className="text-sm font-medium text-[#1A1A1A]/60">
                    <>{t("auth.signup.haveAccount")} <Link to={withLang("/login")} className="ml-1 font-bold text-[#1A1A1A] underline decoration-2 underline-offset-4 hover:text-[#0047FF] hover:decoration-[#0047FF] transition-colors">{t("auth.signup.signIn")}</Link></>
                </p>
            </div>
        </AuthLayoutBold>
    );
}
