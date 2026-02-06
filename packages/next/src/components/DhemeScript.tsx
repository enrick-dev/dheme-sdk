import React from 'react';
import { DhemeClient } from '@dheme/sdk';
import { themeToCSS, buildCacheKey, getNextBlockingScriptPayload } from '@dheme/react';
import { themeCache } from '../server/cache';
import type { DhemeScriptProps } from '../types';

export async function DhemeScript({
  apiKey,
  theme,
  themeParams,
  defaultMode = 'light',
  baseUrl,
  nonce,
}: DhemeScriptProps): Promise<React.ReactElement> {
  const params = { theme, ...themeParams };
  const cacheKey = buildCacheKey(params);

  // Check cache first
  let themeData = themeCache.get(cacheKey);

  if (!themeData) {
    const client = new DhemeClient({ apiKey, baseUrl });
    const response = await client.generateTheme(params);
    themeData = response.data;
    themeCache.set(cacheKey, themeData);
  }

  // Generate CSS for both modes
  const lightCSS = themeToCSS(themeData, 'light');
  const darkCSS = themeToCSS(themeData, 'dark');
  const styleContent = `:root{${lightCSS}}.dark{${darkCSS}}`;

  // Blocking script for mode detection
  const scriptContent = getNextBlockingScriptPayload(defaultMode);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement('style', {
      nonce,
      dangerouslySetInnerHTML: { __html: styleContent },
    }),
    React.createElement('script', {
      nonce,
      dangerouslySetInnerHTML: { __html: scriptContent },
    })
  );
}
