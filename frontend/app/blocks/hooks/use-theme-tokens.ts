/**
 * React Hook for Theme Tokens
 */

import { useMemo, useEffect } from 'react';
import type { Bio } from '../../services/bio/bio';
import type { ThemeTokens } from '../types';
import { createDefaultTokens, applyTokensToElement } from '../tokens/token-system';

export interface UseThemeTokensOptions {
  applyToRoot?: boolean;
  customTokens?: Partial<ThemeTokens>;
}

export interface UseThemeTokensReturn {
  tokens: ThemeTokens;
  applyToElement: (element: HTMLElement) => void;
  getTokenValue: (name: keyof ThemeTokens) => string;
}

export function useThemeTokens(
  bio: Bio,
  options: UseThemeTokensOptions = {}
): UseThemeTokensReturn {
  const { applyToRoot = true, customTokens } = options;

  // Generate tokens from bio + custom overrides
  const tokens = useMemo<ThemeTokens>(() => {
    const defaultTokens = createDefaultTokens(bio);
    return {
      ...defaultTokens,
      ...customTokens
    };
  }, [bio, customTokens]);

  // Apply to root element on mount
  useEffect(() => {
    if (applyToRoot && typeof document !== 'undefined') {
      const root = document.documentElement;
      applyTokensToElement(root, tokens);
    }
  }, [tokens, applyToRoot]);

  const applyToElement = (element: HTMLElement) => {
    applyTokensToElement(element, tokens);
  };

  const getTokenValue = (name: keyof ThemeTokens): string => {
    return tokens[name] || '';
  };

  return {
    tokens,
    applyToElement,
    getTokenValue
  };
}
