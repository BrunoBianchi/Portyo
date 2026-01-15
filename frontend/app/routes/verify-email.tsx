import type { Route } from "./+types/verify-email";
import { Link, useNavigate } from "react-router";
import { AuthBackground } from "~/components/shared/auth-background";
import { useContext, useState, useRef, useEffect } from "react";
import AuthContext from "~/contexts/auth.context";
import { EnvelopeIcon } from "~/components/shared/icons";
import { api } from "~/services/api";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Verify Email - Portyo" }];
}

export default function VerifyEmail() {
    const { user, loading, refreshUser } = useContext(AuthContext);
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);



    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next input
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
        if (pasted.length > 0) {
            const newCode = [...code];
            pasted.forEach((char, i) => {
                if (i < 6) newCode[i] = char;
            });
            setCode(newCode);
            inputRefs[Math.min(pasted.length, 5)].current?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join("");
        if (verificationCode.length !== 6) return;

        setIsLoading(true);
        setError(null);
        if (!user?.email) return;
        try {
            await api.post("/user/verify-email", { email: user.email, code: verificationCode });
            const response = await refreshUser();
            setSuccess("Email verificado com sucesso! Redirecionando...");
            setTimeout(() => {
                // Redirect to onboarding if not completed, otherwise to dashboard
                const updatedUser = response || user;
                if (!updatedUser?.onboardingCompleted) {
                    navigate("/onboarding");
                } else {
                    navigate("/dashboard");
                }
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Auto submit when filled
    useEffect(() => {
        if (code.every(c => c !== "")) {
            handleVerify();
        }
    }, [code]);

    const handleResend = async () => {
        setError(null);
        setSuccess(null);
        try {
            if (!user?.email) return;
            await api.post("/user/resend-verification", { email: user.email });
            setSuccess("Verification code sent!");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend code.");
        }
    };

    if (loading || !user) return null;

    return (
        <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
            <AuthBackground />
            <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                <div className="bg-surface w-full max-w-[480px] rounded-[2rem] shadow-xl p-8 md:p-10 relative border border-white/50 text-center">

                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <EnvelopeIcon className="w-8 h-8" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-3">Check your email</h1>
                    <p className="text-text-muted text-sm mb-6">
                        We sent a verification code to <span className="font-medium text-text-main">{user?.email || "your email address"}</span>.
                        Please enter the 6-digit code below to verify your account.
                    </p>

                    <div className="flex justify-center gap-2 mb-6">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 rounded-xl border-2 border-border bg-surface text-center text-xl font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleVerify}
                            disabled={isLoading || code.some(c => c === "")}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isLoading ? "Verifying..." : "Verify Code"}
                        </button>

                        <div className="text-sm text-text-muted">
                            Didn't receive code?{" "}
                            <button onClick={handleResend} className="font-bold text-text-main hover:text-primary transition-colors">
                                Resend
                            </button>
                        </div>

                        <Link to="/login" className="block w-full text-center text-sm text-text-muted hover:text-primary transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
