import type { Route } from "./+types/login";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useContext, useState, useEffect } from "react";
import { AuthBackground } from "~/components/shared/auth-background";
import AuthContext from "~/contexts/auth.context";
import { AlertCircle } from "lucide-react";
import { EnvelopeIcon } from "~/components/shared/icons";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import { AuthLayoutBold } from "~/components/auth/auth-layout-bold";

export function meta({ params }: Route.MetaArgs) {
    const lang = params?.lang === "pt" ? "pt" : "en";
    const title = i18n.t("meta.login.title", { lng: lang, defaultValue: lang === "pt" ? "Login | Portyo" : "Login | Portyo" });
    const description = lang === "pt"
        ? "Faça login na sua conta Portyo para gerenciar seus links, produtos e analytics."
        : "Log in to your Portyo account to manage your links, products, and analytics.";
    return [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, follow" },
    ];
}

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const authContext = useContext(AuthContext)


    const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
    const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

    const getSafeRedirect = () => {
        const raw = searchParams.get("redirect") || searchParams.get("returnTo") || "";
        if (!raw || !raw.startsWith("/")) {
            return currentLang ? `/${currentLang}` : "/";
        }

        if (raw.includes("/login") || raw.includes("/sign-up")) {
            return currentLang ? `/${currentLang}` : "/";
        }

        return raw;
    };

    const cleanLoginPath = currentLang ? `/${currentLang}/login` : "/login";

    // Handle OAuth callback via URL params (redirect flow)
    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            // Clear the URL params
            window.history.replaceState({}, document.title, cleanLoginPath);
            setError(decodeURIComponent(errorParam));
            return;
        }

        if (token) {
            // Clear the URL params
            window.history.replaceState({}, document.title, cleanLoginPath);

            // Try to validate and login with the token
            authContext.loginWithToken(token)
                .then((freshUser) => {
                    if (freshUser && !freshUser.onboardingCompleted) {
                        const hasBio = !!freshUser.sufix || (freshUser.usage?.bios ?? 0) > 0;
                        navigate(withLang(hasBio ? "/onboarding" : "/claim-bio"));
                    } else {
                        navigate(getSafeRedirect());
                    }
                })
                .catch((err: any) => {
                    console.error('Failed to login with OAuth token:', err);
                    setError(t("auth.login.oauthError"));
                });
        }
    }, [searchParams, cleanLoginPath]);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        try {
            await authContext.login(email, password)
            navigate(getSafeRedirect())
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || err.response?.data?.error || t("auth.login.invalidCredentials");
            setError(message);
        }
    }

    const handleGoogleLogin = () => {
        // Use page redirect instead of popup - use dynamic API URL
        const apiUrl = typeof window !== 'undefined' && window.location.hostname.includes('localhost')
            ? 'http://localhost:3000'
            : 'https://api.portyo.me';
        window.location.href = `${apiUrl}/api/google/auth`;
    };

    return (
        <AuthLayoutBold
            title={t("auth.login.title", "Bem-vindo de volta")}
            subtitle={t("auth.login.subtitle", "Faça login na sua Linktree")}
        >
            <form className="space-y-6" onSubmit={handleLogin}>
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2 pl-1">
                            {t("auth.login.emailPlaceholder", "Email")}
                        </label>
                        <input
                            type="email"
                            placeholder="ex: bruno@portyo.me"
                            value={email}
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-4 rounded-xl bg-[#F3F3F1] border-2 border-transparent focus:bg-white focus:border-[#1A1A1A] outline-none transition-all font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-2 pl-1">
                            {t("auth.login.passwordPlaceholder", "Senha")}
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            value={password}
                            autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 rounded-xl bg-[#F3F3F1] border-2 border-transparent focus:bg-white focus:border-[#1A1A1A] outline-none transition-all font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[3.2rem] text-sm font-bold text-[#1A1A1A] hover:opacity-70 transition-opacity"
                        >
                            {showPassword ? t("auth.login.hide") : t("auth.login.show")}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Link
                        to={withLang("/forgot-password")}
                        className="text-sm font-bold text-[#1A1A1A]/60 hover:text-[#0047FF] transition-colors"
                    >
                        {t("auth.login.trouble")}
                    </Link>
                </div>

                <div className="space-y-4 pt-4">
                    <button
                        type="submit"
                        className="w-full bg-[#1A1A1A] text-white font-display font-bold text-lg py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#1A1A1A]/10"
                    >
                        {t("auth.login.submit", "Entrar")}
                    </button>

                    <div className="relative flex items-center justify-center py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#1A1A1A]/10"></div>
                        </div>
                        <span className="relative bg-white px-4 text-xs font-bold text-[#1A1A1A]/40 uppercase tracking-widest">
                            {t("auth.login.or")}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white border-2 border-[#1A1A1A]/10 text-[#1A1A1A] font-bold text-lg py-4 rounded-full hover:border-[#1A1A1A] hover:bg-transparent transition-colors flex items-center justify-center gap-3"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {t("auth.login.google", "Continuar com Google")}
                    </button>
                </div>
            </form>

            <div className="text-center pt-8">
                <p className="text-sm font-medium text-[#1A1A1A]/60">
                    {t("auth.login.noAccount")}
                    <Link to={withLang("/sign-up")} className="ml-1 font-bold text-[#1A1A1A] underline decoration-2 underline-offset-4 hover:text-[#0047FF] hover:decoration-[#0047FF] transition-colors">
                        {t("auth.login.createNow")}
                    </Link>
                </p>
            </div>
        </AuthLayoutBold>
    );
}
