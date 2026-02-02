import { useState } from "react";
import { 
    BarChart3, 
    TrendingUp, 
    Target, 
    Zap, 
    Brain, 
    FileText, 
    Lightbulb,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Hash,
    Type,
    List,
    Link,
    Eye,
    MessageSquare,
    Sparkles,
    Mic,
    HelpCircle,
    CheckSquare,
    Cpu
} from "lucide-react";
import type { 
    GeneratedPostPreview, 
    AutoPostLog,
    SEOMetrics,
    GEOMetrics,
    AEOMetrics,
    AIOMetrics,
    ContentQualityMetrics,
    ReadabilityMetrics,
    ContentAnalysis,
    KeywordAnalysis
} from "~/contexts/auto-post.context";

interface SEODashboardProps {
    metrics: GeneratedPostPreview | AutoPostLog;
    variant?: "full" | "compact" | "preview";
}

// ========== UTILITY FUNCTIONS ==========

const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-lime-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
};

const getScoreBgColor = (score: number): string => {
    if (score >= 90) return "bg-green-500/20";
    if (score >= 80) return "bg-lime-500/20";
    if (score >= 70) return "bg-yellow-500/20";
    if (score >= 60) return "bg-orange-500/20";
    return "bg-red-500/20";
};

const getScoreBarColor = (score: number): string => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-lime-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
};

const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Work";
};

// ========== SCORE CARD COMPONENT ==========

interface ScoreCardProps {
    title: string;
    score: number;
    icon: React.ReactNode;
    subtitle?: string;
    size?: "sm" | "md" | "lg";
}

const ScoreCard = ({ title, score, icon, subtitle, size = "md" }: ScoreCardProps) => {
    const sizeClasses = {
        sm: "p-2.5",
        md: "p-3",
        lg: "p-4"
    };

    const scoreSizeClasses = {
        sm: "text-xl",
        md: "text-2xl",
        lg: "text-3xl"
    };

    const iconSizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12"
    };

    return (
        <div className={`card ${sizeClasses[size]} hover:scale-[1.02] transition-transform`}>
            {/* Header com ícone e título - layout compacto */}
            <div className="flex items-center gap-2 mb-2">
                <div className={`${iconSizeClasses[size]} rounded-lg flex items-center justify-center ${getScoreBgColor(score)} flex-shrink-0`}>
                    <div className="w-4 h-4">
                        {icon}
                    </div>
                </div>
                <p className="text-xs text-text-muted truncate">{title}</p>
            </div>
            
            {/* Score */}
            <div className="flex items-baseline gap-1 mb-0.5">
                <span className={`font-bold ${scoreSizeClasses[size]} ${getScoreColor(score)}`}>
                    {score}
                </span>
                <span className="text-xs text-text-muted">/100</span>
            </div>
            
            {/* Subtitle/Label - uma linha só */}
            {subtitle && (
                <p className={`text-xs mb-2 truncate ${getScoreColor(score)}`}>
                    {subtitle}
                </p>
            )}
            
            {/* Progress bar fina */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
};

// ========== METRIC BAR COMPONENT ==========

interface MetricBarProps {
    label: string;
    score: number;
    maxScore?: number;
}

const MetricBar = ({ label, score, maxScore = 100 }: MetricBarProps) => (
    <div className="flex items-center gap-2 md:gap-3">
        <span className="text-xs md:text-sm text-text-muted w-28 md:w-40 truncate">{label}</span>
        <div className="flex-1 h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
                style={{ width: `${(score / maxScore) * 100}%` }}
            />
        </div>
        <span className={`text-xs md:text-sm font-medium w-8 md:w-10 text-right ${getScoreColor(score)}`}>
            {score}
        </span>
    </div>
);

// ========== EXPANDABLE SECTION ==========

interface ExpandableSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const ExpandableSection = ({ title, icon, children, defaultOpen = false }: ExpandableSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="card overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-4 h-4 md:w-5 md:h-5">{icon}</div>
                    <span className="text-sm md:font-medium text-text-main">{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-text-muted" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-text-muted" />}
            </button>
            {isOpen && (
                <div className="p-3 md:p-4 pt-0 border-t border-border">
                    {children}
                </div>
            )}
        </div>
    );
};

// ========== KEYWORD ANALYSIS COMPONENT ==========

const KeywordAnalysisPanel = ({ analysis }: { analysis: KeywordAnalysis }) => (
    <div className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-xl">
            <p className="text-sm text-text-muted mb-1">Primary Keyword</p>
            <p className="text-lg font-semibold text-primary">{analysis.primaryKeyword}</p>
            <p className="text-xs text-text-muted mt-1">
                Density: {analysis.keywordDensity.toFixed(1)}%
            </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm text-text-muted mb-2">Secondary Keywords</p>
                <div className="flex flex-wrap gap-2">
                    {analysis.secondaryKeywords?.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-muted rounded-lg text-xs text-text-main">
                            {kw}
                        </span>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-sm text-text-muted mb-2">Semantic Keywords</p>
                <div className="flex flex-wrap gap-2">
                    {analysis.semanticKeywords?.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs">
                            {kw}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {analysis.lsiKeywords?.length > 0 && (
            <div>
                <p className="text-sm text-text-muted mb-2">LSI Keywords</p>
                <div className="flex flex-wrap gap-2">
                    {analysis.lsiKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-muted/50 rounded-lg text-xs text-text-muted">
                            {kw}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
);

// ========== READABILITY PANEL ==========

const ReadabilityPanel = ({ metrics }: { metrics: ReadabilityMetrics }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-xl text-center">
            <p className="text-2xl font-bold text-text-main">{metrics.fleschReadingEase.toFixed(0)}</p>
            <p className="text-xs text-text-muted mt-1">Flesch Reading Ease</p>
            <p className="text-xs text-green-400 mt-1">
                {metrics.fleschReadingEase > 60 ? "Easy to Read" : "Moderate"}
            </p>
        </div>
        <div className="p-4 bg-muted rounded-xl text-center">
            <p className="text-2xl font-bold text-text-main">{metrics.fleschKincaidGrade.toFixed(1)}</p>
            <p className="text-xs text-text-muted mt-1">Grade Level</p>
        </div>
        <div className="p-4 bg-muted rounded-xl text-center">
            <p className="text-2xl font-bold text-text-main">{metrics.averageSentenceLength.toFixed(1)}</p>
            <p className="text-xs text-text-muted mt-1">Avg Sentence Length</p>
        </div>
        <div className="p-4 bg-muted rounded-xl text-center">
            <p className="text-2xl font-bold text-text-main">{metrics.totalWords}</p>
            <p className="text-xs text-text-muted mt-1">Total Words</p>
        </div>
        <div className="p-4 bg-muted rounded-xl text-center">
            <p className="text-2xl font-bold text-text-main">{metrics.totalSentences}</p>
            <p className="text-xs text-text-muted mt-1">Total Sentences</p>
        </div>
        <div className="p-4 bg-muted rounded-xl text-center">
            <p className="text-2xl font-bold text-text-main">{metrics.averageWordLength.toFixed(1)}</p>
            <p className="text-xs text-text-muted mt-1">Avg Word Length</p>
        </div>
    </div>
);

// ========== CONTENT ANALYSIS PANEL ==========

const ContentAnalysisPanel = ({ analysis }: { analysis: ContentAnalysis }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                {analysis.contentDepth} depth
            </span>
            {analysis.hasCTA && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Has CTA
                </span>
            )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-muted rounded-xl text-center">
                <Type className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                <p className="text-lg font-semibold text-text-main">{analysis.headingsCount}</p>
                <p className="text-xs text-text-muted">Headings</p>
            </div>
            <div className="p-3 bg-muted rounded-xl text-center">
                <List className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                <p className="text-lg font-semibold text-text-main">{analysis.paragraphCount}</p>
                <p className="text-xs text-text-muted">Paragraphs</p>
            </div>
            <div className="p-3 bg-muted rounded-xl text-center">
                <Hash className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                <p className="text-lg font-semibold text-text-main">{analysis.listCount}</p>
                <p className="text-xs text-text-muted">Lists</p>
            </div>
            <div className="p-3 bg-muted rounded-xl text-center">
                <Link className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                <p className="text-lg font-semibold text-text-main">{analysis.internalLinksCount + analysis.externalLinksCount}</p>
                <p className="text-xs text-text-muted">Links</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-text-muted">H2 Headings</span>
                <span className="font-medium text-text-main">{analysis.h2Count}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-text-muted">H3 Headings</span>
                <span className="font-medium text-text-main">{analysis.h3Count}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-text-muted">Images</span>
                <span className="font-medium text-text-main">{analysis.imageCount}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-text-muted">External Links</span>
                <span className="font-medium text-text-main">{analysis.externalLinksCount}</span>
            </div>
        </div>
    </div>
);

// ========== SUGGESTIONS PANEL ==========

const SuggestionsPanel = ({ 
    seoSuggestions, 
    geoSuggestions,
    aeoSuggestions,
    aioSuggestions
}: { 
    seoSuggestions: string[]; 
    geoSuggestions: string[];
    aeoSuggestions?: string[];
    aioSuggestions?: string[];
}) => (
    <div className="space-y-4">
        {seoSuggestions?.length > 0 && (
            <div>
                <h4 className="text-sm font-medium text-text-main mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    SEO Improvements
                </h4>
                <ul className="space-y-2">
                    {seoSuggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            {suggestion}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {geoSuggestions?.length > 0 && (
            <div>
                <h4 className="text-sm font-medium text-text-main mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    GEO Optimizations
                </h4>
                <ul className="space-y-2">
                    {geoSuggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                            {suggestion}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {aeoSuggestions && aeoSuggestions?.length > 0 && (
            <div>
                <h4 className="text-sm font-medium text-text-main mb-2 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    AEO Optimizations (Answer Engine)
                </h4>
                <ul className="space-y-2">
                    {aeoSuggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                            <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            {suggestion}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {aioSuggestions && aioSuggestions?.length > 0 && (
            <div>
                <h4 className="text-sm font-medium text-text-main mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-orange-400" />
                    AIO Optimizations (AI Optimization)
                </h4>
                <ul className="space-y-2">
                    {aioSuggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                            <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                            {suggestion}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

// ========== MAIN DASHBOARD COMPONENT ==========

export const SEOGEODashboard = ({ metrics, variant = "full" }: SEODashboardProps) => {
    // Helper to check if metrics is GeneratedPostPreview or AutoPostLog
    const isPreview = (m: GeneratedPostPreview | AutoPostLog): m is GeneratedPostPreview => {
        return "seoMetrics" in m && "geoMetrics" in m;
    };

    const seoMetrics: SEOMetrics | undefined = isPreview(metrics) ? metrics.seoMetrics : undefined;
    const geoMetrics: GEOMetrics | undefined = isPreview(metrics) ? metrics.geoMetrics : undefined;
    const aeoMetrics: AEOMetrics | undefined = isPreview(metrics) ? metrics.aeoMetrics : undefined;
    const aioMetrics: AIOMetrics | undefined = isPreview(metrics) ? metrics.aioMetrics : undefined;
    const contentQuality: ContentQualityMetrics | undefined = isPreview(metrics) ? metrics.contentQualityMetrics : undefined;
    const keywordAnalysis: KeywordAnalysis | undefined = isPreview(metrics) ? metrics.keywordAnalysis : undefined;
    const readabilityMetrics: ReadabilityMetrics | undefined = isPreview(metrics) ? metrics.readabilityMetrics : undefined;
    const contentAnalysis: ContentAnalysis | undefined = isPreview(metrics) ? metrics.contentAnalysis : undefined;

    // For AutoPostLog, we use individual fields
    const getLogScore = (log: AutoPostLog, key: keyof AutoPostLog) => {
        const val = log[key];
        return typeof val === "number" ? val : 0;
    };

    if (variant === "compact") {
        // Compact view for recent posts list
        const log = metrics as AutoPostLog;
        return (
            <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getScoreBgColor(log.seoScore || 0)} ${getScoreColor(log.seoScore || 0)}`}>
                    SEO {log.seoScore || 0}
                </div>
                {log.geoScore && (
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getScoreBgColor(log.geoScore)} ${getScoreColor(log.geoScore)}`}>
                        GEO {log.geoScore}
                    </div>
                )}
                {log.aeoScore && (
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getScoreBgColor(log.aeoScore)} ${getScoreColor(log.aeoScore)}`}>
                        AEO {log.aeoScore}
                    </div>
                )}
                {log.aioScore && (
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getScoreBgColor(log.aioScore)} ${getScoreColor(log.aioScore)}`}>
                        AIO {log.aioScore}
                    </div>
                )}
            </div>
        );
    }

    if (variant === "preview" && seoMetrics && geoMetrics) {
        // Preview mode - compact view for popup
        return (
            <div className="grid grid-cols-4 gap-2 mb-4">
                <ScoreCard
                    title="SEO"
                    score={seoMetrics.seoScore}
                    icon={<TrendingUp className="w-4 h-4 text-primary" />}
                    subtitle={getScoreLabel(seoMetrics.seoScore)}
                    size="sm"
                />
                <ScoreCard
                    title="GEO"
                    score={geoMetrics.geoScore}
                    icon={<Brain className="w-4 h-4 text-purple-400" />}
                    subtitle={getScoreLabel(geoMetrics.geoScore)}
                    size="sm"
                />
                {aeoMetrics && (
                    <ScoreCard
                        title="AEO"
                        score={aeoMetrics.aeoScore}
                        icon={<Mic className="w-4 h-4 text-cyan-400" />}
                        subtitle={getScoreLabel(aeoMetrics.aeoScore)}
                        size="sm"
                    />
                )}
                {aioMetrics && (
                    <ScoreCard
                        title="AIO"
                        score={aioMetrics.aioScore}
                        icon={<Cpu className="w-4 h-4 text-orange-400" />}
                        subtitle={getScoreLabel(aioMetrics.aioScore)}
                        size="sm"
                    />
                )}
            </div>
        );
    }

    // Full dashboard
    if (!seoMetrics || !geoMetrics || !contentQuality) {
        return (
            <div className="card p-6 text-center text-text-muted">
                Detailed metrics not available for this post.
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Main Scores - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <ScoreCard
                    title="SEO"
                    score={seoMetrics.seoScore}
                    icon={<TrendingUp className="w-4 h-4 text-primary" />}
                    subtitle={getScoreLabel(seoMetrics.seoScore)}
                    size="sm"
                />
                <ScoreCard
                    title="GEO"
                    score={geoMetrics.geoScore}
                    icon={<Brain className="w-4 h-4 text-purple-400" />}
                    subtitle={getScoreLabel(geoMetrics.geoScore)}
                    size="sm"
                />
                {aeoMetrics && (
                    <ScoreCard
                        title="AEO"
                        score={aeoMetrics.aeoScore}
                        icon={<Mic className="w-4 h-4 text-cyan-400" />}
                        subtitle={getScoreLabel(aeoMetrics.aeoScore)}
                        size="sm"
                    />
                )}
                <ScoreCard
                    title="Quality"
                    score={contentQuality.depthScore}
                    icon={<Target className="w-4 h-4 text-green-400" />}
                    subtitle={`${contentQuality.engagementPotentialScore}% eng.`}
                    size="sm"
                />
            </div>

            {/* Detailed SEO Metrics */}
            <ExpandableSection 
                title="SEO Breakdown" 
                icon={<BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />}
            >
                <div className="space-y-2 md:space-y-3 pt-2 md:pt-4">
                    <MetricBar label="Title Optimization" score={seoMetrics.titleOptimizationScore} />
                    <MetricBar label="Meta Description" score={seoMetrics.metaDescriptionScore} />
                    <MetricBar label="Content Structure" score={seoMetrics.contentStructureScore} />
                    <MetricBar label="Keyword Density" score={seoMetrics.keywordDensityScore} />
                    <MetricBar label="Readability" score={seoMetrics.readabilityScore} />
                    <MetricBar label="Internal Linking" score={seoMetrics.internalLinkingScore} />
                </div>
            </ExpandableSection>

            {/* Detailed GEO Metrics */}
            <ExpandableSection 
                title="GEO Breakdown (AI Optimization)" 
                icon={<Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />}
            >
                <div className="space-y-2 md:space-y-3 pt-2 md:pt-4">
                    <MetricBar label="Entity Recognition" score={geoMetrics.entityRecognitionScore} />
                    <MetricBar label="Answer Optimization" score={geoMetrics.answerOptimizationScore} />
                    <MetricBar label="Structured Data" score={geoMetrics.structuredDataScore} />
                    <MetricBar label="Authority Signals" score={geoMetrics.authoritySignalsScore} />
                    <MetricBar label="Context Clarity" score={geoMetrics.contextClarityScore} />
                    <MetricBar label="Conversational Value" score={geoMetrics.conversationalValueScore} />
                    <MetricBar label="Featured Snippet Potential" score={geoMetrics.featuredSnippetScore} />
                </div>
            </ExpandableSection>

            {/* Detailed AEO Metrics */}
            {aeoMetrics && (
                <ExpandableSection 
                    title="AEO Breakdown (Answer Engine Optimization)" 
                    icon={<Mic className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />}
                >
                    <div className="space-y-2 md:space-y-3 pt-2 md:pt-4">
                        <MetricBar label="Answer Relevance" score={aeoMetrics.answerRelevanceScore} />
                        <MetricBar label="Direct Answer" score={aeoMetrics.directAnswerScore} />
                        <MetricBar label="Question Optimization" score={aeoMetrics.questionOptimizationScore} />
                        <MetricBar label="Voice Search Ready" score={aeoMetrics.voiceSearchScore} />
                        <MetricBar label="Clarity" score={aeoMetrics.clarityScore} />
                        <MetricBar label="Conciseness" score={aeoMetrics.concisenessScore} />
                        <MetricBar label="Factual Accuracy" score={aeoMetrics.factualAccuracyScore} />
                    </div>
                </ExpandableSection>
            )}

            {/* Detailed AIO Metrics */}
            {aioMetrics && (
                <ExpandableSection 
                    title="AIO Breakdown (AI Optimization)" 
                    icon={<Cpu className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />}
                >
                    <div className="space-y-2 md:space-y-3 pt-2 md:pt-4">
                        <MetricBar label="Prompt Efficiency" score={aioMetrics.promptEfficiencyScore} />
                        <MetricBar label="Context Adherence" score={aioMetrics.contextAdherenceScore} />
                        <MetricBar label="Hallucination Resistance" score={aioMetrics.hallucinationResistanceScore} />
                        <MetricBar label="Citation Quality" score={aioMetrics.citationQualityScore} />
                        <MetricBar label="Multi-Turn Optimization" score={aioMetrics.multiTurnOptimizationScore} />
                        <MetricBar label="Instruction Following" score={aioMetrics.instructionFollowingScore} />
                        <MetricBar label="Output Consistency" score={aioMetrics.outputConsistencyScore} />
                    </div>
                </ExpandableSection>
            )}

            {/* Keyword Analysis */}
            {keywordAnalysis && (
                <ExpandableSection 
                    title="Keyword Analysis" 
                    icon={<Hash className="w-4 h-4 md:w-5 md:h-5 text-green-400" />}
                >
                    <div className="pt-2 md:pt-4">
                        <KeywordAnalysisPanel analysis={keywordAnalysis} />
                    </div>
                </ExpandableSection>
            )}

            {/* Readability Metrics */}
            {readabilityMetrics && (
                <ExpandableSection 
                    title="Readability Metrics" 
                    icon={<Eye className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />}
                >
                    <div className="pt-2 md:pt-4">
                        <ReadabilityPanel metrics={readabilityMetrics} />
                    </div>
                </ExpandableSection>
            )}

            {/* Content Structure */}
            {contentAnalysis && (
                <ExpandableSection 
                    title="Content Structure" 
                    icon={<FileText className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />}
                >
                    <div className="pt-2 md:pt-4">
                        <ContentAnalysisPanel analysis={contentAnalysis} />
                    </div>
                </ExpandableSection>
            )}

            {/* Suggestions */}
            {isPreview(metrics) && (metrics.improvementSuggestions?.length > 0 || metrics.geoSuggestions?.length > 0 || metrics.aeoSuggestions?.length > 0 || metrics.aioSuggestions?.length > 0) && (
                <ExpandableSection 
                    title="Optimization Suggestions" 
                    icon={<Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />}
                    defaultOpen={true}
                >
                    <div className="pt-2 md:pt-4">
                        <SuggestionsPanel 
                            seoSuggestions={metrics.improvementSuggestions || []}
                            geoSuggestions={metrics.geoSuggestions || []}
                            aeoSuggestions={metrics.aeoSuggestions || []}
                            aioSuggestions={metrics.aioSuggestions || []}
                        />
                    </div>
                </ExpandableSection>
            )}
        </div>
    );
};

// ========== SIMPLE SCORE BADGE ==========

export const ScoreBadge = ({ score, label }: { score: number; label: string }) => (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
        <span>{label}</span>
        <span className="font-bold">{score}</span>
    </div>
);

export default SEOGEODashboard;
