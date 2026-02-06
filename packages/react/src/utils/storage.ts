import type { GenerateThemeRequest, GenerateThemeResponse } from '@dheme/sdk';
import type { ThemeMode } from '../types';
import { STORAGE_KEY_PREFIX, STORAGE_PARAMS_KEY, STORAGE_MODE_KEY } from '../constants';

const memoryCache = new Map<string, string>();

function getItem(key: string): string | null {
  if (memoryCache.has(key)) return memoryCache.get(key)!;
  try {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(key);
    if (value !== null) memoryCache.set(key, value);
    return value;
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  memoryCache.set(key, value);
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // localStorage full or unavailable
  }
}

function removeItem(key: string): void {
  memoryCache.delete(key);
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function saveThemeToCache(cacheKey: string, theme: GenerateThemeResponse): void {
  setItem(`${STORAGE_KEY_PREFIX}:${cacheKey}`, JSON.stringify(theme));
}

export function loadThemeFromCache(cacheKey: string): GenerateThemeResponse | null {
  const raw = getItem(`${STORAGE_KEY_PREFIX}:${cacheKey}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GenerateThemeResponse;
  } catch {
    return null;
  }
}

export function saveCurrentParams(params: GenerateThemeRequest): void {
  setItem(STORAGE_PARAMS_KEY, JSON.stringify(params));
}

export function loadCurrentParams(): GenerateThemeRequest | null {
  const raw = getItem(STORAGE_PARAMS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GenerateThemeRequest;
  } catch {
    return null;
  }
}

export function saveMode(mode: ThemeMode): void {
  setItem(STORAGE_MODE_KEY, mode);
}

export function loadMode(): ThemeMode | null {
  const raw = getItem(STORAGE_MODE_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  return null;
}

export function clearAll(): void {
  removeItem(STORAGE_PARAMS_KEY);
  removeItem(STORAGE_MODE_KEY);
  // Clear all cache entries
  const keysToRemove: string[] = [];
  memoryCache.forEach((_, key) => {
    if (key.startsWith(STORAGE_KEY_PREFIX + ':')) {
      keysToRemove.push(key);
    }
  });
  keysToRemove.forEach(removeItem);

  try {
    if (typeof window !== 'undefined') {
      const len = localStorage.length;
      for (let i = len - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX + ':')) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch {
    // ignore
  }
}
