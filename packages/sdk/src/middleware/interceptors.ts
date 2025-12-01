import type { RequestInterceptor, ResponseInterceptor, RequestConfig } from '../types';

/**
 * Aplica interceptors de request
 */
export async function applyRequestInterceptors(
  config: RequestConfig,
  interceptors?: RequestInterceptor[]
): Promise<RequestConfig> {
  if (!interceptors || interceptors.length === 0) {
    return config;
  }

  let currentConfig = config;

  for (const interceptor of interceptors) {
    currentConfig = await interceptor(currentConfig);
  }

  return currentConfig;
}

/**
 * Aplica interceptors de response
 */
export async function applyResponseInterceptors(
  response: Response,
  interceptors?: ResponseInterceptor[]
): Promise<Response> {
  if (!interceptors || interceptors.length === 0) {
    return response;
  }

  let currentResponse = response;

  for (const interceptor of interceptors) {
    currentResponse = await interceptor(currentResponse);
  }

  return currentResponse;
}

/**
 * Interceptor de logging (exemplo)
 */
export const loggingInterceptor: RequestInterceptor = (config) => {
  console.log('[Dheme SDK Request]', config.method, config.url);
  return config;
};

/**
 * Interceptor de custom headers (exemplo)
 */
export function customHeadersInterceptor(
  headers: Record<string, string>
): RequestInterceptor {
  return (config) => ({
    ...config,
    headers: { ...config.headers, ...headers },
  });
}

/**
 * Interceptor de response logging (exemplo)
 */
export const responseLoggingInterceptor: ResponseInterceptor = (response) => {
  console.log('[Dheme SDK Response]', response.status, response.statusText);
  return response;
};

