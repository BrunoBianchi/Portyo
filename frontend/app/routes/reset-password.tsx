import { useState, useEffect, useMemo } from "react";
import type { MetaFunction } from "react-router";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Lock, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { AuthBackground } from "~/components/shared/auth-background";
import { api } from "~/services/api";
import i18n from "~/i18n";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.resetPassword.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.resetPassword.description", { lng: lang }) },
    ];
};

type PasswordStrength = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): { strength: PasswordStrength; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("One lowercase letter");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("One uppercase letter");

    if (/[0-9]/.test(password)) score++;
    else feedback.push("One number");

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push("One special character (optional)");

    let strength: PasswordStrength = "weak";
    if (score >= 4) strength = "strong";
    else if (score >= 3) strength = "medium";

    return { strength, score, feedback };
}

export default function ResetPassword() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordAnalysis = useMemo(() => getPasswordStrength(password), [password]);
    const passwordsMatch = password === confirmPassword;
    const canSubmit = passwordAnalysis.strength !== "weak" && passwordsMatch && password.length >= 8;

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setValidating(false);
            return;
        }

        api.get(`/user/validate-reset-token?token=${token}`)
            .then(() => {
                setTokenValid(true);
            })
            .catch((err) => {
                setError(err.response?.data?.error || "Invalid or expired reset link");
            })
            .finally(() => {
                setValidating(false);
            });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit || !token) return;

        setLoading(true);
        setError(null);

        try {
            await api.post("/user/reset-password", {
                token,
                password,
                confirmPassword
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || t("auth.resetPassword.genericError"));
        } finally {
            setLoading(false);
        }
    };

    const strengthColors = {
        weak: "bg-red-500",
        medium: "bg-amber-500",
        strong: "bg-green-500"
    };

    const strengthLabels = {
        weak: t("auth.resetPassword.strengthWeak"),
        medium: t("auth.resetPassword.strengthMedium"),
        strong: t("auth.resetPassword.strengthStrong")
    };

    return (
        <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
            <AuthBackground />
            <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                <div className="bg-surface w-full max-w-[480px] rounded-[2rem] shadow-xl p-8 md:p-10 relative border border-white/50">

                    {validating ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-text-muted">{t("auth.resetPassword.validating")}</p>
                        </div>
                    ) : !token || (!tokenValid && !success) ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-3">{t("auth.resetPassword.invalidTitle")}</h1>
                            <p className="text-text-muted mb-6">
                                {error || t("auth.resetPassword.invalidDescription")}
                            </p>
                            <Link
                                to="/forgot-password"
                                className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover transition-colors"
                            >
                                {t("auth.resetPassword.requestNewLink")}
                            </Link>
                        </div>
                    ) : success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-3">{t("auth.resetPassword.successTitle")}</h1>
                            <p className="text-text-muted mb-6">
                                {t("auth.resetPassword.successDescription")}
                            </p>
                            <Link
                                to="/login"
                                className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover transition-colors"
                            >
                                {t("auth.resetPassword.goToLogin")}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors mb-6"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t("auth.resetPassword.backToLogin")}
                            </Link>

                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-7 h-7 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold mb-3">{t("auth.resetPassword.createTitle")}</h1>
                                <p className="text-text-muted text-sm">
                                    {t("auth.resetPassword.createDescription")}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium text-red-600">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Password Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-text-main mb-2">
                                        {t("auth.resetPassword.newPasswordLabel")}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
                                            className="w-full px-4 py-3.5 pr-12 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all text-sm placeholder:text-text-muted/70"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {password && (
                                        <div className="mt-3">
                                            <div className="flex gap-1.5 mb-2">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 flex-1 rounded-full transition-colors ${passwordAnalysis.score >= i
                                                                ? strengthColors[passwordAnalysis.strength]
                                                                : "bg-gray-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs font-medium ${passwordAnalysis.strength === "weak" ? "text-red-500" :
                                                        passwordAnalysis.strength === "medium" ? "text-amber-500" : "text-green-500"
                                                    }`}>
                                                    {strengthLabels[passwordAnalysis.strength]}
                                                </span>
                                                {passwordAnalysis.feedback.length > 0 && (
                                                    <span className="text-xs text-text-muted">
                                                        {t("auth.resetPassword.missing")}: {passwordAnalysis.feedback.slice(0, 2).join(", ")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-text-main mb-2">
                                        {t("auth.resetPassword.confirmPasswordLabel")}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
                                            className={`w-full px-4 py-3.5 pr-12 rounded-xl border bg-surface focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-text-muted/70 ${confirmPassword && !passwordsMatch
                                                    ? "border-red-300 focus:ring-red-500/50 focus:border-red-500"
                                                    : "border-border focus:ring-white/30 focus:border-white/50"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {confirmPassword && !passwordsMatch && (
                                        <p className="mt-2 text-xs text-red-500">{t("auth.resetPassword.passwordsNotMatch")}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !canSubmit}
                                    className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? t("auth.resetPassword.resetting") : t("auth.resetPassword.resetButton")}
                                </button>
                            </form>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}
