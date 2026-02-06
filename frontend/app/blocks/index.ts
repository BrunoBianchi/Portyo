/**
 * Portyo Block System
 * 
 * A unified architecture for block-based content editing.
 * 
 * Features:
 * - Block Registry: Central registry for all block types
 * - Token System: CSS Custom Properties for theming
 * - Island Architecture: Partial hydration with vanilla JS
 * - Schema-Driven Forms: JSON Schema powered editors
 * - Migration System: Dual-mode for V1 to V2 transition
 */

// Core Types
export * from './types';

// Registry
export { registry, BlockRegistry } from './registry';

// Rendering
export { 
  renderBlock,
  BlockRenderer,
  BlockErrorBoundary 
} from './renderers/unified-renderer';

// Token System
export {
  createDefaultTokens,
  applyTokensToElement,
  generateTokenStylesheet,
  THEME_TOKEN_NAMES
} from './tokens/token-system';

// Islands
export {
  IslandRegistry,
  generateIslandScripts,
  createIslandLoader
} from './islands/island-system';

// Schemas
export { buttonSchema } from './schemas/button.schema';
export { headingSchema } from './schemas/heading.schema';
export { textSchema } from './schemas/text.schema';
export { dividerSchema } from './schemas/divider.schema';
export { imageSchema } from './schemas/image.schema';

// Block Definitions
export {
  buttonDefinition,
  headingDefinition,
  textDefinition,
  dividerDefinition,
  imageDefinition
} from './definitions';

// Migration
export {
  migrateBlock,
  migrateBlocks,
  isLegacyBlock,
  normalizeBlock,
  type MigrationResult
} from './migration/migrator';

// Editor Adapter
export { BlockEditorAdapter } from './adapters/editor-adapter';

// HTML Generator
export {
  generateBioHtml,
  generateHtmlLegacy,
  type HtmlGenerationOptions,
  type HtmlGenerationResult
} from './generators/html-generator';

// React Hooks
export { useBlockRegistry } from './hooks/use-block-registry';
export { useThemeTokens } from './hooks/use-theme-tokens';
export { useBlockRenderer } from './hooks/use-block-renderer';

// Utils
export { escapeHtml, generateStableId } from './utils';

// Initialize all blocks
import { registry } from './registry';
import {
  buttonDefinition,
  headingDefinition,
  textDefinition,
  dividerDefinition,
  imageDefinition
} from './definitions';

/**
 * Initialize the block system
 * Call this once at app startup
 */
export function initializeBlocks(): void {
  // Register all block definitions
  registry.register(buttonDefinition);
  registry.register(headingDefinition);
  registry.register(textDefinition);
  registry.register(dividerDefinition);
  registry.register(imageDefinition);
  
  console.log('[BlockSystem] Initialized with blocks:', registry.getAllTypes());
}

/**
 * Check if block system is ready
 */
export function isBlockSystemReady(): boolean {
  return registry.getAllTypes().length > 0;
}
