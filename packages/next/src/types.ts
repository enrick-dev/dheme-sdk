import type { GenerateThemeRequest, GenerateThemeResponse } from '@dheme/sdk';
import type { ThemeMode, DhemeProviderProps as ReactProviderProps } from '@dheme/react';

export interface DhemeProviderProps extends ReactProviderProps {
  cookieSync?: boolean;
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
