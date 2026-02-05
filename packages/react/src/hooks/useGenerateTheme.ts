import { useState, useCallback } from 'react';
import { useTheme } from './useTheme';
import type { GenerateThemeRequest } from '@dheme/sdk';

/**
 * Hook para gerar temas com loading state local
 */
export function useGenerateTheme() {
  const { generateTheme: generate } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateTheme = useCallback(
    async (params: GenerateThemeRequest) => {
      setIsGenerating(true);
      setError(null);

      try {
        await generate(params);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [generate]
  );

  return {
    generateTheme,
    isGenerating,
    error,
  };
}
