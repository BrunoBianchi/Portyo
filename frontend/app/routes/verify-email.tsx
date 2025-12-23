import type { Route } from "./+types/verify-email";
import { Link } from "react-router";
import { AuthBackground } from "~/components/auth-background";
import { useContext } from "react";
import AuthContext from "~/contexts/auth.context";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Verify Email - Portyo" }];
}

export default function VerifyEmail() {
    const { user } = useContext(AuthContext);

    const handleResend = () => {
        // TODO: Implement resend verification email
        console.log("Resend email requested");
    };

    return (
        <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
            <AuthBackground />
            <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                <div className="bg-surface w-full max-w-[480px] rounded-[2rem] shadow-xl p-8 md:p-10 relative border border-white/50 text-center">
                    
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
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
