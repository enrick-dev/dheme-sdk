import type { DhemeClient, GenerateThemeRequest, GenerateThemeResponse } from '@dheme/sdk';

export type ThemeMode = 'light' | 'dark';

export interface ThemeDataState {
  theme: GenerateThemeResponse | null;
  mode: ThemeMode;
  isReady: boolean;
}

export interface ThemeActionsState {
  generateTheme: (params: GenerateThemeRequest) => Promise<void>;
  setMode: (mode: ThemeMode) => void;
  clearTheme: () => void;
  isLoading: boolean;
  error: Error | null;
  client: DhemeClient;
}

export interface DhemeProviderProps {
  /** API key (obrigatório para uso externo; omitir para rotas internas sem autenticação) */
  apiKey?: string;
  theme?: string;
  themeParams?: Omit<GenerateThemeRequest, 'theme'>;
  defaultMode?: ThemeMode;
  baseUrl?: string;
  persist?: boolean;
  autoApply?: boolean;
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
  onThemeChange?: (theme: GenerateThemeResponse) => void;
  onModeChange?: (mode: ThemeMode) => void;
  onError?: (error: Error) => void;
  /**
   * Rendered instead of children while the initial theme is loading.
   * Use this to prevent layout flash by showing a skeleton or spinner.
   *
   * Note: when using @dheme/next with DhemeScript, the theme is injected
   * server-side — omit this prop in that case to avoid an unnecessary flash.
   */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export interface DhemeScriptProps {
  defaultMode?: ThemeMode;
  nonce?: string;
}
