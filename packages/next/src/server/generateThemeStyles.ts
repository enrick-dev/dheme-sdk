import { DhemeClient } from '@dheme/sdk';
import { themeToCSS, buildCacheKey } from '@dheme/react';
import { themeCache } from './cache';
import type { GenerateThemeStylesOptions } from '../types';

export async function generateThemeStyles(options: GenerateThemeStylesOptions): Promise<string> {
  const { apiKey, theme, themeParams, mode = 'light', baseUrl } = options;

  const params = { theme, ...themeParams };
  const cacheKey = buildCacheKey(params);

  // Check in-memory cache
  const cached = themeCache.get(cacheKey);
  if (cached) {
    return themeToCSS(cached, mode);
  }

  // Cache miss — fetch from API
  const client = new DhemeClient({ apiKey, baseUrl });
  const response = await client.generateTheme(params);
  const data = response.data;

  // Store in cache
  themeCache.set(cacheKey, data);

  return themeToCSS(data, mode);
}
