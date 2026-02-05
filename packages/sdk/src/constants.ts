import type { RetryConfig } from './types';

export const DEFAULT_BASE_URL = 'https://theme.dheme.com';

/**
 * Timeout padrão (30 segundos)
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Configuração de retry padrão
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Headers padrão
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'dheme-sdk/1.0.0',
};
