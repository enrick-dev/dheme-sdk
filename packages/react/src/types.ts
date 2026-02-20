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
  onThemeChange?: (theme: GenerateThemeResponse) => void;
  onModeChange?: (mode: ThemeMode) => void;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

export interface DhemeScriptProps {
  defaultMode?: ThemeMode;
  nonce?: string;
}
