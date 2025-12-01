import type { RetryConfig } from '../types';
import { DEFAULT_RETRY_CONFIG } from '../constants';

/**
 * Executa função com retry e backoff exponencial
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffMultiplier,
    retryableStatusCodes,
  } = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Verificar se deve fazer retry
      const shouldRetry =
        attempt < maxRetries &&
        error instanceof Error &&
        'statusCode' in error &&
        typeof error.statusCode === 'number' &&
        retryableStatusCodes.includes(error.statusCode);

      if (!shouldRetry) {
        throw error;
      }

      // Aguardar antes de tentar novamente
      await sleep(delay);

      // Aumentar delay com backoff exponencial
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

