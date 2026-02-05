import { createContext } from 'react';
import type { GenerateThemeResponse, DhemeClient, GenerateThemeRequest } from '@dheme/sdk';

export interface ThemeContextValue {
  client: DhemeClient;
  theme: GenerateThemeResponse | null;
  isLoading: boolean;
  error: Error | null;
  generateTheme: (params: GenerateThemeRequest) => Promise<void>;
  clearTheme: () => void;
  applyTheme: (mode: 'light' | 'dark') => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
