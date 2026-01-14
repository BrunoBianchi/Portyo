import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { AuthBackground } from "~/components/shared/auth-background";
import { api } from "~/services/api";

export const meta: MetaFunction = () => {
    return [
        { title: "Forgot Password | Portyo" },
        { name: "description", content: "Reset your Portyo password" },
    ];
};

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSocialProvider, setIsSocialProvider] = useState(false);

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
                setError(errorData?.message || "Something went wrong. Please try again.");
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
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-3">Check your email</h1>
                            <p className="text-text-muted mb-6">
                                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                            </p>
                            <p className="text-sm text-text-muted">
                                Didn't receive the email? Check your spam folder or{" "}
                                <button
                                    onClick={() => { setSuccess(false); setEmail(""); }}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold mb-3">Forgot password?</h1>
                                <p className="text-text-muted text-sm">
                                    No worries! Enter your email and we'll send you a reset link.
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
                                                to="/login"
                                                className="text-sm text-amber-600 hover:underline mt-1 inline-block"
                                            >
                                                Go to login page →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-text-main mb-2">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Sending..." : "Send reset link"}
                                </button>
                            </form>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}
