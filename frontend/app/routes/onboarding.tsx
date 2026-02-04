import { useNavigate } from "react-router";
import { useContext, useState, useEffect, useMemo, useRef } from "react";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";
import THEME_PRESETS, { type ThemePreset } from "~/constants/theme-presets";
import { Check, ChevronRight, Sparkles, Wand2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

export function meta() {
    return [{ title: "Welcome to Portyo - Setup your profile" }];
}

interface OnboardingAnswers {
    username: string;
    category: string;
    theme: ThemePreset | null;
}

const CATEGORIES = [
    { id: "creator", name: "Creator", icon: "🎨" },
    { id: "business", name: "Business", icon: "💼" },
    { id: "personal", name: "Personal", icon: "👋" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "entertainment", name: "Entertainment", icon: "🎬" },
    { id: "tech", name: "Tech", icon: "💻" },
    { id: "fashion", name: "Fashion", icon: "👗" },
    { id: "other", name: "Other", icon: "✨" },
];

export default function Onboarding() {
    const { user, loading, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [answers, setAnswers] = useState<OnboardingAnswers>({
        username: "",
        category: "",
        theme: THEME_PRESETS[0] || null,
    });

    // Check username availability (faked for UI feel, real validation on submit)
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
        if (!loading && user && user.onboardingCompleted) {
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    // Pre-fill username if available
    useEffect(() => {
        if (user?.username && !answers.username) {
            setAnswers(prev => ({ ...prev, username: user.username }));
        }
    }, [user]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleFinish = async () => {
        setIsGenerating(true);
        try {
            // 1. Update Username if changed
            if (answers.username !== user?.username) {
                await api.post("/user/username", { username: answers.username });
            }

            // 2. Generate Bio/Profile
            await api.post("/onboarding/generate-bio", {
                category: answers.category,
                theme: answers.theme?.name || "Modern Minimal",
                aboutYou: `I am a ${answers.category} looking to showcase my work.`, // Simplified for now
                profession: answers.category,
                goals: "Showcase portfolio",
            });

            // 3. Mark completed
            await refreshUser();

            // 4. Celebration!
            if (typeof window !== "undefined") {
                try {
                    const { default: confetti } = await import("canvas-confetti");
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#D2E823', '#0047FF', '#E94E77', '#000000']
                    });
                } catch (error) {
                    console.warn("Confetti unavailable:", error);
                }
            }

            // Slight delay to enjoy confetti
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);

        } catch (err) {
            console.error("Onboarding failed:", err);
            setIsGenerating(false);
            // Fallback navigation
            navigate("/dashboard");
        }
    };

    // --- STEPS RENDERERS ---

    const renderStep1_Username = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                    Claim your link.
                </h1>
                <p className="text-xl text-[#1A1A1A]/60 font-medium max-w-lg mx-auto">
                    Choose your unique username to get started. You can always change it later.
                </p>
            </div>

            <div className="w-full max-w-xl">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <span className="text-2xl font-black text-[#1A1A1A]/40 tracking-tight">portyo.me/</span>
                    </div>
                    <input
                        type="text"
                        value={answers.username}
                        onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
                            setAnswers(prev => ({ ...prev, username: val }));
                            setUsernameAvailable(val.length > 2); // Simple client-side validation for now
                        }}
                        className="w-full py-6 pl-[150px] pr-6 bg-white border-4 border-[#1A1A1A] rounded-2xl text-2xl font-black text-[#1A1A1A] placeholder:text-[#1A1A1A]/20 focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                        placeholder="yourname"
                        autoFocus
                    />
                    {answers.username.length > 2 && (
                        <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                            <div className="bg-[#D2E823] text-black border-2 border-black rounded-full p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Check className="w-4 h-4 text-black" strokeWidth={4} />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleNext}
                    disabled={!answers.username || answers.username.length < 3}
                    className="mt-8 w-full py-5 bg-[#1A1A1A] text-white rounded-2xl font-black text-xl uppercase tracking-widest hover:bg-[#D2E823] hover:text-[#1A1A1A] hover:border-2 hover:border-[#1A1A1A] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 group"
                >
                    Claim & Continue
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );

    const renderStep2_Category = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                    What best describes you?
                </h1>
                <p className="text-lg text-[#1A1A1A]/60 font-medium">
                    This helps us tailor your experience.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setAnswers(prev => ({ ...prev, category: cat.id }))}
                        className={`
                            relative h-32 md:h-40 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 group
                            ${answers.category === cat.id
                                ? 'bg-[#D2E823] border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                                : 'bg-white border-[#1A1A1A] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            }
                        `}
                    >
                        <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                        <span className={`font-black uppercase tracking-wider text-sm ${answers.category === cat.id ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/70'}`}>
                            {cat.name}
                        </span>

                        {answers.category === cat.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-center text-[#D2E823]">
                                <Check className="w-4 h-4" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex gap-4 w-full max-w-md">
                <button
                    onClick={handleBack}
                    className="flex-1 py-4 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-bold uppercase tracking-wider hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!answers.category}
                    className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#D2E823] hover:text-[#1A1A1A] hover:border-2 hover:border-[#1A1A1A] hover:shadow-[4px_4px_0px_0px_rgba(210,232,35,1)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const renderStep3_Theme = () => (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto h-[calc(100vh-140px)] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Left Panel: Selection */}
            <div className="w-full md:w-1/3 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                        Pick a vibe.
                    </h1>
                    <p className="text-[#1A1A1A]/60 font-medium">
                        Start with a theme. Completely customizable later.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pb-20">
                    {THEME_PRESETS.map(theme => (
                        <button
                            key={theme.name}
                            onClick={() => setAnswers(prev => ({ ...prev, theme }))}
                            className={`
                                group relative p-4 rounded-xl border-2 transition-all text-left overflow-hidden
                                ${answers.theme?.name === theme.name
                                    ? 'border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white ring-2 ring-[#D2E823] ring-offset-2'
                                    : 'border-transparent hover:border-[#1A1A1A]/10 bg-white hover:shadow-sm'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                {/* Mini Preview Circle */}
                                <div
                                    className="w-16 h-16 rounded-full shadow-inner border border-black/5 shrink-0"
                                    style={{ background: theme.styles.bgColor }}
                                />
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A]">{theme.name}</h3>
                                    <p className="text-xs text-[#1A1A1A]/50 font-medium line-clamp-1">Designed for {answers.category || 'everyone'}</p>
                                </div>
                            </div>

                            {answers.theme?.name === theme.name && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 bg-[#1A1A1A] text-[#D2E823] rounded-full flex items-center justify-center">
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Live Mobile Preview */}
            <div className="w-full md:w-2/3 bg-[#F3F3F1] rounded-[40px] border-4 border-[#1A1A1A] p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                <div className="relative w-[300px] h-[600px] bg-white rounded-[40px] border-[8px] border-[#1A1A1A] overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-300 transform">
                    {/* Simulated Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-b-2xl z-20" />

                    {/* Theme Preview Content */}
                    {answers.theme && (
                        <div
                            className="w-full h-full flex flex-col p-6 overflow-y-auto scrollbar-hide"
                            style={{
                                background: answers.theme.styles.bgColor,
                                fontFamily: answers.theme.styles.fontFamily
                            }}
                        >
                            <div className="mt-8 flex flex-col items-center gap-4 z-10">
                                <div
                                    className="w-24 h-24 rounded-full shadow-lg"
                                    style={{
                                        background: answers.theme.styles.usernameColor,
                                        opacity: 0.8
                                    }}
                                />
                                <div className="text-center space-y-1">
                                    <div className="h-6 w-32 bg-current opacity-80 rounded mx-auto" style={{ color: answers.theme.styles.usernameColor }} />
                                    <div className="h-4 w-48 bg-current opacity-60 rounded mx-auto" style={{ color: answers.theme.styles.usernameColor }} />
                                </div>
                            </div>

                            <div className="mt-8 space-y-3 z-10">
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className="w-full h-14 rounded-xl flex items-center justify-center font-bold"
                                        style={{
                                            background: answers.theme.styles.cardBackgroundColor,
                                            border: `${answers.theme.styles.cardBorderWidth || 0}px solid ${answers.theme.styles.cardBorderColor}`,
                                            color: answers.theme.styles.usernameColor
                                        }}
                                    >
                                        Link {i}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Action Buttons */}
                <div className="absolute bottom-8 right-8 flex flex-col gap-3">
                    <button
                        onClick={handleBack}
                        className="w-14 h-14 bg-white border-2 border-[#1A1A1A] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <span className="text-xl">🔙</span>
                    </button>
                    <button
                        onClick={handleFinish}
                        disabled={isGenerating}
                        className="w-16 h-16 bg-[#D2E823] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[#1A1A1A]"
                    >
                        {isGenerating ? (
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Check className="w-8 h-8" strokeWidth={4} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#F3F3F1] flex flex-col overflow-hidden font-sans text-[#1A1A1A] selection:bg-[#D2E823] selection:text-black">

            {/* Header / Nav */}
            <header className="p-6 md:p-10 flex justify-between items-center z-10 w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#1A1A1A] text-[#D2E823] rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="font-black text-xl tracking-tight hidden md:inline">Portyo</span>
                </div>

                {/* Steps Indicator */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#1A1A1A]' : i < step ? 'w-2 bg-[#D2E823]' : 'w-2 bg-[#E5E5E5]'
                                }`}
                        />
                    ))}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full max-w-7xl mx-auto px-6">
                <div className="flex-1 flex items-center justify-center w-full">
                    {step === 1 && renderStep1_Username()}
                    {step === 2 && renderStep2_Category()}
                    {step === 3 && renderStep3_Theme()}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 text-center text-[#1A1A1A]/40 text-xs font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} Portyo
            </footer>

            {/* Confetti Canvas (handled by library, but good to have a target if needed manually) */}
        </div>
    );
}

// Styles for custom scrollbar to match theme
const styles = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #E5E5E5;
        border-radius: 99px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #CCCCCC;
    }
`;
