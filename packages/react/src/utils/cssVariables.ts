import type { GenerateThemeResponse } from '@dheme/sdk';
import { formatHSLString } from '@dheme/sdk';

/**
 * Aplica CSS variables do tema no document root
 */
export function applyThemeCSSVariables(theme: GenerateThemeResponse, mode: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const colors = theme.colors[mode];

  // Aplicar variáveis CSS
  root.style.setProperty('--background', formatHSLString(colors.background));
  root.style.setProperty('--foreground', formatHSLString(colors.foreground));
  root.style.setProperty('--card', formatHSLString(colors.card));
  root.style.setProperty('--card-foreground', formatHSLString(colors.cardForeground));
  root.style.setProperty('--popover', formatHSLString(colors.popover));
  root.style.setProperty('--popover-foreground', formatHSLString(colors.popoverForeground));
  root.style.setProperty('--primary', formatHSLString(colors.primary));
  root.style.setProperty('--primary-foreground', formatHSLString(colors.primaryForeground));
  root.style.setProperty('--secondary', formatHSLString(colors.secondary));
  root.style.setProperty('--secondary-foreground', formatHSLString(colors.secondaryForeground));
  root.style.setProperty('--muted', formatHSLString(colors.muted));
  root.style.setProperty('--muted-foreground', formatHSLString(colors.mutedForeground));
  root.style.setProperty('--accent', formatHSLString(colors.accent));
  root.style.setProperty('--accent-foreground', formatHSLString(colors.accentForeground));
  root.style.setProperty('--destructive', formatHSLString(colors.destructive));
  root.style.setProperty('--destructive-foreground', formatHSLString(colors.destructiveForeground));
  root.style.setProperty('--border', formatHSLString(colors.border));
  root.style.setProperty('--input', formatHSLString(colors.input));
  root.style.setProperty('--ring', formatHSLString(colors.ring));
  root.style.setProperty('--radius', `${theme.radius}rem`);

  // Backgrounds (se disponíveis)
  if (theme.backgrounds?.primary) {
    root.style.setProperty('--background-primary', theme.backgrounds.primary[mode]);
  }
  if (theme.backgrounds?.secondary) {
    root.style.setProperty('--background-secondary', theme.backgrounds.secondary[mode]);
  }
}

/**
 * Remove CSS variables do tema
 */
export function removeThemeCSSVariables(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const variables = [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
    '--radius',
    '--background-primary',
    '--background-secondary',
  ];

  variables.forEach((v) => root.style.removeProperty(v));
}
