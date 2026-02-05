import {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_HEADERS,
  DEFAULT_RETRY_CONFIG,
} from './constants';
import {
  AuthenticationError,
  ValidationError,
  RateLimitError,
  ServerError,
  DhemeError,
} from './errors';
import type {
  DhemeClientConfig,
  GenerateThemeRequest,
  GenerateThemeResponse,
  TokensResponse,
  UsageResponse,
  ResponseWithRateLimit,
  RequestConfig,
} from './types';
import { validateApiKey, validateGenerateThemeRequest } from './utils/validators';
import { makeRequest, parseRateLimitHeaders } from './utils/request';
import { withRetry } from './middleware/retry';
import { applyRequestInterceptors, applyResponseInterceptors } from './middleware/interceptors';

/**
 * Cliente principal da SDK Dheme
 */
export class DhemeClient {
  private readonly config: Required<Omit<DhemeClientConfig, 'interceptors'>> & {
    interceptors?: DhemeClientConfig['interceptors'];
  };

  constructor(config: DhemeClientConfig) {
    // Validar API key
    validateApiKey(config.apiKey);

    // Configuração com defaults
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      retryConfig: { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig },
      debug: config.debug || false,
      interceptors: config.interceptors,
    };

    if (this.config.debug) {
      console.log('[DhemeClient] Initialized with config:', {
        baseUrl: this.config.baseUrl,
        timeout: this.config.timeout,
        retryConfig: this.config.retryConfig,
      });
    }
  }

  /**
   * Gera tema completo (JSON)
   */
  async generateTheme(
    params: GenerateThemeRequest
  ): Promise<ResponseWithRateLimit<GenerateThemeResponse>> {
    validateGenerateThemeRequest(params);

    return this.makeApiRequest<GenerateThemeResponse>('POST', '/api/generate-theme', params);
  }

  /**
   * Gera CSS do Shadcn
   */
  async generateShadcnCSS(params: GenerateThemeRequest): Promise<string> {
    validateGenerateThemeRequest(params);

    const response = await this.makeRawRequest('POST', '/api/generate-theme/shadcn', params);

    return response.text();
  }

  /**
   * Gera tokens com múltiplos formatos
   */
  async generateTokens(
    params: GenerateThemeRequest
  ): Promise<ResponseWithRateLimit<TokensResponse>> {
    validateGenerateThemeRequest(params);

    return this.makeApiRequest<TokensResponse>('POST', '/api/generate-theme/tokens', params);
  }

  /**
   * Obtém estatísticas de uso
   */
  async getUsage(): Promise<ResponseWithRateLimit<UsageResponse>> {
    return this.makeApiRequest<UsageResponse>('GET', '/api/usage');
  }

  /**
   * Faz request HTTP com retry e error handling
   */
  private async makeApiRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: unknown
  ): Promise<ResponseWithRateLimit<T>> {
    return withRetry(async () => {
      const response = await this.makeRawRequest(method, endpoint, body);

      // Parse JSON
      const data = await response.json();

      // Parse rate limit headers
      const rateLimit = parseRateLimitHeaders(response.headers);

      return {
        data: data as T,
        rateLimit: rateLimit || {
          limit: 0,
          remaining: 0,
          reset: new Date().toISOString(),
        },
      };
    }, this.config.retryConfig);
  }

  /**
   * Faz request HTTP raw
   */
  private async makeRawRequest(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: unknown
  ): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;

    // Configuração do request
    let requestConfig: RequestConfig = {
      method,
      url,
      headers: {
        ...DEFAULT_HEADERS,
        'x-api-key': this.config.apiKey,
      },
      body,
      timeout: this.config.timeout,
    };

    // Aplicar interceptors de request
    requestConfig = await applyRequestInterceptors(
      requestConfig,
      this.config.interceptors?.request
    );

    if (this.config.debug) {
      console.log('[DhemeClient] Request:', requestConfig);
    }

    // Fazer request
    let response = await makeRequest(requestConfig);

    // Aplicar interceptors de response
    response = await applyResponseInterceptors(response, this.config.interceptors?.response);

    // Handle errors
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response;
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: Record<string, unknown>;

    try {
      errorData = (await response.json()) as Record<string, unknown>;
    } catch {
      errorData = { error: response.statusText };
    }

    const message = (errorData.error as string) || 'Unknown error';

    switch (response.status) {
      case 400:
        throw new ValidationError(message, undefined, errorData);

      case 401:
        throw new AuthenticationError(message, errorData);

      case 429:
        throw new RateLimitError(
          message,
          (errorData.limit as number) || 0,
          (errorData.resetAt as string) || new Date().toISOString(),
          (errorData.plan as string) || 'unknown',
          errorData
        );

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(message, errorData);

      default:
        throw new DhemeError(message, response.status, errorData);
    }
  }
}
