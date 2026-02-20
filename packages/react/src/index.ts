// Components
export { DhemeProvider } from './components/DhemeProvider';
export { DhemeScript } from './components/DhemeScript';
export { ThemeGenerator } from './components/ThemeGenerator';
export type { ThemeGeneratorProps } from './components/ThemeGenerator';

// Hooks
export { useTheme } from './hooks/useTheme';
export { useThemeActions } from './hooks/useThemeActions';
export { useGenerateTheme } from './hooks/useGenerateTheme';
export { useDhemeClient } from './hooks/useDhemeClient';

// Utils (for advanced use and @dheme/next)
export {
  themeToCSS,
  themeToCSSBothModes,
  applyThemeCSSVariables,
  removeThemeCSSVariables,
} from './utils/cssVariables';
export { buildCacheKey } from './utils/cacheKey';
export { getBlockingScriptPayload, getNextBlockingScriptPayload } from './utils/scriptPayload';

// Contexts (for advanced composition)
export { ThemeDataContext } from './contexts/ThemeDataContext';
export { ThemeActionsContext } from './contexts/ThemeActionsContext';

// Types
export type {
  ThemeMode,
  ThemeDataState,
  ThemeActionsState,
  DhemeProviderProps,
  DhemeScriptProps,
} from './types';

// Re-export SDK types that consumers commonly need
export type {
  GenerateThemeRequest,
  GenerateThemeResponse,
  ColorTokens,
  HSLColor,
} from '@dheme/sdk';
