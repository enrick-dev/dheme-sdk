import type { GenerateThemeRequest } from '@dheme/sdk';
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
}

export interface GenerateThemeStylesOptions {
  /** API key (obrigatório para uso externo; omitir para rotas internas sem autenticação) */
  apiKey?: string;
  theme: string;
  themeParams?: Omit<GenerateThemeRequest, 'theme'>;
  mode?: ThemeMode;
  baseUrl?: string;
}
