import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "~/services/api";

type BioBlock = any;

interface AIGenerationResult {
    blocks: BioBlock[];
    settings: {
        bgType?: string;
        bgColor?: string;
        bgSecondaryColor?: string;
        cardStyle?: string;
        cardBackgroundColor?: string;
        usernameColor?: string;
        font?: string;
        imageStyle?: string;
        buttonStyle?: string;
        customFontUrl?: string;
        customFontName?: string;
        enableParallax?: boolean;
        floatingElements?: boolean;
        floatingElementsType?: string;
        floatingElementsColor?: string;
    };
    replaceBlocks: boolean;
    globalBlockStyles?: Partial<BioBlock>;
}

interface PortyoAIProps {
    bioId: string;
    isOpen: boolean;
    onClose: () => void;
    onBlocksGenerated: (newBlocks: BioBlock[], replace: boolean) => void;
    onSettingsChange: (settings: AIGenerationResult['settings']) => void;
    onGlobalStylesChange?: (styles: Partial<BioBlock>) => void;
}

export function PortyoAI({ bioId, isOpen, onClose, onBlocksGenerated, onSettingsChange, onGlobalStylesChange }: PortyoAIProps) {
    const { t } = useTranslation("dashboard");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setError("");

        try {
            const res = await api.post("/onboarding/generate-content", {
                bioId,
                prompt,
                currentBlocks: [] // logic to pass current blocks if needed
            });

            const data: AIGenerationResult = res.data;

            if (data.blocks && Array.isArray(data.blocks)) {
                // Pass replace flag to callback - true means replace all, false means add
                onBlocksGenerated(data.blocks, data.replaceBlocks === true);
            }

            if (data.settings && onSettingsChange) {
                onSettingsChange(data.settings);
            }

            if (data.globalBlockStyles && onGlobalStylesChange) {
                onGlobalStylesChange(data.globalBlockStyles);
            }

            setPrompt("");
            onClose();
        } catch (err: any) {
            console.error("AI generation failed:", err);
            setError(err.response?.data?.message || t("editor.ai.errorGenerate"));
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    const suggestions = [
        { key: "minimalist", label: t("editor.ai.suggestions.minimalist") },
        { key: "instagram", label: t("editor.ai.suggestions.instagram") },
        { key: "portfolio", label: t("editor.ai.suggestions.portfolio") },
        { key: "contact", label: t("editor.ai.suggestions.contact") },
        { key: "dark", label: t("editor.ai.suggestions.dark") },
    ];

    return (
        <div ref={containerRef} className="relative z-50 w-full max-w-md">
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-center gap-2 md:gap-3 bg-white rounded-2xl border-2 border-gray-200 shadow-xl px-3 md:px-4 py-2.5 md:py-3 w-full">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t("editor.ai.placeholder")}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 min-w-0"
                        disabled={isGenerating}
                        autoFocus
                    />

                    {isGenerating ? (
                        <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                            <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : prompt.trim() ? (
                        <button
                            type="submit"
                            className="w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95 text-white shadow-md"
                        >
                            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {error && (
                    <div className="absolute top-full left-0 mt-2 w-full">
                        <div className="bg-red-50 text-red-600 text-xs font-semibold px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-red-200 shadow-sm flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}
            </form>

            {/* Enhanced suggestion chips */}
            <div className="absolute top-full left-0 right-0 mt-3 flex gap-1.5 md:gap-2 flex-wrap px-0 md:px-1 z-[60]">
                {suggestions.map((suggestion) => (
                    <button
                        key={suggestion.key}
                        type="button"
                        onClick={() => setPrompt(suggestion.label)}
                        className="px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-semibold text-gray-600 bg-white hover:bg-purple-50 hover:text-[#8129D9] hover:border-purple-300 border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all duration-200 whitespace-nowrap"
                    >
                        {suggestion.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
