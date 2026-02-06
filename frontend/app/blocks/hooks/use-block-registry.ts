/**
 * React Hook for Block Registry
 */

import { useState, useEffect, useCallback } from 'react';
import { registry, BlockRegistry } from '../registry';
import type { BlockDefinition } from '../types';

export interface UseBlockRegistryReturn {
  registry: BlockRegistry;
  blockTypes: string[];
  getDefinition: (type: string) => BlockDefinition | undefined;
  isRegistered: (type: string) => boolean;
  refresh: () => void;
}

export function useBlockRegistry(): UseBlockRegistryReturn {
  const [blockTypes, setBlockTypes] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setBlockTypes(registry.getAllTypes());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getDefinition = useCallback((type: string) => {
    return registry.lookup(type);
  }, []);

  const isRegistered = useCallback((type: string) => {
    return registry.lookup(type) !== undefined;
  }, []);

  return {
    registry,
    blockTypes,
    getDefinition,
    isRegistered,
    refresh
  };
}
