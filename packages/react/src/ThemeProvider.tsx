import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DhemeClient,
  type GenerateThemeRequest,
  type GenerateThemeResponse,
} from '@dheme/sdk';
import { ThemeContext } from './ThemeContext';
import { applyThemeCSSVariables } from './utils/cssVariables';
import { loadThemeFromStorage, saveThemeToStorage } from './utils/localStorage';

export interface ThemeProviderProps {
  /** API key (obrigatório) */
  apiKey: string;
  /** Base URL da API (opcional) */
  baseUrl?: string;
  /** Children components */
  children: React.ReactNode;
  /** Persistir tema no localStorage (default: true) */
  persistTheme?: boolean;
  /** Aplicar CSS variables automaticamente (default: true) */
  autoApply?: boolean;
  /** Modo inicial light/dark (default: 'light') */
  mode?: 'light' | 'dark';
  /** Callback quando tema mudar (opcional) */
  onThemeChange?: (theme: GenerateThemeResponse | null) => void;
}

export function ThemeProvider({
  apiKey,
  baseUrl,
  children,
  persistTheme = true,
  autoApply = true,
  mode = 'light',
  onThemeChange,
}: ThemeProviderProps) {
  // Cliente SDK
  const client = useMemo(
    () => new DhemeClient({ apiKey, baseUrl }),
    [apiKey, baseUrl]
  );

  // Estado
  const [theme, setTheme] = useState<GenerateThemeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Carregar tema do localStorage no mount (SSR-safe)
  useEffect(() => {
    if (persistTheme && typeof window !== 'undefined') {
      const stored = loadThemeFromStorage();
      if (stored) {
        setTheme(stored);
      }
    }
  }, [persistTheme]);

  // Aplicar tema quando mudar
  useEffect(() => {
    if (theme && autoApply) {
      applyThemeCSSVariables(theme, mode);
    }
  }, [theme, mode, autoApply]);

  // Notificar mudança
  useEffect(() => {
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  // Gerar tema
  const generateTheme = useCallback(
    async (params: GenerateThemeRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await client.generateTheme(params);
        setTheme(response.data);

        if (persistTheme) {
          saveThemeToStorage(response.data);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, persistTheme]
  );

  // Limpar tema
  const clearTheme = useCallback(() => {
    setTheme(null);
    setError(null);

    if (persistTheme && typeof window !== 'undefined') {
      localStorage.removeItem('dheme-theme');
    }
  }, [persistTheme]);

  // Aplicar tema manualmente
  const applyTheme = useCallback(
    (mode: 'light' | 'dark') => {
      if (theme) {
        applyThemeCSSVariables(theme, mode);
      }
    },
    [theme]
  );

  const value = useMemo(
    () => ({
      client,
      theme,
      isLoading,
      error,
      generateTheme,
      clearTheme,
      applyTheme,
    }),
    [client, theme, isLoading, error, generateTheme, clearTheme, applyTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

