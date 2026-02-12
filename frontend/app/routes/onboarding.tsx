import { useNavigate } from "react-router";
import { useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";
import THEME_PRESETS, { type ThemePreset } from "~/constants/theme-presets";
import { Check, Sparkles, Wand2, ArrowRight, Target, User, Zap, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import toast from "react-hot-toast";

export function meta({ params }: { params: { lang?: string } }) {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [{ title: i18n.t("onboarding.meta.title", { lng: lang }) }];
}

interface OnboardingAnswers {
    username: string;
    category: string;
    theme: ThemePreset | null;
    aboutYou: string;
    profession: string;
    skills: string[];
    goals: string[];
    hasGraduation: boolean;
    universityName: string;
    courseName: string;
}

const TOTAL_STEPS = 6;

const SKILL_OPTIONS: Record<string, string[]> = {
    creator: [
        "Design", "Illustration", "Photography", "Video Editing", "Animation", "3D Modeling",
        "UI/UX", "Branding", "Copywriting", "Music Production", "Motion Graphics", "Graphic Design",
        "Typography", "Digital Art", "Print Design", "Packaging Design", "Logo Design", "Color Theory",
        "Storyboarding", "Sound Design", "Podcast Production", "Content Strategy", "Social Media",
        "Art Direction", "Visual Effects", "Hand Lettering", "Watercolor", "Sculpting",
    ],
    business: [
        "Marketing", "Sales", "Strategy", "Finance", "Leadership", "Project Management",
        "Analytics", "Public Speaking", "Negotiation", "Consulting", "Business Development",
        "Operations", "Product Management", "Growth Hacking", "SEO/SEM", "CRM",
        "Supply Chain", "Human Resources", "Accounting", "Investor Relations", "E-commerce",
        "Brand Strategy", "Market Research", "Pricing Strategy", "Customer Success", "Fundraising",
        "Risk Management", "Mergers & Acquisitions",
    ],
    personal: [
        "Writing", "Photography", "Cooking", "Fitness", "Travel", "Music", "Art", "Languages",
        "Public Speaking", "Volunteering", "Yoga", "Meditation", "Reading", "Gardening",
        "DIY / Crafts", "Blogging", "Vlogging", "Nutrition", "Personal Finance", "Mindfulness",
        "Hiking", "Running", "Swimming", "Cycling", "Dance", "Gaming", "Podcasting", "Journaling",
    ],
    education: [
        "Teaching", "Research", "Curriculum Design", "E-learning", "Mentoring", "Academic Writing",
        "Data Analysis", "Public Speaking", "Tutoring", "EdTech", "STEM Education", "Special Education",
        "Course Creation", "Instructional Design", "Assessment Design", "Online Learning Platforms",
        "Student Engagement", "Educational Psychology", "Gamification", "Workshop Facilitation",
        "Classroom Management", "Academic Research", "Thesis Writing", "Language Teaching",
        "Early Childhood Education", "Higher Education",
    ],
    entertainment: [
        "Acting", "Music", "Dance", "Comedy", "Streaming", "Podcasting", "Event Planning", "DJing",
        "Voice Acting", "Storytelling", "Stand-up Comedy", "Improv", "Film Making", "Screenwriting",
        "Theater Direction", "Choreography", "Music Composition", "Singing", "Beatboxing",
        "Magic / Illusion", "Gaming", "Esports", "Content Creation", "Live Performance",
        "Audio Engineering", "Stage Design", "Talent Management", "MC / Hosting",
    ],
    tech: [
        "JavaScript", "Python", "React", "Node.js", "TypeScript", "AWS", "Docker", "Machine Learning",
        "Mobile Dev", "DevOps", "Go", "Rust", "Java", "C#", "Swift", "Kotlin",
        "SQL", "MongoDB", "GraphQL", "REST APIs", "CI/CD", "Kubernetes", "Terraform",
        "Cybersecurity", "Blockchain", "Cloud Architecture", "Data Engineering", "AI / LLMs",
        "Flutter", "React Native", "Vue.js", "Angular", "Next.js", "System Design",
        "Microservices", "Linux", "Git", "Agile / Scrum",
    ],
    fashion: [
        "Styling", "Textile Design", "Fashion Photography", "Trend Analysis", "Merchandising",
        "Pattern Making", "Fashion Marketing", "Modeling", "Sustainable Fashion", "Personal Branding",
        "Fashion Illustration", "Costume Design", "Accessories Design", "Fashion Buying",
        "Visual Merchandising", "Wardrobe Consulting", "Fashion Blogging", "Runway Production",
        "Jewelry Design", "Shoe Design", "Brand Management", "Fashion PR", "E-commerce Fashion",
        "Streetwear Design", "Upcycling", "Color Consulting",
    ],
    other: [
        "Communication", "Problem Solving", "Creativity", "Teamwork", "Time Management",
        "Critical Thinking", "Adaptability", "Leadership", "Networking", "Organization",
        "Emotional Intelligence", "Decision Making", "Conflict Resolution", "Strategic Planning",
        "Public Relations", "Event Management", "Community Building", "Storytelling",
        "Data Visualization", "Technical Writing", "UX Research", "Growth Mindset",
        "Cross-Cultural Communication", "Sustainability", "Innovation", "Mentorship",
    ],
};

const GOAL_LABELS_API: Record<string, string> = {
    showcase: "Showcase my portfolio",
    grow: "Grow my audience",
    network: "Network with others",
    sell: "Sell products or services",
    hire: "Get hired / find opportunities",
    brand: "Build my personal brand",
    share: "Share my content",
    leads: "Generate leads",
};

export default function Onboarding() {
    const { user, loading, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const CATEGORIES = useMemo(() => [
        { id: "creator", name: t("onboarding.categories.creator"), icon: "🎨" },
        { id: "business", name: t("onboarding.categories.business"), icon: "💼" },
        { id: "personal", name: t("onboarding.categories.personal"), icon: "👋" },
        { id: "education", name: t("onboarding.categories.education"), icon: "📚" },
        { id: "entertainment", name: t("onboarding.categories.entertainment"), icon: "🎬" },
        { id: "tech", name: t("onboarding.categories.tech"), icon: "💻" },
        { id: "fashion", name: t("onboarding.categories.fashion"), icon: "👗" },
        { id: "other", name: t("onboarding.categories.other"), icon: "✨" },
    ], [t]);

    const GOAL_OPTIONS = useMemo(() => [
        { id: "showcase", label: t("onboarding.goals.showcase"), icon: "🎯" },
        { id: "grow", label: t("onboarding.goals.grow"), icon: "📈" },
        { id: "network", label: t("onboarding.goals.network"), icon: "🤝" },
        { id: "sell", label: t("onboarding.goals.sell"), icon: "💰" },
        { id: "hire", label: t("onboarding.goals.hire"), icon: "💼" },
        { id: "brand", label: t("onboarding.goals.brand"), icon: "⭐" },
        { id: "share", label: t("onboarding.goals.share"), icon: "📱" },
        { id: "leads", label: t("onboarding.goals.leads"), icon: "🧲" },
    ], [t]);

    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [answers, setAnswers] = useState<OnboardingAnswers>({
        username: "",
        category: "",
        theme: THEME_PRESETS[0] || null,
        aboutYou: "",
        profession: "",
        skills: [],
        goals: [],
        hasGraduation: false,
        universityName: "",
        courseName: "",
    });

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [usernameChecking, setUsernameChecking] = useState(false);
    const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced username availability check
    const checkUsername = useCallback((username: string) => {
        if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
        if (username.length < 3) {
            setUsernameAvailable(null);
            setUsernameChecking(false);
            return;
        }
        setUsernameChecking(true);
        usernameTimerRef.current = setTimeout(async () => {
            try {
                const res = await api.get(`/public/bio/${username}`);
                // If bio exists, username is taken
                setUsernameAvailable(false);
            } catch {
                // 404 means available
                setUsernameAvailable(true);
            } finally {
                setUsernameChecking(false);
            }
        }, 500);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
        if (!loading && user && !user.verified && user.provider === "password") {
            navigate("/verify-email");
        }
        if (!loading && user && user.onboardingCompleted) {
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user?.sufix && !answers.username) {
            setAnswers(prev => ({ ...prev, username: user.sufix! }));
        }
    }, [user]);

    const handleNext = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const toggleSkill = (skill: string) => {
        setAnswers(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : prev.skills.length < 6 ? [...prev.skills, skill] : prev.skills,
        }));
    };

    const toggleGoal = (goalId: string) => {
        setAnswers(prev => ({
            ...prev,
            goals: prev.goals.includes(goalId)
                ? prev.goals.filter(g => g !== goalId)
                : prev.goals.length < 4 ? [...prev.goals, goalId] : prev.goals,
        }));
    };

    const handleFinish = async () => {
        setIsGenerating(true);
        try {
            const selectedGoalLabels = answers.goals.map(g => GOAL_LABELS_API[g] || g);

            await api.post("/onboarding/generate-bio", {
                theme: answers.theme ? {
                    name: answers.theme.name,
                    styles: answers.theme.styles,
                } : undefined,
                aboutYou: answers.aboutYou || `I am a ${answers.category} professional.`,
                education: {
                    hasGraduation: answers.hasGraduation,
                    universityName: answers.universityName || undefined,
                    courseName: answers.courseName || undefined,
                },
                profession: answers.profession || answers.category || "creator",
                skills: answers.skills.length > 0 ? answers.skills : [answers.category || "creator"],
                goals: selectedGoalLabels.length > 0 ? selectedGoalLabels : ["Showcase portfolio"],
            });

            await refreshUser();

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

            toast.success(t("onboarding.step6.success", { defaultValue: "Your bio has been created!" }));

            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);

        } catch (err: any) {
            console.error("Onboarding failed:", err);
            toast.error(
                err?.response?.data?.message ||
                t("onboarding.step6.error", { defaultValue: "Something went wrong. Please try again." })
            );
            setIsGenerating(false);
        }
    };

    // --- STEP RENDERERS ---

    const renderStep1_Username = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2">
            <div className="space-y-3 md:space-y-4">
                <h1 className="text-3xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                    {t("onboarding.step1.title")}
                </h1>
                <p className="text-base md:text-xl text-[#1A1A1A]/60 font-medium max-w-lg mx-auto">
                    {t("onboarding.step1.subtitle")}
                </p>
            </div>

            <div className="w-full max-w-xl">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
                        <span className="text-base md:text-2xl font-black text-[#1A1A1A]/40 tracking-tight">portyo.me/</span>
                    </div>
                    <input
                        type="text"
                        value={answers.username}
                        onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
                            setAnswers(prev => ({ ...prev, username: val }));
                            checkUsername(val);
                        }}
                        className="w-full py-4 md:py-6 pl-[120px] md:pl-[150px] pr-12 md:pr-6 bg-white border-4 border-[#1A1A1A] rounded-2xl text-lg md:text-2xl font-black text-[#1A1A1A] placeholder:text-[#1A1A1A]/20 focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                        placeholder="yourname"
                        autoFocus
                    />
                    {answers.username.length > 2 && (
                        <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                            {usernameChecking ? (
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-[#1A1A1A]/40 animate-spin" />
                                </div>
                            ) : usernameAvailable === true ? (
                                <div className="bg-[#D2E823] text-black border-2 border-black rounded-full p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Check className="w-4 h-4 text-black" strokeWidth={4} />
                                </div>
                            ) : usernameAvailable === false ? (
                                <div className="bg-red-500 text-white border-2 border-black rounded-full p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <span className="block w-4 h-4 text-center text-xs font-black leading-4">✗</span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleNext}
                    disabled={!answers.username || answers.username.length < 3 || usernameChecking || usernameAvailable === false}
                    className="mt-6 md:mt-8 w-full py-4 md:py-5 bg-[#1A1A1A] text-white rounded-2xl font-black text-base md:text-xl uppercase tracking-widest hover:bg-[#D2E823] hover:text-[#1A1A1A] hover:border-2 hover:border-[#1A1A1A] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 group"
                >
                    {t("onboarding.step1.claimContinue")}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );

    const renderStep2_Category = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto px-2">
            <div className="space-y-3 md:space-y-4">
                <h1 className="text-3xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                    {t("onboarding.step2.title")}
                </h1>
                <p className="text-base md:text-lg text-[#1A1A1A]/60 font-medium">
                    {t("onboarding.step2.subtitle")}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setAnswers(prev => ({ ...prev, category: cat.id }))}
                        className={`
                            relative h-24 md:h-40 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 md:gap-3 group
                            ${answers.category === cat.id
                                ? 'bg-[#D2E823] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                                : 'bg-white border-[#1A1A1A] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            }
                        `}
                    >
                        <span className="text-3xl md:text-5xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                        <span className={`font-black uppercase tracking-wider text-xs md:text-sm ${answers.category === cat.id ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/70'}`}>
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
                    {t("onboarding.back")}
                </button>
                <button
                    onClick={handleNext}
                    disabled={!answers.category}
                    className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#D2E823] hover:text-[#1A1A1A] hover:border-2 hover:border-[#1A1A1A] hover:shadow-[4px_4px_0px_0px_rgba(210,232,35,1)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    {t("onboarding.continue")}
                </button>
            </div>
        </div>
    );

    const renderStep3_Theme = () => (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-6xl mx-auto h-auto md:h-[calc(100vh-140px)] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Left Panel: Selection */}
            <div className="w-full md:w-1/3 flex flex-col space-y-4 md:space-y-6 overflow-y-auto pr-0 md:pr-2 custom-scrollbar">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                        {t("onboarding.step3.title")}
                    </h1>
                    <p className="text-sm md:text-base text-[#1A1A1A]/60 font-medium">
                        {t("onboarding.step3.subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:gap-4 pb-32 md:pb-20">
                    {THEME_PRESETS.map(theme => (
                        <button
                            key={theme.name}
                            onClick={() => setAnswers(prev => ({ ...prev, theme }))}
                            className={`
                                group relative p-3 md:p-4 rounded-xl border-2 transition-all text-left overflow-hidden
                                ${answers.theme?.name === theme.name
                                    ? 'border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white ring-2 ring-[#D2E823] ring-offset-2'
                                    : 'border-transparent hover:border-[#1A1A1A]/10 bg-white hover:shadow-sm'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div
                                    className="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-inner border border-black/5 shrink-0"
                                    style={{ background: theme.styles.bgColor }}
                                />
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-[#1A1A1A] text-sm md:text-base">{theme.name}</h3>
                                    <p className="text-xs text-[#1A1A1A]/50 font-medium line-clamp-1">{t("onboarding.step3.designedFor", { category: answers.category || t("onboarding.step3.everyone") })}</p>
                                </div>
                            </div>

                            {answers.theme?.name === theme.name && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-3 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-[#1A1A1A] text-[#D2E823] rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: Live Mobile Preview */}
            <div className="hidden md:flex w-full md:w-2/3 bg-[#F3F3F1] rounded-[40px] border-4 border-[#1A1A1A] p-4 items-center justify-center relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                <div className="relative w-[300px] h-[600px] bg-white rounded-[40px] border-[8px] border-[#1A1A1A] overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-300 transform">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-b-2xl z-20" />

                    {answers.theme && (
                        <div
                            className="w-full h-full flex flex-col p-6 overflow-y-auto scrollbar-hide"
                            style={{
                                background: answers.theme.styles.bgColor,
                                fontFamily: answers.theme.styles.font
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
                                            background: answers.theme!.styles.cardBackgroundColor,
                                            border: `${answers.theme!.styles.cardBorderWidth || 0}px solid ${answers.theme!.styles.cardBorderColor}`,
                                            color: answers.theme!.styles.usernameColor
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
                        onClick={handleNext}
                        className="w-16 h-16 bg-[#D2E823] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[#1A1A1A]"
                    >
                        <ArrowRight className="w-8 h-8" strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t-2 border-[#1A1A1A] p-4 flex items-center gap-3 z-50 safe-area-bottom">
                {answers.theme && (
                    <div
                        className="w-12 h-12 rounded-xl shrink-0 border-2 border-[#1A1A1A]"
                        style={{ background: answers.theme.styles.bgColor }}
                    />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1A1A1A] truncate">{answers.theme?.name || t("onboarding.step3.selectTheme")}</p>
                    <p className="text-xs text-[#1A1A1A]/50">{t("onboarding.step3.tapTheme")}</p>
                </div>
                <button
                    onClick={handleBack}
                    className="w-10 h-10 bg-white border-2 border-[#1A1A1A] rounded-full flex items-center justify-center shrink-0"
                >
                    <span className="text-sm">🔙</span>
                </button>
                <button
                    onClick={handleNext}
                    disabled={!answers.theme}
                    className="h-12 px-6 bg-[#D2E823] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center gap-2 font-bold text-sm text-[#1A1A1A] disabled:opacity-50 shrink-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                    <ArrowRight className="w-5 h-5" strokeWidth={3} />
                    {t("onboarding.continue")}
                </button>
            </div>
        </div>
    );

    const renderStep4_AboutYou = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 w-full max-w-2xl mx-auto">
            <div className="space-y-3 md:space-y-4">
                <div className="w-16 h-16 bg-[#D2E823] border-2 border-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <User className="w-8 h-8 text-[#1A1A1A]" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                    {t("onboarding.step4.title")}
                </h1>
                <p className="text-base md:text-lg text-[#1A1A1A]/60 font-medium max-w-lg mx-auto">
                    {t("onboarding.step4.subtitle")}
                </p>
            </div>

            <div className="w-full space-y-4">
                <div className="text-left">
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">
                        {t("onboarding.step4.professionLabel")}
                    </label>
                    <input
                        type="text"
                        value={answers.profession}
                        onChange={(e) => setAnswers(prev => ({ ...prev, profession: e.target.value }))}
                        className="w-full py-4 px-5 bg-white border-2 border-[#1A1A1A] rounded-xl text-base font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        placeholder={t("onboarding.step4.professionPlaceholder")}
                    />
                </div>

                <div className="text-left">
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2 uppercase tracking-wider">
                        {t("onboarding.step4.aboutLabel")} <span className="text-[#1A1A1A]/40 normal-case">({t("onboarding.step4.aiNote")})</span>
                    </label>
                    <textarea
                        value={answers.aboutYou}
                        onChange={(e) => setAnswers(prev => ({ ...prev, aboutYou: e.target.value }))}
                        rows={4}
                        className="w-full py-4 px-5 bg-white border-2 border-[#1A1A1A] rounded-xl text-base font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none"
                        placeholder={t("onboarding.step4.aboutPlaceholder")}
                    />
                </div>

                <div className="text-left">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                            onClick={() => setAnswers(prev => ({ ...prev, hasGraduation: !prev.hasGraduation }))}
                            className={`w-6 h-6 rounded-lg border-2 border-[#1A1A1A] flex items-center justify-center transition-all ${answers.hasGraduation ? 'bg-[#D2E823] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}
                        >
                            {answers.hasGraduation && <Check className="w-4 h-4 text-[#1A1A1A]" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">{t("onboarding.step4.hasDegree")}</span>
                    </label>

                    {answers.hasGraduation && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <input
                                type="text"
                                value={answers.courseName}
                                onChange={(e) => setAnswers(prev => ({ ...prev, courseName: e.target.value }))}
                                className="w-full py-3 px-4 bg-white border-2 border-[#1A1A1A]/30 rounded-xl text-sm font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#1A1A1A] transition-all"
                                placeholder={t("onboarding.step4.coursePlaceholder")}
                            />
                            <input
                                type="text"
                                value={answers.universityName}
                                onChange={(e) => setAnswers(prev => ({ ...prev, universityName: e.target.value }))}
                                className="w-full py-3 px-4 bg-white border-2 border-[#1A1A1A]/30 rounded-xl text-sm font-medium text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#1A1A1A] transition-all"
                                placeholder={t("onboarding.step4.universityPlaceholder")}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 w-full max-w-md">
                <button
                    onClick={handleBack}
                    className="flex-1 py-4 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-bold uppercase tracking-wider hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    {t("onboarding.back")}
                </button>
                <button
                    onClick={handleNext}
                    disabled={!answers.profession}
                    className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#D2E823] hover:text-[#1A1A1A] hover:border-2 hover:border-[#1A1A1A] hover:shadow-[4px_4px_0px_0px_rgba(210,232,35,1)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    {t("onboarding.continue")}
                </button>
            </div>
        </div>
    );

    const renderStep5_Skills = () => {
        const availableSkills = SKILL_OPTIONS[answers.category] || SKILL_OPTIONS.other;
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 w-full max-w-3xl mx-auto">
                <div className="space-y-3 md:space-y-4">
                    <div className="w-16 h-16 bg-[#D2E823] border-2 border-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Zap className="w-8 h-8 text-[#1A1A1A]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                        {t("onboarding.step5.title")}
                    </h1>
                    <p className="text-base md:text-lg text-[#1A1A1A]/60 font-medium">
                        {t("onboarding.step5.subtitle")} <span className="font-bold text-[#1A1A1A]">{answers.skills.length}/6</span>
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full">
                    {availableSkills.map(skill => (
                        <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={`
                                px-5 py-3 rounded-full border-2 font-bold text-sm transition-all duration-200
                                ${answers.skills.includes(skill)
                                    ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-[3px_3px_0px_0px_rgba(210,232,35,1)] -translate-y-0.5'
                                    : 'bg-white border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:border-[#1A1A1A] hover:text-[#1A1A1A] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                }
                                ${!answers.skills.includes(skill) && answers.skills.length >= 6 ? 'opacity-30 pointer-events-none' : ''}
                            `}
                        >
                            {answers.skills.includes(skill) && <span className="mr-1.5">✓</span>}
                            {skill}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 w-full max-w-md">
                    <button
                        onClick={handleBack}
                        className="flex-1 py-4 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-bold uppercase tracking-wider hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        {t("onboarding.back")}
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={answers.skills.length === 0}
                        className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#D2E823] hover:text-[#1A1A1A] hover:border-2 hover:border-[#1A1A1A] hover:shadow-[4px_4px_0px_0px_rgba(210,232,35,1)] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {t("onboarding.continue")}
                    </button>
                </div>
            </div>
        );
    };

    const renderStep6_Goals = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 w-full max-w-3xl mx-auto">
            <div className="space-y-3 md:space-y-4">
                <div className="w-16 h-16 bg-[#D2E823] border-2 border-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Target className="w-8 h-8 text-[#1A1A1A]" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                    {t("onboarding.step6.title")}
                </h1>
                <p className="text-base md:text-lg text-[#1A1A1A]/60 font-medium">
                    {t("onboarding.step6.subtitle")} <span className="font-bold text-[#1A1A1A]">{answers.goals.length}/4</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {GOAL_OPTIONS.map(goal => (
                    <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`
                            relative flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 text-left group
                            ${answers.goals.includes(goal.id)
                                ? 'bg-[#D2E823] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                                : 'bg-white border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            }
                            ${!answers.goals.includes(goal.id) && answers.goals.length >= 4 ? 'opacity-30 pointer-events-none' : ''}
                        `}
                    >
                        <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">{goal.icon}</span>
                        <span className={`font-bold text-sm md:text-base ${answers.goals.includes(goal.id) ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/70'}`}>
                            {goal.label}
                        </span>
                        {answers.goals.includes(goal.id) && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-center text-[#D2E823]">
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
                    {t("onboarding.back")}
                </button>
                <button
                    onClick={handleFinish}
                    disabled={answers.goals.length === 0 || isGenerating}
                    className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#D2E823] hover:text-[#1A1A1A] hover:border-2 hover:border-[#1A1A1A] hover:shadow-[4px_4px_0px_0px_rgba(210,232,35,1)] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t("onboarding.step6.creating")}
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-5 h-5" />
                            {t("onboarding.step6.generateBio")}
                        </>
                    )}
                </button>
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
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
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
                    {step === 4 && renderStep4_AboutYou()}
                    {step === 5 && renderStep5_Skills()}
                    {step === 6 && renderStep6_Goals()}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 text-center text-[#1A1A1A]/40 text-xs font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} Portyo
            </footer>
        </div>
    );
}
