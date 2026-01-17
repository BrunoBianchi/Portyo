import type { Route } from "./+types/login";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useContext, useState, useEffect } from "react";
import { AuthBackground } from "~/components/shared/auth-background";
import AuthContext from "~/contexts/auth.context";
import { AlertCircle } from "lucide-react";
import { EnvelopeIcon } from "~/components/shared/icons";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export function meta({ params }: Route.MetaArgs) {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [{ title: i18n.t("meta.login.title", { lng: lang }) }];
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
                .then(() => navigate(getSafeRedirect()))
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
        <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
            <AuthBackground />
            <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                <div className="bg-surface w-full max-w-[480px] rounded-[2rem] shadow-xl p-8 md:p-10 relative border border-white/50">

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-3">{t("auth.login.title")}</h1>
                        <p className="text-text-muted text-sm px-4">
                            {t("auth.login.subtitle")}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div>
                            <input
                                type="email"
                                placeholder={t("auth.login.emailPlaceholder")}
                                value={email}
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={t("auth.login.passwordPlaceholder")}
                                value={password}
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}

                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-main hover:text-primary transition-colors"
                            >
                                {showPassword ? t("auth.login.hide") : t("auth.login.show")}
                            </button>
                        </div>

                        <div className="text-left pt-1">
                            <Link to={withLang("/forgot-password")} className="text-xs font-medium text-text-main hover:text-primary transition-colors">
                                {t("auth.login.trouble")}
                            </Link>
                        </div>

                        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm mt-2">
                            {t("auth.login.submit")}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <span className="relative bg-surface px-3 text-xs text-text-main font-semibold uppercase tracking-wider">{t("auth.login.or")}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group"
                            >
                                <span className="font-bold text-lg group-hover:scale-110 transition-transform">G</span> <span className="ml-2 text-xs font-bold hidden sm:inline">{t("auth.login.google")}</span>
                            </button>
                            <button className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group">
                                <span className="font-bold text-lg group-hover:scale-110 transition-transform"></span> <span className="ml-2 text-xs font-bold hidden sm:inline">{t("auth.login.apple")}</span>
                            </button>
                            <button className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group">
                                <span className="font-bold text-lg group-hover:scale-110 transition-transform">f</span> <span className="ml-2 text-xs font-bold hidden sm:inline">{t("auth.login.facebook")}</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-text-muted font-medium">
                            {t("auth.login.noAccount")} <Link to={withLang("/sign-up")} className="font-bold text-text-main hover:underline ml-1">{t("auth.login.createNow")}</Link>
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
}
