import type { Route } from "./+types/login";
import { Link, useNavigate } from "react-router";
import { useContext, useState } from "react";
import { AuthBackground } from "~/components/auth-background";
import AuthContext from "~/contexts/auth.context";
import { AlertCircle } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login - Portyo" }];
}

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const authContext = useContext(AuthContext)

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        try {
            await authContext.login(email,password)
            navigate("/")
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || err.response?.data?.error || "Failed to login. Please check your credentials.";
            setError(message);
        }
    }

    const handleGoogleLogin = () => {
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
            "http://localhost:3000/api/google/auth",
            "Google Login",
            `width=${width},height=${height},left=${left},top=${top}`
        );

        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== "http://localhost:3000") return;
            
            const data = event.data;
            if (data.token && data.user) {
                 authContext.socialLogin(data.user, data.token);
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
                <h1 className="text-2xl font-bold mb-3">Agent Login</h1>
                <p className="text-text-muted text-sm px-4">
                    Hey, Enter your details to get sign in to your account
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
                        type="text" 
                        placeholder="Enter Email" 
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                    />
                </div>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Passcode" 
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/70"
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-main hover:text-primary transition-colors"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                <div className="text-left pt-1">
                    <Link to="/forgot-password" className="text-xs font-medium text-text-main hover:text-primary transition-colors">
                        Having trouble in sign in?
                    </Link>
                </div>

                <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary-hover transition-colors shadow-sm mt-2">
                    Sign in
                </button>
            </form>

            <div className="mt-8">
                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <span className="relative bg-surface px-3 text-xs text-text-main font-semibold uppercase tracking-wider">Or Sign in with</span>
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

            <div className="mt-8 text-center">
                <p className="text-xs text-text-muted font-medium">
                    Don't have an account? <Link to="/sign-up" className="font-bold text-text-main hover:underline ml-1">Create Now</Link>
                </p>
            </div>
        </div>
      </main>

    </div>
  );
}
