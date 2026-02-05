/**
 * Configuração do cliente Dheme SDK
 */
export interface DhemeClientConfig {
  /** API key (obrigatório) */
  apiKey: string;
  /** Base URL da API (opcional, default: production URL) */
  baseUrl?: string;
  /** Timeout em milissegundos (opcional, default: 30000) */
  timeout?: number;
  /** Configuração de retry (opcional) */
  retryConfig?: RetryConfig;
  /** Debug mode (opcional, default: false) */
  debug?: boolean;
  /** Interceptors de request/response (opcional) */
  interceptors?: Interceptors;
}

/**
 * Configuração de retry com backoff exponencial
 */
export interface RetryConfig {
  /** Máximo de tentativas (default: 3) */
  maxRetries: number;
  /** Delay inicial em ms (default: 1000) */
  initialDelay: number;
  /** Delay máximo em ms (default: 10000) */
  maxDelay: number;
  /** Multiplicador do backoff (default: 2) */
  backoffMultiplier: number;
  /** Status codes que permitem retry (default: [408, 429, 500, 502, 503, 504]) */
  retryableStatusCodes: number[];
}

/**
 * Sistema de interceptors
 */
export interface Interceptors {
  /** Interceptors de request */
  request?: RequestInterceptor[];
  /** Interceptors de response */
  response?: ResponseInterceptor[];
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

/**
 * Configuração interna de request
 */
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * Parâmetros para gerar tema
 */
export interface GenerateThemeRequest {
  /** Cor primária em HEX (obrigatório) */
  theme: string;
  /** Cor secundária em HEX (opcional) */
  secondaryColor?: string;
  /** Border radius em rem, 0-2 (opcional, default: 0.5) */
  radius?: number;
  /** Ajuste de saturação, -100 a 100 (opcional, default: 0) */
  saturationAdjust?: number;
  /** Ajuste de luminosidade, -100 a 100 (opcional, default: 0) */
  lightnessAdjust?: number;
  /** Ajuste de contraste, -100 a 100 (opcional, default: 0) */
  contrastAdjust?: number;
  /** Cards com cor (opcional, default: false) */
  cardIsColored?: boolean;
  /** Background com cor (opcional, default: true) */
  backgroundIsColored?: boolean;
  /** Formato de resposta (opcional, default: 'object') */
  format?: 'object' | 'css' | 'tokens';
  /** Template customizado para mapeamento de keys (opcional) */
  template?: string;
}

/**
 * Cor em formato HSL
 */
export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * Cor em formato RGB
 */
export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Tokens de cor do Shadcn
 */
export interface ColorTokens {
  background: HSLColor;
  foreground: HSLColor;
  card: HSLColor;
  cardForeground: HSLColor;
  popover: HSLColor;
  popoverForeground: HSLColor;
  primary: HSLColor;
  primaryForeground: HSLColor;
  secondary: HSLColor;
  secondaryForeground: HSLColor;
  muted: HSLColor;
  mutedForeground: HSLColor;
  accent: HSLColor;
  accentForeground: HSLColor;
  destructive: HSLColor;
  destructiveForeground: HSLColor;
  border: HSLColor;
  input: HSLColor;
  ring: HSLColor;
}

/**
 * Response completo do tema gerado
 */
export interface GenerateThemeResponse {
  theme: string;
  secondaryColor: string;
  radius: number;
  saturationAdjust: number;
  lightnessAdjust: number;
  contrastAdjust: number;
  cardIsColored: boolean;
  backgroundIsColored: boolean;
  colors: {
    light: ColorTokens;
    dark: ColorTokens;
  };
  backgrounds: {
    primary: {
      light: string;
      dark: string;
    };
    secondary: {
      light: string;
      dark: string;
    } | null;
  };
}

/**
 * Cor em múltiplos formatos
 */
export interface ColorFormats {
  hsl: HSLColor;
  rgb: [number, number, number];
  hex: string;
}

/**
 * Response de tokens com múltiplos formatos
 */
export interface TokensResponse {
  light: Record<string, ColorFormats>;
  dark: Record<string, ColorFormats>;
  radius: number;
  backgrounds: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string } | null;
  } | null;
}

/**
 * Response de estatísticas de uso
 */
export interface UsageResponse {
  usage: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetAt: string;
  plan: string;
}

/**
 * Headers de rate limit
 */
export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: string;
}

/**
 * Response com informação de rate limit
 */
export interface ResponseWithRateLimit<T> {
  data: T;
  rateLimit: RateLimitHeaders;
}
