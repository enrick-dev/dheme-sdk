import type { GenerateThemeResponse, HSLColor } from '@dheme/sdk';
import type { ThemeMode } from '../types';
import { CSS_TOKEN_KEYS, TOKEN_TO_CSS_VAR } from '../constants';

function formatHSL(color: HSLColor): string {
  return `${color.h} ${color.s}% ${color.l}%`;
}

export function themeToCSS(theme: GenerateThemeResponse, mode: ThemeMode): string {
  const colors = theme.colors[mode];
  if (!colors) return '';

  const parts: string[] = [];

  for (const key of CSS_TOKEN_KEYS) {
    const color = colors[key] as HSLColor | undefined;
    if (color) {
      parts.push(`${TOKEN_TO_CSS_VAR[key]}:${formatHSL(color)}`);
    }
  }

  if (theme.radius != null) {
    parts.push(`--radius:${theme.radius}rem`);
  }

  return parts.join(';');
}

export function themeToCSSBothModes(theme: GenerateThemeResponse): string {
  const lightCSS = themeToCSS(theme, 'light');
  const darkCSS = themeToCSS(theme, 'dark');
  return `:root{${lightCSS}}.dark{${darkCSS}}`;
}

export function applyThemeCSSVariables(theme: GenerateThemeResponse, mode: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const colors = theme.colors[mode];
  if (!colors) return;

  const style = document.documentElement.style;

  for (const key of CSS_TOKEN_KEYS) {
    const color = colors[key] as HSLColor | undefined;
    if (color) {
      style.setProperty(TOKEN_TO_CSS_VAR[key], formatHSL(color));
    }
  }

  if (theme.radius != null) {
    style.setProperty('--radius', `${theme.radius}rem`);
  }
}

export function removeThemeCSSVariables(): void {
  if (typeof document === 'undefined') return;

  const style = document.documentElement.style;

  for (const key of CSS_TOKEN_KEYS) {
    style.removeProperty(TOKEN_TO_CSS_VAR[key]);
  }
  style.removeProperty('--radius');
}
