import React from 'react';
import Script from 'next/script';
import { DhemeClient } from '@dheme/sdk';
import { themeToCSS, buildCacheKey, getNextBlockingScriptPayload } from '@dheme/react/utils';
import { themeCache } from '../server/cache';
import type { DhemeScriptProps } from '../types';

export async function DhemeScript({
  apiKey,
  theme,
  themeParams,
  defaultMode = 'light',
  baseUrl,
  nonce,
  onGenerateTheme,
}: DhemeScriptProps): Promise<React.ReactElement> {
  const params = { theme, ...themeParams };
  const cacheKey = buildCacheKey(params);

  // Check cache first
  let themeData = themeCache.get(cacheKey);

  if (!themeData) {
    if (onGenerateTheme) {
      themeData = await onGenerateTheme(params);
    } else {
      const client = new DhemeClient({ apiKey, baseUrl });
      const response = await client.generateTheme(params);
      themeData = response.data;
    }
    themeCache.set(cacheKey, themeData);
  }

  // Generate CSS for both modes
  const lightCSS = themeToCSS(themeData, 'light');
  const darkCSS = themeToCSS(themeData, 'dark');
  const styleContent = `:root{${lightCSS}}.dark{${darkCSS}}`;

  // Blocking script for mode detection
  const scriptContent = getNextBlockingScriptPayload(defaultMode);

  // React 19 Resource Hosting: precedence="high" causes React to hoist this
  // <style> into <head>, making it render-blocking and eliminating FOUC.
  // Cast needed because @types/react v18 doesn't include `precedence` yet.
  const styleProps = {
    nonce,
    precedence: 'high',
    dangerouslySetInnerHTML: { __html: styleContent },
  } as unknown as React.StyleHTMLAttributes<HTMLStyleElement>;

  return React.createElement(
    React.Fragment,
    null,
    React.createElement('style', styleProps),
    // strategy="beforeInteractive" causes Next.js to inject this script into
    // the HTML before any page JS runs — prevents dark/light mode flash.
    React.createElement(Script, {
      id: 'dheme-mode-detect',
      strategy: 'beforeInteractive',
      nonce,
      dangerouslySetInnerHTML: { __html: scriptContent },
    })
  );
}
