import type React from 'react';
import type { GenerateThemeRequest, GenerateThemeResponse } from '@dheme/sdk';
import type { ThemeMode, DhemeProviderProps as ReactProviderProps } from '@dheme/react';

export interface DhemeProviderProps extends ReactProviderProps {
  cookieSync?: boolean;
  /**
   * URL of a proxy route that forwards theme requests server-side,
   * keeping the API key out of the browser entirely.
   *
   * Defaults to `"/api/dheme"` when neither `apiKey` nor `onGenerateTheme` is provided.
   * This means the only required setup is creating the route — no need to pass this prop explicitly.
   *
   * Set up the route with `createDhemeHandler` from `@dheme/next/server`:
   * @example
   * // app/api/dheme/route.ts
   * import { createDhemeHandler } from '@dheme/next/server';
   * export const { POST } = createDhemeHandler({ apiKey: process.env.DHEME_API_KEY! });
   *
   * // layout.tsx — proxyUrl is optional, defaults to "/api/dheme"
   * <DhemeProvider theme="..." themeParams={...} />
   */
  proxyUrl?: string;
}

export interface DhemeScriptProps {
  /** API key (obrigatório para uso externo; omitir para rotas internas sem autenticação) */
  apiKey?: string;
  theme: string;
  themeParams?: Omit<GenerateThemeRequest, 'theme'>;
  defaultMode?: ThemeMode;
  baseUrl?: string;
  nonce?: string;
  /**
   * Custom theme generation function. When provided, replaces the SDK client's
   * generateTheme call entirely. Useful for internal use cases with custom endpoints.
   *
   * @example
   * // Call an internal proxy route without API key:
   * onGenerateTheme={async (params) => {
   *   const res = await fetch('/api/generate-theme/proxy', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(params),
   *   });
   *   return res.json();
   * }}
   */
  onGenerateTheme?: (params: GenerateThemeRequest) => Promise<GenerateThemeResponse>;
}

export interface DhemeSetupProps {
  /** Primary color hex for the theme (e.g. "7C3AED" or "#7C3AED") */
  theme: string;
  /**
   * Default color mode. Passed to both DhemeScript and DhemeProvider — single source of truth.
   * @default 'light'
   */
  defaultMode?: ThemeMode;
  /** Additional theme generation parameters */
  themeParams?: Omit<GenerateThemeRequest, 'theme'>;
  // ---- DhemeScript (server-side only) ----
  /** API key for the Dheme service. Server-side only — never sent to the browser. */
  apiKey?: string;
  /** Override the base URL for the Dheme API */
  baseUrl?: string;
  /** Nonce for Content Security Policy */
  nonce?: string;
  /**
   * Server-side custom theme generation function.
   * Replaces the SDK client call in DhemeScript. NOT forwarded to DhemeProvider.
   * For client-side custom generation, use DhemeProvider directly with onGenerateTheme.
   */
  onGenerateTheme?: (params: GenerateThemeRequest) => Promise<GenerateThemeResponse>;
  // ---- DhemeProvider (client-side) ----
  /**
   * URL of the client-side proxy route.
   * Defaults to "/api/dheme" when no apiKey is provided.
   */
  proxyUrl?: string;
  /** Sync active mode and theme params to cookies for SSR hydration. @default true */
  cookieSync?: boolean;
  /** Persist theme data in localStorage for instant cache hits. @default true */
  persist?: boolean;
  /** Automatically apply CSS variables when theme changes. @default true */
  autoApply?: boolean;
  children: React.ReactNode;
}

export interface GenerateThemeStylesOptions {
  /** API key (obrigatório para uso externo; omitir para rotas internas sem autenticação) */
  apiKey?: string;
  theme: string;
  themeParams?: Omit<GenerateThemeRequest, 'theme'>;
  mode?: ThemeMode;
  baseUrl?: string;
  /**
   * Custom theme generation function. When provided, replaces the SDK client's
   * generateTheme call entirely.
   */
  onGenerateTheme?: (params: GenerateThemeRequest) => Promise<GenerateThemeResponse>;
}
