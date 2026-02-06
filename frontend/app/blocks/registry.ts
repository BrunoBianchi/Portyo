/**
 * Portyo Block Registry
 * Central registry for all block types
 */

import type { BlockDefinition, BlockRegistry, LegacyBioBlock, BaseBlockData } from './types';

class BlockRegistryImpl implements BlockRegistry {
  private blocks = new Map<string, BlockDefinition>();

  register<T>(definition: BlockDefinition<T>): void {
    if (this.blocks.has(definition.type)) {
      console.warn(`[BlockRegistry] Block type "${definition.type}" is being overwritten`);
    }
    this.blocks.set(definition.type, definition);
    console.log(`[BlockRegistry] Registered block type: ${definition.type}`);
  }

  get(type: string): BlockDefinition | undefined {
    return this.blocks.get(type);
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  getByCategory(category: string): BlockDefinition[] {
    return this.getAll().filter(block => block.schema.category === category);
  }

  unregister(type: string): void {
    this.blocks.delete(type);
  }

  /**
   * Check if a block type exists
   */
  has(type: string): boolean {
    return this.blocks.has(type);
  }

  /**
   * Get all block types (strings)
   */
  getTypes(): string[] {
    return Array.from(this.blocks.keys());
  }

  /**
   * Migrate legacy block to new format
   */
  migrateBlock(legacy: LegacyBioBlock): BaseBlockData | null {
    const definition = this.get(legacy.type);
    if (!definition) {
      console.warn(`[BlockRegistry] Unknown block type: ${legacy.type}`);
      return null;
    }

    // Extract block-specific data from legacy format
    const { id, type, ...legacyData } = legacy;
    
    // Run migrations if needed
    let data = legacyData as unknown;
    const currentVersion = definition.version;
    const legacyVersion = (legacyData as Record<string, unknown>).version as number || 1;

    if (legacyVersion < currentVersion && definition.migrations) {
      for (let v = legacyVersion; v < currentVersion; v++) {
        const migrate = definition.migrations[v];
        if (migrate) {
          data = migrate(data);
        }
      }
    }

    return {
      id,
      type,
      version: currentVersion,
      data: data as Record<string, unknown>,
    };
  }

  /**
   * Create default data for a block type
   */
  createDefaultData<T>(type: string): T | null {
    const definition = this.get(type);
    if (!definition) return null;
    return { ...definition.defaultData } as T;
  }
}

// Singleton instance
export const blockRegistry = new BlockRegistryImpl();

// Export for use in block definition files
export { BlockRegistryImpl };

// ============================================================
// AUTO-REGISTRATION
// ============================================================

/**
 * Auto-register all built-in blocks
 * This will be called on app initialization
 */
export async function registerBuiltinBlocks(): Promise<void> {
  // Dynamic imports to avoid circular dependencies
  const modules = await Promise.all([
    import('./definitions/button.block'),
    import('./definitions/heading.block'),
    import('./definitions/text.block'),
    import('./definitions/image.block'),
    import('./definitions/divider.block'),
    import('./definitions/socials.block'),
    import('./definitions/video.block'),
    import('./definitions/spotify.block'),
    import('./definitions/instagram.block'),
    import('./definitions/youtube.block'),
    import('./definitions/qrcode.block'),
    import('./definitions/whatsapp.block'),
    import('./definitions/experience.block'),
    import('./definitions/calendar.block'),
    import('./definitions/map.block'),
    import('./definitions/featured.block'),
    import('./definitions/affiliate.block'),
    import('./definitions/event.block'),
    import('./definitions/tour.block'),
    import('./definitions/button-grid.block'),
    import('./definitions/form.block'),
    import('./definitions/portfolio.block'),
    import('./definitions/marketing.block'),
    import('./definitions/blog.block'),
  ]);

  modules.forEach(mod => {
    if (mod.definition) {
      blockRegistry.register(mod.definition);
    }
  });

  console.log('[BlockRegistry] All built-in blocks registered');
}
