import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

function resolveLoadingBg(
  prop: boolean | { light?: string; dark?: string },
  mode: 'light' | 'dark'
): string | null {
  if (prop === false) return null;
  if (prop === true) return mode === 'dark' ? '#000000' : '#ffffff';
  return mode === 'dark' ? (prop.dark ?? '#000000') : (prop.light ?? '#ffffff');
}
import { DhemeClient } from '@dheme/sdk';
import type { GenerateThemeRequest, GenerateThemeResponse } from '@dheme/sdk';
import type { DhemeProviderProps, ThemeMode } from '../types';
import { ThemeDataContext } from '../contexts/ThemeDataContext';
import { ThemeActionsContext } from '../contexts/ThemeActionsContext';
import { applyThemeCSSVariables, removeThemeCSSVariables } from '../utils/cssVariables';
import { buildCacheKey } from '../utils/cacheKey';
import { DhemeLoadingOverlay } from './DhemeLoadingOverlay';
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
  loadingContent,
  loadingBackground = true,
  waitForFresh = true,
  children,
}: DhemeProviderProps): React.ReactElement {
  const client = useMemo(() => new DhemeClient({ apiKey, baseUrl }), [apiKey, baseUrl]);

  // Ref for the custom generate function — avoids recreating generateTheme when the prop changes
  const customGenerateThemeRef = useRef(customGenerateTheme);
  customGenerateThemeRef.current = customGenerateTheme;

  const [theme, setTheme] = useState<GenerateThemeResponse | null>(() => {
    if (typeof window === 'undefined' || !persist || !primaryColor) return null;
    // If blocking script already applied CSS vars, leave theme null here;
    // the useEffect will populate it and kick off background revalidation.
    if (getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() !== '')
      return null;
    const params: GenerateThemeRequest = { theme: primaryColor, ...themeParams };
    return loadThemeFromCache(buildCacheKey(params));
  });
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    return loadMode() || defaultMode;
  });
  // If CSS vars are already present (DhemeScript SSR or client blocking script),
  // initialize as ready to skip the loading screen entirely.
  // Otherwise, if there is a cache hit, apply CSS vars synchronously before the
  // first paint so children render with the correct theme immediately.
  const [isReady, setIsReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    // waitForFresh: always start with loading to guarantee fresh API response before rendering.
    // Still applies the fallback background so there's no unstyled flash behind the overlay.
    if (waitForFresh) {
      const resolvedMode: ThemeMode = loadMode() ?? defaultMode;
      if (loadingBackground !== false) {
        const bg = resolveLoadingBg(loadingBackground, resolvedMode);
        if (bg) document.documentElement.style.backgroundColor = bg;
      }
      return false;
    }
    // Case 1: blocking script already applied CSS vars — trust the DOM.
    // The blocking script (getNextBlockingScriptPayload) already set backgroundColor;
    // the cleanup useEffect below will remove it after hydration.
    if (getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() !== '')
      return true;
    // Resolve mode synchronously (mirrors the mode useState initializer below).
    const resolvedMode: ThemeMode = loadMode() ?? defaultMode;
    // Helper: apply fallback background and return false.
    const applyBgAndReturnFalse = (): false => {
      if (loadingBackground !== false) {
        const bg = resolveLoadingBg(loadingBackground, resolvedMode);
        if (bg) document.documentElement.style.backgroundColor = bg;
      }
      return false;
    };
    // Case 2: no blocking script, but cache exists — apply synchronously to prevent FOUC.
    if (!persist || !primaryColor) return applyBgAndReturnFalse();
    const params: GenerateThemeRequest = { theme: primaryColor, ...themeParams };
    const cached = loadThemeFromCache(buildCacheKey(params));
    if (!cached) return applyBgAndReturnFalse();
    // Cache hit — apply CSS vars synchronously; no fallback background needed.
    if (autoApply)
      applyThemeCSSVariables(cached, resolvedMode, themeParams?.tailwindVersion ?? 'v4');
    if (resolvedMode === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return true;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Remove the fallback backgroundColor from <html> as soon as the theme is ready.
  // Covers two cases:
  // 1. React standalone: set by the useState initializer above when no cache exists.
  // 2. SSR with DhemeScript: set by getNextBlockingScriptPayload before hydration;
  //    isReady=true from mount, so this effect fires once on mount to clean up.
  useEffect(() => {
    if (isReady && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = '';
    }
  }, [isReady]);

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
      applyThemeCSSVariables(theme, mode, themeParams?.tailwindVersion ?? 'v4');
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

        if (process.env.NODE_ENV === 'development') {
          console.log('[dheme] theme data received:', {
            hasColors: !!data?.colors,
            mode: modeRef.current,
            colors: data?.colors?.[modeRef.current],
            autoApply: autoApplyRef.current,
          });
        }

        setTheme(data);
        setIsReady(true);

        if (autoApplyRef.current) {
          applyThemeCSSVariables(data, modeRef.current, params.tailwindVersion ?? 'v4');
        }

        if (persistRef.current) {
          const key = buildCacheKey(params);
          saveThemeToCache(key, data);
          saveCurrentParams(params);
        }

        onThemeChangeRef.current?.(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (process.env.NODE_ENV === 'development') {
          console.error('[dheme] generateTheme failed:', error);
        }
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
    if (!primaryColor) {
      // Nothing to fetch — release the overlay if waitForFresh was holding it.
      if (waitForFresh) setIsReady(true);
      return;
    }

    const params: GenerateThemeRequest = {
      theme: primaryColor,
      ...themeParams,
    };

    const cacheKey = buildCacheKey(params);
    const cached = persist ? loadThemeFromCache(cacheKey) : null;

    if (waitForFresh) {
      // Pre-apply cached CSS vars under the overlay so the reveal is instant and correct.
      if (cached && !theme) {
        setTheme(cached);
        if (autoApply) applyThemeCSSVariables(cached, mode, params.tailwindVersion ?? 'v4');
      }
      // Always fetch fresh. generateTheme sets isReady(true) on success.
      // .finally ensures the overlay is removed even on error.
      generateTheme(params).finally(() => {
        setIsReady(true);
      });
      return () => {
        abortRef.current?.abort();
      };
    }

    if (cached) {
      // Only update state if theme wasn't already pre-loaded in the useState initializer
      if (!theme) {
        setTheme(cached);
        setIsReady(true);
        if (autoApply) applyThemeCSSVariables(cached, mode, params.tailwindVersion ?? 'v4');
      }

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
            if (autoApply)
              applyThemeCSSVariables(data, modeRef.current, params.tailwindVersion ?? 'v4');
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
    React.createElement(
      ThemeActionsContext.Provider,
      { value: themeActionsValue },
      !isReady
        ? React.createElement(
            DhemeLoadingOverlay,
            {
              background:
                loadingBackground !== false ? resolveLoadingBg(loadingBackground, mode) : undefined,
            },
            loadingContent ?? undefined
          )
        : children
    )
  );
}
