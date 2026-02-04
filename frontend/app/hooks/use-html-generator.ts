import { useEffect, useState, useRef, useCallback } from "react";
import { blocksToHtml } from "~/services/html-generator";
import type { BioBlock } from "~/contexts/bio.context";
import type { Bio } from "~/types/bio";
import type { User } from "~/types/user";

interface UseHtmlGeneratorOptions {
  blocks: BioBlock[];
  bio: Bio | null;
  user: User | null;
  delay?: number;
}

interface UseHtmlGeneratorReturn {
  html: string | null;
  isGenerating: boolean;
  error: Error | null;
  regenerate: () => Promise<void>;
}

export function useHtmlGenerator(options: UseHtmlGeneratorOptions): UseHtmlGeneratorReturn {
  const { blocks, bio, user, delay = 300 } = options;
  
  const [html, setHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateHtml = useCallback(async () => {
    if (!blocks || !bio) return;
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsGenerating(true);
    setError(null);
    
    try {
      const generated = await blocksToHtml(blocks, user, bio);
      setHtml(generated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to generate HTML"));
    } finally {
      setIsGenerating(false);
    }
  }, [blocks, bio, user]);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the generation
    timeoutRef.current = setTimeout(generateHtml, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [generateHtml, delay]);

  return {
    html,
    isGenerating,
    error,
    regenerate: generateHtml,
  };
}
