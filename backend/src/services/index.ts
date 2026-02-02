/**
 * Services Barrel Export
 * 
 * Centralizes all service exports for clean imports throughout the application.
 * Includes BAML + TOON integration services for optimized AI content generation.
 */

// Core AI Services - main types exported from auto-post-ai.service
export * from './ai.service';
export * from './auto-post-ai.service';
export * from './auto-post.service';
export * from './auto-post-cache.service';
// Note: baml-ai.service exports duplicate types from auto-post-ai.service
// Import directly from baml-ai.service if needed: import { ... } from './services/baml-ai.service'

// TOON Services (Token Optimization) - utility functions only
export { 
    ToonService, 
    ToonTemplates 
} from './toon.service';

// TOON Adapter - utility functions only (avoid type re-exports)
export {
    TOON_CONFIG,
    formatBioData,
    formatScheduleData,
    formatBioSummary,
    formatGenerationData,
    getTOONAdapterStats,
    setTOONEnabled
} from './toon-adapter';

// BAML Adapter - utility functions and unique types only
// Note: Types like BioSummary, GeneratedPost, etc. are exported from auto-post-ai.service
export {
    // Type definitions (these are duplicates from auto-post-ai.service, so not re-exported here)
    // Use types from auto-post-ai.service instead
    
    // BAML system prompts
    BAML_SYSTEM_PROMPTS,
    
    // Prompt builders
    buildBAMLPrompt,
    buildBioSummaryPrompt,
    buildAutoPostPrompt,
    buildValidationPrompt,
    
    // Validators
    validateBioSummaryResponse,
    validateGeneratedPostResponse,
    
    // Utilities
    calculateTokenSavings,
    logTokenSavings,
    getBAMLAdapterStats,
    
    // Input types unique to BAML adapter
    BioInput,
    PostGenerationInput
} from './baml-adapter';

// External Integration Services
export * from './groq-client.service';
export * from './email.service';
export * from './youtube.service';
export * from './instagram.service';
export * from './image.service';
export * from './cron.service';

// Utility Services
export * from './activity.service';
export * from './billing.service';
export * from './form.service';
export * from './notification.service';
export * from './resume.service';

// Default export with all services
import * as aiService from './ai.service';
import * as autoPostAIService from './auto-post-ai.service';
import * as autoPostService from './auto-post.service';
import * as autoPostCacheService from './auto-post-cache.service';
import * as toonService from './toon.service';
import * as toonAdapter from './toon-adapter';
import * as bamlAdapter from './baml-adapter';

/**
 * Consolidated services object
 */
export const Services = {
    ai: aiService,
    autoPostAI: autoPostAIService,
    autoPost: autoPostService,
    autoPostCache: autoPostCacheService,
    toon: toonService,
    toonAdapter: toonAdapter,
    bamlAdapter: bamlAdapter,
};

export default Services;
