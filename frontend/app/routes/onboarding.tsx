import { useNavigate } from "react-router";
import { useContext, useState, useEffect } from "react";
import { AuthBackground } from "~/components/shared/auth-background";
import AuthContext from "~/contexts/auth.context";
import { api } from "~/services/api";

export function meta() {
    return [{ title: "Welcome to Portyo - Setup Your Profile" }];
}

interface OnboardingAnswers {
    aboutYou: string;
    education: {
        hasGraduation: boolean;
        degree?: string;
    };
    profession: string;
    skills: string[];
    goals: string;
}

const PROFESSIONS = [
    "Software Developer",
    "Designer",
    "Digital Marketing",
    "Content Creator",
    "Photographer",
    "Musician",
    "Consultant",
    "Freelancer",
    "Entrepreneur",
    "Student",
    "Teacher",
    "Artist",
    "Other"
];

const SKILLS = [
    "Programming",
    "Graphic Design",
    "UI/UX Design",
    "Marketing",
    "SEO",
    "Social Media",
    "Photography",
    "Video Editing",
    "Writing",
    "Sales",
    "Project Management",
    "Communication",
    "Leadership",
    "Data Analysis",
    "Languages",
    "Music",
    "Illustration"
];

const GOALS = [
    "Showcase my portfolio",
    "Centralize my links and social media",
    "Sell products or services",
    "Promote my freelance work",
    "Professional networking",
    "Create a professional contact page",
    "Build my personal brand"
];

const STEP_CONFIG = [
    {
        icon: "👋",
        gradient: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/30",
        title: "Tell us about yourself",
        subtitle: "A brief description that will help create your page"
    },
    {
        icon: "🎓",
        gradient: "from-sky-500 to-blue-600",
        shadow: "shadow-sky-500/30",
        title: "Your education",
        subtitle: "Do you have a degree?"
    },
    {
        icon: "💼",
        gradient: "from-emerald-500 to-teal-600",
        shadow: "shadow-emerald-500/30",
        title: "What do you do?",
        subtitle: "Select the option that best describes you"
    },
    {
        icon: "⚡",
        gradient: "from-amber-500 to-orange-600",
        shadow: "shadow-amber-500/30",
        title: "Your top skills",
        subtitle: "Select all that apply (optional)"
    },
    {
        icon: "🎯",
        gradient: "from-rose-500 to-pink-600",
        shadow: "shadow-rose-500/30",
        title: "What's your goal?",
        subtitle: "What do you want to achieve with your page?"
    }
];

export default function Onboarding() {
    const { user, loading, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [answers, setAnswers] = useState<OnboardingAnswers>({
        aboutYou: "",
        education: {
            hasGraduation: false,
            degree: ""
        },
        profession: "",
        skills: [],
        goals: ""
    });

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
        if (!loading && user && user.onboardingCompleted) {
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    const totalSteps = 5;
    const currentConfig = STEP_CONFIG[step - 1];

    const handleSkip = async () => {
        try {
            await api.post("/onboarding/skip");
            await refreshUser();
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to skip onboarding:", err);
            navigate("/dashboard");
        }
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            await api.post("/onboarding/generate-bio", answers);
            await refreshUser();
            navigate("/dashboard");
        } catch (err: any) {
            console.error("Failed to generate bio:", err);
            setError(err.response?.data?.message || "Failed to generate your profile. Please try again.");
            setIsGenerating(false);
        }
    };

    const toggleSkill = (skill: string) => {
        setAnswers(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const canProceed = () => {
        switch (step) {
            case 1: return answers.aboutYou.trim().length > 0;
            case 2: return true;
            case 3: return answers.profession.length > 0;
            case 4: return true;
            case 5: return answers.goals.length > 0;
            default: return false;
        }
    };

    if (loading || !user) return null;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <textarea
                            value={answers.aboutYou}
                            onChange={(e) => setAnswers({ ...answers, aboutYou: e.target.value })}
                            placeholder="e.g., I'm a passionate full-stack developer who loves building innovative solutions..."
                            className="w-full px-5 py-4 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/60 min-h-[160px] resize-none leading-relaxed"
                            autoFocus
                        />
                        <p className="text-xs text-text-muted text-center">
                            This will be used to create your bio description
                        </p>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setAnswers({ ...answers, education: { hasGraduation: true, degree: answers.education.degree } })}
                                className={`group relative px-6 py-8 rounded-2xl font-semibold transition-all duration-300 text-center overflow-hidden ${answers.education.hasGraduation
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]'
                                    : 'bg-white border-2 border-border hover:border-primary/50 hover:shadow-lg'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${answers.education.hasGraduation
                                    ? 'bg-white/20'
                                    : 'bg-primary/10 group-hover:bg-primary/20'
                                    }`}>
                                    <svg className={`w-7 h-7 ${answers.education.hasGraduation ? 'text-white' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold">Yes, I do</span>
                                <p className={`text-xs mt-1 ${answers.education.hasGraduation ? 'text-white/70' : 'text-text-muted'}`}>I have a degree</p>
                            </button>
                            <button
                                onClick={() => setAnswers({ ...answers, education: { hasGraduation: false, degree: "" } })}
                                className={`group relative px-6 py-8 rounded-2xl font-semibold transition-all duration-300 text-center overflow-hidden ${!answers.education.hasGraduation
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]'
                                    : 'bg-white border-2 border-border hover:border-primary/50 hover:shadow-lg'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${!answers.education.hasGraduation
                                    ? 'bg-white/20'
                                    : 'bg-gray-100 group-hover:bg-gray-200'
                                    }`}>
                                    <svg className={`w-7 h-7 ${!answers.education.hasGraduation ? 'text-white' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold">Not yet</span>
                                <p className={`text-xs mt-1 ${!answers.education.hasGraduation ? 'text-white/70' : 'text-text-muted'}`}>Still learning</p>
                            </button>
                        </div>

                        {answers.education.hasGraduation && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    type="text"
                                    value={answers.education.degree || ""}
                                    onChange={(e) => setAnswers({ ...answers, education: { ...answers.education, degree: e.target.value } })}
                                    placeholder="What did you study? e.g., Computer Science"
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-text-muted/60"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {PROFESSIONS.map((profession) => (
                            <button
                                key={profession}
                                onClick={() => setAnswers({ ...answers, profession })}
                                className={`w-full px-5 py-4 rounded-xl font-medium text-sm transition-all text-left flex items-center gap-3 group ${answers.profession === profession
                                    ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/20'
                                    : 'bg-surface border border-border hover:border-primary/40 hover:bg-surface-muted'
                                    }`}
                            >
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${answers.profession === profession
                                    ? 'border-white bg-white/20'
                                    : 'border-border group-hover:border-primary/50'
                                    }`}>
                                    {answers.profession === profession && (
                                        <span className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </span>
                                {profession}
                            </button>
                        ))}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                            {SKILLS.map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${answers.skills.includes(skill)
                                        ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-md shadow-primary/20'
                                        : 'bg-surface border border-border hover:border-primary/40 hover:bg-surface-muted'
                                        }`}
                                >
                                    {answers.skills.includes(skill) && <span className="mr-1.5">✓</span>}
                                    {skill}
                                </button>
                            ))}
                        </div>

                        {answers.skills.length > 0 && (
                            <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium">
                                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    {answers.skills.length}
                                </span>
                                skill{answers.skills.length > 1 ? 's' : ''} selected
                            </div>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {GOALS.map((goal) => (
                            <button
                                key={goal}
                                onClick={() => setAnswers({ ...answers, goals: goal })}
                                className={`w-full px-5 py-4 rounded-xl font-medium text-sm transition-all text-left flex items-center gap-3 group ${answers.goals === goal
                                    ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/20'
                                    : 'bg-surface border border-border hover:border-primary/40 hover:bg-surface-muted'
                                    }`}
                            >
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${answers.goals === goal
                                    ? 'border-white bg-white/20'
                                    : 'border-border group-hover:border-primary/50'
                                    }`}>
                                    {answers.goals === goal && (
                                        <span className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </span>
                                {goal}
                            </button>
                        ))}
                    </div>
                );
        }
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
                <AuthBackground />
                <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                    <div className="bg-surface w-full max-w-[560px] rounded-[2rem] shadow-2xl p-10 md:p-14 relative border border-white/50 text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40 animate-pulse">
                                <span className="text-4xl">✨</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Creating your page...</h2>
                            <p className="text-text-muted text-sm leading-relaxed">
                                Our AI is crafting the perfect content for you.<br />
                                This only takes a few seconds.
                            </p>
                        </div>

                        <div className="flex justify-center gap-2">
                            <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                            <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-surface-alt flex flex-col relative overflow-hidden font-sans text-text-main">
            <AuthBackground />
            <main className="flex-1 flex items-center justify-center p-4 z-10 w-full">
                <div className="bg-surface w-full max-w-[560px] rounded-[2rem] shadow-2xl p-10 md:p-12 relative border border-white/50">

                    {/* Progress Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div
                                        key={s}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${s === step
                                            ? 'w-6 bg-primary'
                                            : s < step
                                                ? 'bg-primary/60'
                                                : 'bg-border'
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleSkip}
                                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-muted"
                            >
                                Skip
                            </button>
                        </div>
                    </div>

                    {/* Step Header */}
                    <div className="text-center mb-8">
                        <div className={`w-16 h-16 bg-gradient-to-br ${currentConfig.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl ${currentConfig.shadow} rotate-3 hover:rotate-0 transition-transform`}>
                            <span className="text-2xl">{currentConfig.icon}</span>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">{currentConfig.title}</h1>
                        <p className="text-text-muted text-sm">{currentConfig.subtitle}</p>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[280px]">
                        {renderStep()}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-10">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex-1 bg-white border-2 border-border text-text-main font-bold py-4 px-6 rounded-2xl hover:bg-surface-muted hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                        )}

                        {step < totalSteps ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex-1 bg-primary text-white font-bold py-4 px-6 rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                Continue
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={!canProceed()}
                                className="flex-1 bg-gradient-to-r from-primary to-primary-hover text-white font-bold py-4 px-6 rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                <span>✨</span> Generate my page
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
}
