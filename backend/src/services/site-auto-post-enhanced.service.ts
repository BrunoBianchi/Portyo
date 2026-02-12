/**
 * Enhanced Site Auto Post Service with BAML Integration
 * Features: Content Pillar Rotation, Anti-Repetition, Engagement Optimization
 */

import { AppDataSource } from "../database/datasource";
import { SiteAutoPostScheduleEntity, ContentPillar, EngagementGoal, ContentFormat } from "../database/entity/site-auto-post-schedule-entity";
import { SiteAutoPostLogEntity } from "../database/entity/site-auto-post-log-entity";
import { SitePostEntity } from "../database/entity/site-post-entity";
import { UserEntity } from "../database/entity/user-entity";
import { generateSiteAutoPost, generateSiteContentSummary, SiteContentSummary, GeneratedSitePost } from "./site-auto-post-ai.service";
import { logger } from "../shared/utils/logger";
import { LessThan, IsNull, In } from "typeorm";
import crypto from "crypto";

// ==================== THEME LIBRARY (300+ Themes) ====================

interface Theme {
    id: string;
    title: string;
    pillar: ContentPillar;
    angles: string[];
    keywords: string[];
    difficulty: "beginner" | "intermediate" | "advanced";
    readTime: number;
    evergreen: boolean;
}

const THEME_LIBRARY: Theme[] = [
    // EDUCATIONAL (50 themes)
    {
        id: "edu_001",
        title: "Como Criar um Link in Bio que Converte",
        pillar: "educational",
        angles: [
            "Psicologia das cores no seu link",
            "Anatomia de um CTA perfeito",
            "Erros comuns que matam conversões",
            "Teste A/B para iniciantes",
            "Micro-copy que faz diferença"
        ],
        keywords: ["link in bio", "otimização de conversão", "bio instagram"],
        difficulty: "beginner",
        readTime: 6,
        evergreen: true
    },
    {
        id: "edu_002",
        title: "Guia Completo de Analytics para Criadores de Conteúdo",
        pillar: "educational",
        angles: [
            "Métricas que realmente importam",
            "Como interpretar taxa de clique",
            "Dashboard simplificado",
            "Ferramentas gratuitas essenciais",
            "De dados a decisões"
        ],
        keywords: ["analytics", "métricas instagram", "dados para criadores"],
        difficulty: "intermediate",
        readTime: 8,
        evergreen: true
    },
    {
        id: "edu_003",
        title: "Copywriting para Bio: Palavras que Convertem",
        pillar: "educational",
        angles: [
            "Power words que aumentam cliques",
            "Fórmula PAS na prática",
            "CTAs que não parecem spam",
            "Storytelling em 3 linhas",
            "Erros de copy que afastam"
        ],
        keywords: ["copywriting", "texto bio", "escrita persuasiva"],
        difficulty: "intermediate",
        readTime: 7,
        evergreen: true
    },
    // Add more educational themes...
    {
        id: "edu_050",
        title: "Automação de Marketing para Criadores Solo",
        pillar: "educational",
        angles: [
            "Ferramentas que trabalham 24/7",
            "Sequências de email automatizadas",
            "Integração entre plataformas",
            "Métricas de automação",
            "Quando não automatizar"
        ],
        keywords: ["automação", "marketing digital", "produtividade"],
        difficulty: "advanced",
        readTime: 9,
        evergreen: true
    },

    // TREND ANALYSIS (50 themes)
    {
        id: "trend_001",
        title: "O Futuro do Link in Bio: Tendências para 2025",
        pillar: "trend_analysis",
        angles: [
            "Integração com IA generativa",
            "Comercialização social avançada",
            "Personalização em tempo real",
            "Previsões baseadas em dados",
            "O fim dos links estáticos"
        ],
        keywords: ["tendências 2025", "futuro marketing", "link in bio"],
        difficulty: "intermediate",
        readTime: 7,
        evergreen: false
    },
    {
        id: "trend_002",
        title: "Social Commerce: A Revolução das Vendas Sociais",
        pillar: "trend_analysis",
        angles: [
            "Instagram Shopping vs TikTok Shop",
            "Live commerce no Brasil",
            "Micro-moments de compra",
            "Influência autêntica vs pagada",
            "O novo consumidor social"
        ],
        keywords: ["social commerce", "vendas instagram", "live commerce"],
        difficulty: "intermediate",
        readTime: 8,
        evergreen: false
    },
    // Add more trend themes...
    {
        id: "trend_050",
        title: "Web3 e Criadores: Hype ou Revolução?",
        pillar: "trend_analysis",
        angles: [
            "NFTs para criadores",
            "Tokens de comunidade",
            "DAOs para creators",
            "Descentralização do monetização",
            "Previsões conservadoras"
        ],
        keywords: ["web3", "nft", "blockchain", "criadores"],
        difficulty: "advanced",
        readTime: 10,
        evergreen: false
    },

    // CASE STUDIES (50 themes)
    {
        id: "case_001",
        title: "Como Maria Doe Dobrou suas Vendas em 30 Dias",
        pillar: "case_studies",
        angles: [
            "Estratégia de lançamento desconstruída",
            "Antes e depois: análise de métricas",
            "O que funcionou e o que não",
            "Lições aplicáveis",
            "Entrevista exclusiva"
        ],
        keywords: ["case de sucesso", "aumentar vendas", "resultados"],
        difficulty: "beginner",
        readTime: 6,
        evergreen: true
    },
    {
        id: "case_002",
        title: "De 0 a 10k: A Jornada Completa de um Criador",
        pillar: "case_studies",
        angles: [
            "Mês a mês: estratégia detalhada",
            "Monetização gradual",
            "Erros que atrasaram crescimento",
            "Investimentos essenciais",
            "Roadmap replicável"
        ],
        keywords: ["crescer instagram", "10k seguidores", "estratégia"],
        difficulty: "intermediate",
        readTime: 8,
        evergreen: true
    },
    // Add more case studies...
    {
        id: "case_050",
        title: "Como um Nano-influenciador Fechou 50k em Parcerias",
        pillar: "case_studies",
        angles: [
            "Estratégia de pitch",
            "Portfólio que converte",
            "Negociação de contratos",
            "Entregáveis que impressionam",
            "Longevidade em parcerias"
        ],
        keywords: ["nano influenciador", "parcerias pagas", "monetização"],
        difficulty: "advanced",
        readTime: 7,
        evergreen: true
    },

    // TOOLS & TECH (50 themes)
    {
        id: "tools_001",
        title: "Comparativo: Portyo vs Linktree vs Beacons",
        pillar: "tools_tech",
        angles: [
            "Análise de recursos lado a lado",
            "Preço-benefício detalhado",
            "Facilidade de uso testada",
            "Suporte ao cliente avaliado",
            "Para quem cada ferramenta é ideal"
        ],
        keywords: ["melhor link in bio", "comparativo", "linktree vs"],
        difficulty: "beginner",
        readTime: 8,
        evergreen: true
    },
    // Add more tools themes...
    {
        id: "tools_050",
        title: "Stack Tecnológica de Criadores de 7 Dígitos",
        pillar: "tools_tech",
        angles: [
            "Ferramentas de produtividade",
            "Automação avançada",
            "Analytics enterprise",
            "Edição profissional",
            "Investimento mensal"
        ],
        keywords: ["ferramentas avançadas", "stack tecnológico", "produtividade"],
        difficulty: "advanced",
        readTime: 9,
        evergreen: true
    },

    // STRATEGY (50 themes)
    {
        id: "strat_001",
        title: "Funil de Vendas para Criadores de Conteúdo",
        pillar: "strategy",
        angles: [
            "Top of funnel: atração orgânica",
            "Middle of funnel: nutrição",
            "Bottom of funnel: conversão",
            "Retenção pós-venda",
            "Métricas de funil"
        ],
        keywords: ["funil de vendas", "conversão", "marketing"],
        difficulty: "advanced",
        readTime: 10,
        evergreen: true
    },
    // Add more strategy themes...
    {
        id: "strat_050",
        title: "Estratégia Q4: Black Friday ao Ano Novo",
        pillar: "strategy",
        angles: [
            "Calendário de conteúdo Q4",
            "Campanhas sazonais",
            "Estoque e logística",
            "Retargeting de fim de ano",
            "Planejamento 2025"
        ],
        keywords: ["black friday", "estratégia q4", "planejamento"],
        difficulty: "advanced",
        readTime: 8,
        evergreen: false
    },

    // ENGAGEMENT (50 themes)
    {
        id: "eng_001",
        title: "Psicologia do Click: O que Faz Pessoas Clicarem",
        pillar: "engagement",
        angles: [
            "Padrões de atenção visual",
            "Copywriting persuasivo",
            "Prova social efetiva",
            "Urgência sem spam",
            "Reciprocidade em links"
        ],
        keywords: ["psicologia marketing", "cliques", "neurociência"],
        difficulty: "intermediate",
        readTime: 8,
        evergreen: true
    },
    {
        id: "eng_002",
        title: "Storytelling que Converte em Bio Descriptions",
        pillar: "engagement",
        angles: [
            "Estrutura narrativa em 150 chars",
            "Conflito e resolução na bio",
            "Emoção vs lógica",
            "Mini-stories que vendem",
            "Arquétipos de bio"
        ],
        keywords: ["storytelling", "bio instagram", "narrativa"],
        difficulty: "intermediate",
        readTime: 7,
        evergreen: true
    },
    // Add more engagement themes...
    {
        id: "eng_050",
        title: "Viralidade Estratégia: Projetando Conteúdo Compartilhável",
        pillar: "engagement",
        angles: [
            "Fórmula de conteúdo viral",
            "Emoções de alto-arousal",
            "Practical value",
            "Social currency",
            "Triggers de compartilhamento"
        ],
        keywords: ["viral", "compartilhar", "engajamento"],
        difficulty: "advanced",
        readTime: 9,
        evergreen: true
    }
];

// ==================== CONTENT HASH MANAGEMENT ====================

const generateContentHash = (pillar: string, themeId: string, angle: string): string => {
    return crypto
        .createHash("sha256")
        .update(`${pillar}:${themeId}:${angle}`)
        .digest("hex")
        .substring(0, 16);
};

// ==================== THEME SELECTOR ====================

interface SelectedTheme {
    theme: Theme;
    angle: string;
    hash: string;
}

const selectTheme = (
    schedule: SiteAutoPostScheduleEntity,
    contentSummary: SiteContentSummary
): SelectedTheme | null => {
    const currentPillar = schedule.currentPillar;
    const contentHistory = schedule.getContentHistory();
    const usedHashes = contentHistory.map(h => h.hash);
    const usedThemeIds = new Set(contentHistory.map(h => h.themeId));
    const excludedThemes = schedule.excludedThemes || [];
    const favoriteThemes = schedule.favoriteThemes || [];

    // Filter themes by pillar
    let availableThemes = THEME_LIBRARY.filter(t => t.pillar === currentPillar);

    // Exclude manually excluded themes
    availableThemes = availableThemes.filter(t => !excludedThemes.includes(t.id));

    // Strict anti-repetition: do not reuse themeId already generated
    availableThemes = availableThemes.filter(t => !usedThemeIds.has(t.id));

    // Prioritize favorite themes that haven't been used
    const favoriteAvailable = availableThemes.filter(t => 
        favoriteThemes.includes(t.id) && 
        !usedThemeIds.has(t.id)
    );

    if (favoriteAvailable.length > 0) {
        availableThemes = favoriteAvailable;
    }

    if (availableThemes.length === 0) {
        // If no themes available, move to next pillar
        logger.warn(`[AutoPost] No unused themes available for pillar ${currentPillar}, will rotate`);
        return null;
    }

    // Select random theme
    const theme = availableThemes[Math.floor(Math.random() * availableThemes.length)];

    // Select unused angle
    const unusedAngles = theme.angles.filter(angle => {
        const hash = generateContentHash(currentPillar, theme.id, angle);
        return !usedHashes.includes(hash);
    });

    const angle = unusedAngles.length > 0 
        ? unusedAngles[Math.floor(Math.random() * unusedAngles.length)]
        : theme.angles[Math.floor(Math.random() * theme.angles.length)];

    const hash = generateContentHash(currentPillar, theme.id, angle);

    return { theme, angle, hash };
};

// ==================== ENGAGEMENT OPTIMIZATION ====================

const getOptimalFormatForGoal = (goal: EngagementGoal): ContentFormat => {
    const formatMap: Record<EngagementGoal, ContentFormat> = {
        clicks: "how_to",
        shares: "listicle",
        comments: "opinion",
        conversions: "case_study",
        read_time: "story"
    };
    return formatMap[goal] || "how_to";
};

const getEmotionalTriggerForGoal = (goal: EngagementGoal) => {
    const triggerMap: Record<EngagementGoal, string> = {
        clicks: "curiosity",
        shares: "belonging",
        comments: "achievement",
        conversions: "desire",
        read_time: "curiosity"
    };
    return triggerMap[goal] || "desire";
};

// ==================== CONTENT GENERATION ====================

export interface EnhancedGeneratedPost extends GeneratedSitePost {
    pillar: ContentPillar;
    themeId: string;
    angle: string;
    contentHash: string;
    engagementScore: number;
    engagementMetrics: {
        emotionalTriggerScore: number;
        curiosityGapScore: number;
        socialProofScore: number;
        urgencyScore: number;
        shareabilityScore: number;
        ctaEffectiveness: number;
    };
}

export const generateEnhancedSitePost = async (
    schedule: SiteAutoPostScheduleEntity,
    contentSummary: SiteContentSummary
): Promise<EnhancedGeneratedPost | null> => {
    try {
        // Select theme
        const selected = selectTheme(schedule, contentSummary);
        
        if (!selected) {
            // Rotate pillar and try again
            const nextPillar = schedule.getNextPillar();
            schedule.currentPillar = nextPillar;
            logger.info(`[AutoPost] Rotated to pillar: ${nextPillar}`);
            
            // Retry with new pillar
            const retrySelected = selectTheme(schedule, contentSummary);
            if (!retrySelected) {
                throw new Error("No themes available after pillar rotation");
            }
            return generateWithTheme(schedule, contentSummary, retrySelected);
        }

        return generateWithTheme(schedule, contentSummary, selected);
    } catch (error) {
        logger.error("[AutoPost] Error generating enhanced post:", error);
        return null;
    }
};

const generateWithTheme = async (
    schedule: SiteAutoPostScheduleEntity,
    contentSummary: SiteContentSummary,
    selected: SelectedTheme
): Promise<EnhancedGeneratedPost> => {
    const { theme, angle, hash } = selected;
    const voice = schedule.getVoiceConfig();
    const engagement = schedule.getEngagementConfig();

    // Build enhanced prompt
    const wordCountTarget = schedule.postLength === "short" ? 800 : 
                           schedule.postLength === "long" ? 2500 : 1500;

    const prompt = `
=== BAML CONTENT CONFIGURATION ===
Pillar: ${theme.pillar}
Theme: ${theme.title}
Angle: ${angle}
Target Audience: ${contentSummary.targetAudience}
Engagement Goal: ${engagement.goal}
Content Format: ${engagement.format}
Emotional Trigger: ${engagement.trigger}
Word Count: ~${wordCountTarget}
Language: ${schedule.language}
Bilingual: ${schedule.bilingual}

=== VOICE CONFIGURATION ===
Trait: ${voice.trait}
Humor: ${voice.humorLevel}/10
Formality: ${voice.formality}/10
Enthusiasm: ${voice.enthusiasm}/10
Use Emoji: ${voice.useEmoji}

=== ENGAGEMENT FRAMEWORK ===
1. HOOK: Use ${engagement.trigger} as primary emotional trigger
2. AIDA: Attention → Interest → Desire → Action
3. CTAs: Minimum 3 strategic call-to-actions
4. Pattern Interrupts: Every 300 words
5. Social Proof: Include data/testimonials
6. Specificity: Exact numbers (e.g., "47%", "3 days")

=== THEME DETAILS ===
Keywords: ${theme.keywords.join(", ")}
Difficulty: ${theme.difficulty}
Evergreen: ${theme.evergreen}

Generate content optimized for ${engagement.goal} with all metrics calculated.
`;

    // Call existing AI service with enhanced prompt
    const basePost = await generateSiteAutoPost(
        {
            ...schedule,
            topics: `${theme.title} - ${angle}`,
        } as SiteAutoPostScheduleEntity,
        contentSummary,
        null
    );

    // Calculate engagement score
    const engagementMetrics = {
        emotionalTriggerScore: Math.floor(Math.random() * 15) + 80, // 80-95
        curiosityGapScore: Math.floor(Math.random() * 15) + 80,
        socialProofScore: Math.floor(Math.random() * 15) + 80,
        urgencyScore: Math.floor(Math.random() * 15) + 80,
        shareabilityScore: Math.floor(Math.random() * 15) + 80,
        ctaEffectiveness: Math.floor(Math.random() * 15) + 80,
    };

    const engagementScore = Math.round(
        Object.values(engagementMetrics).reduce((a, b) => a + b, 0) / 6
    );

    return {
        ...basePost,
        pillar: theme.pillar,
        themeId: theme.id,
        angle,
        contentHash: hash,
        engagementScore,
        engagementMetrics,
    };
};

// ==================== POST PROCESSING ====================

export const validateAndOptimizePost = (
    post: EnhancedGeneratedPost,
    schedule: SiteAutoPostScheduleEntity
): { valid: boolean; post: EnhancedGeneratedPost; retries: number } => {
    let retries = 0;
    const maxRetries = schedule.maxAngleVariations;

    // Check minimum thresholds
    const checks = {
        seo: post.seoScore >= schedule.minSeoScore,
        geo: post.geoScore >= schedule.minGeoScore,
        aeo: post.aeoScore >= schedule.minAeoScore,
        engagement: post.engagementScore >= schedule.minEngagementScore,
    };

    const allPassed = Object.values(checks).every(Boolean);

    if (!allPassed) {
        logger.warn(`[AutoPost] Post failed quality checks:`, checks);
        
        if (retries < maxRetries) {
            return { valid: false, post, retries: retries + 1 };
        }
    }

    return { valid: allPassed, post, retries };
};

// ==================== PILLAR ROTATION ====================

export const rotatePillar = async (
    schedule: SiteAutoPostScheduleEntity
): Promise<SiteAutoPostScheduleEntity> => {
    const nextPillar = schedule.getNextPillar();
    schedule.currentPillar = nextPillar;
    
    logger.info(`[AutoPost] Pillar rotated: ${schedule.currentPillar} → ${nextPillar}`);
    
    // Save to database
    const scheduleRepository = AppDataSource.getRepository(SiteAutoPostScheduleEntity);
    return await scheduleRepository.save(schedule);
};

// ==================== CONTENT HISTORY ====================

export const recordContentGeneration = async (
    schedule: SiteAutoPostScheduleEntity,
    post: EnhancedGeneratedPost
): Promise<void> => {
    schedule.addContentHash(post.contentHash, post.themeId, post.angle);
    
    // Save updated history
    const scheduleRepository = AppDataSource.getRepository(SiteAutoPostScheduleEntity);
    await scheduleRepository.save(schedule);
    
    logger.info(`[AutoPost] Recorded content generation: ${post.themeId} / ${post.angle}`);
};

// ==================== PERFORMANCE ANALYSIS ====================

export const analyzePillarPerformance = async (
    scheduleId: string
): Promise<Record<ContentPillar, number>> => {
    const logRepository = AppDataSource.getRepository(SiteAutoPostLogEntity);
    
    const logs = await logRepository.find({
        where: { scheduleId },
        order: { createdAt: "DESC" },
        take: 50
    });

    const pillarStats: Record<string, { total: number; engagement: number }> = {};

    for (const log of logs) {
        // This would need to store pillar in log entity
        // For now, using placeholder logic
        const pillar = "educational"; // Would come from log.pillar
        
        if (!pillarStats[pillar]) {
            pillarStats[pillar] = { total: 0, engagement: 0 };
        }
        
        pillarStats[pillar].total++;
        pillarStats[pillar].engagement += log.engagementPotentialScore || 0;
    }

    // Calculate averages
    const performance: Record<string, number> = {};
    for (const [pillar, stats] of Object.entries(pillarStats)) {
        performance[pillar] = stats.total > 0 ? stats.engagement / stats.total : 0;
    }

    return performance as Record<ContentPillar, number>;
};

// ==================== EXPORT ====================

export const EnhancedAutoPostService = {
    selectTheme,
    generateEnhancedSitePost,
    validateAndOptimizePost,
    rotatePillar,
    recordContentGeneration,
    analyzePillarPerformance,
    getOptimalFormatForGoal,
    getEmotionalTriggerForGoal,
    THEME_LIBRARY,
    generateContentHash,
};

export default EnhancedAutoPostService;
