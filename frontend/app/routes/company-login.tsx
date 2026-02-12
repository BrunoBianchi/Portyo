import type { MetaFunction } from "react-router";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, Target } from "lucide-react";
import CompanyAuthContext from "~/contexts/company-auth.context";
import { useTranslation } from "react-i18next";
import { useCompanyUrl } from "~/lib/company-utils";

export const meta: MetaFunction = () => {
    return [
        { title: "Company Login | Portyo Sponsors" },
        { name: "description", content: "Login to manage your sponsored link campaigns on Portyo." },
    ];
};

export default function CompanyLogin() {
    const navigate = useNavigate();
    const { t } = useTranslation("company");
    const companyUrl = useCompanyUrl();
    const { login } = useContext(CompanyAuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate(companyUrl.dashboard);
        } catch (err: any) {
            setError(err.response?.data?.error || t("login.invalidCredentials"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F3F1] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-[#D2E823] border-2 border-black rounded-2xl mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Target className="w-8 h-8 text-black stroke-[2.5px]" />
                    </Link>
                    <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">{t("login.heading")}</h1>
                    <p className="text-gray-500 font-medium mt-2">{t("login.subtitle")}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white border-2 border-black rounded-3xl p-8 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-black rounded-xl text-red-700 font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-[#1A1A1A] mb-1.5 uppercase tracking-wide">{t("login.email")}</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 stroke-[2.5px]" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder={t("login.emailPlaceholder")}
                                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-black rounded-xl text-[#1A1A1A] placeholder-gray-400 text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">{t("login.password")}</label>
                            {/* Forgot password link could go here */}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 stroke-[2.5px]" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder={t("login.passwordPlaceholder")}
                                className="w-full pl-12 pr-12 py-3 bg-white border-2 border-black rounded-xl text-[#1A1A1A] placeholder-gray-400 text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#D2E823] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-black rounded-xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t("login.submit")} <ArrowRight className="w-5 h-5 stroke-[3px]" /></>}
                    </button>

                    <p className="text-center text-sm font-medium text-gray-500">
                        {t("login.noAccount")}{" "}
                        <Link to={companyUrl.register} className="text-black hover:text-[#D2E823] hover:underline font-black transition-colors">
                            {t("login.register")}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
