'use client';

import React, { useCallback, useRef } from 'react';
import { DhemeProvider as ReactDhemeProvider } from '@dheme/react';
import type { GenerateThemeResponse } from '@dheme/sdk';
import type { ThemeMode } from '@dheme/react';
import type { DhemeProviderProps } from '../types';

const COOKIE_MAX_AGE = 31_536_000; // 1 year

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${value};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

export function DhemeProvider({
  children,
  cookieSync = true,
  onThemeChange,
  onModeChange,
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

  return React.createElement(ReactDhemeProvider, {
    ...props,
    theme: primaryColor,
    themeParams,
    persist: true,
    onThemeChange: handleThemeChange,
    onModeChange: handleModeChange,
    children,
  });
}
