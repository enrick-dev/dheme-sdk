// Pure server-safe utilities — no React, no hooks, no 'use client'
// Safe to import from Next.js Server Components and Route Handlers
export {
  themeToCSS,
  themeToCSSBothModes,
  applyThemeCSSVariables,
  removeThemeCSSVariables,
} from './utils/cssVariables';
export { buildCacheKey } from './utils/cacheKey';
export { getBlockingScriptPayload, getNextBlockingScriptPayload } from './utils/scriptPayload';
