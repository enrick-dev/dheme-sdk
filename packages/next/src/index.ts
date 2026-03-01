// Next.js Client Components
export { DhemeProvider } from './components/DhemeProvider';
export { ThemeGenerator } from './components/ThemeGenerator';
export type { ThemeGeneratorProps } from './components/ThemeGenerator';

// Next.js Server Components
export { DhemeScript } from './components/DhemeScript';
export { DhemeSetup } from './components/DhemeSetup';

// Re-export hooks from @dheme/react
export { useTheme, useThemeActions, useGenerateTheme, useDhemeClient } from '@dheme/react';

// Re-export utilities from @dheme/react
export { themeToCSS, applyThemeCSSVariables, buildCacheKey } from '@dheme/react';

// Types
export type { DhemeProviderProps, DhemeScriptProps, DhemeSetupProps, GenerateThemeStylesOptions } from './types';
export type { ThemeMode, ThemeDataState, ThemeActionsState } from '@dheme/react';
export type {
  GenerateThemeRequest,
  GenerateThemeResponse,
  ColorTokens,
  HSLColor,
} from '@dheme/sdk';
