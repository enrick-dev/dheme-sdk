// Cliente
export { DhemeClient } from './client';

// Tipos
export type {
  DhemeClientConfig,
  GenerateThemeRequest,
  GenerateThemeResponse,
  TokensResponse,
  UsageResponse,
  ColorTokens,
  HSLColor,
  RGBColor,
  ColorFormats,
  ResponseWithRateLimit,
  RateLimitHeaders,
  RetryConfig,
  Interceptors,
  RequestInterceptor,
  ResponseInterceptor,
} from './types';

// Erros
export {
  DhemeError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NetworkError,
  ServerError,
} from './errors';

// Utilitários de conversão de cor (exportados para uso público)
export {
  hexToHSL,
  hslToRGB,
  rgbToHex,
  hslToHex,
  hexToRGB,
  rgbToHSL,
  formatHSLString,
  isValidHex,
} from './utils/colorConversion';

// Interceptors úteis
export {
  loggingInterceptor,
  customHeadersInterceptor,
  responseLoggingInterceptor,
} from './middleware/interceptors';
