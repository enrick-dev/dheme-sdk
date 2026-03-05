import React from 'react';
import { DhemeScript } from './DhemeScript';
import { DhemeProvider } from './DhemeProvider';
import type { DhemeSetupProps } from '../types';

/**
 * Combined Server Component that renders DhemeScript + DhemeProvider in a single declaration.
 * Accepts `defaultMode` once, eliminating the need to keep it in sync across two components.
 *
 * @example
 * // app/layout.tsx
 * import { DhemeSetup } from '@dheme/next';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <DhemeSetup theme="7C3AED" defaultMode="dark" apiKey={process.env.DHEME_API_KEY}>
 *           {children}
 *         </DhemeSetup>
 *       </body>
 *     </html>
 *   );
 * }
 *
 * For apps that need client-side callbacks (onThemeChange, onModeChange, onError, loadingContent),
 * use DhemeScript + DhemeProvider separately.
 */
export async function DhemeSetup({
  // Shared between script and provider
  theme,
  defaultMode = 'light',
  themeParams,
  // DhemeScript only (server-side — never reaches the browser)
  apiKey,
  baseUrl,
  nonce,
  onGenerateTheme,
  // DhemeProvider only (client-side)
  proxyUrl,
  cookieSync,
  persist,
  autoApply,
  loadingBackground,
  children,
}: DhemeSetupProps): Promise<React.ReactElement> {
  return React.createElement(
    React.Fragment,
    null,
    // Server Component: fetches theme server-side, emits render-blocking <style> + <script>
    await DhemeScript({ apiKey, theme, themeParams, defaultMode, baseUrl, nonce, onGenerateTheme }),
    // Client Component: provides theme context, handles runtime interactivity
    React.createElement(DhemeProvider, {
      theme,
      themeParams,
      defaultMode,
      proxyUrl,
      cookieSync,
      persist,
      autoApply,
      loadingBackground,
      children,
    })
  );
}
