import type { RetryConfig } from './types';

const getBaseUrl = (): string => {
  try {
    return typeof process !== 'undefined' && process.env?.DHEME_BASE_URL
      ? process.env.DHEME_BASE_URL
      : 'https://www.dheme.com';
  } catch {
    return 'https://www.dheme.com';
  }
};

export const DEFAULT_BASE_URL = getBaseUrl();

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
  'User-Agent': 'dheme-sdk/1.1.0',
};
