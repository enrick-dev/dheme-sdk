'use client';

import React, { useCallback, useRef } from 'react';
import { DhemeProvider as ReactDhemeProvider } from '@dheme/react';
import type { GenerateThemeRequest, GenerateThemeResponse } from '@dheme/sdk';
import type { ThemeMode } from '@dheme/react';
import type { DhemeProviderProps } from '../types';

const COOKIE_MAX_AGE = 31_536_000; // 1 year

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${value};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

export function DhemeProvider({
  children,
  cookieSync = true,
  proxyUrl,
  onThemeChange,
  onModeChange,
  onGenerateTheme,
  theme: primaryColor,
  themeParams,
  ...props
}: DhemeProviderProps): React.ReactElement {
  const paramsRef = useRef({ theme: primaryColor, ...themeParams });
  paramsRef.current = { theme: primaryColor, ...themeParams };

  const handleThemeChange = useCallback(
    (theme: GenerateThemeResponse) => {
      if (cookieSync) {
        try {
          setCookie('dheme-params', btoa(JSON.stringify(paramsRef.current)));
        } catch {
          // btoa can fail with non-latin chars, ignore
        }
      }
      onThemeChange?.(theme);
    },
    [cookieSync, onThemeChange]
  );

  const handleModeChange = useCallback(
    (mode: ThemeMode) => {
      if (cookieSync) {
        setCookie('dheme-mode', mode);
      }
      onModeChange?.(mode);
    },
    [cookieSync, onModeChange]
  );

  // Proxy: routes client-side theme requests through a local Next.js Route Handler
  // so the real API key never reaches the browser.
  const proxyGenerateTheme = useCallback(
    async (params: GenerateThemeRequest): Promise<GenerateThemeResponse> => {
      const res = await fetch(proxyUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Proxy request failed: ${res.status}`);
      }
      return res.json();
    },
    [proxyUrl]
  );

  // Priority: proxyUrl > onGenerateTheme > SDK client (uses apiKey directly)
  const resolvedGenerateTheme = proxyUrl ? proxyGenerateTheme : onGenerateTheme;

  return React.createElement(ReactDhemeProvider, {
    ...props,
    theme: primaryColor,
    themeParams,
    persist: true,
    onGenerateTheme: resolvedGenerateTheme,
    onThemeChange: handleThemeChange,
    onModeChange: handleModeChange,
    children,
  });
}
