/**
 * Island System
 * 
 * Partial hydration system - injects minimal vanilla JS only for blocks 
 * that need interactivity.
 */

import type { BlockIsland, ThemeTokens } from '../types';

export interface IslandGenerationOptions {
  lazyLoad?: boolean;
  minify?: boolean;
}

export interface GeneratedIsland {
  id: string;
  scriptId: string;
  code: string;
  config: unknown;
}

/**
 * Registry for island scripts
 */
export class IslandRegistry {
  private islands = new Map<string, BlockIsland>();

  register(island: BlockIsland): void {
    this.islands.set(island.id, island);
  }

  get(id: string): BlockIsland | undefined {
    return this.islands.get(id);
  }

  getAll(): BlockIsland[] {
    return Array.from(this.islands.values());
  }
}

// Singleton instance
export const islandRegistry = new IslandRegistry();

/**
 * Generate island scripts for a set of blocks
 */
export function generateIslandScripts(
  islands: GeneratedIsland[],
  options: IslandGenerationOptions = {}
): string {
  if (islands.length === 0) return '';

  const scripts: string[] = [];
  const presentIslands = new Set<string>();

  islands.forEach(island => {
    if (!presentIslands.has(island.scriptId)) {
      presentIslands.add(island.scriptId);
    }
    
    const wrappedCode = wrapIslandScript(island.id, island.code);
    scripts.push(wrappedCode);
  });

  // Add loader if lazy loading is enabled
  if (options.lazyLoad) {
    scripts.unshift(createIslandLoader());
  }

  return scripts.join('\n\n');
}

/**
 * Wrap island script with initialization guard
 */
function wrapIslandScript(id: string, code: string): string {
  return `(function() {
  const el = document.querySelector('[data-island-id="${id}"]');
  if (!el || el.dataset.islandInitialized) return;
  try {
    ${code}
    el.dataset.islandInitialized = 'true';
  } catch (err) {
    console.error('[Island:${id}] Initialization failed:', err);
  }
})();`;
}

/**
 * Create Intersection Observer-based lazy loading for islands
 */
export function createIslandLoader(): string {
  return `
// Island Lazy Loader
(function() {
  if (!window.IntersectionObserver) {
    // Fallback: load all immediately
    document.querySelectorAll('[data-island-id]').forEach(el => {
      const islandId = el.dataset.islandId;
      if (islandId && window.__islands && window.__islands[islandId]) {
        window.__islands[islandId](el);
      }
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const islandId = el.dataset.islandId;
        if (islandId && window.__islands && window.__islands[islandId]) {
          window.__islands[islandId](el);
          observer.unobserve(el);
        }
      }
    });
  }, { rootMargin: '100px' });

  document.querySelectorAll('[data-island-id]').forEach(el => {
    observer.observe(el);
  });
})();
`.trim();
}

// Type declaration for global window
declare global {
  interface Window {
    __islands?: Record<string, (element: Element) => void>;
  }
}
