import type { Route } from "./+types/verify-email";
import { Link } from "react-router";
import { AuthBackground } from "~/components/auth-background";
import { useContext } from "react";
import AuthContext from "~/contexts/auth.context";
import { EnvelopeIcon } from "~/components/icons";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Verify Email - Portyo" }];
}

export default function VerifyEmail() {
    const { user } = useContext(AuthContext);

    const handleResend = () => {
        // TODO: Implement resend verification email

    };

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
                        We sent a verification link to <span className="font-medium text-text-main">{user?.email || "your email address"}</span>.
                        Please check your inbox and click the link to verify your account.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={handleResend}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]"
                        >
                            Resend Email
                        </button>

                        <Link to="/login" className="block w-full text-center text-sm text-text-muted hover:text-primary transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
