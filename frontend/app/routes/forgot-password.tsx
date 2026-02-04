import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Link, useLocation } from "react-router";
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { AuthBackground } from "~/components/shared/auth-background";
import { api } from "~/services/api";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.forgotPassword.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.forgotPassword.description", { lng: lang }) },
    ];
};

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSocialProvider, setIsSocialProvider] = useState(false);
    const { t } = useTranslation();
    const location = useLocation();
    const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
    const withLang = (to: string) => (currentLang ? `/${currentLang}${to}` : to);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setIsSocialProvider(false);

        try {
            const response = await api.post("/user/forgot-password", { email });
            setSuccess(true);
        } catch (err: any) {
            const errorData = err.response?.data;
            if (errorData?.error === "social_provider") {
                setIsSocialProvider(true);
                setError(errorData.message);
            } else {
                setError(errorData?.message || t("auth.forgot.genericError"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
            <AuthBackground />
            <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                <div className="bg-surface w-full max-w-[480px] rounded-[2rem] shadow-xl p-8 md:p-10 relative border border-white/50">

                    <Link
                        to={withLang("/login")}
                        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t("auth.forgot.backToLogin")}
                    </Link>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-3">{t("auth.forgot.successTitle")}</h1>
                            <p className="text-text-muted mb-6">
                                {t("auth.forgot.successBody", { email })}
                            </p>
                            <p className="text-sm text-text-muted">
                                {t("auth.forgot.successHint")}{" "}
                                <button
                                    onClick={() => { setSuccess(false); setEmail(""); }}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    {t("auth.forgot.tryAgain")}
                                </button>
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold mb-3">{t("auth.forgot.title")}</h1>
                                <p className="text-text-muted text-sm">
                                    {t("auth.forgot.subtitle")}
                                </p>
                            </div>

                            {error && (
                                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${isSocialProvider
                                        ? "bg-amber-50 border border-amber-100"
                                        : "bg-red-50 border border-red-100"
                                    }`}>
                                    <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isSocialProvider ? "text-amber-600" : "text-red-600"
                                        }`} />
                                    <div>
                                        <p className={`text-sm font-medium ${isSocialProvider ? "text-amber-700" : "text-red-600"
                                            }`}>
                                            {error}
                                        </p>
                                        {isSocialProvider && (
                                            <Link
                                                to={withLang("/login")}
                                                className="text-sm text-amber-600 hover:underline mt-1 inline-block"
                                            >
                                                {t("auth.forgot.goToLogin")}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-text-main mb-2">
                                        {t("auth.forgot.emailLabel")}
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t("auth.forgot.emailPlaceholder")}
                                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all text-sm placeholder:text-text-muted/70"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? t("auth.forgot.sending") : t("auth.forgot.sendReset")}
                                </button>
                            </form>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}
