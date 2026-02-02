/**
 * TOON Adapter for Auto Post AI Service
 * 
 * This adapter provides token-efficient data transmission using TOON format.
 * Integrates seamlessly with existing auto-post-ai.service.ts
 * 
 * Benefits:
 * - ~40% reduction in token usage
 * - Maintains all existing functionality
 * - Easy toggle between JSON and TOON formats
 */

import { ToonService, ToonTemplates } from './toon.service';
import { logger } from '../shared/utils/logger';

/**
 * Configuration for TOON optimization
 */
export const TOON_CONFIG = {
    /** Enable/disable TOON optimization */
    ENABLED: process.env.USE_TOON_OPTIMIZATION !== 'false',
    
    /** Log token savings for monitoring */
    LOG_SAVINGS: true,
    
    /** Version of TOON adapter */
    VERSION: '1.0.0'
};

/**
 * Format bio data for AI prompts
 * Returns TOON format if enabled, otherwise JSON
 */
export function formatBioData(bio: any): string {
    if (!TOON_CONFIG.ENABLED) {
        return JSON.stringify({
            displayName: bio.seoTitle || bio.sufix,
            username: bio.sufix,
            description: bio.description,
            seoDescription: bio.seoDescription,
            blocks: bio.blocks
        }, null, 2);
    }
    
    const result = ToonTemplates.bioEntity(bio);
    
    if (TOON_CONFIG.LOG_SAVINGS) {
        const data = {
            displayName: bio.seoTitle || bio.sufix,
            username: bio.sufix,
            description: bio.description || '',
            seoDescription: bio.seoDescription || '',
            blocks: bio.blocks
        };
        const savings = ToonService.calculateSavings(data);
        logger.info(`[TOON] Bio data: Saved ~${savings.percent}% (${savings.savings} tokens)`);
    }
    
    return result;
}

/**
 * Format schedule data for AI prompts
 */
export function formatScheduleData(schedule: any): string {
    if (!TOON_CONFIG.ENABLED) {
        return JSON.stringify({
            topics: schedule.topics,
            keywords: schedule.keywords,
            tone: schedule.tone,
            length: schedule.postLength,
            targetCountry: schedule.targetCountry,
            language: schedule.language
        }, null, 2);
    }
    
    const result = ToonTemplates.autoPostSchedule(schedule);
    
    if (TOON_CONFIG.LOG_SAVINGS) {
        const data = {
            topics: schedule.topics,
            keywords: schedule.keywords,
            tone: schedule.tone,
            length: schedule.postLength,
            targetCountry: schedule.targetCountry,
            language: schedule.language
        };
        const savings = ToonService.calculateSavings(data);
        logger.info(`[TOON] Schedule data: Saved ~${savings.percent}% (${savings.savings} tokens)`);
    }
    
    return result;
}

/**
 * Format bio summary for AI prompts
 */
export function formatBioSummary(summary: any): string {
    if (!TOON_CONFIG.ENABLED) {
        return JSON.stringify(summary, null, 2);
    }
    
    const result = ToonTemplates.bioSummary(summary);
    
    if (TOON_CONFIG.LOG_SAVINGS) {
        const savings = ToonService.calculateSavings(summary);
        logger.info(`[TOON] Bio summary: Saved ~${savings.percent}% (${savings.savings} tokens)`);
    }
    
    return result;
}

/**
 * Format combined data for generation prompts
 */
export function formatGenerationData(
    bio: any,
    schedule: any,
    summary: any
): { bio: string; schedule: string; summary: string; combined: string } {
    const bioFormatted = formatBioData(bio);
    const scheduleFormatted = formatScheduleData(schedule);
    const summaryFormatted = formatBioSummary(summary);
    
    // Combined TOON format for maximum efficiency
    const combined = TOON_CONFIG.ENABLED
        ? ToonService.encode({
            author: {
                name: bio.seoTitle || bio.sufix,
                bio: summary.summary,
                industry: summary.industry,
                expertise: summary.expertise,
                usp: summary.uniqueSellingPoints
            },
            post: {
                topics: schedule.topics,
                keywords: schedule.keywords,
                tone: schedule.tone || summary.tone,
                length: schedule.postLength || 'medium',
                targetCountry: schedule.targetCountry,
                language: schedule.language
            }
        })
        : JSON.stringify({
            author: {
                name: bio.seoTitle || bio.sufix,
                bio: summary.summary,
                industry: summary.industry,
                expertise: summary.expertise,
                usp: summary.uniqueSellingPoints
            },
            post: {
                topics: schedule.topics,
                keywords: schedule.keywords,
                tone: schedule.tone || summary.tone,
                length: schedule.postLength || 'medium',
                targetCountry: schedule.targetCountry,
                language: schedule.language
            }
        }, null, 2);
    
    return {
        bio: bioFormatted,
        schedule: scheduleFormatted,
        summary: summaryFormatted,
        combined
    };
}

/**
 * Get TOON adapter statistics
 */
export function getTOONAdapterStats(): {
    enabled: boolean;
    version: string;
    description: string;
    estimatedSavings: string;
} {
    return {
        enabled: TOON_CONFIG.ENABLED,
        version: TOON_CONFIG.VERSION,
        description: 'Token-Oriented Object Notation for LLM prompts',
        estimatedSavings: '~40% token reduction vs JSON'
    };
}

/**
 * Toggle TOON optimization at runtime
 */
export function setTOONEnabled(enabled: boolean): void {
    TOON_CONFIG.ENABLED = enabled;
    logger.info(`[TOON] Optimization ${enabled ? 'enabled' : 'disabled'}`);
}

export default {
    formatBioData,
    formatScheduleData,
    formatBioSummary,
    formatGenerationData,
    getTOONAdapterStats,
    setTOONEnabled,
    CONFIG: TOON_CONFIG
};
