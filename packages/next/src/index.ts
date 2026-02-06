// Next.js Components
export { DhemeProvider } from './components/DhemeProvider';
export { DhemeScript } from './components/DhemeScript';

// Re-export hooks from @dheme/react
export { useTheme, useThemeActions, useGenerateTheme, useDhemeClient } from '@dheme/react';

// Re-export utilities from @dheme/react
export { themeToCSS, applyThemeCSSVariables, buildCacheKey } from '@dheme/react';

// Types
export type { DhemeProviderProps, DhemeScriptProps, GenerateThemeStylesOptions } from './types';
export type { ThemeMode, ThemeDataState, ThemeActionsState } from '@dheme/react';
export type {
  GenerateThemeRequest,
  GenerateThemeResponse,
  ColorTokens,
  HSLColor,
} from '@dheme/sdk';
