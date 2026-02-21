// Next.js Client Components
export { DhemeProvider } from './components/DhemeProvider';
export { ThemeGenerator } from './components/ThemeGenerator';
export type { ThemeGeneratorProps } from './components/ThemeGenerator';

// Re-export hooks from @dheme/react
export { useTheme, useThemeActions, useGenerateTheme, useDhemeClient } from '@dheme/react';

// Re-export utilities from @dheme/react
export { themeToCSS, applyThemeCSSVariables, buildCacheKey } from '@dheme/react';

// Types
export type { DhemeProviderProps, GenerateThemeStylesOptions } from './types';
export type { ThemeMode, ThemeDataState, ThemeActionsState } from '@dheme/react';
export type {
  GenerateThemeRequest,
  GenerateThemeResponse,
  ColorTokens,
  HSLColor,
} from '@dheme/sdk';
