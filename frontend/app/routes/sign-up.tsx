import type { Route } from "./+types/sign-up";
import { Link, useSearchParams, useNavigate } from "react-router";
import { use, useContext, useEffect, useState } from "react";
import { AuthBackground } from "~/components/shared/auth-background";
import AuthContext from "~/contexts/auth.context";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Sign Up - Portyo" }];
}

export default function Signup() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);

    const step = searchParams.get("step") || "1";
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [sufix, setSufix] = useState(searchParams.get("sufix") || "");
    const navigate = useNavigate()
    const { register, socialLogin } = useContext(AuthContext);
    useEffect(() => {
        setSufix(searchParams.get("sufix") || "");
    }, [searchParams]);

    function normalizeUsername(value: string) {
        return value.replace(/\s+/g, "-").toLowerCase();
    }

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
        if (step === "1") {
            const nextSufix = searchParams.get("sufix") ? sufix : normalizeUsername(username);
            setSufix(nextSufix);
            setSearchParams({ step: "2", sufix: nextSufix });
        } else {
            try {
                await register(email, password, username, sufix);
                navigate("/verify-email");
            } catch (e) {
                console.error("Registration failed", e);
                // Optionally set an error state here to display to the user
                alert("Failed to create account. Please try again.");
            }
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
                navigate("/");
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
                <div className="bg-surface w-full max-w-[480px] rounded-[2rem] shadow-xl p-8 md:p-10 relative border border-white/50">

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-3">
                            {step === "1" ? "Create Account" : "Choose Username"}
                        </h1>
                        <p className="text-text-muted text-sm px-4">
                            {step === "1" ? "Join us! Enter your details to create your account" : "Claim your unique spot on Portyo"}
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleContinue}>
                        {step === "1" ? (
                            <>
                                <div>
                                    <input
                                        type="text"
                                        value={username}
                                        placeholder="Full Name"
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
                                        placeholder="Enter Email / Phone No"
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
                                        placeholder="Passcode"
                                        autoComplete="new-password"
                                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-main hover:text-primary transition-colors"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <div className="mt-2 text-xs">
                                    <p className="text-text-muted mb-2 font-medium">Requirements:</p>
                                    <ul className="space-y-1.5 pl-1">
                                        <li className={`flex items-center gap-2 ${hasFullName ? 'text-green-600' : 'text-text-muted'}`}>
                                            {hasFullName ? <CheckIcon /> : <CircleIcon />}
                                            <span>Full name is required</span>
                                        </li>
                                        <li className={`flex items-center gap-2 ${hasUppercase ? 'text-green-600' : 'text-text-muted'}`}>
                                            {hasUppercase ? <CheckIcon /> : <CircleIcon />}
                                            <span>At least one uppercase letter</span>
                                        </li>
                                        <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-600' : 'text-text-muted'}`}>
                                            {hasMinLength ? <CheckIcon /> : <CircleIcon />}
                                            <span>At least 8 characters</span>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center w-full px-4 py-6 rounded-xl border border-border bg-surface-alt/30 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
                                    <div className="flex items-center text-xl font-semibold tracking-tight whitespace-nowrap overflow-x-auto max-w-full scrollbar-hide">
                                        <span className="text-text-muted/80">portyo.me/p/</span>
                                        <input
                                            defaultValue={sufix}
                                            className="min-w-[2ch] bg-transparent p-0 text-text-main placeholder:text-text-muted/50 focus:outline-none text-left"
                                            placeholder="yourname"
                                            autoFocus
                                            onChange={(e) => setSufix(e.target.value)}
                                            spellCheck={false}
                                            style={{ width: Math.max(sufix.length, 8) + 'ch' }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-center text-text-muted">
                                    This will be your public profile URL. You can't change it later !
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {step === "2" && (
                                <button
                                    type="button"
                                    onClick={() => setSearchParams({ step: "1", username })}
                                    className="w-1/3 bg-surface border border-border text-text-main font-bold py-3.5 rounded-xl hover:bg-surface-muted transition-colors shadow-sm mt-2"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={step === "1" && !isFormValid}
                                className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {step === "1" ? "Continue" : "Create Account"}
                            </button>
                        </div>
                    </form>

                    {step === "1" && (
                        <div className="mt-8">
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <span className="relative bg-surface px-3 text-xs text-text-main font-semibold uppercase tracking-wider">Or Sign up with</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group"
                                >
                                    <span className="font-bold text-lg group-hover:scale-110 transition-transform">G</span> <span className="ml-2 text-xs font-bold hidden sm:inline">Google</span>
                                </button>
                                <button className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group">
                                    <span className="font-bold text-lg group-hover:scale-110 transition-transform"></span> <span className="ml-2 text-xs font-bold hidden sm:inline">Apple ID</span>
                                </button>
                                <button className="flex items-center justify-center px-4 py-2.5 border border-border rounded-xl hover:bg-surface-muted transition-colors group">
                                    <span className="font-bold text-lg group-hover:scale-110 transition-transform">f</span> <span className="ml-2 text-xs font-bold hidden sm:inline">Facebook</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-xs text-text-muted font-medium">
                            {step === "1" ? (
                                <>Already have an account? <Link to="/login" className="font-bold text-text-main hover:underline ml-1">Sign in</Link></>
                            ) : (
                                <span className="opacity-0">Spacer</span>
                            )}
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
}
