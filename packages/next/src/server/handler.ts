import { DhemeClient } from '@dheme/sdk';
import type { GenerateThemeRequest } from '@dheme/sdk';

export interface DhemeHandlerConfig {
  /** API key — keep in an environment variable, never in client code. */
  apiKey: string;
  baseUrl?: string;
}

/**
 * Creates a Next.js App Router Route Handler that proxies theme generation
 * requests server-side, so the API key is never exposed to the browser.
 *
 * @example
 * // app/api/dheme/route.ts
 * import { createDhemeHandler } from '@dheme/next/server';
 * export const { POST } = createDhemeHandler({ apiKey: process.env.DHEME_API_KEY! });
 *
 * // Then in your layout, use proxyUrl instead of apiKey:
 * // <DhemeProvider proxyUrl="/api/dheme" theme="..." />
 */
export function createDhemeHandler(config: DhemeHandlerConfig) {
  const client = new DhemeClient({ apiKey: config.apiKey, baseUrl: config.baseUrl });

  async function POST(request: Request): Promise<Response> {
    let body: GenerateThemeRequest;

    try {
      body = (await request.json()) as GenerateThemeRequest;
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    try {
      const response = await client.generateTheme(body);
      return Response.json(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      // Forward rate-limit errors with the original status code
      const status =
        message.includes('429') || message.toLowerCase().includes('rate limit') ? 429 : 500;
      return Response.json({ error: message }, { status });
    }
  }

  return { POST };
}
