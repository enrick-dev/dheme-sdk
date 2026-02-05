// Provider e Context
export { ThemeProvider } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export { ThemeContext } from './ThemeContext';
export type { ThemeContextValue } from './ThemeContext';

// Hooks
export { useTheme } from './hooks/useTheme';
export { useGenerateTheme } from './hooks/useGenerateTheme';

// Utilitários
export { applyThemeCSSVariables, removeThemeCSSVariables } from './utils/cssVariables';
export {
  saveThemeToStorage,
  loadThemeFromStorage,
  removeThemeFromStorage,
} from './utils/localStorage';

// Re-exportar tipos da SDK base
export type {
  GenerateThemeRequest,
  GenerateThemeResponse,
  ColorTokens,
  HSLColor,
} from '@dheme/sdk';
