import type { GenerateThemeResponse } from '@dheme/sdk';

const STORAGE_KEY = 'dheme-theme';

/**
 * Salva tema no localStorage
 */
export function saveThemeToStorage(theme: GenerateThemeResponse): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.warn('[Dheme] Failed to save theme to localStorage:', error);
  }
}

/**
 * Carrega tema do localStorage
 */
export function loadThemeFromStorage(): GenerateThemeResponse | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('[Dheme] Failed to load theme from localStorage:', error);
  }

  return null;
}

/**
 * Remove tema do localStorage
 */
export function removeThemeFromStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[Dheme] Failed to remove theme from localStorage:', error);
  }
}

