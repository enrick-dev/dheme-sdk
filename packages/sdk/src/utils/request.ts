import { NetworkError } from '../errors';
import type { RequestConfig, RateLimitHeaders } from '../types';

/**
 * Detecta se está rodando em Node.js
 */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * Faz HTTP request universal (Browser/Node.js/Edge)
 */
export async function makeRequest(config: RequestConfig): Promise<Response> {
  const { method, url, headers, body, timeout = 30000 } = config;

  // Controller para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new NetworkError(`Request timeout after ${timeout}ms`, error);
      }
      throw new NetworkError(`Network request failed: ${error.message}`, error);
    }

    throw new NetworkError('Network request failed with unknown error');
  }
}

/**
 * Parse rate limit headers do response
 */
export function parseRateLimitHeaders(headers: Headers): RateLimitHeaders | null {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');

  if (!limit || !remaining || !reset) {
    return null;
  }

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset,
  };
}

