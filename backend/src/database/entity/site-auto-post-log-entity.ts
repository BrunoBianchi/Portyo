import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { SiteAutoPostScheduleEntity } from "./site-auto-post-schedule-entity";
import { SitePostEntity } from "./site-post-entity";

@Entity()
export class SiteAutoPostLogEntity extends BaseEntity {
    @Column({ type: "uuid" })
    scheduleId!: string;

    @ManyToOne(() => SiteAutoPostScheduleEntity, (schedule) => schedule.logs, { onDelete: "CASCADE" })
    @JoinColumn({ name: "scheduleId" })
    schedule!: SiteAutoPostScheduleEntity;

    @Column({ type: "uuid", nullable: true })
    postId!: string | null;

    @ManyToOne(() => SitePostEntity, (post) => post.autoPostLogs, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "postId" })
    post!: SitePostEntity | null;

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

    // Bilingual content
    @Column({ type: "text", nullable: true })
    generatedTitleEn!: string | null;

    @Column({ type: "text", nullable: true })
    generatedContentEn!: string | null;

    @Column({ type: "text", nullable: true })
    generatedKeywordsEn!: string | null;

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

    // ========== CONTENT QUALITY METRICS ==========
    
    @Column({ type: "int", nullable: true })
    originalityScore!: number | null;

    @Column({ type: "int", nullable: true })
    engagementPotentialScore!: number | null;

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

    // Word count
    @Column({ type: "int", nullable: true })
    wordCount!: number | null;

    // Suggestions for improvement
    @Column({ type: "simple-array", nullable: true })
    improvementSuggestions!: string[] | null;

    // AI Provider used (zai, groq, cache)
    @Column({ type: "varchar", length: 10, nullable: true })
    aiProvider!: "zai" | "groq" | "cache" | null;

    // Processing time in milliseconds
    @Column({ type: "int", nullable: true })
    processingTimeMs!: number | null;
}
