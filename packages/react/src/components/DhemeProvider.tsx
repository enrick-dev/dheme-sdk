import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DhemeClient } from '@dheme/sdk';
import type { GenerateThemeRequest, GenerateThemeResponse } from '@dheme/sdk';
import type { DhemeProviderProps, ThemeMode } from '../types';
import { ThemeDataContext } from '../contexts/ThemeDataContext';
import { ThemeActionsContext } from '../contexts/ThemeActionsContext';
import { applyThemeCSSVariables, removeThemeCSSVariables } from '../utils/cssVariables';
import { buildCacheKey } from '../utils/cacheKey';
import {
  saveThemeToCache,
  loadThemeFromCache,
  saveCurrentParams,
  saveMode,
  loadMode,
  clearAll,
} from '../utils/storage';

export function DhemeProvider({
  apiKey,
  theme: primaryColor,
  themeParams,
  defaultMode = 'light',
  baseUrl,
  persist = true,
  autoApply = true,
  onGenerateTheme: customGenerateTheme,
  onThemeChange,
  onModeChange,
  onError,
  children,
}: DhemeProviderProps): React.ReactElement {
  const client = useMemo(() => new DhemeClient({ apiKey, baseUrl }), [apiKey, baseUrl]);

  // Ref for the custom generate function — avoids recreating generateTheme when the prop changes
  const customGenerateThemeRef = useRef(customGenerateTheme);
  customGenerateThemeRef.current = customGenerateTheme;

  const [theme, setTheme] = useState<GenerateThemeResponse | null>(null);
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    return loadMode() || defaultMode;
  });
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs for stable callbacks (avoid stale closures)
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const autoApplyRef = useRef(autoApply);
  autoApplyRef.current = autoApply;

  const persistRef = useRef(persist);
  persistRef.current = persist;

  const onThemeChangeRef = useRef(onThemeChange);
  onThemeChangeRef.current = onThemeChange;

  const onModeChangeRef = useRef(onModeChange);
  onModeChangeRef.current = onModeChange;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Abort controller for cancelling background revalidation
  const abortRef = useRef<AbortController | null>(null);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    if (persistRef.current) saveMode(newMode);
    onModeChangeRef.current?.(newMode);
  }, []);

  // Apply CSS vars when mode changes (no refetch needed)
  useEffect(() => {
    if (theme && autoApply) {
      applyThemeCSSVariables(theme, mode);
    }

    // Sync dark class
    if (typeof document !== 'undefined') {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mode, autoApply]);

  // Resolves theme data from either the custom function or the SDK client
  const fetchTheme = useCallback(
    async (params: GenerateThemeRequest): Promise<GenerateThemeResponse> => {
      if (customGenerateThemeRef.current) {
        return customGenerateThemeRef.current(params);
      }
      const response = await client.generateTheme(params);
      return response.data;
    },
    [client]
  );

  const generateTheme = useCallback(
    async (params: GenerateThemeRequest) => {
      // Cancel any in-flight background revalidation
      abortRef.current?.abort();

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchTheme(params);

        setTheme(data);
        setIsReady(true);

        if (autoApplyRef.current) {
          applyThemeCSSVariables(data, modeRef.current);
        }

        if (persistRef.current) {
          const key = buildCacheKey(params);
          saveThemeToCache(key, data);
          saveCurrentParams(params);
        }

        onThemeChangeRef.current?.(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTheme]
  );

  const clearTheme = useCallback(() => {
    setTheme(null);
    setIsReady(false);
    setError(null);
    if (autoApplyRef.current) removeThemeCSSVariables();
    if (persistRef.current) clearAll();
  }, []);

  // Initial theme load on mount
  useEffect(() => {
    if (!primaryColor) return;

    const params: GenerateThemeRequest = {
      theme: primaryColor,
      ...themeParams,
    };

    const cacheKey = buildCacheKey(params);
    const cached = persist ? loadThemeFromCache(cacheKey) : null;

    if (cached) {
      // Serve from cache immediately
      setTheme(cached);
      setIsReady(true);
      if (autoApply) applyThemeCSSVariables(cached, mode);

      // Stale-while-revalidate in background
      const controller = new AbortController();
      abortRef.current = controller;

      fetchTheme(params)
        .then((data) => {
          if (controller.signal.aborted) return;

          // Only update if colors actually changed
          const cachedLight = JSON.stringify(cached.colors.light);
          const freshLight = JSON.stringify(data.colors.light);
          if (cachedLight !== freshLight) {
            setTheme(data);
            if (autoApply) applyThemeCSSVariables(data, modeRef.current);
            saveThemeToCache(cacheKey, data);
            onThemeChangeRef.current?.(data);
          }
        })
        .catch(() => {
          // Silent fail — we have cached data
        });
    } else {
      // No cache — fetch
      generateTheme(params);
    }

    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const themeDataValue = useMemo(() => ({ theme, mode, isReady }), [theme, mode, isReady]);

  const themeActionsValue = useMemo(
    () => ({ generateTheme, setMode, clearTheme, isLoading, error, client }),
    [generateTheme, setMode, clearTheme, isLoading, error, client]
  );

  return React.createElement(
    ThemeDataContext.Provider,
    { value: themeDataValue },
    React.createElement(ThemeActionsContext.Provider, { value: themeActionsValue }, children)
  );
}
