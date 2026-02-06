import { useState, useCallback } from 'react';
import { useThemeActions } from './useThemeActions';
import type { GenerateThemeRequest } from '@dheme/sdk';

export function useGenerateTheme() {
  const { generateTheme: generate } = useThemeActions();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateTheme = useCallback(
    async (params: GenerateThemeRequest) => {
      setIsGenerating(true);
      setError(null);

      try {
        await generate(params);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [generate]
  );

  return { generateTheme, isGenerating, error };
}
