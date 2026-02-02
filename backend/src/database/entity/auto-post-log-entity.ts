import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { AutoPostScheduleEntity } from "./auto-post-schedule-entity";
import { PostEntity } from "./posts-entity";

@Entity()
export class AutoPostLogEntity extends BaseEntity {
    @Column({ type: "uuid" })
    scheduleId!: string;

    @ManyToOne(() => AutoPostScheduleEntity, (schedule) => schedule.logs, { onDelete: "CASCADE" })
    @JoinColumn({ name: "scheduleId" })
    schedule!: AutoPostScheduleEntity;

    @Column({ type: "uuid", nullable: true })
    postId!: string | null;

    @ManyToOne(() => PostEntity, (post) => post.autoPostLogs, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "postId" })
    post!: PostEntity | null;

    @Column({ type: "varchar", default: "generated" })
    status!: "generated" | "published" | "failed";

    @Column({ type: "text", nullable: true })
    errorMessage!: string | null;

    @Column({ type: "text" })
    generatedTitle!: string;

    @Column({ type: "text" })
    generatedContent!: string;

    @Column({ type: "text" })
    generatedKeywords!: string;

    // ========== SEO METRICS (0-100) ==========
    
    @Column({ type: "int", nullable: true })
    seoScore!: number | null;

    @Column({ type: "int", nullable: true })
    titleOptimizationScore!: number | null;

    @Column({ type: "int", nullable: true })
    metaDescriptionScore!: number | null;

    @Column({ type: "int", nullable: true })
    contentStructureScore!: number | null;

    @Column({ type: "int", nullable: true })
    keywordDensityScore!: number | null;

    @Column({ type: "int", nullable: true })
    readabilityScore!: number | null;

    @Column({ type: "int", nullable: true })
    internalLinkingScore!: number | null;

    // ========== GEO METRICS (0-100) - Generative Engine Optimization ==========
    
    @Column({ type: "int", nullable: true })
    geoScore!: number | null;

    @Column({ type: "int", nullable: true })
    entityRecognitionScore!: number | null;

    @Column({ type: "int", nullable: true })
    answerOptimizationScore!: number | null;

    @Column({ type: "int", nullable: true })
    structuredDataScore!: number | null;

    @Column({ type: "int", nullable: true })
    authoritySignalsScore!: number | null;

    @Column({ type: "int", nullable: true })
    contextClarityScore!: number | null;

    @Column({ type: "int", nullable: true })
    conversationalValueScore!: number | null;

    @Column({ type: "int", nullable: true })
    featuredSnippetScore!: number | null;

    // ========== AEO METRICS (0-100) - Answer Engine Optimization ==========
    
    @Column({ type: "int", nullable: true })
    aeoScore!: number | null;

    @Column({ type: "int", nullable: true })
    answerRelevanceScore!: number | null;

    @Column({ type: "int", nullable: true })
    directAnswerScore!: number | null;

    @Column({ type: "int", nullable: true })
    questionOptimizationScore!: number | null;

    @Column({ type: "int", nullable: true })
    voiceSearchScore!: number | null;

    @Column({ type: "int", nullable: true })
    clarityScore!: number | null;

    @Column({ type: "int", nullable: true })
    concisenessScore!: number | null;

    @Column({ type: "int", nullable: true })
    factualAccuracyScore!: number | null;

    // ========== AIO METRICS (0-100) - AI Optimization for LLMs ==========
    
    @Column({ type: "int", nullable: true })
    aioScore!: number | null;

    @Column({ type: "int", nullable: true })
    promptEfficiencyScore!: number | null;

    @Column({ type: "int", nullable: true })
    contextAdherenceScore!: number | null;

    @Column({ type: "int", nullable: true })
    hallucinationResistanceScore!: number | null;

    @Column({ type: "int", nullable: true })
    citationQualityScore!: number | null;

    @Column({ type: "int", nullable: true })
    multiTurnOptimizationScore!: number | null;

    @Column({ type: "int", nullable: true })
    instructionFollowingScore!: number | null;

    @Column({ type: "int", nullable: true })
    outputConsistencyScore!: number | null;

    // ========== CONTENT QUALITY METRICS ==========
    
    @Column({ type: "int", nullable: true })
    originalityScore!: number | null;

    @Column({ type: "int", nullable: true })
    depthScore!: number | null;

    @Column({ type: "int", nullable: true })
    engagementPotentialScore!: number | null;

    @Column({ type: "int", nullable: true })
    freshnessScore!: number | null;

    // ========== DETAILED ANALYSIS DATA (JSON) ==========
    
    @Column({ type: "json", nullable: true })
    keywordAnalysis!: {
        primaryKeyword: string;
        secondaryKeywords: string[];
        semanticKeywords: string[];
        keywordDensity: number;
        lsiKeywords: string[];
    } | null;

    @Column({ type: "json", nullable: true })
    readabilityMetrics!: {
        fleschReadingEase: number;
        fleschKincaidGrade: number;
        averageSentenceLength: number;
        averageWordLength: number;
        totalWords: number;
        totalSentences: number;
    } | null;

    @Column({ type: "json", nullable: true })
    contentAnalysis!: {
        headingsCount: number;
        h2Count: number;
        h3Count: number;
        paragraphCount: number;
        listCount: number;
        imageCount: number;
        internalLinksCount: number;
        externalLinksCount: number;
        hasCTA: boolean;
        contentDepth: "basic" | "standard" | "comprehensive" | "expert";
    } | null;

    @Column({ type: "json", nullable: true })
    entityAnalysis!: {
        mainEntities: string[];
        relatedEntities: string[];
        entitySalience: Record<string, number>;
        topicCategories: string[];
    } | null;

    @Column({ type: "json", nullable: true })
    aiOptimization!: {
        answerTargets: string[];
        questionCoverage: string[];
        snippetCandidates: string[];
        voiceSearchOptimized: boolean;
        chatGptFriendly: boolean;
    } | null;

    // ========== SUGGESTIONS ==========
    
    @Column({ type: "simple-array", nullable: true })
    improvementSuggestions!: string[] | null;

    @Column({ type: "simple-array", nullable: true })
    geoSuggestions!: string[] | null;

    @Column({ type: "simple-array", nullable: true })
    aeoSuggestions!: string[] | null;

    @Column({ type: "simple-array", nullable: true })
    aioSuggestions!: string[] | null;

    // Meta description generated
    @Column({ type: "text", nullable: true })
    metaDescription!: string | null;

    // Slug generated
    @Column({ type: "text", nullable: true })
    slug!: string | null;

    // Title length for quick reference
    @Column({ type: "int", nullable: true })
    titleLength!: number | null;

    // Meta description length
    @Column({ type: "int", nullable: true })
    metaDescriptionLength!: number | null;
}
